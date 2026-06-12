"use server";

import { prisma } from "@/lib/prisma";

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