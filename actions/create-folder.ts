"use server";

import { prisma } from "@/lib/prisma";

interface CreateFolderProps {
  name: string;
  eventId: string;
}

export const createFolder = async ({ name, eventId }: CreateFolderProps) => {
  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        eventId,
      },
    });

    return {
      success: true,
      folder,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
    };
  }
};
