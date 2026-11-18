import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import { getPlatformStorageUsage } from "@/lib/storage-usage";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // 1. Verify Admin authentication.
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const session = await verifyAuthToken(token);

        if (
            !session ||
            session.role !== "admin" ||
            !session.studioId
        ) {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            );
        }

        const studioId = session.studioId;

        // 2. Get actual R2 storage usage.
        const storage = await getPlatformStorageUsage();

        // 3. Get only this Admin's studio usage.
        const studioUsage = storage.studioUsage.find(
            (item) => item.studioId === studioId
        );

        const usedBytes = studioUsage?.totalBytes ?? 0;
        const usedGB = usedBytes / (1024 ** 3);

        // 4. Get this studio's latest subscription.
        const subscription = await prisma.subscription.findFirst({
            where: {
                studioId,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                plan: true,
                status: true,
                storageLimitGb: true,
                endDate: true,
            },
        });

        const storageLimitGb =
            subscription?.storageLimitGb ?? 0;

        const remainingGB = Math.max(
            storageLimitGb - usedGB,
            0
        );

        const usagePercentage =
            storageLimitGb > 0
                ? (usedGB / storageLimitGb) * 100
                : 0;

        // 5. Return only this studio's storage information.
        return NextResponse.json({
            success: true,

            storage: {
                studioId,

                plan: subscription?.plan ?? null,
                subscriptionStatus:
                    subscription?.status ?? null,
                subscriptionEndDate:
                    subscription?.endDate ?? null,

                usedBytes,
                usedGB,

                objectCount: studioUsage?.objectCount ?? 0,

                storageLimitGb,
                remainingGB,

                usagePercentage: Math.min(
                    usagePercentage,
                    100
                ),
            },

            lastUpdated: new Date().toISOString(),
        });

    } catch (error) {
        console.error(
            "Admin Storage Usage API Error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch storage usage.",
            },
            { status: 500 }
        );
    }
}