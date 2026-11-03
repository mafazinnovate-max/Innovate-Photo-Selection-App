
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

function getHtml(value: unknown): string {
    if (
        typeof value === "object" &&
        value !== null &&
        "html" in value &&
        typeof value.html === "string"
    ) {
        return value.html;
    }

    return "";
}

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
        !session.studioId
    ) {
        return null;
    }

    return session;
}

// GET: Load this studio's document settings
export async function GET() {
    try {
        const session = await getAdminSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const settings = await prisma.studioDocumentSettings.findUnique({
            where: {
                studioId: session.studioId!,
            },
        });

        return NextResponse.json({
            faq: getHtml(settings?.faqContent),
            terms: getHtml(settings?.termsContent),
            policies: getHtml(settings?.policiesContent),
        });
    } catch (error) {
        console.error("Document settings GET error:", error);

        return NextResponse.json(
            { message: "Failed to load document settings" },
            { status: 500 }
        );
    }
}

// PUT: Save this studio's document settings
export async function PUT(req: Request) {
    try {
        const session = await getAdminSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const { faq, terms, policies } = body;

        if (
            typeof faq !== "string" ||
            typeof terms !== "string" ||
            typeof policies !== "string"
        ) {
            return NextResponse.json(
                { message: "Invalid document settings data" },
                { status: 400 }
            );
        }

        const settings = await prisma.studioDocumentSettings.upsert({
            where: {
                studioId: session.studioId!,
            },
            create: {
                studioId: session.studioId!,
                faqContent: { html: faq },
                termsContent: { html: terms },
                policiesContent: { html: policies },
            },
            update: {
                faqContent: { html: faq },
                termsContent: { html: terms },
                policiesContent: { html: policies },
            },
        });

        return NextResponse.json({
            message: "Document settings saved successfully",
            success: true,
        });
    } catch (error) {
        console.error("Document settings PUT error:", error);

        return NextResponse.json(
            { message: "Failed to save document settings" },
            { status: 500 }
        );
    }
}