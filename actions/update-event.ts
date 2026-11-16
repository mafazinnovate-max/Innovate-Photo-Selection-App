"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import {
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

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
    coverImageKey?: string;
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
    coverImageKey,
    coverPosition,
}: UpdateEventProps) => {
    let newCoverKeyToCleanup: string | null = null;
    let updateSucceeded = false;

    try {
        // 1. Authenticate admin
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        const session = await verifyAuthToken(token);

        if (
            !session ||
            session.role !== "admin" ||
            !session.adminId ||
            !session.studioId
        ) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        // 2. Verify admin and studio
        const admin = await prisma.admin.findUnique({
            where: {
                id: session.adminId,
            },
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
            return {
                success: false,
                message: "Studio access denied",
            };
        }

        // 3. Validate new R2 cover key, if supplied
        if (coverImageKey !== undefined) {
            const expectedPrefix =
                `studios/${session.studioId}/event-covers/`;

            if (
                typeof coverImageKey !== "string" ||
                !coverImageKey.startsWith(expectedPrefix) ||
                coverImageKey.includes("..") ||
                coverImageKey.includes("\\") ||
                !coverImageKey.endsWith(".webp")
            ) {
                return {
                    success: false,
                    message: "Invalid cover image",
                };
            }

            newCoverKeyToCleanup = coverImageKey;

            // Verify that the uploaded cover exists in R2
            await r2.send(
                new HeadObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: coverImageKey,
                })
            );
        }

        // 4. Verify event belongs to this studio
        const existingEvent = await prisma.event.findFirst({
            where: {
                id,
                studioId: session.studioId,
                deletedAt: null,
            },
            select: {
                id: true,
                coverImageKey: true,
            },
        });

        if (!existingEvent) {
            if (newCoverKeyToCleanup) {
                await r2.send(
                    new DeleteObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: newCoverKeyToCleanup,
                    })
                );
                newCoverKeyToCleanup = null;
            }

            return {
                success: false,
                message: "Event not found",
            };
        }

        // 5. Update event
        const event = await prisma.event.update({
            where: {
                id: existingEvent.id,
            },
            data: {
                name,
                clientName,
                eventType,
                description,
                eventDate: eventDate ? new Date(eventDate) : null,
                phoneNumber,
                email,
                galleryMode,

                // Only replace legacy cover fields when a new R2
                // cover is supplied. Never save signed URLs.
                ...(coverImageKey !== undefined
                    ? {
                        coverImageKey,
                        coverImageUrl: null,
                        coverImagePublicId: null,
                    }
                    : {}),

                coverPosition,
                accessCode: generateAccessCode(),
            },
        });

        updateSucceeded = true;

        // 6. Delete previous R2 cover only after DB update succeeds
        if (
            coverImageKey &&
            existingEvent.coverImageKey &&
            existingEvent.coverImageKey !== coverImageKey
        ) {
            try {
                await r2.send(
                    new DeleteObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: existingEvent.coverImageKey,
                    })
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to delete previous event cover:",
                    cleanupError
                );
            }
        }

        revalidatePath("/events");
        revalidatePath(`/events/${id}`);

        return {
            success: true,
            event,
        };
    } catch (error) {
        console.error("Update event error:", error);

        // Clean up newly uploaded cover if DB update failed
        if (newCoverKeyToCleanup && !updateSucceeded) {
            try {
                await r2.send(
                    new DeleteObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: newCoverKeyToCleanup,
                    })
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up new event cover:",
                    cleanupError
                );
            }
        }

        return {
            success: false,
            message: "Unable to update event",
        };
    }
};