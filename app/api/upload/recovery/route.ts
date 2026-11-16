import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processImage } from "@/lib/process-image";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 10;
const STALE_MINUTES = 10;

export async function GET(request: Request) {
    try {
        // Secure this endpoint with a secret.
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            return NextResponse.json(
                { success: false, message: "CRON_SECRET is not configured." },
                { status: 500 }
            );
        }

        const authorization = request.headers.get("authorization");

        if (authorization !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const staleTime = new Date(
            Date.now() - STALE_MINUTES * 60 * 1000
        );

        // Mark jobs that exhausted all attempts as failed.
        await prisma.image.updateMany({
            where: {
                processingStatus: "PROCESSING",
                processingAttempts: { gte: MAX_ATTEMPTS },
                processingStartedAt: { lt: staleTime },
            },
            data: {
                processingStatus: "FAILED",
                processingStartedAt: null,
                processingError: "Maximum processing attempts reached.",
            },
        });

        // Find jobs that need processing or recovery.
        const jobs = await prisma.image.findMany({
            where: {
                processingAttempts: { lt: MAX_ATTEMPTS },
                OR: [
                    { processingStatus: "PENDING" },
                    { processingStatus: "FAILED" },
                    {
                        processingStatus: "PROCESSING",
                        processingStartedAt: { lt: staleTime },
                    },
                ],
            },
            orderBy: { createdAt: "asc" },
            take: BATCH_SIZE,
            select: {
                id: true,
                processingStatus: true,
                processingStartedAt: true,
            },
        });

        const queuedIds: string[] = [];

        for (const job of jobs) {
            if (job.processingStatus === "PENDING") {
                queuedIds.push(job.id);
                continue;
            }

            // Requeue failed or stale processing jobs safely.
            const updated = await prisma.image.updateMany({
                where: {
                    id: job.id,
                    processingStatus: job.processingStatus,
                    processingStartedAt: job.processingStartedAt,
                },
                data: {
                    processingStatus: "PENDING",
                    processingStartedAt: null,
                    processingError: null,
                },
            });

            if (updated.count > 0) {
                queuedIds.push(job.id);
            }
        }

        // Start processing after sending the API response.
        if (queuedIds.length > 0) {
            after(async () => {
                await Promise.allSettled(
                    queuedIds.map((id) => processImage(id))
                );
            });
        }

        return NextResponse.json({
            success: true,
            message: "Image recovery check completed.",
            queued: queuedIds.length,
            imageIds: queuedIds,
        });
    } catch (error) {
        console.error("Image recovery failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Image recovery failed.",
            },
            { status: 500 }
        );
    }
}