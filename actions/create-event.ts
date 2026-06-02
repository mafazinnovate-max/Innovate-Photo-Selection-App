"use server";

import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

interface CreateEventProps {
  name: string;
  clientName: string;
  eventType: string;
  description?: string;
  eventDate?: string;
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
        coverImageUrl,
        coverImagePublicId,
        coverPosition,
        shareId: randomUUID(),
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
