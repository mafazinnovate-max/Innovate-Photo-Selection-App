"use server";

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteFolder = async (
    folderId: string,
) => {
    try {
        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
            },
            include: {
                images: true,
            },
        });

        if (!folder) {
            return {
                success: false,
            };
        }

        // Child folders
        const childFolders =
            await prisma.folder.findMany({
                where: {
                    parentId: folderId,
                },
                include: {
                    images: true,
                },
            });

        // All images from parent + children
        const allImages = [
            ...folder.images,
            ...childFolders.flatMap(
                (folder) => folder.images,
            ),
        ];

        // Delete Cloudinary images
        for (const image of allImages) {
            if (image.publicId) {
                try {
                    await cloudinary.uploader.destroy(
                        image.publicId,
                    );
                } catch (error) {
                    console.log(
                        "Cloudinary Delete Error:",
                        error,
                    );
                }
            }
        }

        // Delete child folder image records
        if (childFolders.length > 0) {
            await prisma.image.deleteMany({
                where: {
                    folderId: {
                        in: childFolders.map(
                            (folder) => folder.id,
                        ),
                    },
                },
            });
        }

        // Delete parent folder image records
        await prisma.image.deleteMany({
            where: {
                folderId,
            },
        });

        // Delete child folders
        if (childFolders.length > 0) {
            await prisma.folder.deleteMany({
                where: {
                    parentId: folderId,
                },
            });
        }

        // Delete parent folder
        await prisma.folder.delete({
            where: {
                id: folderId,
            },
        });

        revalidatePath("/events");

        return {
            success: true,
        };
    } catch (error) {
        console.log(
            "Delete Folder Error:",
            error,
        );

        return {
            success: false,
        };
    }
};