"use server";

import { prisma } from "@/lib/prisma";

interface UpdateEventProps {
    id: string;
    name: string;
    clientName: string;
    eventType: string;
    description?: string;
    eventDate?: string;
    coverImageUrl?: string;
    coverImagePublicId?: string;
    coverPosition?: number;
}

export const updateEvent = async ({
    id,
    name,
    clientName,
    eventType,
    description,
    eventDate,
    coverImageUrl,
    coverImagePublicId,
    coverPosition,
}: UpdateEventProps) => {
    try {
        const event = await prisma.event.update({
            where: {
                id,
            },
            data: {
                name,
                clientName,
                eventType,
                description,
                eventDate: eventDate ? new Date(eventDate) : null,
                coverImageUrl,
                coverImagePublicId,
                coverPosition,
            },
        });

        return {
            success: true,
            event,
        };
    } catch (error) {
        console.log(error);

        return {
            success: false,
        };
    }
};