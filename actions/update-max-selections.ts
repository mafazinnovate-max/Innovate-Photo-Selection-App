"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateMaxSelections(
    eventId: string,
    folderId: string | null,
    maxSelections: number | null
) {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
        select: {
            galleryMode: true,
        },
    });

    if (!event) {
        throw new Error("Event not found");
    }

    if (event.galleryMode === "single") {
        await prisma.event.update({
            where: {
                id: eventId,
            },
            data: {
                maxSelections,
            },
        });

        revalidatePath(`/events/${eventId}`);
    } else {
        if (!folderId) {
            throw new Error("Folder ID is required for multi gallery.");
        }

        await prisma.folder.update({
            where: {
                id: folderId,
            },
            data: {
                maxSelections,
            },
        });

        revalidatePath(`/events/${eventId}/folders/${folderId}`);
    }
}