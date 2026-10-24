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
import { useEffect, useState } from "react";

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

    storageUsed: number | null;
    storageLimit: number;

    subscriptionStart: string;
    subscriptionEnd: string;
    createdAt: string;

    maxEvents: number;
    maxCustomers: number;
    maxImages: number;
}

interface RecentEvent {
    id: string;
    name: string;
    date: string;
    photos: number;
    status: string;
}


export default function ViewStudioPage() {
    const router = useRouter();
    const params = useParams<{ studioId: string }>();

    const studioId =
        typeof params.studioId === "string" ? params.studioId : "";

    const [studio, setStudio] = useState<Studio | null>(null);
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [status, setStatus] = useState<StudioStatus>("Active");
    const [showActions, setShowActions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!studioId) {
            setError("Invalid studio ID.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadStudio() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/super-admin/studios/${encodeURIComponent(studioId)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success || !result.studio) {
                    throw new Error(
                        result.message || "Failed to load studio details."
                    );
                }

                if (cancelled) return;

                const raw = result.studio;
                const admin = raw.admins?.[0];
                const subscription = raw.subscriptions?.[0];
                const metrics = result.metrics ?? {};

                const allowedPlans = [
                    "Basic",
                    "Professional",
                    "Enterprise",
                ];

                const plan: Plan = allowedPlans.includes(result.plan)
                    ? result.plan
                    : "Basic";

                const studioStatus: StudioStatus =
                    result.status === "Inactive" ? "Inactive" : "Active";

                const normalizedStudio: Studio = {
                    id: raw.id,
                    name: raw.name ?? "",
                    shortName: (raw.name ?? "").trim().split(/\s+/)[0] || "",
                    description: raw.description ?? "",

                    adminName: admin?.name ?? "",
                    adminEmail: admin?.email ?? "",
                    adminPhone: admin?.phone ?? "",

                    email: raw.email ?? "",
                    phone: raw.phone ?? "",
                    website: raw.website ?? "",

                    address: raw.address ?? "",
                    city: raw.city ?? "",
                    state: raw.state ?? "",
                    country: raw.country ?? "India",

                    plan,
                    status: studioStatus,

                    events: Number(metrics.events ?? 0),
                    customers: Number(metrics.customers ?? 0),
                    images: Number(metrics.images ?? 0),

                    // Image model doesn't currently store file sizes.
                    storageUsed: null,
                    storageLimit: Number(
                        subscription?.storageLimitGb ?? 100
                    ),

                    subscriptionStart: subscription?.startDate ?? "",
                    subscriptionEnd: subscription?.endDate ?? "",
                    createdAt: raw.createdAt ?? "",

                    maxEvents: Number(subscription?.maxEvents ?? 50),
                    maxCustomers: Number(subscription?.maxCustomers ?? 500),
                    maxImages: Number(subscription?.maxImages ?? 100000),
                };

                setStudio(normalizedStudio);
                setStatus(studioStatus);
                setRecentEvents(
                    Array.isArray(result.recentEvents)
                        ? result.recentEvents
                        : []
                );
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Something went wrong while loading the studio."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadStudio();

        return () => {
            cancelled = true;
        };
    }, [studioId]);

    const handleToggleStatus = async () => {
        if (!studio) return;

        const nextStatus: StudioStatus =
            status === "Active" ? "Inactive" : "Active";

        try {
            const response = await fetch(
                `/api/super-admin/studios/${encodeURIComponent(studio.id)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "set-status",
                        isActive: nextStatus === "Active",
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to update studio status."
                );
            }

            setStatus(nextStatus);
            setStudio((current) =>
                current ? { ...current, status: nextStatus } : current
            );
            setShowActions(false);
        } catch (err) {
            window.alert(
                err instanceof Error
                    ? err.message
                    : "Failed to update studio status."
            );
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-400">
                Loading studio details...
            </div>
        );
    }

    if (error || !studio) {
        return (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
                <h2 className="text-lg font-semibold text-white">
                    Unable to load studio
                </h2>
                <p className="mt-2 text-sm text-red-400">
                    {error || "Studio not found."}
                </p>
                <button
                    type="button"
                    onClick={() => router.push("/super-admin/studios")}
                    className="mt-5 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                >
                    Back to Studios
                </button>
            </div>
        );
    }

    const storagePercentage =
        studio.storageUsed === null
            ? null
            : studio.storageLimit > 0
                ? (studio.storageUsed / studio.storageLimit) * 100
                : 0;

    const eventPercentage =
        studio.maxEvents > 0
            ? (studio.events / studio.maxEvents) * 100
            : 0;

    const customerPercentage =
        studio.maxCustomers > 0
            ? (studio.customers / studio.maxCustomers) * 100
            : 0;

    const imagePercentage =
        studio.maxImages > 0
            ? (studio.images / studio.maxImages) * 100
            : 0;

    const subscriptionEnd = studio.subscriptionEnd
        ? new Date(studio.subscriptionEnd)
        : null;

    const today = new Date();
    const todayUtc = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const endUtc =
        subscriptionEnd && !Number.isNaN(subscriptionEnd.getTime())
            ? Date.UTC(
                subscriptionEnd.getUTCFullYear(),
                subscriptionEnd.getUTCMonth(),
                subscriptionEnd.getUTCDate()
            )
            : null;

    const remainingDays =
        endUtc === null
            ? null
            : Math.max(
                0,
                Math.ceil((endUtc - todayUtc) / (1000 * 60 * 60 * 24))
            );


    const totalSubscriptionDays = (() => {
        if (
            !studio.subscriptionStart ||
            !studio.subscriptionEnd ||
            studio.subscriptionStart === "—" ||
            studio.subscriptionEnd === "—"
        ) {
            return null;
        }

        const startDate = new Date(studio.subscriptionStart);
        const endDate = new Date(studio.subscriptionEnd);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            endDate < startDate
        ) {
            return null;
        }

        const start = Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate()
        );

        const end = Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate()
        );

        return Math.round((end - start) / (1000 * 60 * 60 * 24));
    })();

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

                        <button
                            type="button"
                            onClick={handleToggleStatus}
                            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
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
                    icon={<CalendarDays size={19} />}
                    label="Remaining Days"
                    value={
                        remainingDays === null
                            ? "Not set"
                            : remainingDays.toLocaleString()
                    }
                    description={
                        totalSubscriptionDays === null
                            ? "Total duration not set"
                            : `of ${totalSubscriptionDays.toLocaleString()} days`
                    }
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
                    value={
                        studio.storageUsed === null
                            ? "Not tracked"
                            : `${studio.storageUsed} GB`
                    }
                    description={`Limit: ${studio.storageLimit} GB`}
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
                                used={
                                    studio.storageUsed === null
                                        ? "Not tracked"
                                        : `${studio.storageUsed} GB`
                                }
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

                            {/* <UsageBar
                                icon={<Users size={17} />}
                                label="Customers"
                                used={studio.customers.toLocaleString()}
                                limit={studio.maxCustomers.toLocaleString()}
                                percentage={customerPercentage}
                            /> */}

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
                                                {formatDate(event.date)}
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
                                        value={
                                            remainingDays === null
                                                ? "Not set"
                                                : `${remainingDays} days`
                                        }
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

                            {/* <LimitRow
                                icon={<Users size={16} />}
                                label="Customers"
                                value={studio.maxCustomers.toLocaleString()}
                            /> */}

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

                            {/* <button
                                type="button"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                            >
                                <Trash2 size={16} />
                                Delete Studio
                            </button> */}
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
    percentage: number | null;
}) {
    const safePercentage =
        percentage === null
            ? 0
            : Math.min(100, Math.max(0, percentage));

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
                {percentage === null
                    ? "Usage not tracked"
                    : `${safePercentage.toFixed(1)}% used`}
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
    if (!date) return "Not set";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not set";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}