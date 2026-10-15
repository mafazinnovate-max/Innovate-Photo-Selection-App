import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Sidebar from "@/components/admin/sidebar";
import { verifyAuthToken } from "@/lib/auth";

export default async function AdminLayout({
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

    // Super Admin trying to access an Admin page
    // Send them back to their own dashboard.
    if (session.role === "superadmin") {
        redirect("/super-admin/dashboard");
    }

    // Only a real Admin with a studio can access Admin pages.
    if (
        session.role !== "admin" ||
        !session.adminId ||
        !session.studioId
    ) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Sidebar />

            <main className="min-h-screen min-w-0 overflow-x-hidden p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-72 lg:p-8">
                <div className="mx-auto w-full max-w-[1800px]">
                    {children}
                </div>
            </main>
        </div>
    );
}