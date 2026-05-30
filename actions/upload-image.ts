"use server";

import { prisma } from "@/lib/prisma";

interface UploadImageProps {
  imageUrl: string;
  publicId: string;
  fileName: string;
  folderId: string;
}

export const uploadImage = async ({
  imageUrl,
  publicId,
  fileName,
  folderId,
}: UploadImageProps) => {
  try {
    await prisma.image.create({
      data: {
        imageUrl,
        publicId,
        fileName,
        folderId,
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
};
