import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

async function getAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const payload = await verifyAuthToken(token);

    if (
        !payload ||
        payload.role !== "admin" ||
        !payload.adminId ||
        !payload.studioId
    ) {
        return null;
    }

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

    if (!admin) return null;

    return {
        studioId: admin.studioId,
    };
}

export async function GET() {
    try {
        const session = await getAdminSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const studio = await prisma.studio.findUnique({
            where: {
                id: session.studioId,
            },
            select: {
                logoStorageKey: true,
                logoOptimizedKey: true,
            },
        });

        if (!studio) {
            return NextResponse.json(
                { message: "Studio not found" },
                { status: 404 }
            );
        }

        const logoKey =
            studio.logoOptimizedKey || studio.logoStorageKey;

        if (!logoKey) {
            return NextResponse.json(
                { message: "Studio logo not found" },
                { status: 404 }
            );
        }

        // Fetch original WebP directly from R2.
        const object = await r2.send(
            new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: logoKey,
            })
        );

        if (!object.Body) {
            throw new Error("Logo file is empty");
        }

        // Convert WebP to PNG in memory only.
        const imageBuffer = await object.Body.transformToByteArray();

        const pngBuffer = await sharp(Buffer.from(imageBuffer))
            .png()
            .toBuffer();

        return new NextResponse(new Uint8Array(pngBuffer), {
            status: 200,
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error("PDF logo conversion error:", error);

        return NextResponse.json(
            { message: "Unable to load PDF logo" },
            { status: 500 }
        );
    }
}