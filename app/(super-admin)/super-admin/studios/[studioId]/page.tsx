"use client";

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Edit,
    Globe,
    HardDrive,
    Image as ImageIcon,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    User,
    Users,
    Activity,
    Ban,
    Trash2,
    MoreVertical,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type StudioStatus = "Active" | "Inactive" | "Expiring";
type Plan = "Basic" | "Professional" | "Enterprise";

interface Studio {
    id: string;
    name: string;
    shortName: string;
    description: string;

    adminName: string;
    adminEmail: string;
    adminPhone: string;

    email: string;
    phone: string;
    website: string;

    address: string;
    city: string;
    state: string;
    country: string;

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

    maxEvents: number;
    maxCustomers: number;
    maxImages: number;
}

const studio: Studio = {
    id: "studio-001",
    name: "Innovate Wedding Studio",
    shortName: "Innovate",
    description:
        "Professional wedding photography and videography studio managing wedding events, customer galleries and photo selections.",

    adminName: "Mafaz Malik",
    adminEmail: "admin@innovatewedding.com",
    adminPhone: "+91 98765 43210",

    email: "hello@innovatewedding.com",
    phone: "+91 98765 43210",
    website: "https://innovatewedding.com",

    address: "Main Road, Nagercoil",
    city: "Nagercoil",
    state: "Tamil Nadu",
    country: "India",

    plan: "Professional",
    status: "Active",

    events: 28,
    customers: 46,
    images: 48260,

    storageUsed: 67.4,
    storageLimit: 100,

    subscriptionStart: "2026-06-01",
    subscriptionEnd: "2027-05-31",
    createdAt: "2026-06-01",

    maxEvents: 50,
    maxCustomers: 500,
    maxImages: 100000,
};

const recentEvents = [
    {
        id: "EVT-001",
        name: "Rahul & Priya Wedding",
        date: "Sep 28, 2026",
        photos: 6240,
        status: "Active",
    },
    {
        id: "EVT-002",
        name: "Arun & Meena Reception",
        date: "Sep 21, 2026",
        photos: 4380,
        status: "Completed",
    },
    {
        id: "EVT-003",
        name: "Karthik & Anu Engagement",
        date: "Sep 14, 2026",
        photos: 2860,
        status: "Completed",
    },
    {
        id: "EVT-004",
        name: "David & Maria Wedding",
        date: "Sep 08, 2026",
        photos: 7120,
        status: "Completed",
    },
];

