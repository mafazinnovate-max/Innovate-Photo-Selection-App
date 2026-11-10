
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
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

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "studio";
}

async function generateUniqueSlug(studioName: string) {
  const baseSlug = createSlug(studioName);
  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.studioProfile.findUnique({
      where: { publicSlug: slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (typeof body.isPublished !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "A valid publishing status is required.",
        },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.studioProfile.findUnique({
      where: {
        studioId: session.studioId,
      },
    });

    if (!existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Please save your Studio Profile before publishing.",
        },
        { status: 400 }
      );
    }

    let publicSlug = existingProfile.publicSlug;

    if (body.isPublished) {
      const requiredFields = [
        "studioName",
        "shortTagline",
        "description",
        "logoUrl",
        "coverPhotoUrl",
        "ownerName",
        "ownerPhone",
        "phoneNumber",
        "email",
        "address",
        "location",
      ] as const;

      const missingFields = requiredFields.filter((field) => {
        const value = existingProfile[field];
        return typeof value !== "string" || !value.trim();
      });

      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Please complete all required Profile details before publishing.",
            missingFields,
          },
          { status: 400 }
        );
      }

      if (!publicSlug) {
        publicSlug = await generateUniqueSlug(
          existingProfile.studioName
        );
      }
    }

    const updatedProfile = await prisma.studioProfile.update({
      where: {
        studioId: session.studioId,
      },
      data: {
        isPublished: body.isPublished,
        ...(publicSlug ? { publicSlug } : {}),
      },
      select: {
        id: true,
        studioName: true,
        publicSlug: true,
        isPublished: true,
        templateKey: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Profile publishing error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update publishing status.",
      },
      { status: 500 }
    );
  }
}
