"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const generateAccessCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
interface UpdateEventProps {
    id: string;
    name: string;
    clientName: string;
    eventType: string;
    description?: string;
    eventDate?: string;
    phoneNumber?: string;
    email?: string;
    galleryMode?: string;
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
    phoneNumber,
    email,
    galleryMode,
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
                phoneNumber,
                email,
                galleryMode: galleryMode,
                coverImageUrl,
                coverImagePublicId,
                coverPosition,
                accessCode: generateAccessCode(),
            },
        });

        revalidatePath("/events");
        revalidatePath(`/events/${id}`);

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