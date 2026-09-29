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
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type StudioStatus = "Active" | "Inactive" | "Expiring";

type Plan = "Basic" | "Professional" | "Enterprise";

interface Studio {
    id: number;
    name: string;
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
    storageUsed: number;
    storageLimit: number;
    subscriptionStart: string;
    subscriptionEnd: string;
    createdAt: string;
}

const studios: Studio[] = [
    {
        id: 1,
        name: "Innovate Wedding",
        shortName: "IW",
        adminName: "Mafaz Malik",
        adminEmail: "admin@innovatewedding.com",
        adminPhone: "+91 98765 43210",
        location: "Chennai, Tamil Nadu",
        plan: "Professional",
        status: "Active",
        events: 42,
        customers: 38,
        images: 18450,
        storageUsed: 68.4,
        storageLimit: 100,
        subscriptionStart: "01 Aug 2026",
        subscriptionEnd: "31 Jul 2027",
        createdAt: "01 Aug 2026",
    },
    {
        id: 2,
        name: "Moments Studio",
        shortName: "MS",
        adminName: "Rahul Kumar",
        adminEmail: "admin@momentsstudio.com",
        adminPhone: "+91 98765 12345",
        location: "Coimbatore, Tamil Nadu",
        plan: "Basic",
        status: "Active",
        events: 18,
        customers: 16,
        images: 7620,
        storageUsed: 24.8,
        storageLimit: 50,
        subscriptionStart: "15 Jul 2026",
        subscriptionEnd: "14 Jul 2027",
        createdAt: "15 Jul 2026",
    },
    {
        id: 3,
        name: "Dream Frame Photography",
        shortName: "DF",
        adminName: "Arun Prakash",
        adminEmail: "admin@dreamframe.com",
        adminPhone: "+91 91234 56789",
        location: "Madurai, Tamil Nadu",
        plan: "Enterprise",
        status: "Active",
        events: 86,
        customers: 79,
        images: 48210,
        storageUsed: 214.6,
        storageLimit: 500,
        subscriptionStart: "10 Jun 2026",
        subscriptionEnd: "09 Jun 2027",
        createdAt: "10 Jun 2026",
    },
    {
        id: 4,
        name: "Pixel Stories",
        shortName: "PS",
        adminName: "Vijay Raj",
        adminEmail: "admin@pixelstories.com",
        adminPhone: "+91 99887 66554",
        location: "Bangalore, Karnataka",
        plan: "Professional",
        status: "Expiring",
        events: 31,
        customers: 28,
        images: 12640,
        storageUsed: 54.2,
        storageLimit: 100,
        subscriptionStart: "05 Oct 2025",
        subscriptionEnd: "04 Oct 2026",
        createdAt: "05 Oct 2025",
    },
    {
        id: 5,
        name: "Golden Moments",
        shortName: "GM",
        adminName: "Suresh Babu",
        adminEmail: "admin@goldenmoments.com",
        adminPhone: "+91 90000 11223",
        location: "Salem, Tamil Nadu",
        plan: "Basic",
        status: "Inactive",
        events: 7,
        customers: 6,
        images: 2480,
        storageUsed: 8.2,
        storageLimit: 50,
        subscriptionStart: "01 Jan 2026",
        subscriptionEnd: "31 Dec 2026",
        createdAt: "01 Jan 2026",
    },
    {
        id: 6,
        name: "Forever Frames",
        shortName: "FF",
        adminName: "Karthik S",
        adminEmail: "admin@foreverframes.com",
        adminPhone: "+91 94444 77889",
        location: "Trichy, Tamil Nadu",
        plan: "Professional",
        status: "Active",
        events: 27,
        customers: 24,
        images: 10980,
        storageUsed: 42.7,
        storageLimit: 100,
        subscriptionStart: "20 Aug 2026",
        subscriptionEnd: "19 Aug 2027",
        createdAt: "20 Aug 2026",
    },
];

const statusOptions = ["All Status", "Active", "Expiring", "Inactive"];

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

