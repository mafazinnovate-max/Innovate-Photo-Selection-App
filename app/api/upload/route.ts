import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const folderId = formData.get("folderId") as string;

    if (folderId) {
      const existingImage =
        await prisma.image.findFirst({
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
    }

    const originalName = fileName.split(".")[0].replace(/\s+/g, "-");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "wedding-gallery",
              public_id: originalName,
              overwrite: false,
              unique_filename: false,
              resource_type: "image",
            },
            (error, result) => {
              if (error)
                reject(error);
              else
                resolve(result);
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      fileName: fileName,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      {
        status: 500,
      },
    );
  }
}
