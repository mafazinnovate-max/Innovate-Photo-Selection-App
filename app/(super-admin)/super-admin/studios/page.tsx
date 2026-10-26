"use client";

import {
    AlertCircle,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Eye,
    HardDrive,
    Mail,
    MapPin,
    MoreHorizontal,
    Pencil,
    Phone,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    Users,
    XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";


type StudioStatus = "Active" | "Inactive" | "Expiring Soon";
type Plan = "Basic" | "Professional" | "Enterprise";

interface Studio {
    id: string;
    name: string;
    logoUrl: string | null;
    phone: string;
    shortName: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    location: string;
    plan: Plan;
    status: StudioStatus;
    events: number;
    customers: number;
    images: number;
    storageUsed: number | null;
    storageLimit: number;
    subscriptionStart: string;
    subscriptionEnd: string;
    createdAt: string;
}

interface ApiStudio {
    id: string;
    name: string;
    logoUrl?: string | null;
    createdAt: string;
    isActive: boolean;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    admins?: {
        id: string;
        username: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        createdAt: string;
    }[];
    subscriptions?: {
        plan: string;
        status: string;
        startDate: string;
        endDate: string | null;
        storageLimitGb: number;
    }[];
    _count?: {
        events: number;
    };
    metrics?: {
        customers?: number;
        images?: number;
    };
}

const statusOptions = [
    "All Status",
    "Active",
    "Expiring Soon",
    "Inactive",
];

const planOptions = [
    "All Plans",
    "Basic",
    "Professional",
    "Enterprise",
];

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-IN").format(value);
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function formatDate(value: string) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function getStudioStatus(
    isActive: boolean,
    subscription?: ApiStudio["subscriptions"] extends (infer T)[] | undefined
        ? T
        : never
): StudioStatus {
    if (!isActive) return "Inactive";
    if (!subscription) return "Active";

    if (subscription.status.toLowerCase() !== "active") {
        return "Inactive";
    }

    if (!subscription.endDate) return "Active";

    const end = new Date(subscription.endDate);

    if (Number.isNaN(end.getTime())) return "Active";

    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const endDay = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
    );

    const remainingDays = Math.ceil(
        (endDay.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (remainingDays < 0) return "Inactive";
    if (remainingDays <= 10) return "Expiring Soon";

    return "Active";
}

function StatusBadge({ status }: { status: StudioStatus }) {
    if (status === "Active") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 size={13} />
                Active
            </span>
        );
    }

    if (status === "Expiring Soon") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                <Clock3 size={13} />
                Expiring Soon
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
            <XCircle size={13} />
            Inactive
        </span>
    );
}

function PlanBadge({ plan }: { plan: Plan }) {
    return (
        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
            {plan}
        </span>
    );
}

