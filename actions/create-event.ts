"use server";

import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

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
    const event = await prisma.event.create({
      data: {
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