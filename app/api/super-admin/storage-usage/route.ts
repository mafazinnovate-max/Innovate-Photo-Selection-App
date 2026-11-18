import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import { getPlatformStorageUsage } from "@/lib/storage-usage";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // 1. Verify Super Admin authentication.
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const session = await verifyAuthToken(token);

        if (!session || session.role !== "superadmin") {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            );
        }

        // 2. Get actual R2 storage usage.
        const storage = await getPlatformStorageUsage();

        // 3. Get all Studios and their latest subscription.
        const studios = await prisma.studio.findMany({
            select: {
                id: true,
                name: true,
                Subscription: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    select: {
                        plan: true,
                        status: true,
                        storageLimitGb: true,
                        endDate: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // 4. Combine Studio details with actual R2 usage.
        const usageMap = new Map(
            storage.studioUsage.map((item) => [
                item.studioId,
                item,
            ])
        );

        const studioUsage = studios.map((studio) => {
            const usage = usageMap.get(studio.id);

            const usedBytes = usage?.totalBytes ?? 0;
            const usedGB = usedBytes / (1024 ** 3);

            const subscription = studio.Subscription[0] ?? null;
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

            return {
                studioId: studio.id,
                studioName: studio.name,

                plan: subscription?.plan ?? null,
                subscriptionStatus:
                    subscription?.status ?? null,
                subscriptionEndDate:
                    subscription?.endDate ?? null,

                usedBytes,
                usedGB,
                objectCount: usage?.objectCount ?? 0,

                storageLimitGb,
                remainingGB,

                usagePercentage: Math.min(
                    usagePercentage,
                    100
                ),
            };
        });

        // 5. Return complete platform storage summary.
        return NextResponse.json({
            success: true,

            summary: {
                totalBytes: storage.totalBytes,
                totalGB: storage.totalGB,

                privateBucket: storage.privateBucket,
                publicBucket: storage.publicBucket,
                unassigned: storage.unassigned,

                studioCount: studios.length,
            },

            studios: studioUsage,

            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error(
            "Super Admin Storage Usage API Error:",
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