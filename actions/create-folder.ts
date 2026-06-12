"use server";

import { prisma } from "@/lib/prisma";

interface CreateFolderProps {
  name: string;
  eventId: string;
  type?: string;
  parentId?: string; // 👈 IMPORTANT (for bride/groom subfolders)
}

export const createFolder = async ({
  name,
  eventId,
  type = "general",
  parentId,
}: CreateFolderProps) => {
  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        eventId,
        type,
        parentId: parentId ?? null, // 👈 safe DB insert
      },
    });

    return {
      success: true,
      folder,
    };
  } catch (error) {
    console.log("Create Folder Error:", error);
    return { success: false };
  }
};