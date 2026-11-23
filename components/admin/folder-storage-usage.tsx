
"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";

interface StorageInfo {
    usedGB: number;
    storageLimitGb: number;
    remainingGB: number;
    usagePercentage: number;
    objectCount: number;
}

export default function FolderStorageUsage() {
    const [storage, setStorage] = useState<StorageInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function fetchStorage() {
            try {
                const response = await fetch("/api/admin/storage-usage", {
                    method: "GET",
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok || !result.success || !result.storage) {
                    throw new Error("Storage fetch failed");
                }

                if (mounted) {
                    setStorage(result.storage);
                }
            } catch (error) {
                console.error("Folder Storage Usage Error:", error);

                if (mounted) setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchStorage();

        return () => {
            mounted = false;
        };
    }, []);

    const percentage = Math.min(
        storage?.usagePercentage ?? 0,
        100
    );

    const barColor =
        percentage >= 90
            ? "bg-red-500"
            : percentage >= 75
                ? "bg-amber-500"
                : "bg-emerald-500";

    return (
        <div className="mt-4 border-t border-zinc-800 pt-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400">
                        Storage usage
                    </span>
                </div>

                {storage && !loading && !error && (
                    <span className="text-[11px] text-zinc-500">
                        {percentage.toFixed(1)}% used
                    </span>
                )}
            </div>

            {loading ? (
                <div className="mt-3 h-2 animate-pulse rounded-full bg-zinc-800" />
            ) : error || !storage ? (
                <p className="mt-2 text-xs text-red-400">
                    Unable to load storage usage
                </p>
            ) : (
                <>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                        <span className="text-lg font-semibold text-white">
                            {storage.usedGB.toFixed(3)} GB
                        </span>

                        <span className="text-xs text-zinc-500">
                            / {storage.storageLimitGb.toLocaleString("en-IN")} GB
                        </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    <div className="mt-2 flex justify-between text-[11px]">
                        <span className="text-zinc-500">
                            {storage.objectCount.toLocaleString("en-IN")} R2 objects
                        </span>

                        <span className="text-zinc-400">
                            {storage.remainingGB.toFixed(3)} GB left
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}