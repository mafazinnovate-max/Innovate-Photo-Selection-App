"use client";

import { useEffect, useMemo, useState } from "react";
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
    X,
} from "lucide-react";

type UsageStatus = "Healthy" | "Warning" | "Critical" | "Not tracked";

type StudioUsage = {
    id: string;
    studioName: string;
    adminName: string;
    plan: string;
    storageUsed: number;
    storageLimit: number;
    images: number;
    maxImages: number;
    events: number;
    maxEvents: number;
    status: UsageStatus;
};

type ApiStudio = {
    id: string;
    name: string;
    admins?: {
        name?: string | null;
    }[];
    Subscription?: {
        plan?: string | null;
        storageLimitGb?: number | null;
        maxImages?: number | null;
        maxEvents?: number | null;
    }[];
    _count?: {
        events?: number;
    };
    totalImages?: number;
};

type ApiStorageStudio = {
    studioId: string;
    usedGB: number;
    storageLimitGb: number;
};

type StudiosResponse = {
    success: boolean;
    message?: string;
    studios: ApiStudio[];
};

type StorageResponse = {
    success: boolean;
    message?: string;
    summary: {
        totalGB: number;
        privateBucket: {
            totalBytes: number;
            totalGB: number;
            objectCount: number;
        };
        publicBucket: {
            totalBytes: number;
            totalGB: number;
            objectCount: number;
        };
        unassigned: {
            totalBytes: number;
            totalGB: number;
        };
        studioCount: number;
    };
    studios: ApiStorageStudio[];
    lastUpdated?: string;
};

type UsageFilter =
    | "All"
    | "Healthy"
    | "Warning"
    | "Critical"
    | "Not tracked";

function getUsageStatus(
    storageUsed: number,
    storageLimit: number,
    images: number,
    maxImages: number,
    events: number,
    maxEvents: number
): UsageStatus {
    const percentages: number[] = [];

    if (storageLimit > 0) {
        percentages.push((storageUsed / storageLimit) * 100);
    }

    if (maxImages > 0) {
        percentages.push((images / maxImages) * 100);
    }

    if (maxEvents > 0) {
        percentages.push((events / maxEvents) * 100);
    }

    if (percentages.length === 0) {
        return "Not tracked";
    }

    const highestPercentage = Math.max(...percentages);

    if (highestPercentage >= 90) return "Critical";
    if (highestPercentage >= 75) return "Warning";

    return "Healthy";
}

