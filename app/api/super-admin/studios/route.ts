import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        // Verify Super Admin
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const session = await verifyAuthToken(token);

        if (!session || session.role !== "superadmin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Super Admin access required.",
                },
                { status: 403 }
            );
        }

        // Read form data
        const data = await request.json();

        const {
            studioName,
            adminUsername,
            password,
            confirmPassword,
        } = data;

        // Validate studio name
        if (
            typeof studioName !== "string" ||
            !studioName.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Studio name is required.",
                },
                { status: 400 }
            );
        }

        // Validate admin username
        if (
            typeof adminUsername !== "string" ||
            !adminUsername.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin username is required.",
                },
                { status: 400 }
            );
        }

        // Validate password
        if (
            typeof password !== "string" ||
            password.length < 6
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Admin password must be at least 6 characters.",
                },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Passwords do not match.",
                },
                { status: 400 }
            );
        }

        // Check duplicate username
        const existingAdmin = await prisma.admin.findUnique({
            where: {
                username: adminUsername.trim(),
            },
        });

        if (existingAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin username already exists.",
                },
                { status: 409 }
            );
        }

        // Hash admin password
        const passwordHash = await bcrypt.hash(
            password,
            12
        );

        // Create Studio + Admin together
        const result = await prisma.$transaction(
            async (tx) => {
                const studio = await tx.studio.create({
                    data: {
                        name: studioName.trim(),
                    },
                });

                const admin = await tx.admin.create({
                    data: {
                        username: adminUsername.trim(),
                        passwordHash,
                        studioId: studio.id,
                    },
                });

                return {
                    studio,
                    admin,
                };
            }
        );

        return NextResponse.json({
            success: true,
            message: "Studio created successfully.",
            studio: {
                id: result.studio.id,
                name: result.studio.name,
            },
            admin: {
                id: result.admin.id,
                username: result.admin.username,
            },
        });
    } catch (error) {
        console.error(
            "Super Admin studio creation error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create studio.",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Verify Super Admin
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const session = await verifyAuthToken(token);

        if (!session || session.role !== "superadmin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Super Admin access required.",
                },
                { status: 403 }
            );
        }

        // Get all studios with their admins and event count
        const studios = await prisma.studio.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                admins: {
                    select: {
                        id: true,
                        username: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        events: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            studios,
        });
    } catch (error) {
        console.error(
            "Super Admin studio fetch error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch studios.",
            },
            { status: 500 }
        );
    }
}