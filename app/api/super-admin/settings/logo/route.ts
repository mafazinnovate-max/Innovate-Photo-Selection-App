
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Please log in again." },
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

        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json(
                { message: "Cloudinary environment variables are not configured." },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("logo");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { message: "Choose a logo image first." },
                { status: 400 }
            );
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: "Only PNG, JPG and WebP images are supported." },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { message: "Logo image must be 5 MB or smaller." },
                { status: 400 }
            );
        }

        const superAdmin = await prisma.superAdmin.findFirst();

        if (!superAdmin) {
            return NextResponse.json(
                { message: "Super Admin account was not found." },
                { status: 404 }
            );
        }

        const bytes = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise<{
            secure_url: string;
            public_id: string;
        }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "picnovate/platform",
                    resource_type: "image",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"],
                },
                (error, result) => {
                    if (error || !result) {
                        reject(error ?? new Error("Cloudinary upload failed."));
                        return;
                    }

                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            );

            stream.end(bytes);
        });

        await prisma.superAdmin.update({
            where: { id: superAdmin.id },
            data: {
                logoUrl: uploadResult.secure_url,
            },
        });

        return NextResponse.json({
            message: "Platform logo uploaded successfully.",
            logoUrl: uploadResult.secure_url,
        });
    } catch (error) {
        console.error("Super Admin logo upload error:", error);

        return NextResponse.json(
            { message: "Logo upload failed. Please try again." },
            { status: 500 }
        );
    }
}