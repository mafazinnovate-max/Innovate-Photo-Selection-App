
"use server";

import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
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
  coverImageKey?: string;
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
  coverImageKey,
  coverPosition,
}: CreateEventProps) => {
  let newCoverKeyToCleanup: string | null = null;
  let eventCreated = false;

  try {
    // 1. Get the logged-in admin's session
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

    // 2. Validate and verify the uploaded R2 cover
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

      await r2.send(
        new HeadObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: coverImageKey,
        })
      );
    }

    // 3. Check subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        studioId: session.studioId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        maxEvents: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found.");
    }

    // 4. Check event limit
    const eventCount = await prisma.event.count({
      where: {
        studioId: session.studioId,
        createdAt: {
          gte: subscription.startDate,
          ...(subscription.endDate
            ? {
              lte: subscription.endDate,
            }
            : {}),
        },
      },
    });

    if (eventCount >= subscription.maxEvents) {
      throw new Error(
        `You have reached your event limit of ${subscription.maxEvents}. Please contact the administrator to increase your limit.`
      );
    }

    // 5. Create the event
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

        // Store only the R2 object key.
        // Never store a temporary signed URL.
        coverImageUrl: null,
        coverImagePublicId: null,
        coverImageKey,

        coverPosition,
        shareId: randomUUID(),
        accessCode: generateAccessCode(),
      },
    });

    eventCreated = true;

    revalidatePath("/events");

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error("Create event error:", error);

    // 6. Clean up uploaded cover if event creation failed
    if (newCoverKeyToCleanup && !eventCreated) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: newCoverKeyToCleanup,
          })
        );
      } catch (cleanupError) {
        console.error(
          "Failed to clean up uploaded event cover:",
          cleanupError
        );
      }
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create event.",
    };
  }
};