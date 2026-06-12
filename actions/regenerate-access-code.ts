"use server";

import { prisma } from "@/lib/prisma";

const generateCode = () =>
    Math.floor(1000 + Math.random() * 9000).toString();

export const regenerateAccessCode = async (eventId: string) => {
    try {
        const event = await prisma.event.update({
            where: { id: eventId },
            data: {
                accessCode: generateCode(),
                accessCodeVersion: {
                    increment: 1,
                },
            },
        });

        return {
            success: true,
            accessCode: event.accessCode,
        };
    } catch (error) {
        console.log(error);
        return { success: false };
    }
};