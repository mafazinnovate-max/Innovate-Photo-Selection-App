import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/svg+xml",
];

const FORMAT_TO_CONTENT_TYPE: Record<string, string> = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml",
};

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/svg+xml": "svg",
};

async function deleteR2Object(key: string) {
    try {
        await r2.send(
            new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
            })
        );
    } catch (error) {
        console.error("R2 cleanup failed:", key, error);
    }
}

export async function POST(req: Request) {
    let temporaryKey: string | null = null;
    const createdKeys: string[] = [];

    try {
        // 1. Verify admin session
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const payload = await verifyAuthToken(token);

        if (
            !payload ||
            payload.role !== "admin" ||
            !payload.adminId ||
            !payload.studioId
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized access" },
                { status: 401 }
            );
        }

        // 2. Verify active admin and studio
        const admin = await prisma.admin.findFirst({
            where: {
                id: payload.adminId,
                studioId: payload.studioId,
                studio: {
                    isActive: true,
                },
            },
            select: {
                id: true,
                studioId: true,
            },
        });

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Admin or studio is inactive" },
                { status: 403 }
            );
        }

        // 3. Validate temporary storage key
        const body = await req.json();
        const { storageKey, contentType } = body;

        const uploadPrefix =
            `studios/${admin.studioId}/studio-logo-uploads/`;

        if (
            typeof storageKey !== "string" ||
            !storageKey.startsWith(uploadPrefix) ||
            storageKey.includes("..") ||
            storageKey.includes("\\") ||
            storageKey.slice(uploadPrefix.length).includes("/")
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid storage key" },
                { status: 400 }
            );
        }

        temporaryKey = storageKey;

        if (
            typeof contentType !== "string" ||
            !ALLOWED_CONTENT_TYPES.includes(contentType)
        ) {
            await deleteR2Object(temporaryKey);
            return NextResponse.json(
                { success: false, message: "Unsupported image format" },
                { status: 400 }
            );
        }

        // 4. Verify uploaded temporary object
        const headResult = await r2.send(
            new HeadObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: temporaryKey,
            })
        );

        const uploadedSize = headResult.ContentLength;
        const uploadedContentType = headResult.ContentType;

        if (
            typeof uploadedSize !== "number" ||
            uploadedSize <= 0 ||
            uploadedSize > MAX_FILE_SIZE ||
            uploadedContentType !== contentType
        ) {
            throw new Error("Uploaded image validation failed");
        }

        // 5. Download temporary image
        const object = await r2.send(
            new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: temporaryKey,
            })
        );

        if (!object.Body) {
            throw new Error("Unable to read uploaded image");
        }

        const inputBuffer = Buffer.from(
            await object.Body.transformToByteArray()
        );

        if (inputBuffer.length !== uploadedSize) {
            throw new Error("Uploaded image size mismatch");
        }

        // 6. Validate actual image format using Sharp
        const metadata = await sharp(inputBuffer, {
            limitInputPixels: 40_000_000,
        }).metadata();

        const actualContentType = metadata.format
            ? FORMAT_TO_CONTENT_TYPE[metadata.format]
            : undefined;

        if (
            !actualContentType ||
            actualContentType !== contentType ||
            !metadata.width ||
            !metadata.height
        ) {
            throw new Error("Invalid image content");
        }

        // 7. Generate permanent storage keys
        const logoId = randomUUID();

        const permanentPrefix =
            `studios/${admin.studioId}/studio-logos/${logoId}`;

        const extension = EXTENSIONS[contentType];

        const originalKey =
            `${permanentPrefix}/original.${extension}`;

        const optimizedKey =
            `${permanentPrefix}/optimized.webp`;

        const thumbnailKey =
            `${permanentPrefix}/thumbnail.webp`;

        // 8. Preserve original image
        await r2.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: originalKey,
                Body: inputBuffer,
                ContentType: contentType,
            })
        );

        createdKeys.push(originalKey);

        // 9. Generate optimized WebP
        // Transparency is preserved by Sharp's WebP output.
        const optimizedBuffer = await sharp(inputBuffer, {
            limitInputPixels: 40_000_000,
        })
            .rotate()
            .resize({
                width: 1600,
                height: 1600,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({
                quality: 85,
                effort: 5,
                alphaQuality: 100,
            })
            .toBuffer();

        await r2.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: optimizedKey,
                Body: optimizedBuffer,
                ContentType: "image/webp",
                CacheControl: "public, max-age=31536000, immutable",
            })
        );

        createdKeys.push(optimizedKey);

        // 10. Generate thumbnail without cropping
        const thumbnailBuffer = await sharp(inputBuffer, {
            limitInputPixels: 40_000_000,
        })
            .rotate()
            .resize({
                width: 512,
                height: 512,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({
                quality: 80,
                effort: 5,
                alphaQuality: 100,
            })
            .toBuffer();

        await r2.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: thumbnailKey,
                Body: thumbnailBuffer,
                ContentType: "image/webp",
                CacheControl: "public, max-age=31536000, immutable",
            })
        );

        createdKeys.push(thumbnailKey);

        // 11. Verify generated objects
        for (const key of [originalKey, optimizedKey, thumbnailKey]) {
            await r2.send(
                new HeadObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: key,
                })
            );
        }

        // 12. Remove temporary upload only after all outputs succeed
        await r2.send(
            new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: temporaryKey,
            })
        );

        return NextResponse.json({
            success: true,
            storageKey: originalKey,
            optimizedKey,
            thumbnailKey,
            contentType: "image/webp",
            originalContentType: contentType,
            fileSize: optimizedBuffer.length,
            thumbnailSize: thumbnailBuffer.length,
        });
    } catch (error) {
        console.error("Studio logo finalize error:", error);

        // Clean up temporary and partially generated objects
        if (temporaryKey) {
            await deleteR2Object(temporaryKey);
        }

        await Promise.all(
            createdKeys.map((key) => deleteR2Object(key))
        );

        return NextResponse.json(
            {
                success: false,
                message: "Unable to process studio logo",
            },
            { status: 500 }
        );
    }
}