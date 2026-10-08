"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    BarChart3,
    CalendarDays,
    ChevronDown,
    HardDrive,
    ImageIcon,
    Search,
    Users,
    X,
} from "lucide-react";

type UsageStatus = "Healthy" | "Warning" | "Critical";

type StudioUsage = {
    id: string;
    studioName: string;
    adminName: string;
    plan: "Basic" | "Professional" | "Enterprise";
    storageUsed: number;
    storageLimit: number;
    images: number;
    maxImages: number;
    events: number;
    maxEvents: number;
    customers: number;
    maxCustomers: number;
    status: UsageStatus;
};

const studioUsageData: StudioUsage[] = [
    {
        id: "studio-001",
        studioName: "Innovate Wedding Studio",
        adminName: "Mafaz Malik",
        plan: "Professional",
        storageUsed: 67.4,
        storageLimit: 100,
        images: 48260,
        maxImages: 100000,
        events: 28,
        maxEvents: 50,
        customers: 46,
        maxCustomers: 500,
        status: "Healthy",
    },
    {
        id: "studio-002",
        studioName: "Royal Moments",
        adminName: "Arun Kumar",
        plan: "Enterprise",
        storageUsed: 184.6,
        storageLimit: 200,
        images: 142850,
        maxImages: 200000,
        events: 76,
        maxEvents: 100,
        customers: 128,
        maxCustomers: 1000,
        status: "Warning",
    },
    {
        id: "studio-003",
        studioName: "Dream Frame Studio",
        adminName: "Vishnu Raj",
        plan: "Basic",
        storageUsed: 8.2,
        storageLimit: 25,
        images: 8420,
        maxImages: 25000,
        events: 8,
        maxEvents: 15,
        customers: 12,
        maxCustomers: 100,
        status: "Healthy",
    },
    {
        id: "studio-004",
        studioName: "Golden Lens Photography",
        adminName: "Sanjay Kumar",
        plan: "Professional",
        storageUsed: 91.8,
        storageLimit: 100,
        images: 78240,
        maxImages: 100000,
        events: 43,
        maxEvents: 50,
        customers: 74,
        maxCustomers: 500,
        status: "Critical",
    },
    {
        id: "studio-005",
        studioName: "Moments by Hari",
        adminName: "Hari Prasad",
        plan: "Basic",
        storageUsed: 18.4,
        storageLimit: 25,
        images: 17480,
        maxImages: 25000,
        events: 12,
        maxEvents: 15,
        customers: 21,
        maxCustomers: 100,
        status: "Warning",
    },
    {
        id: "studio-006",
        studioName: "Pixel Stories",
        adminName: "Rahul Menon",
        plan: "Enterprise",
        storageUsed: 248.7,
        storageLimit: 300,
        images: 214620,
        maxImages: 300000,
        events: 92,
        maxEvents: 150,
        customers: 184,
        maxCustomers: 1500,
        status: "Healthy",
    },
    {
        id: "studio-007",
        studioName: "Elegant Clicks",
        adminName: "Naveen Joseph",
        plan: "Professional",
        storageUsed: 72.6,
        storageLimit: 100,
        images: 63480,
        maxImages: 100000,
        events: 31,
        maxEvents: 50,
        customers: 52,
        maxCustomers: 500,
        status: "Healthy",
    },
    {
        id: "studio-008",
        studioName: "Forever Frames",
        adminName: "Joel Mathew",
        plan: "Basic",
        storageUsed: 23.7,
        storageLimit: 25,
        images: 22960,
        maxImages: 25000,
        events: 14,
        maxEvents: 15,
        customers: 38,
        maxCustomers: 100,
        status: "Critical",
    },
    {
        id: "studio-009",
        studioName: "Classic Wedding Works",
        adminName: "Ajith Kumar",
        plan: "Professional",
        storageUsed: 42.8,
        storageLimit: 100,
        images: 36820,
        maxImages: 100000,
        events: 19,
        maxEvents: 50,
        customers: 34,
        maxCustomers: 500,
        status: "Healthy",
    },
    {
        id: "studio-010",
        studioName: "White Rose Photography",
        adminName: "Deepak Raj",
        plan: "Basic",
        storageUsed: 21.2,
        storageLimit: 25,
        images: 19840,
        maxImages: 25000,
        events: 13,
        maxEvents: 15,
        customers: 29,
        maxCustomers: 100,
        status: "Warning",
    },
    {
        id: "studio-011",
        studioName: "Candid Tales",
        adminName: "Praveen Kumar",
        plan: "Professional",
        storageUsed: 58.3,
        storageLimit: 100,
        images: 51420,
        maxImages: 100000,
        events: 26,
        maxEvents: 50,
        customers: 47,
        maxCustomers: 500,
        status: "Healthy",
    },
    {
        id: "studio-012",
        studioName: "Elite Wedding Studio",
        adminName: "Mohammed Asif",
        plan: "Enterprise",
        storageUsed: 276.4,
        storageLimit: 300,
        images: 268420,
        maxImages: 300000,
        events: 118,
        maxEvents: 150,
        customers: 246,
        maxCustomers: 1500,
        status: "Warning",
    },
];

