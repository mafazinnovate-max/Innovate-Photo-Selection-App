import { NextResponse } from "next/server";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 40 * 1024 * 1024;
const TARGET_MAX_SIZE = 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

async function deleteR2Object(key: string) {
    try {
        await r2.send(
            new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
            })
        );
    } catch (error) {
        console.error(`Failed to delete R2 object: ${key}`, error);
    }
}

export async function POST(request: Request) {
    let temporaryKey: string | null = null;
    let finalKey: string | null = null;
    let finalUploadCompleted = false;

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
            where: { id: session.adminId },
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

        // 3. Validate request details
        const body = await request.json();

        const storageKey = body.storageKey;
        const fileSize = body.fileSize;
        const contentType = body.contentType;

        if (
            typeof storageKey !== "string" ||
            !storageKey.trim() ||
            typeof fileSize !== "number" ||
            !Number.isSafeInteger(fileSize) ||
            fileSize <= 0 ||
            fileSize > MAX_FILE_SIZE ||
            typeof contentType !== "string" ||
            !ALLOWED_CONTENT_TYPES.includes(contentType)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid cover image details",
                },
                { status: 400 }
            );
        }

        // 4. Verify temporary key belongs to this studio
        const expectedPrefix =
            `studios/${admin.studioId}/event-cover-uploads/`;

        if (
            !storageKey.startsWith(expectedPrefix) ||
            storageKey.includes("..") ||
            storageKey.includes("\\") ||
            storageKey.slice(expectedPrefix.length).includes("/")
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid storage key" },
                { status: 400 }
            );
        }

        temporaryKey = storageKey;

        // 5. Verify uploaded object exists in R2
        const uploadedObject = await r2.send(
            new HeadObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: temporaryKey,
            })
        );

        if (
            uploadedObject.ContentLength !== fileSize ||
            uploadedObject.ContentType !== contentType
        ) {
            await deleteR2Object(temporaryKey);
            temporaryKey = null;

            return NextResponse.json(
                {
                    success: false,
                    message: "Uploaded image details do not match",
                },
                { status: 400 }
            );
        }

        // 6. Download original image from R2
        const originalObject = await r2.send(
            new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: temporaryKey,
            })
        );

        if (!originalObject.Body) {
            throw new Error("Unable to read uploaded cover image");
        }

        const originalBuffer = Buffer.from(
            await originalObject.Body.transformToByteArray()
        );

        // 7. Verify actual image format
        const metadata = await sharp(originalBuffer).metadata();

        if (
            !metadata.format ||
            !["jpeg", "png", "webp", "avif"].includes(metadata.format)
        ) {
            throw new Error("Unsupported image format");
        }

        // 8. Compress image to WebP with adaptive quality
        const qualityLevels = [82, 76, 70, 64, 58, 52];

        let compressedBuffer: Buffer | null = null;

        for (const quality of qualityLevels) {
            compressedBuffer = await sharp(originalBuffer)
                .rotate()
                .resize(2400, 1600, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({
                    quality,
                    effort: 5,
                })
                .toBuffer();

            if (compressedBuffer.length <= TARGET_MAX_SIZE) {
                break;
            }
        }

        if (!compressedBuffer) {
            throw new Error("Cover image compression failed");
        }

        // 9. Generate final permanent R2 key
        finalKey =
            `studios/${admin.studioId}` +
            `/event-covers/${randomUUID()}.webp`;

        await r2.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: finalKey,
                Body: compressedBuffer,
                ContentType: "image/webp",
                ContentLength: compressedBuffer.length,
            })
        );

        finalUploadCompleted = true;

        // 10. Verify final compressed object
        const finalObject = await r2.send(
            new HeadObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: finalKey,
            })
        );

        if (
            finalObject.ContentType !== "image/webp" ||
            finalObject.ContentLength !== compressedBuffer.length
        ) {
            throw new Error("Final cover image verification failed");
        }

        // 11. Remove temporary original
        await r2.send(
            new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: temporaryKey,
            })
        );

        temporaryKey = null;

        return NextResponse.json({
            success: true,
            coverImageKey: finalKey,
            contentType: "image/webp",
            fileSize: compressedBuffer.length,
        });
    } catch (error) {
        console.error("Event cover finalize error:", error);

        // Clean up files if finalization failed
        if (temporaryKey) {
            await deleteR2Object(temporaryKey);
        }

        if (finalUploadCompleted && finalKey) {
            await deleteR2Object(finalKey);
        }

        return NextResponse.json(
            {
                success: false,
                message: "Unable to process cover image",
            },
            { status: 500 }
        );
    }
}