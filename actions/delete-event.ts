"use server";

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

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
            return {
                success: false,
            };
        }

        const session = await verifyAuthToken(token);

        // Only normal admins with a studio can archive events
        if (
            !session ||
            session.role !== "admin" ||
            !session.studioId
        ) {
            return {
                success: false,
            };
        }

        // Make sure the event belongs to this admin's studio
        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                studioId: session.studioId,
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
            return {
                success: false,
            };
        }

        // Delete cover image from Cloudinary
        if (event.coverImagePublicId) {
            try {
                await cloudinary.uploader.destroy(
                    event.coverImagePublicId,
                );
            } catch (error) {
                console.log(error);
            }
        }

        // Delete all folder images from Cloudinary
        const images = event.folders.flatMap(
            (folder) => folder.images,
        );

        for (const image of images) {
            if (image.publicId) {
                try {
                    await cloudinary.uploader.destroy(
                        image.publicId,
                    );
                } catch (error) {
                    console.log(
                        "Image delete failed",
                        error,
                    );
                }
            }
        }

        // Soft delete the event in Neon.
        // The Event, folders, images, selections and other
        // database records remain in Neon for the Past Events summary.
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
        console.log(error);

        return {
            success: false,
        };
    }
};