export default function UsagePage() {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [usageFilter, setUsageFilter] = useState<
        "All" | "Healthy" | "Warning" | "Critical"
    >("All");

    const filteredStudios = useMemo(() => {
        const query = search.trim().toLowerCase();

        return studioUsageData.filter((studio) => {
            const matchesSearch =
                !query ||
                studio.studioName.toLowerCase().includes(query) ||
                studio.adminName.toLowerCase().includes(query) ||
                studio.plan.toLowerCase().includes(query);

            const matchesFilter =
                usageFilter === "All" || studio.status === usageFilter;

            return matchesSearch && matchesFilter;
        });
    }, [search, usageFilter]);

    const totalStorageUsed = studioUsageData.reduce(
        (sum, studio) => sum + studio.storageUsed,
        0
    );

    const totalStorageLimit = studioUsageData.reduce(
        (sum, studio) => sum + studio.storageLimit,
        0
    );

    const totalImages = studioUsageData.reduce(
        (sum, studio) => sum + studio.images,
        0
    );

    const totalEvents = studioUsageData.reduce(
        (sum, studio) => sum + studio.events,
        0
    );

    const totalCustomers = studioUsageData.reduce(
        (sum, studio) => sum + studio.customers,
        0
    );

    const warningCount = studioUsageData.filter(
        (studio) => studio.status === "Warning"
    ).length;

    const criticalCount = studioUsageData.filter(
        (studio) => studio.status === "Critical"
    ).length;

    const overallStoragePercentage =
        totalStorageLimit > 0
            ? (totalStorageUsed / totalStorageLimit) * 100
            : 0;

    const highestStorageStudios = [...studioUsageData]
        .sort((a, b) => b.storageUsed - a.storageUsed)
        .slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <button
                        onClick={() => router.push("/super-admin/dashboard")}
                        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
                            <BarChart3 size={22} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Usage Overview
                            </h1>

                            <p className="mt-1 text-sm text-zinc-400">
                                Monitor storage, images, events and customer usage across all
                                studios.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                    <p className="text-xs text-zinc-500">Studios Monitored</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                        {studioUsageData.length}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Storage Used"
                    value={`${totalStorageUsed.toFixed(1)} GB`}
                    subtitle={`of ${totalStorageLimit.toFixed(0)} GB`}
                    icon={HardDrive}
                    progress={overallStoragePercentage}
                />

                <SummaryCard
                    title="Total Images"
                    value={formatNumber(totalImages)}
                    subtitle="Across all studios"
                    icon={ImageIcon}
                />

                <SummaryCard
                    title="Total Events"
                    value={formatNumber(totalEvents)}
                    subtitle="Active and completed"
                    icon={CalendarDays}
                />

                <SummaryCard
                    title="Total Customers"
                    value={formatNumber(totalCustomers)}
                    subtitle="Across all studios"
                    icon={Users}
                />
            </div>

            {/* Alerts */}
            {(warningCount > 0 || criticalCount > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                    {criticalCount > 0 && (
                        <div className="flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                                <AlertTriangle size={20} />
                            </div>

                            <div>
                                <p className="font-semibold text-white">
                                    {criticalCount} studio
                                    {criticalCount > 1 ? "s" : ""} near storage limit
                                </p>

                                <p className="mt-1 text-sm leading-6 text-zinc-400">
                                    These studios are using more than 90% of their allocated
                                    storage. Consider upgrading their storage limit.
                                </p>
                            </div>
                        </div>
                    )}

                    {warningCount > 0 && (
                        <div className="flex items-start gap-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                                <AlertTriangle size={20} />
                            </div>

                            <div>
                                <p className="font-semibold text-white">
                                    {warningCount} studio
                                    {warningCount > 1 ? "s" : ""} approaching limits
                                </p>

                                <p className="mt-1 text-sm leading-6 text-zinc-400">
                                    These studios are using between 75% and 90% of their
                                    allocated storage.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Storage Overview */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 p-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Overall Storage
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Storage consumption across all registered studios.
                            </p>
                        </div>

                        <div className="text-left md:text-right">
                            <p className="text-2xl font-bold text-white">
                                {overallStoragePercentage.toFixed(1)}%
                            </p>

                            <p className="text-xs text-zinc-500">storage utilized</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="text-zinc-400">
                            {totalStorageUsed.toFixed(1)} GB used
                        </span>

                        <span className="text-zinc-500">
                            {totalStorageLimit.toFixed(0)} GB total
                        </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-zinc-800">
                        <div
                            className={`h-full rounded-full transition-all ${overallStoragePercentage >= 90
                                    ? "bg-red-500"
                                    : overallStoragePercentage >= 75
                                        ? "bg-yellow-500"
                                        : "bg-white"
                                }`}
                            style={{
                                width: `${Math.min(overallStoragePercentage, 100)}%`,
                            }}
                        />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <UsageStat
                            label="Used"
                            value={`${totalStorageUsed.toFixed(1)} GB`}
                        />

                        <UsageStat
                            label="Available"
                            value={`${Math.max(
                                totalStorageLimit - totalStorageUsed,
                                0
                            ).toFixed(1)} GB`}
                        />

                        <UsageStat
                            label="Total Limit"
                            value={`${totalStorageLimit.toFixed(0)} GB`}
                        />
                    </div>
                </div>
            </section>

            {/* Highest Storage Consumers */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Highest Storage Consumers
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Studios currently using the most storage.
                        </p>
                    </div>
                </div>

                <div className="divide-y divide-zinc-800">
                    {highestStorageStudios.map((studio, index) => {
                        const percentage =
                            studio.storageLimit > 0
                                ? (studio.storageUsed / studio.storageLimit) * 100
                                : 0;

                        return (
                            <div
                                key={studio.id}
                                className="flex flex-col gap-4 p-5 transition hover:bg-zinc-900/40 lg:flex-row lg:items-center"
                            >
                                <div className="flex items-center gap-4 lg:w-[35%]">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-zinc-400">
                                        #{index + 1}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-white">
                                            {studio.studioName}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {studio.adminName} · {studio.plan}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="mb-2 flex items-center justify-between text-xs">
                                        <span className="text-zinc-400">
                                            {studio.storageUsed.toFixed(1)} GB used
                                        </span>

                                        <span className="text-zinc-500">
                                            {studio.storageLimit} GB
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                                        <div
                                            className={`h-full rounded-full ${percentage >= 90
                                                    ? "bg-red-500"
                                                    : percentage >= 75
                                                        ? "bg-yellow-500"
                                                        : "bg-white"
                                                }`}
                                            style={{
                                                width: `${Math.min(percentage, 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-6 lg:w-36 lg:justify-end">
                                    <div>
                                        <p className="text-right text-sm font-semibold text-white">
                                            {percentage.toFixed(1)}%
                                        </p>

                                        <p className="text-right text-xs text-zinc-500">
                                            utilized
                                        </p>
                                    </div>

                                    <StatusBadge status={studio.status} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Search / Filters */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Studio Usage
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Detailed resource usage for every studio.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {/* Search */}
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search studio..."
                                    className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600 sm:w-64"
                                />

                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>

                            {/* Filter */}
                            <FilterSelect
                                value={usageFilter}
                                onChange={(value) => setUsageFilter(value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[1100px]">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                                <th className="px-6 py-4 font-medium">Studio</th>
                                <th className="px-6 py-4 font-medium">Storage</th>
                                <th className="px-6 py-4 font-medium">Images</th>
                                <th className="px-6 py-4 font-medium">Events</th>
                                <th className="px-6 py-4 font-medium">Customers</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStudios.map((studio) => {
                                const storagePercentage =
                                    (studio.storageUsed / studio.storageLimit) * 100;

                                const imagePercentage =
                                    (studio.images / studio.maxImages) * 100;

                                const eventPercentage =
                                    (studio.events / studio.maxEvents) * 100;

                                const customerPercentage =
                                    (studio.customers / studio.maxCustomers) * 100;

                                return (
                                    <tr
                                        key={studio.id}
                                        className="border-b border-zinc-900 transition hover:bg-zinc-900/40"
                                    >
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-medium text-white">
                                                    {studio.studioName}
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {studio.adminName}
                                                </p>

                                                <span className="mt-2 inline-flex rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400">
                                                    {studio.plan}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <ResourceUsage
                                                used={studio.storageUsed}
                                                limit={studio.storageLimit}
                                                percentage={storagePercentage}
                                                suffix="GB"
                                            />
                                        </td>

                                        <td className="px-6 py-5">
                                            <ResourceUsage
                                                used={studio.images}
                                                limit={studio.maxImages}
                                                percentage={imagePercentage}
                                            />
                                        </td>

                                        <td className="px-6 py-5">
                                            <ResourceUsage
                                                used={studio.events}
                                                limit={studio.maxEvents}
                                                percentage={eventPercentage}
                                            />
                                        </td>

                                        <td className="px-6 py-5">
                                            <ResourceUsage
                                                used={studio.customers}
                                                limit={studio.maxCustomers}
                                                percentage={customerPercentage}
                                            />
                                        </td>

                                        <td className="px-6 py-5">
                                            <StatusBadge status={studio.status} />
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/super-admin/studios/${studio.id}`
                                                    )
                                                }
                                                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                                            >
                                                View Studio
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile / Tablet Cards */}
                <div className="divide-y divide-zinc-800 lg:hidden">
                    {filteredStudios.map((studio) => {
                        const storagePercentage =
                            (studio.storageUsed / studio.storageLimit) * 100;

                        const imagePercentage =
                            (studio.images / studio.maxImages) * 100;

                        const eventPercentage =
                            (studio.events / studio.maxEvents) * 100;

                        const customerPercentage =
                            (studio.customers / studio.maxCustomers) * 100;

                        return (
                            <div key={studio.id} className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-white">
                                            {studio.studioName}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {studio.adminName}
                                        </p>
                                    </div>

                                    <StatusBadge status={studio.status} />
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400">Storage</span>

                                        <span className="text-zinc-500">
                                            {studio.storageUsed.toFixed(1)} /{" "}
                                            {studio.storageLimit} GB
                                        </span>
                                    </div>

                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                                        <div
                                            className={`h-full rounded-full ${storagePercentage >= 90
                                                    ? "bg-red-500"
                                                    : storagePercentage >= 75
                                                        ? "bg-yellow-500"
                                                        : "bg-white"
                                                }`}
                                            style={{
                                                width: `${Math.min(storagePercentage, 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    <MiniUsage
                                        label="Images"
                                        value={formatNumber(studio.images)}
                                        limit={formatNumber(studio.maxImages)}
                                        percentage={imagePercentage}
                                    />

                                    <MiniUsage
                                        label="Events"
                                        value={formatNumber(studio.events)}
                                        limit={formatNumber(studio.maxEvents)}
                                        percentage={eventPercentage}
                                    />

                                    <MiniUsage
                                        label="Customers"
                                        value={formatNumber(studio.customers)}
                                        limit={formatNumber(studio.maxCustomers)}
                                        percentage={customerPercentage}
                                    />
                                </div>

                                <button
                                    onClick={() =>
                                        router.push(
                                            `/super-admin/studios/${studio.id}`
                                        )
                                    }
                                    className="mt-5 flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                                >
                                    View Studio
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredStudios.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
                            <Search size={20} />
                        </div>

                        <h3 className="mt-4 font-semibold text-white">
                            No studios found
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
                            Try changing your search or usage filter.
                        </p>

                        <button
                            onClick={() => {
                                setSearch("");
                                setUsageFilter("All");
                            }}
                            className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>

            {/* Bottom Info */}
            <div className="grid gap-4 md:grid-cols-3">
                <InfoCard
                    icon={HardDrive}
                    title="Storage"
                    description="Tracks actual media storage consumed by all studios. Database storage is not included."
                />

                <InfoCard
                    icon={ImageIcon}
                    title="Images"
                    description="Shows the number of uploaded images compared with each studio's image limit."
                />

                <InfoCard
                    icon={AlertTriangle}
                    title="Usage Alerts"
                    description="Warning starts at 75% usage and critical status starts at 90% usage."
                />
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function SummaryCard({
    title,
    value,
    subtitle,
    icon: Icon,
    progress,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    progress?: number;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-zinc-500">{title}</p>

                    <p className="mt-2 text-2xl font-bold text-white">{value}</p>

                    <p className="mt-1 text-xs text-zinc-600">{subtitle}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400">
                    <Icon size={19} />
                </div>
            </div>

            {typeof progress === "number" && (
                <div className="mt-5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                            className={`h-full rounded-full ${progress >= 90
                                    ? "bg-red-500"
                                    : progress >= 75
                                        ? "bg-yellow-500"
                                        : "bg-white"
                                }`}
                            style={{
                                width: `${Math.min(progress, 100)}%`,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function UsageStat({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">{label}</p>

            <p className="mt-1 text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

function ResourceUsage({
    used,
    limit,
    percentage,
    suffix = "",
}: {
    used: number;
    limit: number;
    percentage: number;
    suffix?: string;
}) {
    return (
        <div className="min-w-[160px]">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-zinc-300">
                    {formatNumber(used)}
                    {suffix ? ` ${suffix}` : ""}
                </span>

                <span className="text-zinc-600">
                    {formatNumber(limit)}
                    {suffix ? ` ${suffix}` : ""}
                </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                    className={`h-full rounded-full ${percentage >= 90
                            ? "bg-red-500"
                            : percentage >= 75
                                ? "bg-yellow-500"
                                : "bg-white"
                        }`}
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                    }}
                />
            </div>

            <p className="mt-1 text-[10px] text-zinc-600">
                {percentage.toFixed(1)}% used
            </p>
        </div>
    );
}

function MiniUsage({
    label,
    value,
    limit,
    percentage,
}: {
    label: string;
    value: string;
    limit: string;
    percentage: number;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <p className="text-[11px] text-zinc-500">{label}</p>

            <p className="mt-1 truncate text-sm font-semibold text-white">
                {value}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                / {limit}
            </p>

            <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                    className={`h-full rounded-full ${percentage >= 90
                            ? "bg-red-500"
                            : percentage >= 75
                                ? "bg-yellow-500"
                                : "bg-white"
                        }`}
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                    }}
                />
            </div>
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: UsageStatus;
}) {
    const styles = {
        Healthy: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        Warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        Critical: "border-red-500/20 bg-red-500/10 text-red-400",
    };

    const icons = {
        Healthy: ArrowDown,
        Warning: ArrowUp,
        Critical: AlertTriangle,
    };

    const Icon = icons[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
        >
            <Icon size={12} />
            {status}
        </span>
    );
}

function FilterSelect({
    value,
    onChange,
}: {
    value: "All" | "Healthy" | "Warning" | "Critical";
    onChange: (
        value: "All" | "Healthy" | "Warning" | "Critical"
    ) => void;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value as
                        | "All"
                        | "Healthy"
                        | "Warning"
                        | "Critical"
                    )
                }
                className="h-10 appearance-none rounded-xl border border-zinc-800 bg-zinc-900 pl-4 pr-10 text-sm text-zinc-300 outline-none transition focus:border-zinc-600"
            >
                <option value="All">All Usage</option>
                <option value="Healthy">Healthy</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
            </select>

            <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
        </div>
    );
}

function InfoCard({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400">
                <Icon size={17} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
                {description}
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-IN").format(value);
}