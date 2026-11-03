"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateFolderProps {
  name: string;
  eventId: string;
  type?: string;
  parentId?: string; // 👈 IMPORTANT (for bride/groom subfolders)
  hardDiskName?: string;
}

export const createFolder = async ({
  name,
  eventId,
  type = "general",
  parentId,
  hardDiskName,
}: CreateFolderProps) => {
  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        eventId,
        type,
        parentId: parentId ?? null, // 👈 safe DB insert
        hardDiskName: hardDiskName ?? null,
      },
    });
    revalidatePath(`/events/${eventId}`);
    return {
      success: true,
      folder,
    };
  } catch (error) {
    console.log("Create Folder Error:", error);
    return { success: false };
  }
};