
"use server";

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteFolder = async (folderId: string) => {
    try {
        // 1. Authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return { success: false };
        }

        const session = await verifyAuthToken(token);

        if (
            !session ||
            session.role !== "admin" ||
            !session.studioId
        ) {
            return { success: false };
        }

        // 2. Find folder and verify ownership
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            include: {
                event: {
                    select: {
                        id: true,
                        studioId: true,
                    },
                },
            },
        });

        if (
            !folder ||
            folder.event.studioId !== session.studioId
        ) {
            return { success: false };
        }

        const studioId = session.studioId;
        const eventId = folder.event.id;

        // 3. Fetch folders and their images from this event
        const allFolders = await prisma.folder.findMany({
            where: { eventId },
            include: { images: true },
        });

        // 4. Collect selected folder and all descendants
        const folderIds = new Set<string>([folderId]);
        let parentIds = [folderId];

        while (parentIds.length > 0) {
            const children = allFolders.filter(
                (item) =>
                    item.parentId !== null &&
                    parentIds.includes(item.parentId) &&
                    !folderIds.has(item.id)
            );

            parentIds = children.map((item) => item.id);

            for (const child of children) {
                folderIds.add(child.id);
            }
        }

        const foldersToDelete = allFolders.filter(
            (item) => folderIds.has(item.id)
        );

        // 5. Collect R2 image keys
        const r2Prefix = `studios/${studioId}/`;
        const r2Keys = new Set<string>();

        for (const item of foldersToDelete) {
            for (const image of item.images) {
                const possibleKeys = [
                    image.storageKey,
                    image.optimizedKey,
                    image.thumbnailKey,
                    image.imageUrl,
                ];

                for (const key of possibleKeys) {
                    if (
                        key &&
                        key.startsWith(r2Prefix) &&
                        !key.includes("..") &&
                        !key.includes("\\")
                    ) {
                        r2Keys.add(key);
                    }
                }
            }
        }

        // 6. Delete R2 objects in batches
        const keys = Array.from(r2Keys);

        for (let i = 0; i < keys.length; i += 1000) {
            const batch = keys.slice(i, i + 1000);

            try {
                const result = await r2.send(
                    new DeleteObjectsCommand({
                        Bucket: R2_BUCKET_NAME,
                        Delete: {
                            Objects: batch.map((key) => ({
                                Key: key,
                            })),
                            Quiet: true,
                        },
                    })
                );

                if (result.Errors?.length) {
                    console.error(
                        "R2 Folder Delete Errors:",
                        result.Errors
                    );
                }
            } catch (error) {
                console.error(
                    "R2 Folder Batch Delete Error:",
                    error
                );
            }
        }

        // 7. Legacy Cloudinary cleanup
        for (const item of foldersToDelete) {
            for (const image of item.images) {
                if (!image.storageKey && image.publicId) {
                    try {
                        await cloudinary.uploader.destroy(
                            image.publicId
                        );
                    } catch (error) {
                        console.error(
                            "Cloudinary Image Delete Error:",
                            error
                        );
                    }
                }
            }
        }

        // 8. Clear image hashes and soft-delete folders together
        await prisma.$transaction(async (tx) => {
            // Release duplicate hashes from images in deleted folders
            await tx.image.updateMany({
                where: {
                    folderId: {
                        in: Array.from(folderIds),
                    },
                },
                data: {
                    fileHash: null,
                },
            });

            // Soft-delete the selected folder and its descendants
            await tx.folder.updateMany({
                where: {
                    id: {
                        in: Array.from(folderIds),
                    },
                    eventId,
                },
                data: {
                    deletedAt: new Date(),
                },
            });
        });

        revalidatePath("/events");

        return { success: true };
    } catch (error) {
        console.log("Delete Folder Error:", error);

        return { success: false };
    }
};
