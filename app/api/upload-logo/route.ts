import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cloudinary from "@/lib/cloudinary";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const session = await verifyAuthToken(token);

    if (
      !session ||
      session.role !== "admin" ||
      !session.studioId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
        },
        {
          status: 400,
        }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "Logo must be smaller than 5MB",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "studio-logos",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(buffer);
      }
    );

    await prisma.studio.update({
      where: {
        id: session.studioId,
      },
      data: {
        logoUrl: result.secure_url,
      },
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Logo upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logo upload failed",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const session = await verifyAuthToken(token);

    if (
      !session ||
      session.role !== "admin" ||
      !session.studioId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const studio = await prisma.studio.findUnique({
      where: {
        id: session.studioId,
      },
      select: {
        logoUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      logoUrl: studio?.logoUrl ?? null,
    });
  } catch (error) {
    console.error("Get logo error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load studio logo",
      },
      {
        status: 500,
      }
    );
  }
}