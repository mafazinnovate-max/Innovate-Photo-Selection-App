
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

async function getAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

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

function validateDocumentData(
    documentType: unknown,
    documentData: unknown
) {
    if (
        !["contract", "quotation"].includes(
            documentType as string
        ) ||
        !documentData ||
        typeof documentData !== "object" ||
        Array.isArray(documentData)
    ) {
        return null;
    }

    const data = documentData as Record<string, unknown>;

    if (
        typeof data.clientName !== "string" ||
        !data.clientName.trim() ||
        typeof data.eventName !== "string" ||
        !data.eventName.trim()
    ) {
        return null;
    }

    let parsedEventDate: Date | null = null;

    if (data.eventDate) {
        if (typeof data.eventDate !== "string") {
            return null;
        }

        parsedEventDate = new Date(data.eventDate);

        if (Number.isNaN(parsedEventDate.getTime())) {
            return null;
        }
    }

    return {
        data,
        parsedEventDate,
        clientName: data.clientName.trim(),
        eventName: data.eventName.trim(),
    };
}

async function getCurrentSnapshots(studioId: string) {
    const studio = await prisma.studio.findUnique({
        where: {
            id: studioId,
        },
        select: {
            id: true,
            name: true,
            logoUrl: true,
            logoZoom: true,
            logoPositionX: true,
            logoPositionY: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
            website: true,
        },
    });

    if (!studio) {
        return null;
    }

    const settings =
        await prisma.studioDocumentSettings.findUnique({
            where: {
                studioId,
            },
        });

    return {
        studioSnapshot: {
            ...studio,
        } as Prisma.InputJsonValue,

        sectionsSnapshot: {
            faq: getHtml(settings?.faqContent),
            terms: getHtml(settings?.termsContent),
            policies: getHtml(settings?.policiesContent),
        } as Prisma.InputJsonValue,
    };
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAdminSession();

        if (!session?.studioId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Document ID is required" },
                { status: 400 }
            );
        }

        const document = await prisma.studioDocument.findFirst({
            where: {
                id,
                studioId: session.studioId,
            },
            select: {
                id: true,
                documentType: true,
                clientName: true,
                eventName: true,
                eventDate: true,
                documentData: true,
                studioSnapshot: true,
                sectionsSnapshot: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!document) {
            return NextResponse.json(
                { message: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            document,
        });

    } catch (error) {
        console.error("Document fetch error:", error);

        return NextResponse.json(
            { message: "Failed to load document" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAdminSession();

        if (!session?.studioId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Document ID is required" },
                { status: 400 }
            );
        }

        const existingDocument =
            await prisma.studioDocument.findFirst({
                where: {
                    id,
                    studioId: session.studioId,
                },
                select: {
                    id: true,
                },
            });

        if (!existingDocument) {
            return NextResponse.json(
                { message: "Document not found" },
                { status: 404 }
            );
        }

        const body = await req.json();

        const validated = validateDocumentData(
            body.documentType,
            body.documentData
        );

        if (!validated) {
            return NextResponse.json(
                {
                    message:
                        "Invalid document data. Client name and event name are required.",
                },
                { status: 400 }
            );
        }

        const {
            data,
            parsedEventDate,
            clientName,
            eventName,
        } = validated;

        // Get the latest Studio and document settings.
        // Editing a document refreshes its snapshots.
        const snapshots = await getCurrentSnapshots(
            session.studioId
        );

        if (!snapshots) {
            return NextResponse.json(
                { message: "Studio not found" },
                { status: 404 }
            );
        }

        const document = await prisma.studioDocument.update({
            where: {
                id: existingDocument.id,
            },
            data: {
                documentType: body.documentType,
                clientName,
                eventName,
                eventDate: parsedEventDate,

                documentData:
                    data as Prisma.InputJsonValue,

                studioSnapshot: snapshots.studioSnapshot,
                sectionsSnapshot: snapshots.sectionsSnapshot,
            },
            select: {
                id: true,
                documentType: true,
                clientName: true,
                eventName: true,
                eventDate: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Document updated successfully",
            document,
        });

    } catch (error) {
        console.error("Document update error:", error);

        return NextResponse.json(
            { message: "Failed to update document" },
            { status: 500 }
        );
    }
}