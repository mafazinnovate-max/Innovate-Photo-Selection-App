"use client";

import { useEffect, useState } from "react";
import {
    Building2,
    CalendarDays,
    HardDrive,
    Users,
} from "lucide-react";

interface ApiStudio {
    id: string;
    name: string;
    logoUrl: string | null;
    createdAt: string;
    isActive: boolean;
    _count?: {
        events: number;
    };
}

interface DashboardStats {
    totalStudios: number;
    activeStudios: number;
    totalEvents: number;
}

export default function SuperAdminDashboardPage() {
    const [studios, setStudios] = useState<ApiStudio[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalStudios: 0,
        activeStudios: 0,
        totalEvents: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/super-admin/studios", {
                    method: "GET",
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Failed to load dashboard data."
                    );
                }

                const studioList: ApiStudio[] = data.studios ?? [];

                setStudios(studioList);

                setStats({
                    totalStudios: studioList.length,
                    activeStudios: studioList.filter(
                        (studio) => studio.isActive
                    ).length,
                    totalEvents: studioList.reduce(
                        (total, studio) =>
                            total + (studio._count?.events ?? 0),
                        0
                    ),
                });
            } catch (err) {
                console.error("Dashboard loading error:", err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const cards = [
        {
            title: "Total Studios",
            value: stats.totalStudios.toLocaleString(),
            description: "Registered studios",
            icon: Building2,
        },
        {
            title: "Active Studios",
            value: stats.activeStudios.toLocaleString(),
            description: "Currently active",
            icon: Users,
        },
        {
            title: "Total Events",
            value: stats.totalEvents.toLocaleString(),
            description: "Across all studios",
            icon: CalendarDays,
        },
        {
            title: "Storage Used",
            value: "Not tracked",
            description: "Actual storage usage unavailable",
            icon: HardDrive,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Dashboard
                </h1>

                <p className="mt-2 text-zinc-400">
                    Manage your photo selection SaaS platform.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-zinc-400">
                                        {stat.title}
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold text-white">
                                        {loading ? "—" : stat.value}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-zinc-800 p-2.5">
                                    <Icon className="h-5 w-5 text-zinc-300" />
                                </div>
                            </div>

                            <p className="mt-4 text-xs text-zinc-500">
                                {stat.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Studios */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="border-b border-zinc-800 px-6 py-5">
                    <h2 className="text-lg font-semibold text-white">
                        Recent Studios
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Recently registered studios will appear here.
                    </p>
                </div>

                <div className="px-6 py-5">
                    {loading ? (
                        <div
                            className="min-h-48 space-y-5"
                            role="status"
                            aria-label="Loading studios"
                        >
                            {/* Skeleton studio rows */}
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="flex animate-pulse items-center justify-between gap-4 py-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        {/* Studio logo */}
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-800" />

                                        {/* Studio name and created date */}
                                        <div className="space-y-2">
                                            <div className="h-3.5 w-32 rounded bg-zinc-800 sm:w-44" />
                                            <div className="h-3 w-24 rounded bg-zinc-800/70" />
                                        </div>
                                    </div>

                                    {/* Events and status */}
                                    <div className="flex shrink-0 items-center gap-4">
                                        <div className="hidden h-3 w-14 rounded bg-zinc-800 sm:block" />
                                        <div className="h-6 w-16 rounded-full bg-zinc-800" />
                                    </div>
                                </div>
                            ))}

                            <span className="sr-only">Loading studios...</span>
                        </div>
                    ) : studios.length === 0 ? (
                        <div className="flex min-h-64 items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                                    <Building2 className="h-5 w-5 text-zinc-500" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-300">
                                    No studios yet
                                </h3>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Studio information will appear here once
                                    studios are added.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {studios.slice(0, 5).map((studio) => (
                                <div
                                    key={studio.id}
                                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-semibold text-white">
                                            <img
                                                src={studio.logoUrl || ""}
                                                alt={`${studio.name} logo`}
                                                className={`h-full w-full object-cover ${studio.logoUrl ? "" : "hidden"
                                                    }`}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                    const fallback = e.currentTarget.nextElementSibling;
                                                    if (fallback) {
                                                        fallback.classList.remove("hidden");
                                                    }
                                                }}
                                            />

                                            <span className={studio.logoUrl ? "hidden" : ""}>
                                                {studio.name
                                                    .trim()
                                                    .split(/\s+/)
                                                    .slice(0, 2)
                                                    .map((word) => word[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-white">
                                                {studio.name}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                Created{" "}
                                                {new Date(
                                                    studio.createdAt
                                                ).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-4">
                                        <span className="hidden text-xs text-zinc-400 sm:inline">
                                            {studio._count?.events ?? 0} events
                                        </span>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${studio.isActive
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-zinc-800 text-zinc-400"
                                                }`}
                                        >
                                            {studio.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}