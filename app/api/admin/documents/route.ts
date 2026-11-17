
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

export async function GET(req: Request) {
    try {
        const session = await getAdminSession();

        if (!session?.studioId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);

        const search = searchParams.get("search")?.trim() || "";
        const type = searchParams.get("type") || "all";

        if (!["all", "contract", "quotation"].includes(type)) {
            return NextResponse.json(
                { message: "Invalid document type" },
                { status: 400 }
            );
        }

        const documents = await prisma.studioDocument.findMany({
            where: {
                studioId: session.studioId,

                ...(type !== "all" && {
                    documentType: type,
                }),

                ...(search && {
                    OR: [
                        {
                            clientName: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            eventName: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }),
            },

            orderBy: {
                createdAt: "desc",
            },

            select: {
                id: true,
                documentType: true,
                clientName: true,
                eventName: true,
                eventDate: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            documents,
        });

    } catch (error) {
        console.error("Document history error:", error);

        return NextResponse.json(
            { message: "Failed to load documents" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();

        if (!session?.studioId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const {
            documentType,
            documentData,
        } = body;

        if (
            !["contract", "quotation"].includes(documentType) ||
            !documentData ||
            typeof documentData !== "object" ||
            Array.isArray(documentData)
        ) {
            return NextResponse.json(
                { message: "Invalid document data" },
                { status: 400 }
            );
        }

        const {
            clientName,
            eventName,
            eventDate,
        } = documentData;

        if (
            typeof clientName !== "string" ||
            !clientName.trim() ||
            typeof eventName !== "string" ||
            !eventName.trim()
        ) {
            return NextResponse.json(
                { message: "Client name and event name are required" },
                { status: 400 }
            );
        }

        let parsedEventDate: Date | null = null;

        if (eventDate) {
            parsedEventDate = new Date(eventDate);

            if (Number.isNaN(parsedEventDate.getTime())) {
                return NextResponse.json(
                    { message: "Invalid event date" },
                    { status: 400 }
                );
            }
        }

        // Fetch studio information using authenticated studioId
        const studio = await prisma.studio.findUnique({
            where: {
                id: session.studioId,
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
            return NextResponse.json(
                { message: "Studio not found" },
                { status: 404 }
            );
        }

        // Fetch current document settings
        const settings =
            await prisma.studioDocumentSettings.findUnique({
                where: {
                    studioId: session.studioId,
                },
            });

        // Save document data and immutable snapshots
        const document = await prisma.studioDocument.create({
            data: {
                studioId: session.studioId,
                documentType,
                clientName: clientName.trim(),
                eventName: eventName.trim(),
                eventDate: parsedEventDate,

                documentData:
                    documentData as Prisma.InputJsonValue,

                studioSnapshot: {
                    ...studio,
                } as Prisma.InputJsonValue,

                sectionsSnapshot: {
                    faq: getHtml(settings?.faqContent),
                    terms: getHtml(settings?.termsContent),
                    policies: getHtml(settings?.policiesContent),
                } as Prisma.InputJsonValue,
            },
            select: {
                id: true,
                documentType: true,
                clientName: true,
                eventName: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Document saved successfully",
                document,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Document creation error:", error);

        return NextResponse.json(
            { message: "Failed to save document" },
            { status: 500 }
        );
    }
}