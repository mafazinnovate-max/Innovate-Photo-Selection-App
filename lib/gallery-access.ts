import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const hasGalleryAccess = async (
    shareId: string,
    parentId?: string | null,
) => {
    const cookieStore = await cookies();

    // Admin bypass
    const adminAuth =
        cookieStore.get("admin-auth")?.value;

    if (adminAuth === "true") {
        return true;
    }

    const event = await prisma.event.findUnique({
        where: {
            shareId,
        },
        select: {
            accessCodeVersion: true,
        },
    });

    if (!event) {
        return false;
    }

    const authCookie =
        cookieStore.get(
            `gallery-auth-${shareId}-${parentId ?? "root"}`,
        )?.value;

    if (!authCookie) {
        return false;
    }

    return (
        authCookie ===
        String(event.accessCodeVersion)
    );
};