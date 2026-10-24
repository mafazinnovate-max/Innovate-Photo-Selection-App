"use server";

import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

const generateAccessCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

interface CreateEventProps {
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

export const createEvent = async ({
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
}: CreateEventProps) => {
  try {
    // Get the logged-in admin's session
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
      !session.studioId
    ) {
      return {
        success: false,
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
    message: "Subscription not found.",
  };
}

const eventCount = await prisma.event.count({
  where: {
    studioId: session.studioId,
  },
});

if (eventCount + 2 > subscription.maxEvents) {
  return {
    success: false,
    message: `You have reached your event limit of ${subscription.maxEvents}. Please contact the administrator to increase your limit.`,
  };
}

    // Create the event under the logged-in admin's studio
    const event = await prisma.event.create({
      data: {
        studioId: session.studioId,
        name,
        clientName,
        eventType,
        description,
        eventDate: eventDate ? new Date(eventDate) : null,
        phoneNumber,
        email,
        galleryMode: galleryMode ?? "single",
        coverImageUrl,
        coverImagePublicId,
        coverPosition,
        shareId: randomUUID(),
        accessCode: generateAccessCode(),
      },
    });

    revalidatePath("/events");

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};