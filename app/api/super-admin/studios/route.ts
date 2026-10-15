
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

async function verifySuperAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return false;

    const session = await verifyAuthToken(token);
    return session?.role === "superadmin";
}

function cleanString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown): string | null {
    const result = cleanString(value);
    return result || null;
}

function positiveInteger(value: unknown): number | null {
    const number = Number(value);

    if (!Number.isSafeInteger(number) || number <= 0) {
        return null;
    }

    return number;
}

function parseDate(value: unknown): Date | null {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: Request) {
    try {
        if (!(await verifySuperAdmin())) {
            return NextResponse.json(
                { success: false, message: "Super Admin access required." },
                { status: 403 }
            );
        }

        const data = await request.json();

        const studioName = cleanString(data.studioName);
        const adminName = cleanString(data.adminName);
        const adminUsername = cleanString(data.adminUsername);
        const adminEmail = cleanString(data.adminEmail);
        const password = typeof data.password === "string" ? data.password : "";
        const confirmPassword =
            typeof data.confirmPassword === "string"
                ? data.confirmPassword
                : "";

        if (!studioName || !adminUsername || !adminName || !adminEmail) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Studio name, admin name, username and email are required.",
                },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
            return NextResponse.json(
                { success: false, message: "Enter a valid admin email." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin password must be at least 8 characters.",
                },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { success: false, message: "Passwords do not match." },
                { status: 400 }
            );
        }

        const startDate = parseDate(data.startDate);
        const endDate = parseDate(data.endDate);
        const storageLimitGb = positiveInteger(data.storageLimit);
        const maxEvents = positiveInteger(data.maxEvents);
        const maxCustomers = positiveInteger(data.maxCustomers);
        const maxImages = positiveInteger(data.maxImages);

        if (!startDate || !endDate || endDate < startDate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter valid subscription start and end dates.",
                },
                { status: 400 }
            );
        }

        if (
            !storageLimitGb ||
            !maxEvents ||
            !maxCustomers ||
            !maxImages
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All storage and usage limits must be positive whole numbers.",
                },
                { status: 400 }
            );
        }

        const plan = ["Basic", "Professional", "Enterprise"].includes(data.plan)
            ? data.plan
            : "Professional";

        const status = data.status === "Inactive" ? "Inactive" : "Active";

        const existingAdmin = await prisma.admin.findUnique({
            where: { username: adminUsername },
            select: { id: true },
        });

        if (existingAdmin) {
            return NextResponse.json(
                { success: false, message: "Admin username already exists." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await prisma.$transaction(async (tx) => {
            const studio = await tx.studio.create({
                data: {
                    name: studioName,
                    email: optionalString(data.studioEmail),
                    phone: optionalString(data.phone),
                    address: optionalString(data.address),
                    city: optionalString(data.city),
                    state: optionalString(data.state),
                    country: cleanString(data.country) || "India",
                    website: optionalString(data.website),
                    description: optionalString(data.description),
                    internalNotes: optionalString(data.notes),
                    isActive: status === "Active",
                },
            });

            const admin = await tx.admin.create({
                data: {
                    name: adminName,
                    username: adminUsername,
                    email: adminEmail,
                    phone: optionalString(data.adminPhone),
                    passwordHash,
                    studioId: studio.id,
                },
            });

            const subscription = await tx.subscription.create({
                data: {
                    plan,
                    status,
                    startDate,
                    endDate,
                    storageLimitGb,
                    maxEvents,
                    maxCustomers,
                    maxImages,
                    studioId: studio.id,
                },
            });

            return { studio, admin, subscription };
        });

        return NextResponse.json(
            {
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
                subscription: result.subscription,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Super Admin studio creation error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to create studio." },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        if (!(await verifySuperAdmin())) {
            return NextResponse.json(
                { success: false, message: "Super Admin access required." },
                { status: 403 }
            );
        }

        const studios = await prisma.studio.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                admins: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        phone: true,
                        createdAt: true,
                    },
                },
                subscriptions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                _count: {
                    select: { events: true },
                },
            },
        });

        return NextResponse.json({ success: true, studios });
    } catch (error) {
        console.error("Super Admin studio fetch error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch studios." },
            { status: 500 }
        );
    }
}