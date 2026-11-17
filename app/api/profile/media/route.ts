
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";

async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const session = await verifyAuthToken(token);

  if (!session || session.role !== "admin" || !session.studioId) {
    return null;
  }

  return session;
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const type = formData.get("type");

    // Portfolio photo limit: maximum 25 photos per studio.
    if (type === "portfolio") {
      const currentCountValue = formData.get("currentCount");
      const currentCount = Number(currentCountValue);

      if (
        typeof currentCountValue !== "string" ||
        !/^\d+$/.test(currentCountValue) ||
        !Number.isInteger(currentCount) ||
        currentCount < 0 ||
        currentCount >= 25
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Maximum 25 portfolio photos are allowed.",
          },
          { status: 400 }
        );
      }
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (
      type !== "logo" &&
      type !== "cover" &&
      type !== "portfolio"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid upload type" },
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
        {
          success: false,
          error: "Only PNG, JPG and WEBP images are allowed",
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Image must be smaller than 10MB",
        },
        { status: 400 }
      );
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/jpeg"
          ? "jpg"
          : "webp";

    const storageKey =
      `studios/${session.studioId}/profile/${type}/${randomUUID()}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const url = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
      }),
      { expiresIn: 3600 }
    );

    return NextResponse.json({
      success: true,
      url,
      publicId: storageKey,
    });
  } catch (error) {
    console.error("Profile media upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Image upload failed",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const publicId =
      typeof body.publicId === "string"
        ? body.publicId.trim()
        : "";

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "Public ID is required" },
        { status: 400 }
      );
    }

    const studioPrefix =
      `studios/${session.studioId}/profile/`;

    if (!publicId.startsWith(studioPrefix)) {
      return NextResponse.json(
        { success: false, error: "Invalid media ownership" },
        { status: 403 }
      );
    }

    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: publicId,
      })
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Profile media deletion error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Image deletion failed",
      },
      { status: 500 }
    );
  }
}
