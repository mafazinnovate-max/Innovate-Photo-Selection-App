"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

export const checkEventLimit = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return {
                success: false,
                allowed: false,
                message: "Unauthorized",
            };
        }

        const session = await verifyAuthToken(token);

        if (
            !session ||
            session.role !== "admin" ||
            !session.studioId
        ) {
            return {
                success: false,
                allowed: false,
                message: "Unauthorized",
            };
        }

        const subscription = await prisma.subscription.findFirst({
            where: {
                studioId: session.studioId,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                maxEvents: true,
            },
        });

        if (!subscription) {
            return {
                success: false,
                allowed: false,
                message: "Subscription not found.",
            };
        }

        const eventCount = await prisma.event.count({
            where: {
                studioId: session.studioId,
            },
        });

        console.log("EVENT LIMIT DEBUG:", {
    sessionStudioId: session.studioId,
    maxEvents: subscription.maxEvents,
    eventCount,
});

        if (eventCount  >= subscription.maxEvents) {
            return {
                success: true,
                allowed: false,
                message: `You have reached your event limit of ${subscription.maxEvents}. Please contact the administrator to increase your limit.`,
            };
        }

        return {
            success: true,
            allowed: true,
        };
    } catch (error) {
        console.error("Failed to check event limit:", error);

        return {
            success: false,
            allowed: false,
            message: "Unable to check event limit.",
        };
    }
};