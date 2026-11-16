import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cloudinary from "@/lib/cloudinary";
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
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const type = formData.get("type");

    // Portfolio photo limit: maximum 25 photos per studio
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
        {
          success: false,
          error: "No file provided",
        },
        {
          status: 400,
        }
      );
    }

    if (
      type !== "logo" &&
      type !== "cover" &&
      type !== "portfolio"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid upload type",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Image must be smaller than 10MB",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folder =
      type === "logo"
        ? `studio-profiles/${session.studioId}/logo`
        : type === "cover"
          ? `studio-profiles/${session.studioId}/cover`
          : `studio-profiles/${session.studioId}/portfolio`;

    const result = await new Promise<any>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: "image",
            },
            (error, uploadResult) => {
              if (error) {
                reject(error);
              } else {
                resolve(uploadResult);
              }
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Profile media upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Image upload failed",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const publicId =
      typeof body.publicId === "string"
        ? body.publicId.trim()
        : "";

    if (!publicId) {
      return NextResponse.json(
        {
          success: false,
          error: "Public ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const studioPrefix = `studio-profiles/${session.studioId}/`;

    if (!publicId.startsWith(studioPrefix)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid media ownership",
        },
        {
          status: 403,
        }
      );
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

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
      {
        status: 500,
      }
    );
  }
}