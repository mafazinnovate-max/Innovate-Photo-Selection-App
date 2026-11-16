
import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        // 1. Validate admin authentication
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

        // 2. Verify admin and studio status
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

        // 3. Read upload details
        const body = await request.json();

        const folderId = body.folderId;
        const fileName = body.fileName;
        const contentType = body.contentType;
        const fileSize = body.fileSize;
        const fileHash = body.fileHash;

        if (
            typeof folderId !== "string" ||
            !folderId.trim() ||
            typeof fileName !== "string" ||
            !fileName.trim() ||
            typeof contentType !== "string" ||
            !contentType.startsWith("image/") ||
            contentType === "image/svg+xml" ||
            typeof fileSize !== "number" ||
            !Number.isSafeInteger(fileSize) ||
            fileSize <= 0 ||
            typeof fileHash !== "string" ||
            !/^[a-f0-9]{64}$/i.test(fileHash)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid upload details" },
                { status: 400 }
            );
        }

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

        // 5. Check duplicate content within the same event
        const normalizedHash = fileHash.toLowerCase();

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
            return NextResponse.json({
                success: true,
                duplicate: true,
                imageId: existingImage.id,
                fileName: existingImage.fileName,
                processingStatus: existingImage.processingStatus,
            });
        }

        // 6. Generate a unique R2 object key
        const safeFileName = fileName
            .trim()
            .replace(/[\/\\]/g, "-")
            .replace(/[^\w.-]/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 150);

        const storageKey =
            `studios/${admin.studioId}` +
            `/events/${folder.eventId}` +
            `/folders/${folder.id}` +
            `/${randomUUID()}-${safeFileName || "image"}`;

        // 7. Generate temporary direct-upload URL
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: storageKey,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(r2, command, {
            expiresIn: 900,
        });

        return NextResponse.json({
            success: true,
            duplicate: false,
            uploadUrl,
            storageKey,
            fileName: fileName.trim(),
            contentType,
            fileSize,
            fileHash: normalizedHash,
        });
    } catch (error) {
        console.error("R2 presigned upload URL error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to prepare image upload",
            },
            { status: 500 }
        );
    }
}