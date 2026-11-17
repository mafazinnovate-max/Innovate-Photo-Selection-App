"use server";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAuthToken } from "@/lib/auth";

async function getAuthorizedStudioId() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const session = await verifyAuthToken(token);

    if (
        !session ||
        session.role !== "admin" ||
        !session.adminId ||
        !session.studioId
    ) {
        return null;
    }

    const admin = await prisma.admin.findUnique({
        where: { id: session.adminId },
        select: {
            studioId: true,
            studio: {
                select: {
                    isActive: true,
                },
            },
        },
    });

    if (
        !admin ||
        admin.studioId !== session.studioId ||
        !admin.studio.isActive
    ) {
        return null;
    }

    return admin.studioId;
}

function getImageR2Keys(image: {
    storageKey: string | null;
    optimizedKey: string | null;
    thumbnailKey: string | null;
    imageUrl: string;
    publicId: string | null;
}) {
    return [
        image.storageKey,
        image.optimizedKey,
        image.thumbnailKey,
        image.imageUrl,
        image.publicId,
    ]
        .filter(
            (key): key is string =>
                typeof key === "string" &&
                key.trim().length > 0 &&
                !key.startsWith("http://") &&
                !key.startsWith("https://")
        )
        .map((key) => key.trim())
        .filter((key, index, keys) => keys.indexOf(key) === index);
}

export const deleteImages = async (imageIds: string[]) => {
    try {
        const studioId = await getAuthorizedStudioId();

        if (
            !studioId ||
            !Array.isArray(imageIds) ||
            imageIds.length === 0
        ) {
            return { success: false };
        }

        const uniqueIds = [...new Set(imageIds)];

        if (
            uniqueIds.some(
                (id) => typeof id !== "string" || !id.trim()
            )
        ) {
            return { success: false };
        }

        const images = await prisma.image.findMany({
            where: {
                id: {
                    in: uniqueIds,
                },
            },
            include: {
                folder: {
                    include: {
                        event: {
                            select: {
                                studioId: true,
                            },
                        },
                    },
                },
            },
        });

        // Stop if an image is missing or belongs to another studio.
        if (
            images.length !== uniqueIds.length ||
            images.some(
                (image) => image.folder.event.studioId !== studioId
            )
        ) {
            return { success: false };
        }

        // Collect all unique R2 keys across the selected images.
        const objectKeys = [
            ...new Set(
                images.flatMap((image) => getImageR2Keys(image))
            ),
        ];

        // Delete R2 objects before deleting database records.
        await Promise.all(
            objectKeys.map((key) =>
                r2.send(
                    new DeleteObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: key,
                    })
                )
            )
        );

        const deleted = await prisma.image.deleteMany({
            where: {
                id: {
                    in: uniqueIds,
                },
            },
        });

        if (deleted.count !== uniqueIds.length) {
            return { success: false };
        }

        revalidatePath("/events");

        return { success: true };
    } catch (error) {
        console.error("R2 bulk image deletion failed:", error);

        return { success: false };
    }
};