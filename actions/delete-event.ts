"use server";

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import {
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import {
    r2,
    R2_BUCKET_NAME,
} from "@/lib/r2";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteEvent = async (eventId: string) => {
    try {
        // Get logged-in admin session
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return { success: false };
        }

        const session = await verifyAuthToken(token);

        // Only normal admins with a studio can archive events
        if (
            !session ||
            session.role !== "admin" ||
            !session.studioId
        ) {
            return { success: false };
        }

        const studioId = session.studioId;

        // Make sure the event belongs to this admin's studio
        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                studioId,
                deletedAt: null,
            },
            include: {
                folders: {
                    include: {
                        images: true,
                    },
                },
            },
        });

        if (!event) {
            return { success: false };
        }

        const images = event.folders.flatMap(
            (folder) => folder.images,
        );

        // Collect R2 objects belonging to this studio
        const studioPrefix = `studios/${studioId}/`;

        const r2Keys = new Set<string>();

        const addR2Key = (key: string | null | undefined) => {
            if (
                key &&
                key.startsWith(studioPrefix) &&
                !key.includes("..") &&
                !key.includes("\\")
            ) {
                r2Keys.add(key);
            }
        };

        // Event cover image
        addR2Key(event.coverImageKey);

        // Gallery original, optimized and thumbnail images
        for (const image of images) {
            addR2Key(image.storageKey);
            addR2Key(image.optimizedKey);
            addR2Key(image.thumbnailKey);

            // Include imageUrl only when it is an R2 object key
            addR2Key(image.imageUrl);
        }

        // Delete R2 objects in batches of 1000
        const keys = Array.from(r2Keys);

        for (let i = 0; i < keys.length; i += 1000) {
            const batch = keys.slice(i, i + 1000);

            try {
                const result = await r2.send(
                    new DeleteObjectsCommand({
                        Bucket: R2_BUCKET_NAME,
                        Delete: {
                            Objects: batch.map((Key) => ({ Key })),
                            Quiet: true,
                        },
                    }),
                );

                if (result.Errors?.length) {
                    console.error(
                        "Some R2 objects could not be deleted:",
                        result.Errors,
                    );
                }
            } catch (error) {
                console.error(
                    "R2 event image cleanup failed:",
                    error,
                );
            }
        }

        // Delete legacy cover image from Cloudinary
        // R2 cover images use coverImageKey instead.
        if (
            !event.coverImageKey &&
            event.coverImagePublicId
        ) {
            try {
                await cloudinary.uploader.destroy(
                    event.coverImagePublicId,
                );
            } catch (error) {
                console.error(
                    "Cloudinary cover delete failed:",
                    error,
                );
            }
        }

        // Delete legacy gallery images from Cloudinary
        for (const image of images) {
            if (
                !image.storageKey &&
                image.publicId
            ) {
                try {
                    await cloudinary.uploader.destroy(
                        image.publicId,
                    );
                } catch (error) {
                    console.error(
                        "Cloudinary image delete failed:",
                        error,
                    );
                }
            }
        }

        // Soft delete the event in Neon.
        // Database records remain for Past Events summary.
        await prisma.event.update({
            where: {
                id: event.id,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        revalidatePath("/events");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Event delete failed:", error);

        return {
            success: false,
        };
    }
};