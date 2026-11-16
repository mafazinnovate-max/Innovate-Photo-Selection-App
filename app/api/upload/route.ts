
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const fileName = formData.get("fileName");
    const folderId = formData.get("folderId");

    if (
      !(file instanceof File) ||
      typeof fileName !== "string" ||
      !fileName.trim() ||
      typeof folderId !== "string" ||
      !folderId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload details",
        },
        { status: 400 }
      );
    }

    // Check duplicate filename inside the same folder
    const existingImage = await prisma.image.findFirst({
      where: {
        folderId,
        fileName,
      },
    });

    if (existingImage) {
      return NextResponse.json({
        success: true,
        skipped: true,
        url: existingImage.imageUrl,
        publicId: existingImage.publicId,
        fileName: existingImage.fileName,
      });
    }

    // Create a unique R2 object key
    const safeFileName = fileName
      .replace(/[\/\\]/g, "-")
      .replace(/\s+/g, "-");

    const objectKey = `wedding-gallery/${folderId}/${randomUUID()}-${safeFileName}`;

    // Upload image to Cloudflare R2
    const bytes = await file.arrayBuffer();

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
        Body: Buffer.from(bytes),
        ContentType: file.type || "application/octet-stream",
      })
    );

    return NextResponse.json({
      success: true,
      url: objectKey,
      publicId: objectKey,
      fileName,
    });
  } catch (error) {
    console.error("R2 image upload failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      { status: 500 }
    );
  }
}