"use server";

import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

interface CreateEventProps {
  name: string;
  clientName: string;
  eventType: string;
  description?: string;
}

export const createEvent = async ({
  name,
  clientName,
  eventType,
  description,
}: CreateEventProps) => {
  try {
    const event = await prisma.event.create({
      data: {
        name,
        clientName,
        eventType,
        description,
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
