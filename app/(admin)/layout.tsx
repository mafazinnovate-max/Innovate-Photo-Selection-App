import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Sidebar from "@/components/admin/sidebar";
import SubscriptionAlert from "@/components/admin/subscription-alert";
import SubscriptionSessionGuard from "@/components/admin/subscription-session-guard";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import AuthHistoryGuard from "@/components/admin/auth-history-guard";
import PageEntrance from "@/components/admin/page-entrance";

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

 const [subscription, studio] = await Promise.all([
    prisma.subscription.findFirst({
        where: {
            studioId: session.studioId,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            startDate: true,
            endDate: true,
        },
    }),

    prisma.studio.findUnique({
        where: {
            id: session.studioId,
        },
        select: {
            isActive: true,
        },
    }),
]);


if (!studio || !studio.isActive) {
    redirect("/login");
}

    const subscriptionInfo = subscription
        ? {
              id: subscription.id,
              startDate: subscription.startDate.toISOString(),
              endDate: subscription.endDate?.toISOString() ?? null,
          }
        : null;

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <AuthHistoryGuard />
           <Sidebar subscription={subscriptionInfo} />

            <SubscriptionAlert
                subscription={subscriptionInfo}
            />

            <SubscriptionSessionGuard
             endDate={subscriptionInfo?.endDate ?? null}
             isActive={studio?.isActive ?? false}
             />

            <main className="min-h-screen min-w-0 overflow-x-clip p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-72 lg:p-8">
              <div className="mx-auto w-full max-w-[1800px]">
    <PageEntrance>
        {children}
    </PageEntrance>
</div>
            </main>
        </div>
    );
}