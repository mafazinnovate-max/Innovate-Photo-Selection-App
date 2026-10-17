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
 * Loads the currently logged-in admin's Studio and Admin settings.
 *
 * Ownership is taken only from the authenticated session.
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
          city: true,
          state: true,
          country: true,
          description: true,
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
        city: studio.city,
        state: studio.state,
        country: studio.country,
        description: studio.description,
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
 * Updates Studio and Admin profile settings.
 *
 * The Studio and Admin are identified only from
 * the authenticated session.
 *
 * IMPORTANT:
 * Studio description is intentionally NOT accepted here.
 * It is controlled by Super Admin and is read-only for Admin.
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

    /* --------------------------------
       Verify Admin belongs to Studio
    -------------------------------- */

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

    /* --------------------------------
       Studio data
    -------------------------------- */

    const studioData: {
  name?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
} = {};

    /* Studio Name */

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

    /* Optional Studio Fields */

    const studioOptionalFields = [
      "email",
      "phone",
      "website",
      "address",
      "city",
      "state",
      "country",
    ] as const;

    for (const field of studioOptionalFields) {
  if (body[field] === undefined) {
    continue;
  }

  if (body[field] === null) {
    if (field === "country") {
      return NextResponse.json(
        {
          success: false,
          message: "Country cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (field === "email") {
      studioData.email = null;
    } else if (field === "phone") {
      studioData.phone = null;
    } else if (field === "website") {
      studioData.website = null;
    } else if (field === "address") {
      studioData.address = null;
    } else if (field === "city") {
      studioData.city = null;
    } else if (field === "state") {
      studioData.state = null;
    }

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

  if (field === "country") {
    studioData.country = value || "India";
  } else if (field === "email") {
    studioData.email = value || null;
  } else if (field === "phone") {
    studioData.phone = value || null;
  } else if (field === "website") {
    studioData.website = value || null;
  } else if (field === "address") {
    studioData.address = value || null;
  } else if (field === "city") {
    studioData.city = value || null;
  } else if (field === "state") {
    studioData.state = value || null;
  }
}

    /* --------------------------------
       Admin data
    -------------------------------- */

    const adminData: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    } = {};

    const adminOptionalFields = [
      "adminName",
      "adminEmail",
      "adminPhone",
    ] as const;

    for (const field of adminOptionalFields) {
      if (body[field] === undefined) {
        continue;
      }

      if (body[field] === null) {
        if (field === "adminName") {
          adminData.name = null;
        } else if (field === "adminEmail") {
          adminData.email = null;
        } else {
          adminData.phone = null;
        }

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

      const value = body[field].trim() || null;

      if (field === "adminName") {
        adminData.name = value;
      } else if (field === "adminEmail") {
        adminData.email = value;
      } else {
        adminData.phone = value;
      }
    }

    /* --------------------------------
       Make sure something is being saved
    -------------------------------- */

    if (
      Object.keys(studioData).length === 0 &&
      Object.keys(adminData).length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "No settings were provided.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------
       Update Studio + Admin together
    -------------------------------- */

    const result = await prisma.$transaction(async (tx) => {
      const studio =
        Object.keys(studioData).length > 0
          ? await tx.studio.update({
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
                city: true,
                state: true,
                country: true,
                description: true,
                logoUrl: true,
              },
            })
          : await tx.studio.findUniqueOrThrow({
              where: {
                id: session.studioId,
              },
              select: {
                name: true,
                email: true,
                phone: true,
                website: true,
                address: true,
                city: true,
                state: true,
                country: true,
                description: true,
                logoUrl: true,
              },
            });

      if (Object.keys(adminData).length > 0) {
        await tx.admin.update({
          where: {
            id: session.adminId,
          },
          data: adminData,
        });
      }

      const updatedAdmin = await tx.admin.findFirstOrThrow({
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
      });

      return {
        studio,
        admin: updatedAdmin,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",

      studio: result.studio,

      admin: result.admin,
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