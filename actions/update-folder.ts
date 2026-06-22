"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateFolder = async (
    folderId: string,
    name: string,
) => {
    try {
        const folder = await prisma.folder.update({
            where: {
                id: folderId,
            },
            data: {
                name,
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