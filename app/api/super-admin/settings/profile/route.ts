
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

async function getAuthenticatedSuperAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const session = await verifyAuthToken(token);

    if (!session || session.role !== "superadmin") return null;

    return prisma.superAdmin.findFirst();
}

export async function GET() {
    try {
        const superAdmin = await getAuthenticatedSuperAdmin();

        if (!superAdmin) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        return NextResponse.json({
            profile: {
                name: superAdmin.name ?? "",
                username: superAdmin.username,
                email: superAdmin.email ?? "",
                logoUrl: superAdmin.logoUrl ?? "",
            },
        });
    } catch (error) {
        console.error("Load Super Admin profile error:", error);

        return NextResponse.json(
            { message: "Unable to load profile." },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const superAdmin = await getAuthenticatedSuperAdmin();

        if (!superAdmin) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        const body = await request.json();

        const name = String(body.name ?? "").trim();
        const username = String(body.username ?? "").trim();
        const email = String(body.email ?? "").trim().toLowerCase();

        if (!name || !username) {
            return NextResponse.json(
                { message: "Name and username are required." },
                { status: 400 }
            );
        }

        if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
            return NextResponse.json(
                { message: "Username must be 3–30 characters and use only letters, numbers, dots, underscores or hyphens." },
                { status: 400 }
            );
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { message: "Enter a valid email address." },
                { status: 400 }
            );
        }

        const existingUsername = await prisma.superAdmin.findFirst({
            where: {
                username,
                NOT: { id: superAdmin.id },
            },
        });

        if (existingUsername) {
            return NextResponse.json(
                { message: "That username is already in use." },
                { status: 409 }
            );
        }

        if (email) {
            const existingEmail = await prisma.superAdmin.findFirst({
                where: {
                    email,
                    NOT: { id: superAdmin.id },
                },
            });

            if (existingEmail) {
                return NextResponse.json(
                    { message: "That email address is already in use." },
                    { status: 409 }
                );
            }
        }

        const updated = await prisma.superAdmin.update({
            where: { id: superAdmin.id },
            data: {
                name,
                username,
                email: email || null,
            },
        });

        return NextResponse.json({
            message: "Profile saved successfully.",
            profile: {
                name: updated.name ?? "",
                username: updated.username,
                email: updated.email ?? "",
                logoUrl: updated.logoUrl ?? "",
            },
        });
    } catch (error) {
        console.error("Save Super Admin profile error:", error);

        return NextResponse.json(
            { message: "Unable to save profile. Please try again." },
            { status: 500 }
        );
    }
}