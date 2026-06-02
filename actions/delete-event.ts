"use server";

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteEvent = async (eventId: string) => {
    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
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
            return {
                success: false,
            };
        }

        // Delete cover image
        if (event.coverImagePublicId) {
            try {
                await cloudinary.uploader.destroy(
                    event.coverImagePublicId,
                );
            } catch (error) {
                console.log(error);
            }
        }

        // Delete all folder images
        const images = event.folders.flatMap((folder) => folder.images);

        for (const image of images) {
            if (image.publicId) {
                try {
                    await cloudinary.uploader.destroy(image.publicId);
                } catch (error) {
                    console.log("Image delete failed", error);
                }
            }
        }

        await prisma.event.delete({
            where: {
                id: eventId,
            },
        });

        return {
            success: true,
        };
    } catch (error) {
        console.log(error);

        return {
            success: false,
        };
    }
};