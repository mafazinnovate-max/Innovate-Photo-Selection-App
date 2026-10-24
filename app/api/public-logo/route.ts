import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const superAdmin = await prisma.superAdmin.findFirst({
            select: {
                logoUrl: true,
            },
        });

        return NextResponse.json({
            success: true,
            logoUrl: superAdmin?.logoUrl ?? null,
        });
    } catch (error) {
        console.error("Failed to fetch logo:", error);

        return NextResponse.json(
            {
                success: false,
                logoUrl: null,
            },
            { status: 500 }
        );
    }
}