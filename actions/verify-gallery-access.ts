"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const verifyGalleryAccess = async (
    shareId: string,
    accessCode: string,
    parentId?: string | null,
) => {
    try {
        const event = await prisma.event.findUnique({
            where: {
                shareId,
            },
        });

        if (!event) {
            return {
                success: false,
                message: "Gallery not found",
            };
        }

        if (event.accessCode !== accessCode) {
            return {
                success: false,
                message: "Invalid access code",
            };
        }

        const cookieStore = await cookies();

        let deviceId =
            cookieStore.get("gallery-device-id")?.value;

        if (!deviceId) {
            deviceId = randomUUID();

            cookieStore.set(
                "gallery-device-id",
                deviceId,
                {
                    httpOnly: true,
                    secure:
                        process.env.NODE_ENV === "production",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 365,
                },
            );
        }

        const existingDevice =
            await prisma.galleryAccess.findFirst({
                where: {
                    eventId: event.id,
                    parentId: parentId ?? null,
                    deviceId,
                    accessVersion:
                        event.accessCodeVersion,
                },
            });

        if (!existingDevice) {
            const totalDevices =
                await prisma.galleryAccess.count({
                    where: {
                        eventId: event.id,
                        parentId: parentId ?? null,
                        accessVersion:
                            event.accessCodeVersion,
                    },
                });

            if (totalDevices >= 2) {
                return {
                    success: false,
                    message:
                        "Maximum device limit reached. Contact administrator.",
                };
            }

            await prisma.galleryAccess.create({
                data: {
                    eventId: event.id,
                    parentId: parentId ?? null,
                    deviceId,
                    accessVersion:
                        event.accessCodeVersion,
                },
            });
        }

        cookieStore.set(
            `gallery-auth-${shareId}-${parentId ?? "root"}`,
            String(event.accessCodeVersion),
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
            },
        );

        return {
            success: true,
        };
    } catch (error) {
        console.log(error);

        return {
            success: false,
            message: "Something went wrong",
        };
    }
};