
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

type RouteContext = {
    params: Promise<{ studioId: string }>;
};

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

    return Number.isSafeInteger(number) && number > 0
        ? number
        : null;
}

function parseDate(value: unknown): Date | null {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function dateInputValue(date: Date | null | undefined): string {
    return date ? date.toISOString().slice(0, 10) : "";
}

export async function GET(
    _request: Request,
    { params }: RouteContext
) {
    try {
        if (!(await verifySuperAdmin())) {
            return NextResponse.json(
                { success: false, message: "Super Admin access required." },
                { status: 403 }
            );
        }

        const { studioId } = await params;

        const studio = await prisma.studio.findUnique({
            where: { id: studioId },
            include: {
                admins: {
                    orderBy: { createdAt: "asc" },
                },
                subscriptions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        if (!studio) {
            return NextResponse.json(
                { success: false, message: "Studio not found." },
                { status: 404 }
            );
        }

        const admin = studio.admins[0];
        const subscription = studio.subscriptions[0];

        return NextResponse.json({
            success: true,
            studio,
            formData: {
                studioName: studio.name ?? "",
                studioEmail: studio.email ?? "",
                phone: studio.phone ?? "",
                address: studio.address ?? "",
                city: studio.city ?? "",
                state: studio.state ?? "",
                country: studio.country ?? "India",
                website: studio.website ?? "",
                description: studio.description ?? "",

                adminName: admin?.name ?? "",
                adminUsername: admin?.username ?? "",
                adminEmail: admin?.email ?? "",
                adminPhone: admin?.phone ?? "",
                password: "",
                confirmPassword: "",

                startDate: dateInputValue(subscription?.startDate),
                endDate: dateInputValue(subscription?.endDate),
                storageLimit: String(subscription?.storageLimitGb ?? 100),
                maxEvents: String(subscription?.maxEvents ?? 50),
                maxCustomers: String(subscription?.maxCustomers ?? 500),
                maxImages: String(subscription?.maxImages ?? 100000),

                notes: studio.internalNotes ?? "",
            },
            plan: subscription?.plan ?? "Professional",
            status: studio.isActive ? "Active" : "Inactive",
        });
    } catch (error) {
        console.error("Super Admin studio detail fetch error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch studio details." },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: RouteContext
) {
    try {
        if (!(await verifySuperAdmin())) {
            return NextResponse.json(
                { success: false, message: "Super Admin access required." },
                { status: 403 }
            );
        }

        const { studioId } = await params;
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

        if (!studioName || !adminName || !adminUsername || !adminEmail) {
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

        if (password && password.length < 8) {
            return NextResponse.json(
                {
                    success: false,
                    message: "New password must be at least 8 characters.",
                },
                { status: 400 }
            );
        }

        if (password && password !== confirmPassword) {
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

        const currentStudio = await prisma.studio.findUnique({
            where: { id: studioId },
            include: {
                admins: {
                    orderBy: { createdAt: "asc" },
                },
                subscriptions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        if (!currentStudio) {
            return NextResponse.json(
                { success: false, message: "Studio not found." },
                { status: 404 }
            );
        }

        const admin = currentStudio.admins[0];

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No admin account is linked to this studio. Create its admin account first.",
                },
                { status: 400 }
            );
        }

        const duplicateUsername = await prisma.admin.findFirst({
            where: {
                username: adminUsername,
                NOT: { id: admin.id },
            },
            select: { id: true },
        });

        if (duplicateUsername) {
            return NextResponse.json(
                { success: false, message: "Admin username already exists." },
                { status: 409 }
            );
        }

        const passwordHash = password
            ? await bcrypt.hash(password, 12)
            : undefined;

        await prisma.$transaction(async (tx) => {
            await tx.studio.update({
                where: { id: studioId },
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

            await tx.admin.update({
                where: { id: admin.id },
                data: {
                    name: adminName,
                    username: adminUsername,
                    email: adminEmail,
                    phone: optionalString(data.adminPhone),
                    ...(passwordHash ? { passwordHash } : {}),
                },
            });

            const subscriptionData = {
                plan,
                status,
                startDate,
                endDate,
                storageLimitGb,
                maxEvents,
                maxCustomers,
                maxImages,
            };

            const existingSubscription = currentStudio.subscriptions[0];

            if (existingSubscription) {
                await tx.subscription.update({
                    where: { id: existingSubscription.id },
                    data: subscriptionData,
                });
            } else {
                await tx.subscription.create({
                    data: {
                        ...subscriptionData,
                        studioId,
                    },
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: "Studio updated successfully.",
        });
    } catch (error) {
        console.error("Super Admin studio update error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to update studio." },
            { status: 500 }
        );
    }
}
