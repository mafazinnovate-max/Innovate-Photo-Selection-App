
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Please log in again." },
                { status: 401 }
            );
        }

        const session = await verifyAuthToken(token);

        if (!session || session.role !== "superadmin") {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const currentPassword = String(body.currentPassword ?? "");
        const newPassword = String(body.newPassword ?? "");
        const confirmPassword = String(body.confirmPassword ?? "");

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { message: "Fill in all password fields." },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { message: "New password must be at least 8 characters." },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { message: "New password and confirmation do not match." },
                { status: 400 }
            );
        }

        if (currentPassword === newPassword) {
            return NextResponse.json(
                { message: "Choose a password different from your current one." },
                { status: 400 }
            );
        }

        const superAdmin = await prisma.superAdmin.findFirst();

        if (!superAdmin) {
            return NextResponse.json(
                { message: "Super Admin account was not found." },
                { status: 404 }
            );
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            superAdmin.passwordHash
        );

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { message: "Current password is incorrect." },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.superAdmin.update({
            where: { id: superAdmin.id },
            data: {
                passwordHash,
                passwordUpdatedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: "Password updated successfully.",
        });
    } catch (error) {
        console.error("Super Admin password update error:", error);

        return NextResponse.json(
            { message: "Unable to update password. Please try again." },
            { status: 500 }
        );
    }
}