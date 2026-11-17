"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateFolder = async (
    folderId: string,
    name: string,
    hardDiskName?: string,
) => {
    try {
        const folder = await prisma.folder.update({
            where: {
                id: folderId,
            },
            data: {
                name,
                hardDiskName: hardDiskName ?? null,
            },
        });

        revalidatePath("/events");

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