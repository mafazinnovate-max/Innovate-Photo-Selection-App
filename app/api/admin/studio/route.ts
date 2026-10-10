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

  if (
    !session ||
    session.role !== "admin" ||
    !session.studioId
  ) {
    return null;
  }

  return session;
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
        id: true,
        name: true,
        logoUrl: true,
      },
    });

    if (!studio) {
      return NextResponse.json(
        {
          success: false,
          message: "Studio not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      studio,
    });
  } catch (error) {
    console.error("Studio fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load studio",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request) {
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

    const logoUrl =
      typeof body.logoUrl === "string" && body.logoUrl.trim()
        ? body.logoUrl.trim()
        : null;

    const studio = await prisma.studio.update({
      where: {
        id: session.studioId,
      },
      data: {
        logoUrl,
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      studio,
    });
  } catch (error) {
    console.error("Studio update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update studio",
      },
      {
        status: 500,
      }
    );
  }
}