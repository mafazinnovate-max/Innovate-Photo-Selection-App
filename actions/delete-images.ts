"use server";

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

export const deleteImages = async (
    imageIds: string[],
) => {
    try {
        const images =
            await prisma.image.findMany({
                where: {
                    id: {
                        in: imageIds,
                    },
                },
            });

        await Promise.all(
            images.map(async (image) => {
                if (image.publicId) {
                    try {
                        await cloudinary.uploader.destroy(
                            image.publicId,
                        );
                    } catch (error) {
                        console.log(error);
                    }
                }
            }),
        );

        await prisma.image.deleteMany({
            where: {
                id: {
                    in: imageIds,
                },
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