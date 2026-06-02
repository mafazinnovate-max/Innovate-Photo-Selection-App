"use server";

import { prisma } from "@/lib/prisma";

export async function toggleImageStatus(
  imageId: string,
  currentStatus: boolean,
) {
  try {
    await prisma.image.update({
      where: {
        id: imageId,
      },
      data: {
        status: !currentStatus,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
    };
  }
}