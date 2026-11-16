"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    Building2,
    CreditCard,
    LayoutDashboard,
    Settings,
    HardDrive,
    LogOut,
} from "lucide-react";
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

    const router = useRouter();

    const [isNavigating, setIsNavigating] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState<"success" | "error">("success");

    const showMessage = (message: string, type: "success" | "error" = "success") => {
        setNotice(message);
        setNoticeType(type);
    };

    // Load Super Admin profile
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
                console.error(
                    "Failed to load Super Admin profile:",
                    error
                );
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [pathname]);

    // Hide loader when the destination route becomes active
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    async function handleLogout() {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            const response = await fetch("/api/super-admin/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Unable to log out. Please try again.");
            }

            router.replace("/login");
            router.refresh();
        } catch (error) {
            showMessage(
                error instanceof Error ? error.message : "Unable to log out.",
                "error"
            );
            setShowLogoutConfirm(false);
            setLoggingOut(false);
        }
    }

    return (
        <>
            {/* Full-screen navigation loader */}
            {isNavigating && (
                <div
                    className="fixed left-72 right-0 top-0 bottom-0 z-30 flex items-center justify-center bg-black"
                    role="status"
                    aria-label="Loading page"
                >
                    {profile.logoUrl ? (
                        <Image
                            src={profile.logoUrl}
                            alt="Picnovate"
                            width={96}
                            height={96}
                            priority
                            unoptimized
                            className="h-20 w-20 animate-pulse object-contain sm:h-24 sm:w-24"
                        />
                    ) : (
                        <h1 className="animate-pulse text-3xl font-bold tracking-wide text-white">
                            Picnovate
                        </h1>
                    )}
                </div>
            )}

            <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-zinc-800 bg-zinc-950">
                {/* Logo */}
                <div className="flex h-40 flex-col items-center justify-center gap-2 border-b border-zinc-800 px-5 pb-3 pt-5">
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
                                onClick={(event) => {
                                    // Ignore modified clicks and new tabs
                                    if (
                                        event.defaultPrevented ||
                                        event.button !== 0 ||
                                        event.metaKey ||
                                        event.ctrlKey ||
                                        event.shiftKey ||
                                        event.altKey
                                    ) {
                                        return;
                                    }

                                    // Don't show the loader for the same URL
                                    if (pathname === item.href) {
                                        return;
                                    }

                                    setIsNavigating(true);
                                }}
                                aria-current={isActive ? "page" : undefined}
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

                        <button
                            type="button"
                            onClick={() => setShowLogoutConfirm(true)}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                            <LogOut size={21} />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-white">
                            Log out of Picnovate?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                            Are you sure you want to end your Super Admin session?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={handleLogout}
                                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
                            >
                                {loggingOut ? "Logging out..." : "Confirm logout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}