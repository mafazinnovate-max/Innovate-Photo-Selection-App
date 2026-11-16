
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

const allowedTemplates = [
  "template-1",
  "template-2",
  "template-3",
];

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifyAuthToken(token);

    if (
      !session ||
      session.role !== "admin" ||
      !session.studioId
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const templateKey = body.templateKey;

    if (
      typeof templateKey !== "string" ||
      !allowedTemplates.includes(templateKey)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid template selection",
        },
        { status: 400 }
      );
    }

    let profile;

    try {
      profile = await prisma.studioProfile.update({
        where: {
          studioId: session.studioId,
        },
        data: {
          templateKey,
        },
        select: {
          id: true,
          templateKey: true,
        },
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2025"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please save your studio profile before selecting a template.",
          },
          { status: 400 }
        );
      }

      throw error;
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Template selection error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update template",
      },
      { status: 500 }
    );
  }
}
