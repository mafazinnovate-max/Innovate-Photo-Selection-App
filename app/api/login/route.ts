import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            !username ||
            !password
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username and password are required.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * SUPER ADMIN LOGIN
         *
         * Super Admin credentials are stored in the database.
         */
        const superAdmin = await prisma.superAdmin.findUnique({
            where: {
                username,
            },
        });

        if (superAdmin) {
            const passwordMatches = await bcrypt.compare(
                password,
                superAdmin.passwordHash
            );

            if (passwordMatches) {
                const token = await createAuthToken({
                    role: "superadmin",
                });

                const cookieStore = await cookies();

                cookieStore.set("auth-token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                });

                return NextResponse.json({
                    success: true,
                    role: "superadmin",
                });
            }
        }

        /*
         * NORMAL ADMIN LOGIN
         */
        const admin = await prisma.admin.findUnique({
            where: {
                username,
            },
        });

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                },
                {
                    status: 401,
                }
            );
        }

        const passwordMatches = await bcrypt.compare(
            password,
            admin.passwordHash
        );

        if (!passwordMatches) {
            return NextResponse.json(
                {
                    success: false,
                },
                {
                    status: 401,
                }
            );
        }

        const token = await createAuthToken({
            role: "admin",
            adminId: admin.id,
            studioId: admin.studioId,
        });

        const cookieStore = await cookies();

        cookieStore.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({
            success: true,
            role: "admin",
        });
    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Login failed.",
            },
            {
                status: 500,
            }
        );
    }
}