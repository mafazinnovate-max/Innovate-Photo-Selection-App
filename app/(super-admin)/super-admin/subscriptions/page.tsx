"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    CreditCard,
    Eye,
    MoreHorizontal,
    Search,
    ShieldCheck,
    TrendingUp,
    XCircle,
} from "lucide-react";

type Plan = "Basic" | "Professional" | "Enterprise";

type SubscriptionStatus =
    | "Active"
    | "Expiring Soon"
    | "Expired"
    | "Cancelled";

interface Subscription {
    id: string;
    studioId: string;
    studioName: string;
    adminName: string;
    adminEmail: string;
    plan: Plan;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    storageUsed: number;
    storageLimit: number;
    events: number;
    maxEvents: number;
    customers: number;
    maxCustomers: number;
    monthlyPrice: number;
}

const subscriptions: Subscription[] = [
    {
        id: "sub-001",
        studioId: "studio-001",
        studioName: "Innovate Wedding Studio",
        adminName: "Mafaz Malik",
        adminEmail: "admin@innovatewedding.com",
        plan: "Professional",
        status: "Active",
        startDate: "2026-06-01",
        endDate: "2027-05-31",
        storageUsed: 67.4,
        storageLimit: 100,
        events: 28,
        maxEvents: 50,
        customers: 46,
        maxCustomers: 500,
        monthlyPrice: 4999,
    },
    {
        id: "sub-002",
        studioId: "studio-002",
        studioName: "Dream Lens Studio",
        adminName: "Arun Kumar",
        adminEmail: "admin@dreamlens.com",
        plan: "Basic",
        status: "Active",
        startDate: "2026-08-15",
        endDate: "2027-08-14",
        storageUsed: 32.8,
        storageLimit: 50,
        events: 14,
        maxEvents: 25,
        customers: 22,
        maxCustomers: 200,
        monthlyPrice: 2499,
    },
    {
        id: "sub-003",
        studioId: "studio-003",
        studioName: "Moments Photography",
        adminName: "Meena Joseph",
        adminEmail: "admin@momentsphoto.com",
        plan: "Professional",
        status: "Expiring Soon",
        startDate: "2025-11-10",
        endDate: "2026-11-08",
        storageUsed: 81.2,
        storageLimit: 100,
        events: 41,
        maxEvents: 50,
        customers: 89,
        maxCustomers: 500,
        monthlyPrice: 4999,
    },
    {
        id: "sub-004",
        studioId: "studio-004",
        studioName: "Royal Frames",
        adminName: "Karthik Raj",
        adminEmail: "admin@royalframes.com",
        plan: "Enterprise",
        status: "Active",
        startDate: "2026-01-01",
        endDate: "2027-12-31",
        storageUsed: 286.5,
        storageLimit: 500,
        events: 92,
        maxEvents: 150,
        customers: 318,
        maxCustomers: 2000,
        monthlyPrice: 9999,
    },
    {
        id: "sub-005",
        studioId: "studio-005",
        studioName: "Golden Moments",
        adminName: "David Thomas",
        adminEmail: "admin@goldenmoments.com",
        plan: "Basic",
        status: "Expired",
        startDate: "2025-05-01",
        endDate: "2026-04-30",
        storageUsed: 18.4,
        storageLimit: 50,
        events: 19,
        maxEvents: 25,
        customers: 31,
        maxCustomers: 200,
        monthlyPrice: 2499,
    },
    {
        id: "sub-006",
        studioId: "studio-006",
        studioName: "Pixel Stories",
        adminName: "Priya Menon",
        adminEmail: "admin@pixelstories.com",
        plan: "Professional",
        status: "Expiring Soon",
        startDate: "2025-12-15",
        endDate: "2026-10-20",
        storageUsed: 94.6,
        storageLimit: 100,
        events: 47,
        maxEvents: 50,
        customers: 112,
        maxCustomers: 500,
        monthlyPrice: 4999,
    },
    {
        id: "sub-007",
        studioId: "studio-007",
        studioName: "White Rose Weddings",
        adminName: "Maria George",
        adminEmail: "admin@whiterose.com",
        plan: "Professional",
        status: "Cancelled",
        startDate: "2026-02-01",
        endDate: "2027-01-31",
        storageUsed: 43.7,
        storageLimit: 100,
        events: 17,
        maxEvents: 50,
        customers: 28,
        maxCustomers: 500,
        monthlyPrice: 4999,
    },
    {
        id: "sub-008",
        studioId: "studio-008",
        studioName: "Lens Craft",
        adminName: "Sanjay Kumar",
        adminEmail: "admin@lenscraft.com",
        plan: "Basic",
        status: "Active",
        startDate: "2026-07-01",
        endDate: "2027-06-30",
        storageUsed: 21.5,
        storageLimit: 50,
        events: 9,
        maxEvents: 25,
        customers: 18,
        maxCustomers: 200,
        monthlyPrice: 2499,
    },
    {
        id: "sub-009",
        studioId: "studio-009",
        studioName: "Elegant Clicks",
        adminName: "Anu Krishnan",
        adminEmail: "admin@elegantclicks.com",
        plan: "Enterprise",
        status: "Active",
        startDate: "2026-03-01",
        endDate: "2027-02-28",
        storageUsed: 352.2,
        storageLimit: 500,
        events: 106,
        maxEvents: 150,
        customers: 462,
        maxCustomers: 2000,
        monthlyPrice: 9999,
    },
    {
        id: "sub-010",
        studioId: "studio-010",
        studioName: "Forever Frames",
        adminName: "John Mathew",
        adminEmail: "admin@foreverframes.com",
        plan: "Professional",
        status: "Active",
        startDate: "2026-05-15",
        endDate: "2027-05-14",
        storageUsed: 58.1,
        storageLimit: 100,
        events: 23,
        maxEvents: 50,
        customers: 51,
        maxCustomers: 500,
        monthlyPrice: 4999,
    },
    {
        id: "sub-011",
        studioId: "studio-011",
        studioName: "Dream Wedding Films",
        adminName: "Rahul Nair",
        adminEmail: "admin@dreamweddingfilms.com",
        plan: "Professional",
        status: "Active",
        startDate: "2026-04-01",
        endDate: "2027-03-31",
        storageUsed: 72.9,
        storageLimit: 100,
        events: 35,
        maxEvents: 50,
        customers: 74,
        maxCustomers: 500,
        monthlyPrice: 4999,
    },
    {
        id: "sub-012",
        studioId: "studio-012",
        studioName: "Classic Moments",
        adminName: "Nithin Jose",
        adminEmail: "admin@classicmoments.com",
        plan: "Basic",
        status: "Expired",
        startDate: "2025-08-01",
        endDate: "2026-07-31",
        storageUsed: 27.3,
        storageLimit: 50,
        events: 12,
        maxEvents: 25,
        customers: 26,
        maxCustomers: 200,
        monthlyPrice: 2499,
    },
];

