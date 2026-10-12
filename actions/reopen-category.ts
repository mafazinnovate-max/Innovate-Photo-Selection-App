"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ReopenCategoryProps {
  folderId: string;
  shareId: string;
}

export const reopenCategory = async ({
  folderId,
  shareId,
}: ReopenCategoryProps) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        event: {
          shareId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!folder) {
      throw new Error("Folder not found");
    }

    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        selectionStatus: "SELECTING",
      },
    });

    revalidatePath(`/gallery/${shareId}`);
    revalidatePath(`/gallery/${shareId}/folder/${folderId}`);

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