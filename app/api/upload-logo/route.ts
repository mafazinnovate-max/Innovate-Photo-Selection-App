import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cloudinary from "@/lib/cloudinary";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const session = await verifyAuthToken(token);

  if (
    !session ||
    session.role !== "admin" ||
    !session.studioId
  ) {
    return null;
  }

  return session;
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
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

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
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

    const body = await request.json();

    const zoom = Number(body.zoom);
    const positionX = Number(body.positionX);
    const positionY = Number(body.positionY);

    if (
      !Number.isFinite(zoom) ||
      !Number.isFinite(positionX) ||
      !Number.isFinite(positionY)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid logo transform values",
        },
        {
          status: 400,
        }
      );
    }

    const studio = await prisma.studio.update({
      where: {
        id: session.studioId,
      },
      data: {
        logoZoom: zoom,
        logoPositionX: positionX,
        logoPositionY: positionY,
      },
     select: {
  name: true,
  logoUrl: true,
  logoZoom: true,
  logoPositionX: true,
  logoPositionY: true,
},
    });

    return NextResponse.json({
  success: true,
  studioName: studio?.name ?? "Your Studio",
  logoUrl: studio?.logoUrl ?? null,
  logoZoom: studio?.logoZoom ?? 1,
  logoPositionX: studio?.logoPositionX ?? 0,
  logoPositionY: studio?.logoPositionY ?? 0,
});
  } catch (error) {
    console.error("Save logo transform error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save logo settings",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
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
  name: true,
  logoUrl: true,
  logoZoom: true,
  logoPositionX: true,
  logoPositionY: true,
},
    });

   return NextResponse.json({
  success: true,
  studioName: studio?.name ?? "Your Studio",
  logoUrl: studio?.logoUrl ?? null,
  logoZoom: studio?.logoZoom ?? 1,
  logoPositionX: studio?.logoPositionX ?? 0,
  logoPositionY: studio?.logoPositionY ?? 0,
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