const ITEMS_PER_PAGE = 8;

export default function SubscriptionsPage() {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState<"All" | Plan>("All");
    const [statusFilter, setStatusFilter] = useState<
        "All" | SubscriptionStatus
    >("All");

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredSubscriptions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return subscriptions.filter((subscription) => {
            const matchesSearch =
                !query ||
                subscription.studioName.toLowerCase().includes(query) ||
                subscription.adminName.toLowerCase().includes(query) ||
                subscription.adminEmail.toLowerCase().includes(query);

            const matchesPlan =
                planFilter === "All" ||
                subscription.plan === planFilter;

            const matchesStatus =
                statusFilter === "All" ||
                subscription.status === statusFilter;

            return matchesSearch && matchesPlan && matchesStatus;
        });
    }, [search, planFilter, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE)
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedSubscriptions = filteredSubscriptions.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE
    );

    const totalSubscriptions = subscriptions.length;

    const activeSubscriptions = subscriptions.filter(
        (item) => item.status === "Active"
    ).length;

    const expiringSubscriptions = subscriptions.filter(
        (item) => item.status === "Expiring Soon"
    ).length;

    const expiredSubscriptions = subscriptions.filter(
        (item) => item.status === "Expired"
    ).length;

    const monthlyRevenue = subscriptions
        .filter(
            (item) =>
                item.status === "Active" ||
                item.status === "Expiring Soon"
        )
        .reduce((total, item) => total + item.monthlyPrice, 0);

    const resetPage = () => {
        setCurrentPage(1);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        resetPage();
    };

    const handlePlanFilter = (
        value: "All" | Plan
    ) => {
        setPlanFilter(value);
        resetPage();
    };

    const handleStatusFilter = (
        value: "All" | SubscriptionStatus
    ) => {
        setStatusFilter(value);
        resetPage();
    };

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
                        <span>Super Admin</span>
                        <span>/</span>
                        <span className="text-zinc-300">
                            Subscriptions
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-white">
                        Subscriptions
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                        Manage studio subscription plans, billing periods,
                        usage limits and subscription status.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        router.push("/super-admin/studios")
                    }
                    className="flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                    <ShieldCheck size={17} />
                    Manage Studios
                </button>
            </div>

            {/* Overview Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <SummaryCard
                    title="Total Subscriptions"
                    value={totalSubscriptions.toString()}
                    description="All subscription records"
                    icon={<CreditCard size={19} />}
                />

                <SummaryCard
                    title="Active"
                    value={activeSubscriptions.toString()}
                    description="Currently active"
                    icon={<CheckCircle2 size={19} />}
                    iconClassName="text-emerald-400"
                />

                <SummaryCard
                    title="Expiring Soon"
                    value={expiringSubscriptions.toString()}
                    description="Needs attention"
                    icon={<Clock3 size={19} />}
                    iconClassName="text-amber-400"
                />

                <SummaryCard
                    title="Expired"
                    value={expiredSubscriptions.toString()}
                    description="Require renewal"
                    icon={<XCircle size={19} />}
                    iconClassName="text-red-400"
                />

                <SummaryCard
                    title="Monthly Revenue"
                    value={formatCurrency(monthlyRevenue)}
                    description="Active + expiring plans"
                    icon={<TrendingUp size={19} />}
                    iconClassName="text-blue-400"
                />
            </div>

            {/* Filters */}
            <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                    {/* Search */}
                    <div className="relative min-w-0 flex-1">
                        <Search
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                            placeholder="Search studio, admin or email..."
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {/* Plan Filter */}
                        <FilterSelect
                            value={planFilter}
                            onChange={(value) =>
                                handlePlanFilter(value as "All" | Plan)
                            }
                            options={[
                                "All",
                                "Basic",
                                "Professional",
                                "Enterprise",
                            ]}
                            label="Plan"
                        />

                        {/* Status Filter */}
                        <FilterSelect
                            value={statusFilter}
                            onChange={(value) =>
                                handleStatusFilter(
                                    value as "All" | SubscriptionStatus
                                )
                            }
                            options={[
                                "All",
                                "Active",
                                "Expiring Soon",
                                "Expired",
                                "Cancelled",
                            ]}
                            label="Status"
                        />
                    </div>
                </div>
            </div>

            {/* Results Info */}
            <div className="mb-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-zinc-500">
                    Showing{" "}
                    <span className="font-medium text-zinc-300">
                        {filteredSubscriptions.length === 0
                            ? 0
                            : (safeCurrentPage - 1) *
                            ITEMS_PER_PAGE +
                            1}
                        {" - "}
                        {Math.min(
                            safeCurrentPage * ITEMS_PER_PAGE,
                            filteredSubscriptions.length
                        )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-zinc-300">
                        {filteredSubscriptions.length}
                    </span>{" "}
                    subscriptions
                </p>

                {(search ||
                    planFilter !== "All" ||
                    statusFilter !== "All") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setPlanFilter("All");
                                setStatusFilter("All");
                                setCurrentPage(1);
                            }}
                            className="w-fit text-xs text-zinc-400 transition hover:text-white"
                        >
                            Clear filters
                        </button>
                    )}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-visible rounded-2xl border border-zinc-800 bg-zinc-900 lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left">
                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Studio
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Plan
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Subscription
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Usage
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Billing
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedSubscriptions.map(
                                (subscription) => (
                                    <tr
                                        key={subscription.id}
                                        className="border-b border-zinc-800/80 last:border-0 hover:bg-zinc-800/20"
                                    >
                                        {/* Studio */}
                                        <td className="px-5 py-5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/super-admin/studios/${subscription.studioId}`
                                                    )
                                                }
                                                className="group text-left"
                                            >
                                                <p className="font-medium text-white transition group-hover:text-zinc-300">
                                                    {subscription.studioName}
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {subscription.adminName}
                                                </p>

                                                <p className="mt-0.5 text-xs text-zinc-600">
                                                    {subscription.adminEmail}
                                                </p>
                                            </button>
                                        </td>

                                        {/* Plan */}
                                        <td className="px-5 py-5">
                                            <PlanBadge plan={subscription.plan} />

                                            <p className="mt-2 text-xs text-zinc-600">
                                                {formatCurrency(
                                                    subscription.monthlyPrice
                                                )}
                                                /month
                                            </p>
                                        </td>

                                        {/* Subscription Dates */}
                                        <td className="px-5 py-5">
                                            <div className="flex items-start gap-2">
                                                <CalendarDays
                                                    size={15}
                                                    className="mt-0.5 shrink-0 text-zinc-600"
                                                />

                                                <div>
                                                    <p className="text-sm text-zinc-300">
                                                        {formatDate(
                                                            subscription.startDate
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-zinc-600">
                                                        to
                                                    </p>

                                                    <p className="mt-1 text-sm text-zinc-300">
                                                        {formatDate(
                                                            subscription.endDate
                                                        )}
                                                    </p>

                                                    <RemainingDays
                                                        endDate={subscription.endDate}
                                                        status={subscription.status}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Usage */}
                                        <td className="px-5 py-5">
                                            <div className="w-44">
                                                <div className="mb-2 flex items-center justify-between text-xs">
                                                    <span className="text-zinc-500">
                                                        Storage
                                                    </span>

                                                    <span className="text-zinc-300">
                                                        {subscription.storageUsed} /{" "}
                                                        {subscription.storageLimit} GB
                                                    </span>
                                                </div>

                                                <UsageBar
                                                    value={
                                                        subscription.storageUsed
                                                    }
                                                    max={
                                                        subscription.storageLimit
                                                    }
                                                />

                                                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
                                                    <span>
                                                        {subscription.events}/
                                                        {subscription.maxEvents} events
                                                    </span>

                                                    <span>
                                                        {subscription.customers}/
                                                        {subscription.maxCustomers} customers
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Billing */}
                                        <td className="px-5 py-5">
                                            <p className="text-sm font-medium text-white">
                                                {formatCurrency(
                                                    subscription.monthlyPrice
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-600">
                                                Monthly
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-5">
                                            <StatusBadge
                                                status={subscription.status}
                                            />
                                        </td>

                                        {/* Action */}
                                        <td className="relative px-5 py-5 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenMenu(
                                                        openMenu === subscription.id
                                                            ? null
                                                            : subscription.id
                                                    )
                                                }
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {openMenu === subscription.id && (
                                                <ActionMenu
                                                    onClose={() =>
                                                        setOpenMenu(null)
                                                    }
                                                    onView={() =>
                                                        router.push(
                                                            `/super-admin/studios/${subscription.studioId}`
                                                        )
                                                    }
                                                />
                                            )}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {paginatedSubscriptions.length === 0 && (
                    <EmptyState />
                )}
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="space-y-4 lg:hidden">
                {paginatedSubscriptions.map(
                    (subscription) => (
                        <div
                            key={subscription.id}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/super-admin/studios/${subscription.studioId}`
                                        )
                                    }
                                    className="min-w-0 text-left"
                                >
                                    <p className="truncate font-semibold text-white">
                                        {subscription.studioName}
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        {subscription.adminName}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-zinc-600">
                                        {subscription.adminEmail}
                                    </p>
                                </button>

                                <StatusBadge
                                    status={subscription.status}
                                />
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                <PlanBadge plan={subscription.plan} />

                                <span className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-500">
                                    {formatCurrency(
                                        subscription.monthlyPrice
                                    )}
                                    /month
                                </span>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-zinc-600">
                                        Subscription Period
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <CalendarDays
                                            size={15}
                                            className="text-zinc-600"
                                        />

                                        <div>
                                            <p className="text-sm text-zinc-300">
                                                {formatDate(
                                                    subscription.startDate
                                                )}
                                            </p>

                                            <p className="text-xs text-zinc-600">
                                                to{" "}
                                                {formatDate(
                                                    subscription.endDate
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <RemainingDays
                                        endDate={subscription.endDate}
                                        status={subscription.status}
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-600">
                                        Storage
                                    </p>

                                    <p className="mt-2 text-sm text-zinc-300">
                                        {subscription.storageUsed} GB{" "}
                                        <span className="text-zinc-600">
                                            / {subscription.storageLimit} GB
                                        </span>
                                    </p>

                                    <div className="mt-2">
                                        <UsageBar
                                            value={subscription.storageUsed}
                                            max={subscription.storageLimit}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-800 pt-4">
                                <div>
                                    <p className="text-xs text-zinc-600">
                                        Events
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-300">
                                        {subscription.events}{" "}
                                        <span className="text-zinc-600">
                                            / {subscription.maxEvents}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-600">
                                        Customers
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-300">
                                        {subscription.customers}{" "}
                                        <span className="text-zinc-600">
                                            / {subscription.maxCustomers}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/super-admin/studios/${subscription.studioId}`
                                        )
                                    }
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                                >
                                    <Eye size={16} />
                                    View Studio
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/super-admin/studios/${subscription.studioId}/edit`
                                        )
                                    }
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                                >
                                    Manage
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </div>
                    )
                )}

                {paginatedSubscriptions.length === 0 && (
                    <EmptyState />
                )}
            </div>

            {/* Pagination */}
            {filteredSubscriptions.length > 0 && (
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-zinc-600">
                        Page {safeCurrentPage} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={safeCurrentPage === 1}
                            onClick={() =>
                                setCurrentPage(
                                    (page) => Math.max(1, page - 1)
                                )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronLeft size={17} />
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`hidden h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-medium transition sm:flex ${page === safeCurrentPage
                                        ? "bg-white text-black"
                                        : "border border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <span className="px-1 text-xs text-zinc-600 sm:hidden">
                            {safeCurrentPage} / {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={safeCurrentPage === totalPages}
                            onClick={() =>
                                setCurrentPage(
                                    (page) =>
                                        Math.min(totalPages, page + 1)
                                )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Information */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoCard
                    icon={<CreditCard size={18} />}
                    title="Subscription Management"
                    description="Plans and subscription dates are currently UI-only and will be connected to the database later."
                />

                <InfoCard
                    icon={<ShieldCheck size={18} />}
                    title="Usage Limits"
                    description="Storage, event, customer and image limits are configured per studio."
                />

                <InfoCard
                    icon={<AlertCircle size={18} />}
                    title="Renewal Attention"
                    description="Expiring and expired subscriptions are highlighted so they can be handled quickly."
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
    description,
    icon,
    iconClassName = "text-zinc-300",
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    iconClassName?: string;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-zinc-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 ${iconClassName}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FilterSelect({
    value,
    onChange,
    options,
    label,
}: {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    label: string;
}) {
    return (
        <div className="relative min-w-[180px]">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-10 text-sm text-zinc-300 outline-none transition focus:border-zinc-500"
                aria-label={label}
            >
                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                        className="bg-zinc-950"
                    >
                        {option === "All"
                            ? `All ${label}s`
                            : option}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
        </div>
    );
}

function PlanBadge({
    plan,
}: {
    plan: Plan;
}) {
    const classes = {
        Basic: "border-zinc-700 bg-zinc-800 text-zinc-300",
        Professional:
            "border-blue-500/20 bg-blue-500/10 text-blue-400",
        Enterprise:
            "border-purple-500/20 bg-purple-500/10 text-purple-400",
    };

    return (
        <span
            className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${classes[plan]}`}
        >
            {plan}
        </span>
    );
}

function StatusBadge({
    status,
}: {
    status: SubscriptionStatus;
}) {
    const config = {
        Active: {
            className:
                "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
            icon: <CheckCircle2 size={13} />,
        },
        "Expiring Soon": {
            className:
                "border-amber-500/20 bg-amber-500/10 text-amber-400",
            icon: <Clock3 size={13} />,
        },
        Expired: {
            className:
                "border-red-500/20 bg-red-500/10 text-red-400",
            icon: <XCircle size={13} />,
        },
        Cancelled: {
            className:
                "border-zinc-700 bg-zinc-800 text-zinc-500",
            icon: <XCircle size={13} />,
        },
    };

    const current = config[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${current.className}`}
        >
            {current.icon}
            {status}
        </span>
    );
}

function RemainingDays({
    endDate,
    status,
}: {
    endDate: string;
    status: SubscriptionStatus;
}) {
    if (status === "Expired") {
        return (
            <p className="mt-2 text-xs font-medium text-red-400">
                Subscription expired
            </p>
        );
    }

    if (status === "Cancelled") {
        return (
            <p className="mt-2 text-xs font-medium text-zinc-500">
                Subscription cancelled
            </p>
        );
    }

    const today = new Date();
    const end = new Date(endDate);

    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const difference =
        end.getTime() - today.getTime();

    const days = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

    if (days <= 0) {
        return (
            <p className="mt-2 text-xs font-medium text-red-400">
                Expires today
            </p>
        );
    }

    if (days <= 30) {
        return (
            <p className="mt-2 text-xs font-medium text-amber-400">
                {days} days remaining
            </p>
        );
    }

    return (
        <p className="mt-2 text-xs text-zinc-600">
            {days} days remaining
        </p>
    );
}

function UsageBar({
    value,
    max,
}: {
    value: number;
    max: number;
}) {
    const percentage =
        max > 0
            ? Math.min(100, (value / max) * 100)
            : 0;

    return (
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
                className="h-full rounded-full bg-white transition-all"
                style={{
                    width: `${percentage}%`,
                }}
            />
        </div>
    );
}

function ActionMenu({
    onClose,
    onView,
}: {
    onClose: () => void;
    onView: () => void;
}) {
    return (
        <div className="absolute right-5 top-14 z-30 w-48 rounded-xl border border-zinc-700 bg-zinc-950 p-1.5 text-left shadow-2xl">
            <button
                type="button"
                onClick={() => {
                    onClose();
                    onView();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
                <Eye size={16} />
                View Studio
            </button>

            <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
                <CreditCard size={16} />
                Manage Plan
            </button>

            <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
                <CalendarDays size={16} />
                Change Dates
            </button>

            <div className="my-1 border-t border-zinc-800" />

            <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
                Renew Subscription
            </button>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500">
                <Search size={22} />
            </div>

            <h3 className="mt-5 font-semibold text-white">
                No subscriptions found
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Try changing your search or filter settings to
                find the subscription you are looking for.
            </p>
        </div>
    );
}

function InfoCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
                {icon}
            </div>

            <h3 className="mt-4 text-sm font-semibold text-white">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
                {description}
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}