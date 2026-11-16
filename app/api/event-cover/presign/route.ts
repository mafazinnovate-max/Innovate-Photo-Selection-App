import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 40 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

export async function POST(request: Request) {
    try {
        // 1. Authenticate admin
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
            !session.adminId ||
            !session.studioId
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Verify admin and studio
        const admin = await prisma.admin.findUnique({
            where: { id: session.adminId },
            select: {
                studioId: true,
                studio: {
                    select: {
                        isActive: true,
                    },
                },
            },
        });

        if (
            !admin ||
            admin.studioId !== session.studioId ||
            !admin.studio.isActive
        ) {
            return NextResponse.json(
                { success: false, message: "Studio access denied" },
                { status: 403 }
            );
        }

        // 3. Validate upload details
        const body = await request.json();

        const fileName = body.fileName;
        const contentType = body.contentType;
        const fileSize = body.fileSize;

        if (
            typeof fileName !== "string" ||
            !fileName.trim() ||
            typeof contentType !== "string" ||
            !ALLOWED_CONTENT_TYPES.includes(contentType) ||
            typeof fileSize !== "number" ||
            !Number.isSafeInteger(fileSize) ||
            fileSize <= 0 ||
            fileSize > MAX_FILE_SIZE
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid image. Maximum file size is 40MB.",
                },
                { status: 400 }
            );
        }

        // 4. Generate a unique temporary R2 key
        const uploadId = randomUUID();

        const storageKey =
            `studios/${admin.studioId}` +
            `/event-cover-uploads/${uploadId}`;

        // 5. Generate direct R2 upload URL
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
        console.error("Event cover presign error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to prepare cover image upload",
            },
            { status: 500 }
        );
    }
}