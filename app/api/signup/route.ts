import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";

function getISTWallClockDate(date: Date) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);

    const values: Record<string, string> = {};

    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    }

    return new Date(
        Date.UTC(
            Number(values.year),
            Number(values.month) - 1,
            Number(values.day),
            Number(values.hour),
            Number(values.minute),
            Number(values.second)
        )
    );
}

function getTrialEndDate(startDate: Date) {
    const endDate = new Date(startDate);

    endDate.setUTCDate(endDate.getUTCDate() + 3);

    endDate.setUTCHours(0, 0, 0, 0);

    return endDate;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            studioName,
            studioEmail,
            adminName,
            adminContact,
            adminEmail,
            username,
            password,
            confirmPassword,
        } = body;

        /*
         * Validate all input on the server.
         *
         * Never trust the browser for:
         * - role
         * - studioId
         * - subscription limits
         * - subscription dates
         * - admin privileges
         */

        if (
            typeof studioName !== "string" ||
            typeof studioEmail !== "string" ||
            typeof adminName !== "string" ||
            typeof adminContact !== "string" ||
            typeof adminEmail !== "string" ||
            typeof username !== "string" ||
            typeof password !== "string" ||
            typeof confirmPassword !== "string"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid signup details.",
                },
                {
                    status: 400,
                }
            );
        }

        const cleanStudioName = studioName.trim();
        const cleanStudioEmail = studioEmail.trim().toLowerCase();
        const cleanAdminName = adminName.trim();
        const cleanAdminContact = adminContact.trim();
        const cleanAdminEmail = adminEmail.trim().toLowerCase();
        const cleanUsername = username.trim();

        if (
            !cleanStudioName ||
            !cleanStudioEmail ||
            !cleanAdminName ||
            !cleanAdminContact ||
            !cleanAdminEmail ||
            !cleanUsername ||
            !password ||
            !confirmPassword
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All fields are required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !cleanStudioEmail.includes("@") ||
            !cleanAdminEmail.includes("@")
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please enter valid email addresses.",
                },
                {
                    status: 400,
                }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password must be at least 8 characters.",
                },
                {
                    status: 400,
                }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Passwords do not match.",
                },
                {
                    status: 400,
                }
            );
        }

        if (cleanUsername.length < 3) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username must be at least 3 characters.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Username is globally unique in the current schema.
         */
        const existingAdmin =
            await prisma.admin.findUnique({
                where: {
                    username: cleanUsername,
                },
            });

        if (existingAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "That username is already taken.",
                },
                {
                    status: 409,
                }
            );
        }

        /*
         * Password is hashed before it is stored.
         */
        const passwordHash = await bcrypt.hash(
            password,
            12
        );

        /*
         * Trial timing:
         *
         * Signup:
         * 21/10/2026 11:00 IST
         *
         * Stored start:
         * 21/10/2026 11:00
         *
         * Stored end:
         * 24/10/2026 00:00
         *
         * The existing login system interprets subscription
         * wall-clock dates as IST, so we preserve that format.
         */
        const now = new Date();

       const trialStartDate = now;

        const trialEndDate =
            getTrialEndDate(trialStartDate);

        const authSecret = randomBytes(32).toString(
            "hex"
        );

        /*
         * Create the complete tenant/account inside
         * one transaction.
         *
         * If any part fails, none of the account records
         * are created.
         */
        const result = await prisma.$transaction(
            async (tx) => {
                const studio = await tx.studio.create({
                    data: {
                        name: cleanStudioName,
                        email: cleanStudioEmail,
                        isActive: true,
                    },
                });

                const admin = await tx.admin.create({
                    data: {
                        username: cleanUsername,
                        passwordHash,
                        name: cleanAdminName,
                        email: cleanAdminEmail,
                        phone: cleanAdminContact,
                        studioId: studio.id,
                    },
                });

                await tx.authSecret.create({
                    data: {
                        secret: authSecret,
                        adminId: admin.id,
                    },
                });

                const subscription =
                    await tx.subscription.create({
                        data: {
                            id: randomUUID(),
                            plan: "Trial",
                            status: "Active",
                            startDate: trialStartDate,
                            endDate: trialEndDate,

                            /*
                             * Trial limits
                             */
                            storageLimitGb: 5,
                            maxEvents: 2,
                            maxCustomers: 20,
                            maxImages: 700,

                            studioId: studio.id,
                        },
                    });

                return {
                    studioId: studio.id,
                    adminId: admin.id,
                    subscriptionId:
                        subscription.id,
                };
            }
        );

        console.log(
            "New trial account created:",
            result.studioId
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Account created successfully.",
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "Signup error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to create your account. Please try again.",
            },
            {
                status: 500,
            }
        );
    }
}