function StatusBadge({ status }: { status: StudioStatus }) {
    if (status === "Active") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 size={13} />
                Active
            </span>
        );
    }

    if (status === "Expiring") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                <Clock3 size={13} />
                Expiring
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
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [planFilter, setPlanFilter] = useState("All Plans");
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const router = useRouter();

    const filteredStudios = useMemo(() => {
        return studios.filter((studio) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                studio.name.toLowerCase().includes(searchValue) ||
                studio.adminName.toLowerCase().includes(searchValue) ||
                studio.adminEmail.toLowerCase().includes(searchValue) ||
                studio.location.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "All Status" ||
                studio.status === statusFilter;

            const matchesPlan =
                planFilter === "All Plans" ||
                studio.plan === planFilter;

            return matchesSearch && matchesStatus && matchesPlan;
        });
    }, [search, statusFilter, planFilter]);

    const totalStudios = studios.length;
    const activeStudios = studios.filter(
        (studio) => studio.status === "Active"
    ).length;
    const expiringStudios = studios.filter(
        (studio) => studio.status === "Expiring"
    ).length;
    const inactiveStudios = studios.filter(
        (studio) => studio.status === "Inactive"
    ).length;

    const totalStorage = studios.reduce(
        (total, studio) => total + studio.storageUsed,
        0
    );

    return (
        <div
            className="space-y-8"
            onClick={() => setOpenMenu(null)}
        >
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
                                Manage all studios registered on your platform.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        router.push("/super-admin/studios/new");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-200 cursor-pointer"
                >
                    <Plus size={17} />
                    Add Studio
                </button>
            </div>

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
                            <Building2 size={20} className="text-zinc-300" />
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
                                {totalStorage.toFixed(1)} GB
                            </p>
                        </div>

                        <div className="rounded-lg bg-zinc-800 p-2.5">
                            <HardDrive size={20} className="text-zinc-300" />
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
                                setSearch(event.target.value)
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
                                setStatusFilter(event.target.value)
                            }
                            className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-10 text-sm text-zinc-300 outline-none focus:border-zinc-600 xl:w-44"
                        >
                            {statusOptions.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
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
                                setPlanFilter(event.target.value)
                            }
                            className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-10 text-sm text-zinc-300 outline-none focus:border-zinc-600 xl:w-48"
                        >
                            {planOptions.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
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
                            Showing {filteredStudios.length} of {totalStudios}{" "}
                            studios
                        </p>
                    </div>

                    {inactiveStudios > 0 && (
                        <div className="text-xs text-zinc-500">
                            {inactiveStudios} inactive account
                            {inactiveStudios !== 1 ? "s" : ""}
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
                            {filteredStudios.map((studio) => {
                                const storagePercentage =
                                    (studio.storageUsed / studio.storageLimit) *
                                    100;

                                return (
                                    <tr
                                        key={studio.id}
                                        className="border-b border-zinc-800/70 transition hover:bg-zinc-900"
                                    >
                                        {/* Studio */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-white">
                                                    {getInitials(studio.name)}
                                                </div>

                                                <div>
                                                    <p className="font-medium text-white">
                                                        {studio.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        {studio.location}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Admin */}
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-medium text-zinc-200">
                                                {studio.adminName}
                                            </p>

                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                                <Mail size={12} />
                                                {studio.adminEmail}
                                            </div>
                                        </td>

                                        {/* Activity */}
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5 text-xs">
                                                <div className="flex items-center gap-2 text-zinc-400">
                                                    <CalendarDays size={13} />
                                                    {studio.events} events
                                                </div>

                                                <div className="flex items-center gap-2 text-zinc-500">
                                                    <Users size={13} />
                                                    {studio.customers} customers
                                                </div>
                                            </div>
                                        </td>

                                        {/* Storage */}
                                        <td className="px-6 py-5">
                                            <div className="w-36">
                                                <div className="mb-2 flex items-center justify-between text-xs">
                                                    <span className="text-zinc-300">
                                                        {studio.storageUsed} GB
                                                    </span>

                                                    <span className="text-zinc-600">
                                                        {studio.storageLimit} GB
                                                    </span>
                                                </div>

                                                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                                    <div
                                                        className={`h-full rounded-full ${storagePercentage >= 90
                                                            ? "bg-red-400"
                                                            : storagePercentage >= 75
                                                                ? "bg-amber-400"
                                                                : "bg-white"
                                                            }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                storagePercentage,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Subscription */}
                                        <td className="px-6 py-5">
                                            <PlanBadge plan={studio.plan} />

                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                                                <Clock3 size={12} />
                                                Until {studio.subscriptionEnd}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <StatusBadge status={studio.status} />
                                        </td>

                                        {/* Action */}
                                        <td className="relative px-6 py-5 text-right">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setOpenMenu(
                                                        openMenu === studio.id
                                                            ? null
                                                            : studio.id
                                                    );
                                                }}
                                                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {openMenu === studio.id && (
                                                <div
                                                    onClick={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                    className="absolute right-6 top-14 z-20 w-48 rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 text-left shadow-2xl"
                                                >
                                                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                                        <Eye size={15} />
                                                        View Studio
                                                    </button>

                                                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                                        <Pencil size={15} />
                                                        Edit Studio
                                                    </button>

                                                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white">
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

                                                    <div className="my-1 border-t border-zinc-800" />

                                                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
                                                        <Trash2 size={15} />
                                                        Delete Studio
                                                    </button>
                                                </div>
                                            )}
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

                        return (
                            <div
                                key={studio.id}
                                className="p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-white">
                                            {getInitials(studio.name)}
                                        </div>

                                        <div>
                                            <p className="font-medium text-white">
                                                {studio.name}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                {studio.location}
                                            </p>
                                        </div>
                                    </div>

                                    <StatusBadge status={studio.status} />
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Admin
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-300">
                                            {studio.adminName}
                                        </p>

                                        <p className="mt-1 break-all text-xs text-zinc-500">
                                            {studio.adminEmail}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Subscription
                                        </p>

                                        <div className="mt-1">
                                            <PlanBadge plan={studio.plan} />
                                        </div>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            Until {studio.subscriptionEnd}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Activity
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-300">
                                            {studio.events} events
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {studio.customers} customers
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Storage
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-300">
                                            {studio.storageUsed} GB /{" "}
                                            {studio.storageLimit} GB
                                        </p>

                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                            <div
                                                className={`h-full rounded-full ${storagePercentage >= 90
                                                    ? "bg-red-400"
                                                    : storagePercentage >= 75
                                                        ? "bg-amber-400"
                                                        : "bg-white"
                                                    }`}
                                                style={{
                                                    width: `${Math.min(
                                                        storagePercentage,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                                    <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800">
                                        <Eye size={14} />
                                        View
                                    </button>

                                    <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800">
                                        <Pencil size={14} />
                                        Edit
                                    </button>

                                    <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800">
                                        {studio.status === "Inactive" ? (
                                            <>
                                                <CheckCircle2 size={14} />
                                                Activate
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={14} />
                                                Deactivate
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* No Results */}
                {filteredStudios.length === 0 && (
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
                                Try changing your search or filters to find
                                the studio you are looking for.
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
                                1–{filteredStudios.length}
                            </span>{" "}
                            of{" "}
                            <span className="text-zinc-300">
                                {filteredStudios.length}
                            </span>{" "}
                            studios
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                disabled
                                className="rounded-lg border border-zinc-800 p-2 text-zinc-600 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-white px-2 text-xs font-medium text-black">
                                1
                            </span>

                            <button
                                disabled
                                className="rounded-lg border border-zinc-800 p-2 text-zinc-600 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
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
                                Subscription Management
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                Plans and billing will be managed from the
                                subscription module.
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
                                Storage Monitoring
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                Storage usage will be calculated from the
                                connected file storage provider.
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
                                Activate or deactivate studio access when
                                required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}