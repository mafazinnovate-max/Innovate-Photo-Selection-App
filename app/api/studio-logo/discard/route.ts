import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        // 1. Verify admin session
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const payload = await verifyAuthToken(token);

        if (
            !payload ||
            payload.role !== "admin" ||
            !payload.adminId ||
            !payload.studioId
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized access" },
                { status: 401 }
            );
        }

        // 2. Verify active admin and studio
        const admin = await prisma.admin.findFirst({
            where: {
                id: payload.adminId,
                studioId: payload.studioId,
                studio: {
                    isActive: true,
                },
            },
            select: {
                id: true,
                studioId: true,
            },
        });

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Admin or studio is inactive" },
                { status: 403 }
            );
        }

        // 3. Get currently applied logo keys
        const studio = await prisma.studio.findUnique({
            where: {
                id: admin.studioId,
            },
            select: {
                logoStorageKey: true,
                logoOptimizedKey: true,
                logoThumbnailKey: true,
            },
        });

        if (!studio) {
            return NextResponse.json(
                { success: false, message: "Studio not found" },
                { status: 404 }
            );
        }

        const activeLogoKeys = new Set(
            [
                studio.logoStorageKey,
                studio.logoOptimizedKey,
                studio.logoThumbnailKey,
            ].filter((key): key is string => Boolean(key))
        );

        // 4. Validate requested keys
        const body = await req.json();
        const { keys } = body;

        if (
            !Array.isArray(keys) ||
            keys.length > 3 ||
            !keys.every(
                (key: unknown) =>
                    typeof key === "string" &&
                    key.length > 0 &&
                    key.length <= 500
            )
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid storage keys" },
                { status: 400 }
            );
        }

        const permanentPrefix =
            `studios/${admin.studioId}/studio-logos/`;

        const temporaryPrefix =
            `studios/${admin.studioId}/studio-logo-uploads/`;

        const uniqueKeys = [...new Set(keys)] as string[];

        for (const key of uniqueKeys) {
            // Never allow deletion of currently applied logo files
            if (activeLogoKeys.has(key)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Cannot delete an active studio logo",
                    },
                    { status: 403 }
                );
            }

            const isTemporaryKey =
                key.startsWith(temporaryPrefix) &&
                /^[a-f0-9-]{36}$/i.test(
                    key.slice(temporaryPrefix.length)
                );

            const permanentParts = key.startsWith(permanentPrefix)
                ? key.slice(permanentPrefix.length).split("/")
                : [];

            const isPermanentKey =
                permanentParts.length === 2 &&
                /^[a-f0-9-]{36}$/i.test(permanentParts[0]) &&
                ["original.webp", "optimized.webp", "thumbnail.webp"].includes(
                    permanentParts[1]
                );

            if (
                !isTemporaryKey &&
                !isPermanentKey
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid storage key" },
                    { status: 400 }
                );
            }
        }

        // 5. Delete pending files only
        await Promise.all(
            uniqueKeys.map((key) =>
                r2.send(
                    new DeleteObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: key,
                    })
                )
            )
        );

        return NextResponse.json({
            success: true,
            message: "Pending logo files cleaned up",
        });
    } catch (error) {
        console.error("Studio logo discard error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to clean up pending logo files",
            },
            { status: 500 }
        );
    }
}