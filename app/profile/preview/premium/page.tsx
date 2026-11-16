
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import PremiumTemplate from "@/app/studio/templates/premium-template";

export const dynamic = "force-dynamic";

export default async function PremiumPreviewPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        redirect("/login");
    }

    const session = await verifyAuthToken(token);

    if (!session) {
        redirect("/login");
    }

    if (session.role === "superadmin") {
        redirect("/super-admin/dashboard");
    }

    if (
        session.role !== "admin" ||
        !session.adminId ||
        !session.studioId
    ) {
        redirect("/login");
    }

    const studio = await prisma.studio.findUnique({
        where: {
            id: session.studioId,
        },
        select: {
            isActive: true,
        },
    });

    if (!studio || !studio.isActive) {
        redirect("/login");
    }

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-white">
            <Link
                href="/profile"
                className="fixed right-5 top-5 z-[9999] rounded-full border border-white/20 bg-black/80 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black"
            >
                ✕ Close Preview
            </Link>

            <PremiumTemplate />
        </div>
    );
}
