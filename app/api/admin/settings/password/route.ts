import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

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
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const session = await verifyAuthToken(token);

    if (
      !session ||
      session.role !== "admin" ||
      !session.adminId ||
      !session.studioId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    /* -----------------------------
       Basic validation
    ----------------------------- */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all password fields.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------
       Password strength validation
    ----------------------------- */

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must contain at least one uppercase letter.",
        },
        { status: 400 }
      );
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must contain at least one special character.",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password and confirmation password do not match.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------
       Find authenticated admin
       using BOTH adminId + studioId
    ----------------------------- */

    const admin = await prisma.admin.findFirst({
      where: {
        id: session.adminId,
        studioId: session.studioId,
      },
      select: {
        id: true,
        passwordHash: true,
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

    /* -----------------------------
       Verify current password
    ----------------------------- */

    const currentPasswordMatches =
      await bcrypt.compare(
        currentPassword,
        admin.passwordHash
      );

    if (!currentPasswordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------
       Hash new password
    ----------------------------- */

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      12
    );

    /* -----------------------------
       Update password
    ----------------------------- */

    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to change admin password:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to change password.",
      },
      { status: 500 }
    );
  }
}