"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Building2,
    CreditCard,
    LayoutDashboard,
    Settings,
    HardDrive,
} from "lucide-react";

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

export default function SuperAdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-zinc-800 bg-zinc-950">
            {/* Logo */}
            <div className="flex h-20 items-center border-b border-zinc-800 px-6">
                <div>
                    <h1 className="text-lg font-semibold text-white">
                        Innovate
                    </h1>

                    <p className="text-xs text-zinc-500">
                        Super Admin
                    </p>
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
                    <p className="text-sm font-medium text-white">
                        Super Admin
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        SaaS Management
                    </p>
                </div>
            </div>
        </aside>
    );
}