import { after, NextResponse } from "next/server";
import { processImage } from "@/lib/process-image";
import {
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
    let uploadedKey: string | null = null;

    try {
        // 1. Authenticate admin
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const session = await verifyAuthToken(token);

        if (
            !session ||
            session.role !== "admin" ||
            !session.adminId ||
            !session.studioId
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Verify admin and studio
        const admin = await prisma.admin.findUnique({
            where: {
                id: session.adminId,
            },
            select: {
                studioId: true,
                studio: {
                    select: {
                        isActive: true,
                    },
                },
            },
        });

        if (
            !admin ||
            admin.studioId !== session.studioId ||
            !admin.studio.isActive
        ) {
            return NextResponse.json(
                { success: false, message: "Studio access denied" },
                { status: 403 }
            );
        }

        // 3. Read and validate request
        const body = await request.json();

        const folderId = body.folderId;
        const fileName = body.fileName;
        const storageKey = body.storageKey;
        const fileHash = body.fileHash;
        const fileSize = body.fileSize;
        const contentType = body.contentType;

        if (
            typeof folderId !== "string" ||
            !folderId.trim() ||
            typeof fileName !== "string" ||
            !fileName.trim() ||
            typeof storageKey !== "string" ||
            !storageKey.trim() ||
            typeof fileHash !== "string" ||
            !/^[a-f0-9]{64}$/i.test(fileHash) ||
            typeof fileSize !== "number" ||
            !Number.isSafeInteger(fileSize) ||
            fileSize <= 0 ||
            typeof contentType !== "string" ||
            !contentType.startsWith("image/") ||
            contentType === "image/svg+xml"
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid finalize details" },
                { status: 400 }
            );
        }

        const normalizedHash = fileHash.toLowerCase();

        // 4. Verify folder belongs to this studio
        const folder = await prisma.folder.findFirst({
            where: {
                id: folderId,
                deletedAt: null,
            },
            select: {
                id: true,
                eventId: true,
                event: {
                    select: {
                        id: true,
                        studioId: true,
                        deletedAt: true,
                    },
                },
            },
        });

        if (
            !folder ||
            folder.event.studioId !== admin.studioId ||
            folder.event.deletedAt !== null
        ) {
            return NextResponse.json(
                { success: false, message: "Folder not found" },
                { status: 404 }
            );
        }

        // 5. Verify object key belongs to this studio/event/folder
        const expectedPrefix =
            `studios/${admin.studioId}` +
            `/events/${folder.eventId}` +
            `/folders/${folder.id}/`;

        if (
            !storageKey.startsWith(expectedPrefix) ||
            storageKey.includes("..") ||
            storageKey.includes("\\")
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid storage key" },
                { status: 400 }
            );
        }

        uploadedKey = storageKey;

        // 6. Verify uploaded object exists in private R2
        let object;

        try {
            object = await r2.send(
                new HeadObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: storageKey,
                })
            );
        } catch (error) {
            console.error("R2 object verification failed:", error);

            return NextResponse.json(
                {
                    success: false,
                    message: "Uploaded image not found in storage",
                },
                { status: 400 }
            );
        }

        if (
            object.ContentLength !== fileSize ||
            object.ContentType !== contentType
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Uploaded file details do not match",
                },
                { status: 400 }
            );
        }

        // 7. Check duplicate content within this event
        const existingImage = await prisma.image.findUnique({
            where: {
                eventId_fileHash: {
                    eventId: folder.eventId,
                    fileHash: normalizedHash,
                },
            },
            select: {
                id: true,
                fileName: true,
                processingStatus: true,
            },
        });

        if (existingImage) {
            // Remove the newly uploaded duplicate object
            await r2.send(
                new DeleteObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: storageKey,
                })
            );

            uploadedKey = null;

            return NextResponse.json({
                success: true,
                duplicate: true,
                imageId: existingImage.id,
                fileName: existingImage.fileName,
                processingStatus: existingImage.processingStatus,
            });
        }

        // 8. Create pending image record
        const image = await prisma.image.create({
            data: {
                imageUrl: storageKey,
                publicId: storageKey,
                folderId: folder.id,
                eventId: folder.eventId,
                fileName: fileName.trim(),
                fileHash: normalizedHash,
                storageKey,
                originalSize: BigInt(fileSize),
                processingStatus: "PENDING",
                processingAttempts: 0,
            },
            select: {
                id: true,
                fileName: true,
                processingStatus: true,
            },
        });

        // Database now owns this R2 object
        uploadedKey = null;

        // Start background image processing after the response lifecycle.
        after(async () => {
            await processImage(image.id);
        });

        return NextResponse.json({
            success: true,
            duplicate: false,
            image,
        });
    } catch (error) {
        console.error("Image finalize failed:", error);

        // 9. Clean up orphaned upload if database creation failed
        if (uploadedKey) {
            try {
                await r2.send(
                    new DeleteObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: uploadedKey,
                    })
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up orphaned R2 object:",
                    cleanupError
                );
            }
        }

        // Handle concurrent duplicate uploads
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    duplicate: true,
                    message: "This image has already been uploaded to this event",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Unable to finalize image upload",
            },
            { status: 500 }
        );
    }
}