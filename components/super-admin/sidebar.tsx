"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building2,
    CreditCard,
    LayoutDashboard,
    Settings,
    HardDrive,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const menuItems = [
    {
        label: "Dashboard",
        href: "/super-admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Studios",
        href: "/super-admin/studios",
        icon: Building2,
    },
    {
        label: "Subscriptions",
        href: "/super-admin/subscriptions",
        icon: CreditCard,
    },
    {
        label: "Usage",
        href: "/super-admin/usage",
        icon: HardDrive,
    },
    {
        label: "Settings",
        href: "/super-admin/settings",
        icon: Settings,
    },
];

type SuperAdminProfile = {
    name: string | null;
    logoUrl: string | null;
};

export default function SuperAdminSidebar() {
    const pathname = usePathname();

    const [profile, setProfile] = useState<SuperAdminProfile>({
        name: null,
        logoUrl: null,
    });

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            try {
                const response = await fetch(
                    "/api/super-admin/settings/profile",
                    { cache: "no-store" }
                );

                if (!response.ok) return;

                const data = await response.json();

                if (isMounted && data.profile) {
                    setProfile({
                        name: data.profile.name || null,
                        logoUrl: data.profile.logoUrl || null,
                    });
                }
            } catch (error) {
                console.error("Failed to load Super Admin profile:", error);
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [pathname]);

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-zinc-800 bg-zinc-950">
            {/* Logo */}
            <div className="flex h-40 flex-col items-center justify-center gap-2 border-b border-zinc-800 px-5 pt-5 pb-3">
                <div className="flex min-h-0 w-full flex-1 items-center justify-center pt-2">
                    {profile.logoUrl ? (
                        <Image
                            src={profile.logoUrl}
                            alt="Picnovate logo"
                            width={400}
                            height={160}
                            unoptimized
                            className="h-auto max-h-full w-auto max-w-full object-contain"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold tracking-wide text-white">
                            Picnovate
                        </h1>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-4 py-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom profile */}
            <div className="border-t border-zinc-800 p-4">
                <div className="rounded-lg bg-zinc-900 px-4 py-3">
                    <p className="truncate text-sm font-medium text-white">
                        {profile.name || "Super Admin"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        SaaS Management
                    </p>
                </div>
            </div>
        </aside>
    );
}