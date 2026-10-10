import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();

    cookieStore.delete("auth-token");

    // Remove the old authentication cookie too
    // in case it still exists from the previous system.
    cookieStore.delete("admin-auth");

    return Response.json({
        success: true,
    });
}