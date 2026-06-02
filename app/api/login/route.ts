import { cookies } from "next/headers";

export async function POST(req: Request) {
    const { username, password } = await req.json();

    if (
        username !== process.env.ADMIN_USERNAME ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return Response.json(
            { success: false },
            { status: 401 }
        );
    }

    const cookieStore = await cookies();

    cookieStore.set("admin-auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({
        success: true,
    });
}