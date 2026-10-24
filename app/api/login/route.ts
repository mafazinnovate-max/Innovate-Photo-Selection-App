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
         *
         * Subscription restrictions do not apply to Super Admin.
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
               const authSecret =
    await prisma.authSecret.findUnique({
        where: {
            superAdminId: superAdmin.id,
        },
    });

if (!authSecret) {
    return NextResponse.json(
        {
            success: false,
            message:
                "Authentication configuration is missing. Please contact the administrator.",
        },
        {
            status: 500,
        }
    );
}

const token = await createAuthToken(
    {
        role: "superadmin",
    },
    authSecret.id,
    authSecret.secret
);

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
    logoUrl: superAdmin.logoUrl,
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
                    message: "Invalid username or password.",
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
                    message: "Invalid username or password.",
                },
                {
                    status: 401,
                }
            );
        }


        const studio = await prisma.studio.findUnique({
    where: {
        id: admin.studioId,
    },
    select: {
        isActive: true,
    },
});

if (!studio || !studio.isActive) {
    return NextResponse.json(
        {
            success: false,
            message:
                "Your account is inactive. Please contact the administrator.",
        },
        {
            status: 403,
        }
    );
}


        /*
         * Check the latest subscription for this admin's studio
         * before creating an authentication token.
         *
         * Subscription dates are stored in PostgreSQL as
         * timestamp without time zone and are intended to
         * represent IST (Asia/Kolkata) wall-clock time.
         */
        const subscription =
            await prisma.subscription.findFirst({
                where: {
                    studioId: admin.studioId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    endDate: true,
                },
            });

        /*
         * Subscription expired.
         *
         * Convert the stored subscription wall-clock value
         * to an explicit IST timestamp before comparing it
         * with the current instant.
         */

        // console.log("LOGIN SUBSCRIPTION END DATE:", subscription?.endDate);
        // console.log("LOGIN CURRENT TIME:", new Date());

        if (subscription?.endDate) {
            const endDateText = subscription.endDate
                .toISOString()
                .replace("Z", "");

            const endDateIST = new Date(
                `${endDateText}+05:30`
            );

            if (Date.now() >= endDateIST.getTime()) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Your subscription has expired. Please contact the administrator to renew your subscription.",
                    },
                    {
                        status: 403,
                    }
                );
            }
        }

        /*
         * Active subscription.
         * Create the normal admin session.
         */
      const authSecret =
    await prisma.authSecret.findUnique({
        where: {
            adminId: admin.id,
        },
    });

if (!authSecret) {
    return NextResponse.json(
        {
            success: false,
            message:
                "Authentication configuration is missing. Please contact the administrator.",
        },
        {
            status: 500,
        }
    );
}

const token = await createAuthToken(
    {
        role: "admin",
        adminId: admin.id,
        studioId: admin.studioId,
    },
    authSecret.id,
    authSecret.secret
);

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