export default function StudiosPage() {
    const [studios, setStudios] = useState<Studio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [planFilter, setPlanFilter] = useState("All Plans");

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const router = useRouter();

    const navigateWithLoader = (path: string) => {
        setIsNavigating(true);
        router.push(path);
    };

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
                    setLogoUrl(data.profile.logoUrl || null);
                }
            } catch (error) {
                console.error(
                    "Failed to load Super Admin logo:",
                    error
                );
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadStudios() {
            try {
                setIsLoading(true);
                setLoadError("");

                const response = await fetch(
                    "/api/super-admin/studios",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to fetch studios."
                    );
                }

                if (!Array.isArray(data.studios)) {
                    throw new Error(
                        "Invalid studio data received."
                    );
                }

                const mappedStudios: Studio[] = (
                    data.studios as ApiStudio[]
                ).map((studio) => {
                    const firstAdmin = studio.admins?.[0];
                    const subscription = studio.subscriptions?.[0];

                    const validPlans: Plan[] = [
                        "Basic",
                        "Professional",
                        "Enterprise",
                    ];

                    const plan: Plan = validPlans.includes(
                        subscription?.plan as Plan
                    )
                        ? (subscription?.plan as Plan)
                        : "Basic";

                    const location = [
                        studio.city,
                        studio.state,
                    ]
                        .filter(Boolean)
                        .join(", ");

                    return {
                        id: studio.id,
                        name: studio.name,
                        logoUrl: studio.logoUrl || null,
                        shortName: getInitials(studio.name),
                        phone: studio.phone || "—",

                        adminName:
                            firstAdmin?.name ||
                            firstAdmin?.username ||
                            "—",

                        adminEmail: firstAdmin?.email || "—",
                        adminPhone: firstAdmin?.phone || "—",

                        location: location || "—",

                        plan,

                        status: getStudioStatus(
                            studio.isActive,
                            subscription
                        ),

                        events: studio._count?.events ?? 0,

                        // No Customer model exists in the current Prisma schema.
                        customers: studio.metrics?.customers ?? 0,

                        images: studio.metrics?.images ?? 0,

                        // Storage usage is not currently tracked in the schema.
                        storageUsed: null,

                        storageLimit: subscription?.storageLimitGb ?? 100,

                        subscriptionStart: subscription?.startDate ?? "",
                        subscriptionEnd: subscription?.endDate ?? "",

                        createdAt: studio.createdAt,
                    };
                });

                if (!cancelled) {
                    setStudios(mappedStudios);
                }
            } catch (error) {
                console.error(
                    "Failed to load studios:",
                    error
                );

                if (!cancelled) {
                    setLoadError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load studios."
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadStudios();

        return () => {
            cancelled = true;
        };
    }, []);


    const handleToggleStatus = async (
        studioId: string,
        currentStatus: StudioStatus,
        subscriptionEnd: string
    ) => {
        const nextStatus: StudioStatus =
            currentStatus === "Inactive" ? "Active" : "Inactive";

        try {
            const response = await fetch(
                `/api/super-admin/studios/${encodeURIComponent(studioId)}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "set-status",
                        isActive: nextStatus !== "Inactive",
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to update studio status.");
            }

            let updatedStatus: StudioStatus = nextStatus;

            if (nextStatus === "Active" && subscriptionEnd !== "—") {
                const expiryDate = new Date(subscriptionEnd);
                const today = new Date();
                const daysLeft = Math.ceil(
                    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysLeft >= 0 && daysLeft <= 10) {
                    updatedStatus = "Expiring Soon";
                }
            }

            setStudios((current) =>
                current.map((item) =>
                    item.id === studioId
                        ? { ...item, status: updatedStatus }
                        : item
                )
            );
        } catch (err) {
            window.alert(
                err instanceof Error ? err.message : "Failed to update studio status."
            );
        }
    };

    const filteredStudios = useMemo(() => {
        return studios.filter((studio) => {
            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                studio.name
                    .toLowerCase()
                    .includes(searchValue) ||
                studio.adminName
                    .toLowerCase()
                    .includes(searchValue) ||
                studio.adminEmail
                    .toLowerCase()
                    .includes(searchValue) ||
                studio.location
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "All Status" ||
                studio.status === statusFilter;

            const matchesPlan =
                planFilter === "All Plans" ||
                studio.plan === planFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPlan
            );
        });
    }, [
        studios,
        search,
        statusFilter,
        planFilter,
    ]);

    const totalStudios = studios.length;

    const activeStudios = studios.filter(
        (studio) => studio.status === "Active"
    ).length;

    const expiringStudios = studios.filter(
        (studio) => studio.status === "Expiring Soon"
    ).length;

    const inactiveStudios = studios.filter(
        (studio) => studio.status === "Inactive"
    ).length;

    return (
        <div
            className="space-y-8"
            onClick={() => setOpenMenu(null)}
        >
            {/* Navigation Loader */}
            {isNavigating && (
                <div
                    className="fixed left-72 right-0 top-0 bottom-0 z-30 flex items-center justify-center bg-black"
                    role="status"
                    aria-label="Loading page"
                >
                    {logoUrl ? (
                        <Image
                            src={logoUrl}
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

            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
                            <Building2 size={21} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Studios
                            </h1>

                            <p className="mt-1 text-sm text-zinc-400">
                                Manage all studios
                                registered on your
                                platform.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        navigateWithLoader("/super-admin/studios/new");
                    }}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-200"
                >
                    <Plus size={17} />
                    Add Studio
                </button>
            </div>

            {/* Error */}
            {!isLoading && loadError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-red-400"
                        />

                        <div>
                            <p className="font-medium text-red-300">
                                Failed to load studios
                            </p>

                            <p className="mt-1 text-sm text-red-400">
                                {loadError}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-400">
                                Total Studios
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-white">
                                {totalStudios}
                            </p>
                        </div>

                        <div className="rounded-lg bg-zinc-800 p-2.5">
                            <Building2
                                size={20}
                                className="text-zinc-300"
                            />
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-zinc-500">
                        All registered studios
                    </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-400">
                                Active Studios
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-white">
                                {activeStudios}
                            </p>
                        </div>

                        <div className="rounded-lg bg-emerald-500/10 p-2.5">
                            <ShieldCheck
                                size={20}
                                className="text-emerald-400"
                            />
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-zinc-500">
                        Currently active accounts
                    </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-400">
                                Expiring Soon
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-white">
                                {expiringStudios}
                            </p>
                        </div>

                        <div className="rounded-lg bg-amber-500/10 p-2.5">
                            <AlertCircle
                                size={20}
                                className="text-amber-400"
                            />
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-zinc-500">
                        Need subscription attention
                    </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-400">
                                Storage Used
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-white">
                                {studios.some((studio) => studio.storageUsed !== null)
                                    ? `${studios
                                        .reduce(
                                            (total, studio) =>
                                                total + (studio.storageUsed ?? 0),
                                            0
                                        )
                                        .toFixed(1)} GB`
                                    : "Not tracked"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-zinc-800 p-2.5">
                            <HardDrive
                                size={20}
                                className="text-zinc-300"
                            />
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-zinc-500">
                        Across all studios
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search by studio, admin, email or location..."
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
                        />
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-10 text-sm text-zinc-300 outline-none focus:border-zinc-600 xl:w-44"
                        >
                            {statusOptions.map(
                                (option) => (
                                    <option
                                        key={option}
                                    >
                                        {option}
                                    </option>
                                )
                            )}
                        </select>

                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                    </div>

                    {/* Plan */}
                    <div className="relative">
                        <select
                            value={planFilter}
                            onChange={(event) =>
                                setPlanFilter(
                                    event.target.value
                                )
                            }
                            className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-10 text-sm text-zinc-300 outline-none focus:border-zinc-600 xl:w-48"
                        >
                            {planOptions.map(
                                (option) => (
                                    <option
                                        key={option}
                                    >
                                        {option}
                                    </option>
                                )
                            )}
                        </select>

                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                    </div>
                </div>
            </div>

            {/* Studio Table */}
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="flex flex-col gap-2 border-b border-zinc-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            All Studios
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Showing{" "}
                            {filteredStudios.length}{" "}
                            of {totalStudios} studios
                        </p>
                    </div>

                    {inactiveStudios > 0 && (
                        <div className="text-xs text-zinc-500">
                            {inactiveStudios} inactive
                            account
                            {inactiveStudios !== 1
                                ? "s"
                                : ""}
                        </div>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[1200px]">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left">
                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                                    Studio
                                </th>

                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                                    Admin
                                </th>

                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                                    Activity
                                </th>

                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                                    Storage
                                </th>

                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                                    Subscription
                                </th>

                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr
                                        key={`studio-skeleton-${index}`}
                                        className="border-b border-zinc-800/70 animate-pulse"
                                    >
                                        {/* Studio skeleton */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-800" />
                                                <div className="space-y-2">
                                                    <div className="h-3.5 w-32 rounded bg-zinc-800" />
                                                    <div className="h-3 w-24 rounded bg-zinc-800/70" />
                                                    <div className="h-3 w-28 rounded bg-zinc-800/70" />
                                                </div>
                                            </div>
                                        </td>
                                        {/* Admin skeleton */}
                                        <td className="px-6 py-5">
                                            <div className="space-y-2">
                                                <div className="h-3.5 w-28 rounded bg-zinc-800" />
                                                <div className="h-3 w-24 rounded bg-zinc-800/70" />
                                                <div className="h-3 w-32 rounded bg-zinc-800/70" />
                                            </div>
                                        </td>
                                        {/* Activity skeleton */}
                                        <td className="px-6 py-5">
                                            <div className="h-3 w-16 rounded bg-zinc-800" />
                                        </td>
                                        {/* Storage skeleton */}
                                        <td className="px-6 py-5">
                                            <div className="w-36 space-y-2">
                                                <div className="flex justify-between gap-3">
                                                    <div className="h-3 w-12 rounded bg-zinc-800" />
                                                    <div className="h-3 w-12 rounded bg-zinc-800" />
                                                </div>
                                                <div className="h-1.5 rounded-full bg-zinc-800" />
                                            </div>
                                        </td>
                                        {/* Subscription skeleton */}
                                        <td className="px-6 py-5">
                                            <div className="space-y-2">
                                                <div className="h-6 w-24 rounded-full bg-zinc-800" />
                                                <div className="h-3 w-24 rounded bg-zinc-800/70" />
                                            </div>
                                        </td>
                                        {/* Status skeleton */}
                                        <td className="px-6 py-5">
                                            <div className="h-6 w-20 rounded-full bg-zinc-800" />
                                        </td>
                                        {/* Action skeleton */}
                                        <td className="px-6 py-5">
                                            <div className="ml-auto h-8 w-8 rounded-lg bg-zinc-800" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredStudios.map(
                                    (studio) => {
                                        const storagePercentage =
                                            studio.storageUsed !== null &&
                                                studio.storageLimit > 0
                                                ? (studio.storageUsed / studio.storageLimit) * 100
                                                : null;

                                        return (
                                            <tr
                                                key={
                                                    studio.id
                                                }
                                                className="border-b border-zinc-800/70 transition hover:bg-zinc-900"
                                            >
                                                {/* Studio */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
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
                                                                {getInitials(
                                                                    studio.name
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">
                                                                {
                                                                    studio.name
                                                                }
                                                            </p>
                                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                                                <Phone
                                                                    size={
                                                                        12
                                                                    }
                                                                />
                                                                {
                                                                    studio.phone
                                                                }
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                                                <MapPin
                                                                    size={
                                                                        12
                                                                    }
                                                                />
                                                                {
                                                                    studio.location
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Admin */}
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-medium text-zinc-200">
                                                        {
                                                            studio.adminName
                                                        }
                                                    </p>

                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                                        <Phone
                                                            size={
                                                                12
                                                            }
                                                        />

                                                        {
                                                            studio.adminPhone
                                                        }
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                                        <Mail
                                                            size={
                                                                12
                                                            }
                                                        />

                                                        {
                                                            studio.adminEmail
                                                        }
                                                    </div>
                                                </td>

                                                {/* Activity */}
                                                <td className="px-6 py-5">
                                                    <div className="space-y-1.5 text-xs w-20">
                                                        <div className="flex items-center gap-2 text-zinc-400">
                                                            <CalendarDays
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            {
                                                                studio.events
                                                            }{" "}
                                                            events
                                                        </div>

                                                        {/* <div className="flex items-center gap-2 text-zinc-500">
                                                        <Users
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        {
                                                            studio.customers
                                                        }{" "}
                                                        customers
                                                    </div> */}
                                                    </div>
                                                </td>

                                                {/* Storage */}
                                                <td className="px-6 py-5">
                                                    <div className="w-36">
                                                        <div className="mb-2 flex items-center justify-between text-xs">
                                                            <span className="text-zinc-300">
                                                                {studio.storageLimit >
                                                                    0
                                                                    ? `${studio.storageUsed} GB`
                                                                    : "—"}
                                                            </span>

                                                            <span className="text-zinc-600">
                                                                {studio.storageLimit >
                                                                    0
                                                                    ? `${studio.storageLimit} GB`
                                                                    : "—"}
                                                            </span>
                                                        </div>

                                                        {storagePercentage !== null && (
                                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                                                <div
                                                                    className={`h-full rounded-full ${storagePercentage >= 90
                                                                        ? "bg-red-400"
                                                                        : storagePercentage >= 75
                                                                            ? "bg-amber-400"
                                                                            : "bg-white"
                                                                        }`}
                                                                    style={{
                                                                        width: `${Math.min(storagePercentage, 100)}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Subscription */}
                                                <td className="px-6 py-5">
                                                    <PlanBadge
                                                        plan={
                                                            studio.plan
                                                        }
                                                    />

                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                                                        <Clock3
                                                            size={
                                                                12
                                                            }
                                                        />

                                                        Until{" "}
                                                        {studio.subscriptionEnd &&
                                                            studio.subscriptionEnd !== "—"
                                                            ? new Date(studio.subscriptionEnd).toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                            : "—"}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-5">
                                                    <StatusBadge
                                                        status={
                                                            studio.status
                                                        }
                                                    />
                                                </td>

                                                {/* Action */}
                                                <td className="relative px-6 py-5 text-right">
                                                    <button
                                                        onClick={(
                                                            event
                                                        ) => {
                                                            event.stopPropagation();

                                                            setOpenMenu(
                                                                openMenu ===
                                                                    studio.id
                                                                    ? null
                                                                    : studio.id
                                                            );
                                                        }}
                                                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                                                    >
                                                        <MoreHorizontal
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </button>

                                                    {openMenu ===
                                                        studio.id && (
                                                            <div
                                                                onClick={(
                                                                    event
                                                                ) => {
                                                                    event.stopPropagation()
                                                                    setOpenMenu(
                                                                        openMenu ===
                                                                            studio.id
                                                                            ? null
                                                                            : studio.id
                                                                    );
                                                                }}
                                                                className="absolute right-6 top-14 z-20 w-48 rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 text-left shadow-2xl"
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        navigateWithLoader(
                                                                            `/super-admin/studios/${studio.id}`
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                    View Studio
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        navigateWithLoader(
                                                                            `/super-admin/studios/${studio.id}/edit`
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                                                >
                                                                    <Pencil
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                    Edit Studio
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleStatus(studio.id, studio.status, studio.subscriptionEnd)}
                                                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                                                >
                                                                    {studio.status === "Inactive" ? (
                                                                        <>
                                                                            <CheckCircle2 size={15} />
                                                                            Activate
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <XCircle size={15} />
                                                                            Deactivate
                                                                        </>
                                                                    )}
                                                                </button>


                                                                {/* <div className="my-1 border-t border-zinc-800" /> */}
                                                            </div>
                                                        )}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile / Tablet Cards */}
                <div className="divide-y divide-zinc-800 lg:hidden">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={`studio-mobile-skeleton-${index}`}
                                className="animate-pulse p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="h-11 w-11 shrink-0 rounded-xl bg-zinc-800" />
                                        <div className="min-w-0 space-y-2">
                                            <div className="h-3.5 w-32 rounded bg-zinc-800" />
                                            <div className="h-3 w-24 rounded bg-zinc-800/70" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-20 shrink-0 rounded-full bg-zinc-800" />
                                </div>
                                <div className="mt-5 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="h-3 w-16 rounded bg-zinc-800/70" />
                                        <div className="h-3.5 w-24 rounded bg-zinc-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-16 rounded bg-zinc-800/70" />
                                        <div className="h-3.5 w-20 rounded bg-zinc-800" />
                                    </div>
                                </div>
                                <div className="mt-5 flex gap-2">
                                    <div className="h-8 w-20 rounded-lg bg-zinc-800" />
                                    <div className="h-8 w-24 rounded-lg bg-zinc-800" />
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredStudios.map(
                            (studio) => {
                                const storagePercentage =
                                    studio.storageUsed !== null &&
                                        studio.storageLimit > 0
                                        ? (studio.storageUsed / studio.storageLimit) * 100
                                        : null;

                                return (
                                    <div
                                        key={studio.id}
                                        className="p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-white">
                                                    {getInitials(
                                                        studio.name
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-medium text-white">
                                                        {
                                                            studio.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        {
                                                            studio.location
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <StatusBadge
                                                status={
                                                    studio.status
                                                }
                                            />
                                        </div>

                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs text-zinc-500">
                                                    Admin
                                                </p>

                                                <p className="mt-1 text-sm text-zinc-300">
                                                    {
                                                        studio.adminName
                                                    }
                                                </p>

                                                <p className="mt-1 break-all text-xs text-zinc-500">
                                                    {
                                                        studio.adminEmail
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-zinc-500">
                                                    Subscription
                                                </p>

                                                <div className="mt-1">
                                                    <PlanBadge
                                                        plan={
                                                            studio.plan
                                                        }
                                                    />
                                                </div>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    Until{" "}
                                                    {studio.subscriptionEnd &&
                                                        studio.subscriptionEnd !== "—"
                                                        ? new Date(studio.subscriptionEnd).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })
                                                        : "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-zinc-500">
                                                    Activity
                                                </p>

                                                <p className="mt-1 text-sm text-zinc-300">
                                                    {
                                                        studio.events
                                                    }{" "}
                                                    events
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {
                                                        studio.customers
                                                    }{" "}
                                                    customers
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-zinc-500">
                                                    Storage
                                                </p>

                                                <p className="mt-1 text-sm text-zinc-300">
                                                    {studio.storageLimit >
                                                        0
                                                        ? `${studio.storageUsed} GB / ${studio.storageLimit} GB`
                                                        : "—"}
                                                </p>

                                                {storagePercentage !== null && (
                                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                                        <div
                                                            className={`h-full rounded-full ${storagePercentage >= 90
                                                                ? "bg-red-400"
                                                                : storagePercentage >= 75
                                                                    ? "bg-amber-400"
                                                                    : "bg-white"
                                                                }`}
                                                            style={{
                                                                width: `${Math.min(storagePercentage, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                                            <button
                                                onClick={() =>
                                                    navigateWithLoader(
                                                        `/super-admin/studios/${studio.id}`
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
                                            >
                                                <Eye
                                                    size={
                                                        14
                                                    }
                                                />
                                                View
                                            </button>

                                            <button
                                                onClick={() =>
                                                    navigateWithLoader(
                                                        `/super-admin/studios/${studio.id}/edit`
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
                                            >
                                                <Pencil
                                                    size={
                                                        14
                                                    }
                                                />
                                                Edit
                                            </button>

                                            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800">
                                                {studio.status ===
                                                    "Inactive" ? (
                                                    <>
                                                        <CheckCircle2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Activate
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Deactivate
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                        )
                    )}
                </div>

                {/* No Results */}
                {!isLoading &&
                    filteredStudios.length === 0 && (
                        <div className="flex min-h-80 items-center justify-center px-6">
                            <div className="max-w-sm text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
                                    <Building2
                                        size={23}
                                        className="text-zinc-500"
                                    />
                                </div>

                                <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                                    No studios found
                                </h3>

                                <p className="mt-2 text-sm text-zinc-500">
                                    Try changing your
                                    search or filters
                                    to find the studio
                                    you are looking
                                    for.
                                </p>
                            </div>
                        </div>
                    )}

                {/* Pagination */}
                {filteredStudios.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-zinc-800 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-zinc-500">
                            Showing{" "}
                            <span className="text-zinc-300">
                                1–
                                {
                                    filteredStudios.length
                                }
                            </span>{" "}
                            of{" "}
                            <span className="text-zinc-300">
                                {
                                    filteredStudios.length
                                }
                            </span>{" "}
                            studios
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                disabled
                                className="rounded-lg border border-zinc-800 p-2 text-zinc-600 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft
                                    size={16}
                                />
                            </button>

                            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-white px-2 text-xs font-medium text-black">
                                1
                            </span>

                            <button
                                disabled
                                className="rounded-lg border border-zinc-800 p-2 text-zinc-600 disabled:cursor-not-allowed"
                            >
                                <ChevronRight
                                    size={16}
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Information */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-zinc-800 p-2">
                            <CircleDollarSign
                                size={18}
                                className="text-zinc-300"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-zinc-300">
                                Subscription
                                Management
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                Plans and billing
                                will be managed
                                from the
                                subscription
                                module.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-zinc-800 p-2">
                            <HardDrive
                                size={18}
                                className="text-zinc-300"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-zinc-300">
                                Storage
                                Monitoring
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                Storage usage
                                will be
                                calculated from
                                the connected
                                file storage
                                provider.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-zinc-800 p-2">
                            <ShieldCheck
                                size={18}
                                className="text-zinc-300"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-zinc-300">
                                Account Control
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                Activate or
                                deactivate
                                studio access
                                when required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}