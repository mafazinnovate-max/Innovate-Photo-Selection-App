import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SuperAdminSidebar from "@/components/super-admin/sidebar";
import { verifyAuthToken } from "@/lib/auth";

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    // No valid login session
    if (!token) {
        redirect("/login");
    }

    const session = await verifyAuthToken(token);

    // Invalid or expired session
    if (!session) {
        redirect("/login");
    }

    // Normal Admin trying to access a Super Admin page
    // Send them back to their own Admin dashboard.
    if (session.role === "admin") {
        redirect("/events");
    }

    // Only Super Admin can access these pages.
    if (session.role !== "superadmin") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <SuperAdminSidebar />

            <main className="ml-72 min-h-screen overflow-x-hidden p-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}