export default function UsagePage() {
    const router = useRouter();

    const [studios, setStudios] = useState<StudioUsage[]>([]);
    const [platformStorageUsed, setPlatformStorageUsed] = useState(0);
    const [privateStorage, setPrivateStorage] = useState(0);
    const [publicStorage, setPublicStorage] = useState(0);
    const [unassignedStorage, setUnassignedStorage] = useState(0);
    const [totalR2Objects, setTotalR2Objects] = useState(0);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [search, setSearch] = useState("");
    const [usageFilter, setUsageFilter] = useState<UsageFilter>("All");

    useEffect(() => {
        let cancelled = false;

        async function loadUsageData() {
            try {
                setIsLoading(true);
                setError("");

                const [studiosResponse, storageResponse] = await Promise.all([
                    fetch("/api/super-admin/studios", {
                        cache: "no-store",
                    }),
                    fetch("/api/super-admin/storage-usage", {
                        cache: "no-store",
                    }),
                ]);

                const [studiosData, storageData]: [
                    StudiosResponse,
                    StorageResponse
                ] = await Promise.all([
                    studiosResponse.json(),
                    storageResponse.json(),
                ]);

                if (!studiosResponse.ok || !studiosData.success) {
                    throw new Error(
                        studiosData.message || "Failed to fetch studio details."
                    );
                }

                if (!storageResponse.ok || !storageData.success) {
                    throw new Error(
                        storageData.message || "Failed to fetch storage usage."
                    );
                }

                const storageMap = new Map(
                    (storageData.studios ?? []).map((item) => [
                        item.studioId,
                        item,
                    ])
                );

                const usageData: StudioUsage[] = studiosData.studios.map(
                    (studio) => {
                        const subscription = studio.Subscription?.[0];
                        const storage = storageMap.get(studio.id);

                        const storageUsed = Number(storage?.usedGB ?? 0);

                        const storageLimit = Number(
                            subscription?.storageLimitGb ??
                            storage?.storageLimitGb ??
                            0
                        );

                        const images = Number(studio.totalImages ?? 0);
                        const maxImages = Number(subscription?.maxImages ?? 0);

                        const events = Number(studio._count?.events ?? 0);
                        const maxEvents = Number(subscription?.maxEvents ?? 0);

                        return {
                            id: studio.id,
                            studioName: studio.name,
                            adminName: studio.admins?.[0]?.name || "No Admin",
                            plan: subscription?.plan || "No Plan",
                            storageUsed,
                            storageLimit,
                            images,
                            maxImages,
                            events,
                            maxEvents,
                            status: getUsageStatus(
                                storageUsed,
                                storageLimit,
                                images,
                                maxImages,
                                events,
                                maxEvents
                            ),
                        };
                    }
                );

                if (cancelled) return;

                setStudios(usageData);

                setPlatformStorageUsed(
                    Number(storageData.summary?.totalGB ?? 0)
                );

                setPrivateStorage(
                    Number(storageData.summary?.privateBucket?.totalGB ?? 0)
                );

                setPublicStorage(
                    Number(storageData.summary?.publicBucket?.totalGB ?? 0)
                );

                setUnassignedStorage(
                    Number(storageData.summary?.unassigned?.totalGB ?? 0)
                );

                setTotalR2Objects(
                    Number(storageData.summary?.privateBucket?.objectCount ?? 0) +
                    Number(storageData.summary?.publicBucket?.objectCount ?? 0)
                );

                setLastUpdated(storageData.lastUpdated ?? null);
            } catch (err) {
                if (cancelled) return;

                console.error("Usage page fetch error:", err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong while loading usage data."
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadUsageData();

        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    const filteredStudios = useMemo(() => {
        const query = search.trim().toLowerCase();

        return studios.filter((studio) => {
            const matchesSearch =
                !query ||
                studio.studioName.toLowerCase().includes(query) ||
                studio.adminName.toLowerCase().includes(query) ||
                studio.plan.toLowerCase().includes(query);

            const matchesFilter =
                usageFilter === "All" || studio.status === usageFilter;

            return matchesSearch && matchesFilter;
        });
    }, [studios, search, usageFilter]);

    const totalStorageUsed = studios.reduce(
        (sum, studio) => sum + studio.storageUsed,
        0
    );

    const totalStorageLimit = studios.reduce(
        (sum, studio) => sum + studio.storageLimit,
        0
    );

    const totalImages = studios.reduce(
        (sum, studio) => sum + studio.images,
        0
    );

    const totalEvents = studios.reduce(
        (sum, studio) => sum + studio.events,
        0
    );

    const warningCount = studios.filter(
        (studio) => studio.status === "Warning"
    ).length;

    const criticalCount = studios.filter(
        (studio) => studio.status === "Critical"
    ).length;

    const overallStoragePercentage =
        totalStorageLimit > 0
            ? (totalStorageUsed / totalStorageLimit) * 100
            : 0;

    const highestStorageStudios = [...studios]
        .sort((a, b) => b.storageUsed - a.storageUsed)
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-7 w-48 rounded-lg bg-zinc-800" />
                        <div className="h-4 w-72 rounded bg-zinc-800/70" />
                    </div>
                    <div className="h-10 w-36 rounded-xl bg-zinc-800" />
                </div>

                {/* Summary Cards Skeleton */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-28 rounded bg-zinc-800" />
                                <div className="h-10 w-10 rounded-xl bg-zinc-800" />
                            </div>
                            <div className="mt-5 h-8 w-32 rounded-lg bg-zinc-800" />
                            <div className="mt-3 h-3 w-40 rounded bg-zinc-800/70" />
                        </div>
                    ))}
                </div>

                {/* Storage Overview Skeleton */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <div className="h-5 w-40 rounded bg-zinc-800" />
                    <div className="mt-5 h-3 w-full rounded-full bg-zinc-800" />
                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="space-y-2">
                                <div className="h-3 w-20 rounded bg-zinc-800" />
                                <div className="h-6 w-24 rounded bg-zinc-800" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Highest Storage Consumers Skeleton */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <div className="h-5 w-52 rounded bg-zinc-800" />
                    <div className="mt-6 space-y-5">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-4 w-32 rounded bg-zinc-800" />
                                    <div className="h-4 w-20 rounded bg-zinc-800" />
                                </div>
                                <div className="h-2 w-full rounded-full bg-zinc-800" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Studio Usage Table Skeleton */}
                <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
                    <div className="flex items-center justify-between border-b border-zinc-800 p-5">
                        <div className="h-5 w-36 rounded bg-zinc-800" />
                        <div className="h-10 w-56 rounded-xl bg-zinc-800" />
                    </div>

                    {/* Desktop Rows */}
                    <div className="hidden md:block">
                        <div className="grid grid-cols-6 gap-4 border-b border-zinc-800 px-6 py-4">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div key={item} className="h-3 w-16 rounded bg-zinc-800" />
                            ))}
                        </div>

                        <div className="divide-y divide-zinc-800/70">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div
                                    key={item}
                                    className="grid grid-cols-6 items-center gap-4 px-6 py-5"
                                >
                                    {[1, 2, 3, 4, 5, 6].map((col) => (
                                        <div
                                            key={col}
                                            className={`h-4 rounded bg-zinc-800 ${col === 1 ? "w-28" : "w-16"
                                                }`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="space-y-4 p-4 md:hidden">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="rounded-xl border border-zinc-800 p-4"
                            >
                                <div className="h-4 w-36 rounded bg-zinc-800" />
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((col) => (
                                        <div key={col} className="space-y-2">
                                            <div className="h-3 w-16 rounded bg-zinc-800" />
                                            <div className="h-5 w-20 rounded bg-zinc-800" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                        <AlertTriangle size={22} />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-white">
                        Unable to Load Usage Data
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {error}
                    </p>

                    <button
                        onClick={() => setRefreshKey((value) => value + 1)}
                        className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

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
                                Monitor storage, images and events across all studios.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                    <p className="text-xs text-zinc-500">Studios Monitored</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                        {studios.length}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Storage Used"
                    value={`${totalStorageUsed.toFixed(3)} GB`}
                    subtitle={`of ${totalStorageLimit.toFixed(0)} GB allocated`}
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
                    subtitle="Non-deleted events"
                    icon={CalendarDays}
                />

                <SummaryCard
                    title="Platform R2 Storage"
                    value={`${platformStorageUsed.toFixed(3)} GB`}
                    subtitle="Includes private and public buckets"
                    icon={HardDrive}
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
                                    {criticalCount > 1 ? "s" : ""} at critical usage
                                </p>

                                <p className="mt-1 text-sm leading-6 text-zinc-400">
                                    These studios have reached 90% or more of their storage,
                                    image or event limits. Consider increasing their limits.
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
                                    These studios are using between 75% and 90% of at least
                                    one allocated resource.
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
                                Studio Storage Overview
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Storage consumption compared with the total storage allocated
                                to registered studios.
                            </p>
                        </div>

                        <div className="text-left md:text-right">
                            <p className="text-2xl font-bold text-white">
                                {overallStoragePercentage.toFixed(1)}%
                            </p>

                            <p className="text-xs text-zinc-500">studio storage utilized</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="text-zinc-400">
                            {totalStorageUsed.toFixed(3)} GB used
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

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <UsageStat
                            label="Studio Storage Used"
                            value={`${totalStorageUsed.toFixed(3)} GB`}
                        />

                        <UsageStat
                            label="Available Studio Storage"
                            value={`${Math.max(
                                totalStorageLimit - totalStorageUsed,
                                0
                            ).toFixed(3)} GB`}
                        />

                        <UsageStat
                            label="Total Studio Storage Limit"
                            value={`${totalStorageLimit.toFixed(0)} GB`}
                        />

                        <UsageStat
                            label="Private Bucket"
                            value={`${privateStorage.toFixed(3)} GB`}
                        />

                        <UsageStat
                            label="Public Bucket"
                            value={`${publicStorage.toFixed(3)} GB`}
                        />

                        <UsageStat
                            label="Unassigned Storage"
                            value={`${unassignedStorage.toFixed(3)} GB`}
                        />

                        <UsageStat
                            label="Total R2 Objects"
                            value={formatNumber(totalR2Objects)}
                        />
                    </div>

                    {lastUpdated && (
                        <p className="mt-5 text-right text-[11px] text-zinc-600">
                            Storage last updated:{" "}
                            {new Date(lastUpdated).toLocaleString("en-IN")}
                        </p>
                    )}
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

                {highestStorageStudios.length > 0 ? (
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
                                                {studio.storageUsed.toFixed(3)} GB used
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
                ) : (
                    <p className="p-8 text-center text-sm text-zinc-500">
                        No storage usage available.
                    </p>
                )}
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

                            <FilterSelect
                                value={usageFilter}
                                onChange={setUsageFilter}
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[1050px]">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                                <th className="px-6 py-4 font-medium">Studio</th>
                                <th className="px-6 py-4 font-medium">Storage</th>
                                <th className="px-6 py-4 font-medium">Images</th>
                                <th className="px-6 py-4 font-medium">Events</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStudios.map((studio) => {
                                const storagePercentage =
                                    studio.storageLimit > 0
                                        ? (studio.storageUsed / studio.storageLimit) * 100
                                        : 0;

                                const imagePercentage =
                                    studio.maxImages > 0
                                        ? (studio.images / studio.maxImages) * 100
                                        : 0;

                                const eventPercentage =
                                    studio.maxEvents > 0
                                        ? (studio.events / studio.maxEvents) * 100
                                        : 0;

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
                            studio.storageLimit > 0
                                ? (studio.storageUsed / studio.storageLimit) * 100
                                : 0;

                        const imagePercentage =
                            studio.maxImages > 0
                                ? (studio.images / studio.maxImages) * 100
                                : 0;

                        const eventPercentage =
                            studio.maxEvents > 0
                                ? (studio.events / studio.maxEvents) * 100
                                : 0;

                        return (
                            <div key={studio.id} className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-white">
                                            {studio.studioName}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {studio.adminName} · {studio.plan}
                                        </p>
                                    </div>

                                    <StatusBadge status={studio.status} />
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400">Storage</span>

                                        <span className="text-zinc-500">
                                            {studio.storageUsed.toFixed(3)} /{" "}
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

                                <div className="mt-5 grid grid-cols-2 gap-3">
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
                    description="Tracks actual R2 storage consumed by individual studios and platform-wide private and public bucket usage."
                />

                <InfoCard
                    icon={ImageIcon}
                    title="Images"
                    description="Shows uploaded image counts for non-deleted events compared with each studio's image limit."
                />

                <InfoCard
                    icon={AlertTriangle}
                    title="Usage Alerts"
                    description="Warning starts at 75% usage and critical status starts at 90% usage across storage, images or events."
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
    if (limit <= 0) {
        return (
            <div className="min-w-[160px]">
                <p className="text-xs text-zinc-500">Not tracked</p>
                <p className="mt-1 text-[10px] text-zinc-600">
                    No usage limit configured
                </p>
            </div>
        );
    }

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
    const styles: Record<UsageStatus, string> = {
        Healthy: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        Warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        Critical: "border-red-500/20 bg-red-500/10 text-red-400",
        "Not tracked": "border-zinc-700 bg-zinc-800/60 text-zinc-400",
    };

    const icons: Record<UsageStatus, React.ElementType> = {
        Healthy: ArrowDown,
        Warning: ArrowUp,
        Critical: AlertTriangle,
        "Not tracked": AlertTriangle,
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
    value: UsageFilter;
    onChange: (value: UsageFilter) => void;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value as UsageFilter)
                }
                className="h-10 appearance-none rounded-xl border border-zinc-800 bg-zinc-900 pl-4 pr-10 text-sm text-zinc-300 outline-none transition focus:border-zinc-600"
            >
                <option value="All">All Usage</option>
                <option value="Healthy">Healthy</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
                <option value="Not tracked">Not tracked</option>
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