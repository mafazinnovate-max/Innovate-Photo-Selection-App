import {
    Building2,
    CalendarDays,
    HardDrive,
    Users,
} from "lucide-react";

const stats = [
    {
        title: "Total Studios",
        value: "0",
        description: "Registered studios",
        icon: Building2,
    },
    {
        title: "Active Studios",
        value: "0",
        description: "Currently active",
        icon: Users,
    },
    {
        title: "Total Events",
        value: "0",
        description: "Across all studios",
        icon: CalendarDays,
    },
    {
        title: "Storage Used",
        value: "0 GB",
        description: "Total storage usage",
        icon: HardDrive,
    },
];

export default function SuperAdminDashboardPage() {
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

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
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
                                        {stat.value}
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

                <div className="flex min-h-64 items-center justify-center px-6">
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                            <Building2 className="h-5 w-5 text-zinc-500" />
                        </div>

                        <h3 className="mt-4 text-sm font-medium text-zinc-300">
                            No studios yet
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                            Studio information will appear here once studios are added.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}