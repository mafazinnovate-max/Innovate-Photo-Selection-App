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

export const deleteImage = async (imageId: string) => {
    try {
        const studioId = await getAuthorizedStudioId();

        if (!studioId || !imageId) {
            return { success: false };
        }

        const image = await prisma.image.findUnique({
            where: {
                id: imageId,
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

        if (!image || image.folder.event.studioId !== studioId) {
            return { success: false };
        }

        const objectKeys = getImageR2Keys(image);

        // Delete R2 objects before deleting the database record.
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

        await prisma.image.delete({
            where: {
                id: imageId,
            },
        });

        revalidatePath("/events");

        return { success: true };
    } catch (error) {
        console.error("R2 image deletion failed:", error);

        return { success: false };
    }
};