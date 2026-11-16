"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

interface ExternalEventProps {
    name: string;
    clientName: string;
    eventType: string;
    description?: string;
    eventDate?: string;
    phoneNumber?: string;
    email?: string;
    hardDiskName?: string;
}

interface UpdateExternalEventProps extends ExternalEventProps {
    id: string;
}

/* --------------------------------
   Verify authenticated admin
-------------------------------- */

const getAuthorizedAdminSession = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        return null;
    }

    const session = await verifyAuthToken(token);

    if (
        !session ||
        session.role !== "admin" ||
        !session.adminId ||
        !session.studioId
    ) {
        return null;
    }

        return {
        ...session,
        adminId: session.adminId!,
        studioId: session.studioId!,
    };
};

/* --------------------------------
   Create External Event
-------------------------------- */

export const createExternalEvent = async ({
    name,
    clientName,
    eventType,
    description,
    eventDate,
    phoneNumber,
    email,
    hardDiskName,
}: ExternalEventProps) => {
    try {
        const session = await getAuthorizedAdminSession();

        if (!session) {
            return {
                success: false,
                message: "Unauthorized.",
            };
        }

        if (!name?.trim() || !clientName?.trim() || !eventType?.trim()) {
            return {
                success: false,
                message: "Event name, client name and event type are required.",
            };
        }

        const externalEvent = await prisma.externalEvent.create({
            data: {
                studioId: session.studioId,
                name: name.trim(),
                clientName: clientName.trim(),
                eventType: eventType.trim(),
                description: description?.trim() || null,
                eventDate: eventDate ? new Date(eventDate) : null,
                phoneNumber: phoneNumber?.trim() || null,
                email: email?.trim() || null,
                hardDiskName: hardDiskName?.trim() || null,
            },
        });

        revalidatePath("/admin");
        revalidatePath("/events");

        return {
            success: true,
            externalEvent,
        };
    } catch (error) {
        console.error("Failed to create external event:", error);

        return {
            success: false,
            message: "Failed to create external event.",
        };
    }
};

/* --------------------------------
   Update External Event
-------------------------------- */

export const updateExternalEvent = async ({
    id,
    name,
    clientName,
    eventType,
    description,
    eventDate,
    phoneNumber,
    email,
    hardDiskName,
}: UpdateExternalEventProps) => {
    try {
        const session = await getAuthorizedAdminSession();

        if (!session) {
            return {
                success: false,
                message: "Unauthorized.",
            };
        }

        if (!id) {
            return {
                success: false,
                message: "External event ID is required.",
            };
        }

        if (!name?.trim() || !clientName?.trim() || !eventType?.trim()) {
            return {
                success: false,
                message: "Event name, client name and event type are required.",
            };
        }

        /*
         * Verify ownership using the authenticated session.
         * Never trust a studioId supplied by the client.
         */
        const existingEvent = await prisma.externalEvent.findFirst({
            where: {
                id,
                studioId: session.studioId,
            },
            select: {
                id: true,
            },
        });

        if (!existingEvent) {
            return {
                success: false,
                message: "External event not found.",
            };
        }

        const externalEvent = await prisma.externalEvent.update({
            where: {
                id: existingEvent.id,
            },
            data: {
                name: name.trim(),
                clientName: clientName.trim(),
                eventType: eventType.trim(),
                description: description?.trim() || null,
                eventDate: eventDate ? new Date(eventDate) : null,
                phoneNumber: phoneNumber?.trim() || null,
                email: email?.trim() || null,
                hardDiskName: hardDiskName?.trim() || null,
            },
        });

        revalidatePath("/admin");
        revalidatePath("/events");

        return {
            success: true,
            externalEvent,
        };
    } catch (error) {
        console.error("Failed to update external event:", error);

        return {
            success: false,
            message: "Failed to update external event.",
        };
    }
};

/* --------------------------------
   Permanently Delete External Event
-------------------------------- */

export const deleteExternalEvent = async (id: string) => {
    try {
        const session = await getAuthorizedAdminSession();

        if (!session) {
            return {
                success: false,
                message: "Unauthorized.",
            };
        }

        if (!id) {
            return {
                success: false,
                message: "External event ID is required.",
            };
        }

        /*
         * Verify that this external event belongs to
         * the authenticated admin's studio.
         */
        const existingEvent = await prisma.externalEvent.findFirst({
            where: {
                id,
                studioId: session.studioId,
            },
            select: {
                id: true,
            },
        });

        if (!existingEvent) {
            return {
                success: false,
                message: "External event not found.",
            };
        }

        /*
         * Permanent deletion.
         *
         * Unlike Picknovate Events, External Events are
         * completely removed from the database.
         */
        await prisma.externalEvent.delete({
            where: {
                id: existingEvent.id,
            },
        });

        revalidatePath("/admin");
        revalidatePath("/events");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to delete external event:", error);

        return {
            success: false,
            message: "Failed to delete external event.",
        };
    }
};