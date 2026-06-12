"use server";

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteImage = async (
    imageId: string,
) => {
    try {
        const image = await prisma.image.findUnique({
            where: {
                id: imageId,
            },
        });

        if (!image) {
            return {
                success: false,
            };
        }

        if (image.publicId) {
            try {
                await cloudinary.uploader.destroy(
                    image.publicId,
                );
            } catch (error) {
                console.log(
                    "Cloudinary delete failed",
                    error,
                );
            }
        }

        await prisma.image.delete({
            where: {
                id: imageId,
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