import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);

async function getSession(req: NextRequest) {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(
            token,
            secretKey
        );

        if (
            payload.role !== "superadmin" &&
            payload.role !== "admin"
        ) {
            return null;
        }

        return {
            role: payload.role,
        };
    } catch {
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    /*
     * Public pages
     */
    const publicRoutes = [
        "/login",
        "/gallery",
    ];

    const isPublicPage = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isPublicPage) {
        return NextResponse.next();
    }

    /*
     * Public API routes
     */
    const publicApiRoutes = [
        "/api/login",
    ];

    const isPublicApi = publicApiRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isPublicApi) {
        return NextResponse.next();
    }

    /*
     * Authentication
     */
    const session = await getSession(req);

    if (!session) {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        return NextResponse.redirect(
            new URL("/login", req.url)
        );
    }

    /*
     * Super Admin area
     */
    if (pathname.startsWith("/super-admin")) {
        if (session.role !== "superadmin") {
            return NextResponse.redirect(
                new URL("/events", req.url)
            );
        }
    }

    /*
     * Normal Admin area
     */
    if (
        session.role === "admin" &&
        pathname.startsWith("/super-admin")
    ) {
        return NextResponse.redirect(
            new URL("/events", req.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|favicon.ico|.*\\..*).*)",
    ],
};