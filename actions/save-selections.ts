"use server";

import { prisma } from "@/lib/prisma";

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

    for (const imageId of folderImageIds) {
      const isSelected = selectedImages.includes(imageId);

      // UPDATE IMAGE TABLE
      await prisma.image.update({
        where: {
          id: imageId,
        },
        data: {
          isSelected,
          comment: comments[imageId] || null,
          selectionOrder: isSelected
            ? selectedImages.indexOf(imageId) + 1
            : null,
        },
      });

      // REMOVE FROM SELECTION TABLE
      if (!isSelected) {
        await prisma.selection.deleteMany({
          where: {
            imageId,
          },
        });
      }
    }

    // CREATE / UPDATE selected images
    for (const imageId of selectedImages) {
      const existingSelection = await prisma.selection.findFirst({
        where: {
          imageId,
        },
      });

      if (existingSelection) {
        await prisma.selection.update({
          where: {
            id: existingSelection.id,
          },
          data: {
            comment: comments[imageId] || "",
          },
        });
      } else {
        await prisma.image.update({
          where: {
            id: imageId,
          },
          data: {
            isSelected: true,
            selectionOrder: selectedImages.indexOf(imageId) + 1,
          },
        });
        await prisma.selection.create({
          data: {
            imageId,
            comment: comments[imageId] || "",
          },
        });
      }
    }

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
