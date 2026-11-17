import "server-only";
import sharp from "sharp";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

export async function processImage(imageId: string): Promise<void> {
    let claimed = false;
    let completed = false;

    let originalKey: string | null = null;
    let optimizedKey: string | null = null;
    let thumbnailKey: string | null = null;

    try {
        // Claim the job so it cannot be processed twice simultaneously.
        const claim = await prisma.image.updateMany({
            where: {
                id: imageId,
                processingStatus: "PENDING",
            },
            data: {
                processingStatus: "PROCESSING",
                processingAttempts: { increment: 1 },
                processingStartedAt: new Date(),
                processingError: null,
            },
        });

        if (claim.count === 0) return;

        claimed = true;

        const image = await prisma.image.findUnique({
            where: { id: imageId },
            select: {
                id: true,
                storageKey: true,
                imageUrl: true,
            },
        });

        if (!image) {
            throw new Error("Image database record not found.");
        }

        originalKey = image.storageKey || image.imageUrl;

        if (
            !originalKey ||
            originalKey.startsWith("http://") ||
            originalKey.startsWith("https://")
        ) {
            throw new Error("Invalid original R2 storage key.");
        }

        const lastSlash = originalKey.lastIndexOf("/");

        if (lastSlash === -1) {
            throw new Error("Invalid original image path.");
        }

        const processedPrefix =
            `${originalKey.substring(0, lastSlash + 1)}processed/${image.id}/`;

        optimizedKey = `${processedPrefix}optimized.webp`;
        thumbnailKey = `${processedPrefix}thumbnail.webp`;

        // Download original image from R2.
        const originalObject = await r2.send(
            new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: originalKey,
            })
        );

        if (!originalObject.Body) {
            throw new Error("Original image could not be downloaded.");
        }

        const originalBuffer = Buffer.from(
            await originalObject.Body.transformToByteArray()
        );

        if (originalBuffer.length === 0) {
            throw new Error("Original image is empty.");
        }

        // Generate optimized image and thumbnail.
        const sharpInput = sharp(originalBuffer, {
            limitInputPixels: 100_000_000,
        }).rotate();

        const optimizedBuffer = await sharpInput
            .clone()
            .resize({
                width: 2560,
                height: 2560,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: 82, effort: 4 })
            .toBuffer();

        const thumbnailBuffer = await sharpInput
            .clone()
            .resize({
                width: 400,
                height: 400,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: 75, effort: 4 })
            .toBuffer();

        if (!optimizedBuffer.length || !thumbnailBuffer.length) {
            throw new Error("Image compression produced an empty file.");
        }

        // Upload both generated files.
        await Promise.all([
            r2.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: optimizedKey,
                    Body: optimizedBuffer,
                    ContentType: "image/webp",
                    CacheControl: "private, max-age=31536000, immutable",
                })
            ),
            r2.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: thumbnailKey,
                    Body: thumbnailBuffer,
                    ContentType: "image/webp",
                    CacheControl: "private, max-age=31536000, immutable",
                })
            ),
        ]);

        // Verify both R2 objects.
        const [optimizedHead, thumbnailHead] = await Promise.all([
            r2.send(
                new HeadObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: optimizedKey,
                })
            ),
            r2.send(
                new HeadObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: thumbnailKey,
                })
            ),
        ]);

        if (
            optimizedHead.ContentLength !== optimizedBuffer.length ||
            optimizedHead.ContentType !== "image/webp" ||
            thumbnailHead.ContentLength !== thumbnailBuffer.length ||
            thumbnailHead.ContentType !== "image/webp"
        ) {
            throw new Error("Generated image verification failed.");
        }

        // Update database only after both uploads are verified.
        await prisma.image.update({
            where: { id: image.id },
            data: {
                imageUrl: optimizedKey,
                optimizedKey,
                thumbnailKey,
                optimizedSize: BigInt(optimizedBuffer.length),
                thumbnailSize: BigInt(thumbnailBuffer.length),
                processingStatus: "COMPLETED",
                processingError: null,
                processingStartedAt: null,
                processedAt: new Date(),
            },
        });

        completed = true;

        // Delete original only after successful database update.
        try {
            await r2.send(
                new DeleteObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: originalKey,
                })
            );
        } catch (deleteError) {
            console.error(
                `Original image cleanup failed for ${image.id}:`,
                deleteError
            );
        }

        console.log(`Image processing completed: ${image.id}`);
    } catch (error) {
        console.error(`Image processing failed for ${imageId}:`, error);

        if (claimed && !completed) {
            const cleanupKeys = [optimizedKey, thumbnailKey].filter(
                (key): key is string => Boolean(key)
            );

            await Promise.allSettled(
                cleanupKeys.map((key) =>
                    r2.send(
                        new DeleteObjectCommand({
                            Bucket: R2_BUCKET_NAME,
                            Key: key,
                        })
                    )
                )
            );

            try {
                await prisma.image.update({
                    where: { id: imageId },
                    data: {
                        processingStatus: "FAILED",
                        processingStartedAt: null,
                        processingError:
                            error instanceof Error
                                ? error.message.slice(0, 1000)
                                : "Image processing failed",
                    },
                });
            } catch (databaseError) {
                console.error(
                    "Failed to update image processing status:",
                    databaseError
                );
            }
        }
    }
}