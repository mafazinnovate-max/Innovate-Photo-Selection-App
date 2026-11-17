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

               // Soft delete child folders
        if (childFolders.length > 0) {
            await prisma.folder.updateMany({
                where: {
                    parentId: folderId,
                },
                data: {
                    deletedAt: new Date(),
                },
            });
        }

        // Soft delete parent folder
        await prisma.folder.update({
            where: {
                id: folderId,
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
        console.log(
            "Delete Folder Error:",
            error,
        );

        return {
            success: false,
        };
    }
};