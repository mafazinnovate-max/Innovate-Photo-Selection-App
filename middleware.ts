import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const authCookie =
        req.cookies.get("admin-auth")?.value;

    const pathname = req.nextUrl.pathname;

    const publicRoutes = [
        "/login",
        "/gallery",
    ];

    const isPublic =
        publicRoutes.some((route) =>
            pathname.startsWith(route),
        ) ||
        pathname.startsWith("/api");

    if (isPublic) {
        return NextResponse.next();
    }

    if (authCookie === "true") {
        return NextResponse.next();
    }

    return NextResponse.redirect(
        new URL("/login", req.url),
    );
}

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};