export default function ViewStudioPage() {
    const router = useRouter();
    const params = useParams();

    const [status, setStatus] = useState<StudioStatus>(studio.status);
    const [showActions, setShowActions] = useState(false);

    const storagePercentage =
        (studio.storageUsed / studio.storageLimit) * 100;

    const eventPercentage =
        (studio.events / studio.maxEvents) * 100;

    const customerPercentage =
        (studio.customers / studio.maxCustomers) * 100;

    const imagePercentage =
        (studio.images / studio.maxImages) * 100;

    const subscriptionEnd = new Date(studio.subscriptionEnd);
    const today = new Date("2026-10-02");

    const remainingDays = Math.max(
        0,
        Math.ceil(
            (subscriptionEnd.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        )
    );

    const handleToggleStatus = () => {
        setStatus((current) =>
            current === "Active" ? "Inactive" : "Active"
        );
    };

    return (
        <div className="pb-10">
            {/* ====================================================== */}
            {/* HEADER */}
            {/* ====================================================== */}

            <div className="mb-8">
                <div className="mb-5 flex items-center gap-2 text-sm text-zinc-500">
                    <button
                        type="button"
                        onClick={() => router.push("/super-admin/studios")}
                        className="transition hover:text-white"
                    >
                        Studios
                    </button>

                    <ChevronRight size={15} />

                    <span className="text-zinc-300">{studio.name}</span>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/super-admin/studios")}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-semibold text-white">
                                    {studio.name}
                                </h1>

                                <StatusBadge status={status} />
                            </div>

                            <p className="mt-1 text-sm text-zinc-500">
                                Studio ID: {studio.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(`/super-admin/studios/${params.studioId}/edit`)
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        >
                            <Edit size={16} />
                            Edit Studio
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowActions((prev) => !prev)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                            >
                                <MoreVertical size={18} />
                            </button>

                            {showActions && (
                                <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl">
                                    <button
                                        type="button"
                                        onClick={handleToggleStatus}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                                    >
                                        {status === "Active" ? (
                                            <Ban size={16} />
                                        ) : (
                                            <CheckCircle2 size={16} />
                                        )}

                                        {status === "Active"
                                            ? "Deactivate Studio"
                                            : "Activate Studio"}
                                    </button>

                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                                    >
                                        <Trash2 size={16} />
                                        Delete Studio
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ====================================================== */}
            {/* OVERVIEW CARDS */}
            {/* ====================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <OverviewCard
                    icon={<CalendarDays size={19} />}
                    label="Total Events"
                    value={studio.events.toLocaleString()}
                    description={`of ${studio.maxEvents.toLocaleString()} allowed`}
                />

                <OverviewCard
                    icon={<Users size={19} />}
                    label="Customers"
                    value={studio.customers.toLocaleString()}
                    description={`of ${studio.maxCustomers.toLocaleString()} allowed`}
                />

                <OverviewCard
                    icon={<ImageIcon size={19} />}
                    label="Images"
                    value={studio.images.toLocaleString()}
                    description={`of ${studio.maxImages.toLocaleString()} allowed`}
                />

                <OverviewCard
                    icon={<HardDrive size={19} />}
                    label="Storage Used"
                    value={`${studio.storageUsed} GB`}
                    description={`of ${studio.storageLimit} GB`}
                />
            </div>

            {/* ====================================================== */}
            {/* MAIN GRID */}
            {/* ====================================================== */}

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* LEFT */}
                <div className="space-y-6 xl:col-span-2">
                    {/* Studio Information */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <SectionHeader
                            icon={<Building2 size={19} />}
                            title="Studio Information"
                            description="Basic information about this studio"
                        />

                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InfoItem
                                icon={<Building2 size={17} />}
                                label="Studio Name"
                                value={studio.name}
                            />

                            <InfoItem
                                icon={<Mail size={17} />}
                                label="Studio Email"
                                value={studio.email}
                            />

                            <InfoItem
                                icon={<Phone size={17} />}
                                label="Phone"
                                value={studio.phone}
                            />

                            <InfoItem
                                icon={<Globe size={17} />}
                                label="Website"
                                value={studio.website}
                                link
                            />

                            <InfoItem
                                icon={<MapPin size={17} />}
                                label="Address"
                                value={`${studio.address}, ${studio.city}, ${studio.state}`}
                            />

                            <InfoItem
                                icon={<Clock3 size={17} />}
                                label="Created On"
                                value={formatDate(studio.createdAt)}
                            />
                        </div>

                        <div className="mt-6 border-t border-zinc-800 pt-6">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                                Description
                            </p>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                {studio.description}
                            </p>
                        </div>
                    </section>

                    {/* Admin */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <SectionHeader
                            icon={<ShieldCheck size={19} />}
                            title="Studio Admin"
                            description="Administrator account associated with this studio"
                        />

                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InfoItem
                                icon={<User size={17} />}
                                label="Admin Name"
                                value={studio.adminName}
                            />

                            <InfoItem
                                icon={<Mail size={17} />}
                                label="Admin Email"
                                value={studio.adminEmail}
                            />

                            <InfoItem
                                icon={<Phone size={17} />}
                                label="Admin Phone"
                                value={studio.adminPhone}
                            />

                            <InfoItem
                                icon={<ShieldCheck size={17} />}
                                label="Account Status"
                                value={status}
                                valueClass={
                                    status === "Active"
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                }
                            />
                        </div>
                    </section>

                    {/* Usage */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <SectionHeader
                            icon={<Activity size={19} />}
                            title="Usage"
                            description="Current resource usage for this studio"
                        />

                        <div className="mt-6 space-y-6">
                            <UsageBar
                                icon={<HardDrive size={17} />}
                                label="Storage"
                                used={`${studio.storageUsed} GB`}
                                limit={`${studio.storageLimit} GB`}
                                percentage={storagePercentage}
                            />

                            <UsageBar
                                icon={<CalendarDays size={17} />}
                                label="Events"
                                used={studio.events.toLocaleString()}
                                limit={studio.maxEvents.toLocaleString()}
                                percentage={eventPercentage}
                            />

                            <UsageBar
                                icon={<Users size={17} />}
                                label="Customers"
                                used={studio.customers.toLocaleString()}
                                limit={studio.maxCustomers.toLocaleString()}
                                percentage={customerPercentage}
                            />

                            <UsageBar
                                icon={<ImageIcon size={17} />}
                                label="Images"
                                used={studio.images.toLocaleString()}
                                limit={studio.maxImages.toLocaleString()}
                                percentage={imagePercentage}
                            />
                        </div>
                    </section>

                    {/* Recent Events */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <SectionHeader
                                icon={<CalendarDays size={19} />}
                                title="Recent Events"
                                description="Latest events created by this studio"
                            />

                            <button
                                type="button"
                                className="text-sm font-medium text-zinc-400 transition hover:text-white"
                            >
                                View all
                            </button>
                        </div>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[620px]">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-left">
                                        <th className="pb-3 text-xs font-medium uppercase tracking-wide text-zinc-600">
                                            Event
                                        </th>

                                        <th className="pb-3 text-xs font-medium uppercase tracking-wide text-zinc-600">
                                            Date
                                        </th>

                                        <th className="pb-3 text-xs font-medium uppercase tracking-wide text-zinc-600">
                                            Photos
                                        </th>

                                        <th className="pb-3 text-xs font-medium uppercase tracking-wide text-zinc-600">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentEvents.map((event) => (
                                        <tr
                                            key={event.id}
                                            className="border-b border-zinc-800/70 last:border-0"
                                        >
                                            <td className="py-4">
                                                <p className="text-sm font-medium text-zinc-200">
                                                    {event.name}
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-600">
                                                    {event.id}
                                                </p>
                                            </td>

                                            <td className="py-4 text-sm text-zinc-400">
                                                {event.date}
                                            </td>

                                            <td className="py-4 text-sm text-zinc-400">
                                                {event.photos.toLocaleString()}
                                            </td>

                                            <td className="py-4">
                                                <EventStatus status={event.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* RIGHT */}
                <div className="space-y-6">
                    {/* Subscription */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <SectionHeader
                            icon={<CalendarDays size={19} />}
                            title="Subscription"
                            description="Current subscription details"
                        />

                        <div className="mt-6">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-600">
                                            Current Plan
                                        </p>

                                        <p className="mt-1 text-xl font-semibold text-white">
                                            {studio.plan}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black">
                                        {status}
                                    </div>
                                </div>

                                <div className="mt-5 h-px bg-zinc-800" />

                                <div className="mt-5 space-y-4">
                                    <DateRow
                                        label="Start Date"
                                        value={formatDate(studio.subscriptionStart)}
                                    />

                                    <DateRow
                                        label="End Date"
                                        value={formatDate(studio.subscriptionEnd)}
                                    />

                                    <DateRow
                                        label="Remaining"
                                        value={`${remainingDays} days`}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Limits */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <SectionHeader
                            icon={<ShieldCheck size={19} />}
                            title="Plan Limits"
                            description="Limits configured for this studio"
                        />

                        <div className="mt-6 space-y-3">
                            <LimitRow
                                icon={<HardDrive size={16} />}
                                label="Storage"
                                value={`${studio.storageLimit} GB`}
                            />

                            <LimitRow
                                icon={<CalendarDays size={16} />}
                                label="Events"
                                value={studio.maxEvents.toLocaleString()}
                            />

                            <LimitRow
                                icon={<Users size={16} />}
                                label="Customers"
                                value={studio.maxCustomers.toLocaleString()}
                            />

                            <LimitRow
                                icon={<ImageIcon size={16} />}
                                label="Images"
                                value={studio.maxImages.toLocaleString()}
                            />
                        </div>
                    </section>

                    {/* Location */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <SectionHeader
                            icon={<MapPin size={19} />}
                            title="Location"
                            description="Studio location information"
                        />

                        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                            <div className="flex gap-3">
                                <MapPin
                                    size={18}
                                    className="mt-0.5 shrink-0 text-zinc-500"
                                />

                                <div>
                                    <p className="text-sm font-medium text-zinc-200">
                                        {studio.city}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                                        {studio.address}
                                        <br />
                                        {studio.state}, {studio.country}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Account Actions */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <SectionHeader
                            icon={<ShieldCheck size={19} />}
                            title="Account Actions"
                            description="Manage this studio account"
                        />

                        <div className="mt-6 space-y-3">
                            <button
                                type="button"
                                onClick={handleToggleStatus}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${status === "Active"
                                    ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    }`}
                            >
                                {status === "Active" ? (
                                    <>
                                        <Ban size={16} />
                                        Deactivate Studio
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} />
                                        Activate Studio
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        `/super-admin/studios/${params.studioId}/edit`
                                    )
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                            >
                                <Edit size={16} />
                                Edit Studio
                            </button>

                            <button
                                type="button"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                            >
                                <Trash2 size={16} />
                                Delete Studio
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

/* ============================================================ */
/* COMPONENTS */
/* ============================================================ */

function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400">
                {icon}
            </div>

            <div>
                <h2 className="text-base font-semibold text-white">
                    {title}
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                    {description}
                </p>
            </div>
        </div>
    );
}

function OverviewCard({
    icon,
    label,
    value,
    description,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-500">
                    {icon}
                </div>
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-zinc-600">
                {label}
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
                {value}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
                {description}
            </p>
        </div>
    );
}

function InfoItem({
    icon,
    label,
    value,
    link = false,
    valueClass = "text-zinc-200",
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    link?: boolean;
    valueClass?: string;
}) {
    return (
        <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-600">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs text-zinc-600">{label}</p>

                <p
                    className={`mt-1 break-words text-sm ${valueClass} ${link ? "cursor-pointer hover:underline" : ""
                        }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

function UsageBar({
    icon,
    label,
    used,
    limit,
    percentage,
}: {
    icon: React.ReactNode;
    label: string;
    used: string;
    limit: string;
    percentage: number;
}) {
    const safePercentage = Math.min(100, Math.max(0, percentage));

    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-zinc-600">{icon}</span>

                    <span className="text-sm font-medium text-zinc-300">
                        {label}
                    </span>
                </div>

                <p className="text-xs text-zinc-500">
                    <span className="text-zinc-300">{used}</span>
                    {" / "}
                    {limit}
                </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{
                        width: `${safePercentage}%`,
                    }}
                />
            </div>

            <p className="mt-2 text-right text-xs text-zinc-600">
                {safePercentage.toFixed(1)}% used
            </p>
        </div>
    );
}

function DateRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-zinc-600">{label}</span>

            <span className="text-sm text-zinc-300">{value}</span>
        </div>
    );
}

function LimitRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            <div className="flex items-center gap-3">
                <span className="text-zinc-600">{icon}</span>

                <span className="text-sm text-zinc-400">{label}</span>
            </div>

            <span className="text-sm font-medium text-zinc-200">
                {value}
            </span>
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: StudioStatus;
}) {
    const styles = {
        Active:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        Inactive:
            "border-zinc-700 bg-zinc-800 text-zinc-500",
        Expiring:
            "border-amber-500/20 bg-amber-500/10 text-amber-400",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${status === "Active"
                    ? "bg-emerald-400"
                    : status === "Expiring"
                        ? "bg-amber-400"
                        : "bg-zinc-500"
                    }`}
            />

            {status}
        </span>
    );
}

function EventStatus({
    status,
}: {
    status: string;
}) {
    if (status === "Active") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
            Completed
        </span>
    );
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}