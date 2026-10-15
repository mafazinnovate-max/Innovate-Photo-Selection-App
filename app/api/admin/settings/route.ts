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
    !session.adminId ||
    !session.studioId
  ) {
    return null;
  }

  return session;
}

/**
 * GET
 * Loads the currently logged-in admin's Studio settings.
 *
 * Ownership is taken from the authenticated session.
 * No studio/admin ID is accepted from the browser.
 */
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const [studio, admin] = await Promise.all([
      prisma.studio.findUnique({
        where: {
          id: session.studioId,
        },
        select: {
          name: true,
          email: true,
          phone: true,
          website: true,
          address: true,
          logoUrl: true,
        },
      }),

      prisma.admin.findFirst({
        where: {
          id: session.adminId,
          studioId: session.studioId,
        },
        select: {
          username: true,
          name: true,
          email: true,
          phone: true,
        },
      }),
    ]);

    if (!studio || !admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin or studio information not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      studio: {
        name: studio.name,
        email: studio.email,
        phone: studio.phone,
        website: studio.website,
        address: studio.address,
        logoUrl: studio.logoUrl,
      },

      admin: {
        username: admin.username,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error("Get admin settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load settings.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT
 * Updates Studio Profile settings.
 *
 * The Studio is identified only from the authenticated session.
 */
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const studioData: {
      name?: string;
      email?: string | null;
      phone?: string | null;
      website?: string | null;
      address?: string | null;
    } = {};

    if (body.studioName !== undefined) {
      if (typeof body.studioName !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Studio name must be a string.",
          },
          { status: 400 }
        );
      }

      const studioName = body.studioName.trim();

      if (!studioName) {
        return NextResponse.json(
          {
            success: false,
            message: "Studio name cannot be empty.",
          },
          { status: 400 }
        );
      }

      studioData.name = studioName;
    }

    const optionalFields = [
      "email",
      "phone",
      "website",
      "address",
    ] as const;

    for (const field of optionalFields) {
      if (body[field] !== undefined) {
        if (body[field] === null) {
          studioData[field] = null;
          continue;
        }

        if (typeof body[field] !== "string") {
          return NextResponse.json(
            {
              success: false,
              message: `${field} must be a string.`,
            },
            { status: 400 }
          );
        }

        const value = body[field].trim();

        studioData[field] = value || null;
      }
    }

    if (Object.keys(studioData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No settings were provided.",
        },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({
      where: {
        id: session.adminId,
        studioId: session.studioId,
      },
      select: {
        id: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account not found.",
        },
        { status: 404 }
      );
    }

    const studio = await prisma.studio.update({
      where: {
        id: session.studioId,
      },
      data: studioData,
      select: {
        name: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        logoUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
      studio,
    });
  } catch (error) {
    console.error("Update admin settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save settings.",
      },
      { status: 500 }
    );
  }
}