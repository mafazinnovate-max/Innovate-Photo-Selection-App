import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import {
    r2Public,
    R2_PUBLIC_BUCKET_NAME,
    R2_PUBLIC_URL,
} from "@/lib/r2-public";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

export async function POST(request: Request) {
    let uploadedKey: string | null = null;

    try {
        // 1. Super Admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        const session = await verifyAuthToken(token);

        if (!session || session.role !== "superadmin") {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        // 2. Validate uploaded file
        const formData = await request.formData();
        const file = formData.get("logo");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { message: "Please select a logo image." },
                { status: 400 }
            );
        }

        const extension = ALLOWED_TYPES[file.type];

        if (!extension) {
            return NextResponse.json(
                {
                    message:
                        "Only PNG, JPEG and WebP images are allowed.",
                },
                { status: 400 }
            );
        }

        if (file.size === 0 || file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { message: "Logo size must be greater than 0 and less than 5MB." },
                { status: 400 }
            );
        }

        // 3. Find Super Admin
        const superAdmin = await prisma.superAdmin.findFirst();

        if (!superAdmin) {
            return NextResponse.json(
                { message: "Super Admin account not found." },
                { status: 404 }
            );
        }

        // 4. Generate unique R2 object key
        const storageKey =
            `picnovate/platform/superadmin/logo-${randomUUID()}.${extension}`;

        const bytes = Buffer.from(await file.arrayBuffer());

        // 5. Upload to separate public R2 bucket
        await r2Public.send(
            new PutObjectCommand({
                Bucket: R2_PUBLIC_BUCKET_NAME,
                Key: storageKey,
                Body: bytes,
                ContentType: file.type,
                CacheControl: "public, max-age=31536000, immutable",
            })
        );

        uploadedKey = storageKey;

        // 6. Build public logo URL
        const logoUrl = `${R2_PUBLIC_URL}/${storageKey}`;

        // 7. Update database
        await prisma.superAdmin.update({
            where: { id: superAdmin.id },
            data: {
                logoUrl,
                logoStorageKey: storageKey,
            },
        });

        return NextResponse.json({
            message: "Platform logo uploaded successfully.",
            logoUrl,
        });
    } catch (error) {
        console.error("Platform logo R2 upload failed:", error);

        // Upload succeeded but database update failed.
        // Keep the uploaded file for investigation/recovery.
        return NextResponse.json(
            {
                message:
                    "Platform logo upload failed. Please check server logs and try again.",
            },
            { status: 500 }
        );
    }
}