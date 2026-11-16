import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/svg+xml",
];

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

        // 2. Verify admin belongs to an active studio

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

        // 3. Validate request
        const body = await req.json();

        const { fileName, contentType, fileSize } = body;

        if (
            typeof fileName !== "string" ||
            !fileName.trim() ||
            typeof contentType !== "string" ||
            !ALLOWED_CONTENT_TYPES.includes(contentType) ||
            typeof fileSize !== "number" ||
            !Number.isInteger(fileSize) ||
            fileSize <= 0 ||
            fileSize > MAX_FILE_SIZE
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid file. Allowed formats: JPEG, PNG, WebP, AVIF and SVG. Maximum size is 5MB.",
                },
                { status: 400 }
            );
        }

        // 4. Generate temporary R2 storage key
        const uploadId = randomUUID();

        const storageKey =
            `studios/${admin.studioId}/studio-logo-uploads/${uploadId}`;

        // 5. Generate secure presigned upload URL
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: storageKey,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(r2, command, {
            expiresIn: 900,
        });

        return NextResponse.json({
            success: true,
            uploadUrl,
            storageKey,
            fileName: fileName.trim(),
            contentType,
            fileSize,
        });
    } catch (error) {
        console.error("Studio logo presign error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to prepare logo upload",
            },
            { status: 500 }
        );
    }
}