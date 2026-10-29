import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";




async function getSession(req: NextRequest) {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
        return null;
    }

    try {
        const parts = token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(
            Buffer.from(parts[1], "base64url").toString()
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
    "/",
    "/login",
    "/signup",
    "/gallery",
];

    const isPublicPage = publicRoutes.some((route) =>
    pathname.startsWith(route)
);

if (isPublicPage) {
    // If the user opens the landing page while already logged in,
    // take them to the appropriate dashboard.
  if (pathname === "/login") {
    const session = await getSession(req);

    if (session?.role === "admin") {
        return NextResponse.redirect(
            new URL("/dashboard", req.url)
        );
    }

    if (session?.role === "superadmin") {
        return NextResponse.redirect(
            new URL("/super-admin/dashboard", req.url)
        );
    }
}

    return NextResponse.next();
}

    /*
     * Public API routes
     */
   const publicApiRoutes = [
    "/api/login",
    "/api/signup",
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