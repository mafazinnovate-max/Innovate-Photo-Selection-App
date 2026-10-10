"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface SaveSelectionsProps {
  folderId: string;
  selectedImages: string[];
  comments: Record<string, string>;
}

export const saveSelections = async ({
  folderId,
  selectedImages,
  comments,
}: SaveSelectionsProps) => {
  try {
    // ALL IMAGES FROM FOLDER
    const folderImages = await prisma.image.findMany({
      where: {
        folderId,
      },
      select: {
        id: true,
      },
    });

    const folderImageIds = folderImages.map((img) => img.id);

    await prisma.image.updateMany({
      where: {
        folderId,
      },
      data: {
        isSelected: false,
        selectionOrder: null,
      },
    });

    await prisma.selection.deleteMany({
      where: {
        imageId: {
          in: folderImageIds,
        },
      },
    });

    // CREATE / UPDATE selected images
    await prisma.$transaction(
      selectedImages.map((imageId, index) =>
        prisma.image.update({
          where: {
            id: imageId,
          },
          data: {
            isSelected: true,
            selectionOrder: index + 1,
            comment: comments[imageId] || null,
          },
        })
      )
    );

    if (selectedImages.length > 0) {
      await prisma.selection.createMany({
        data: selectedImages.map((imageId) => ({
          imageId,
          comment: comments[imageId] || "",
        })),
      });
    }
    const folder = await prisma.folder.findUnique({
  where: {
    id: folderId,
  },
  select: {
    event: {
      select: {
        shareId: true,
      },
    },
  },
});

if (!folder) {
  throw new Error("Folder not found");
}

revalidatePath(`/gallery/${folder.event.shareId}`);
revalidatePath(`/gallery/${folder.event.shareId}/folder/${folderId}`);

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
