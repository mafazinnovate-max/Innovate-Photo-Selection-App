import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const originalName = body.fileName.split(".")[0].replace(/\s+/g, "-");

    const result = await cloudinary.uploader.upload(body.image, {
      folder: "wedding-gallery",
      public_id: originalName,
      overwrite: false,
      unique_filename: false,
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      fileName: body.fileName,
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
