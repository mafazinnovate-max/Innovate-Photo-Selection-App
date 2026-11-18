"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  HardDrive,
  Image as ImageIcon,
} from "lucide-react";

interface SubscriptionInfo {
  id: string;
  plan: string;
  price: number;
  status: string;
  startDate: string;
  endDate: string | null;
  storageLimitGb: number;
  maxEvents: number;
  maxImages: number;
}

interface StorageInfo {
  studioId: string;
  usedBytes: number;
  usedGB: number;
  objectCount: number;
  storageLimitGb: number;
  remainingGB: number;
  usagePercentage: number;
}

interface SubscriptionCardProps {
  subscription: SubscriptionInfo | null;
  totalEvents: number;
  totalImages: number;
}

export default function SubscriptionCard({
  subscription,
  totalEvents,
  totalImages,
}: SubscriptionCardProps) {
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [storageLoading, setStorageLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);

  /*
   * Update current time every minute.
   * Prevents server/client hydration mismatch.
   */
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now());
    };

    updateTime();

    const interval = window.setInterval(updateTime, 60 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * Fetch actual R2 storage usage for this studio.
   */
  useEffect(() => {
    let isMounted = true;

    const fetchStorageUsage = async () => {
      try {
        setStorageLoading(true);
        setStorageError(false);

        const response = await fetch("/api/admin/storage-usage", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.storage) {
          throw new Error("Failed to fetch storage usage.");
        }

        if (isMounted) {
          setStorage(data.storage);
        }
      } catch (error) {
        console.error("Storage Usage Fetch Error:", error);

        if (isMounted) {
          setStorageError(true);
        }
      } finally {
        if (isMounted) {
          setStorageLoading(false);
        }
      }
    };

    fetchStorageUsage();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!subscription) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-zinc-800 p-3">
            <Clock3 className="h-5 w-5 text-zinc-300" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Subscription
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              No subscription found for your studio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(subscription.startDate);

  const endDate = subscription.endDate
    ? new Date(subscription.endDate)
    : null;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  /*
   * Use startDate as the fallback during the first render.
   * This keeps server and client rendering deterministic.
   */
  const now = currentTime
    ? new Date(currentTime)
    : startDate;

  let remainingDays = 0;
  let remainingPercentage = 100;
  let isExpired = false;
  let hasStarted = true;

  if (endDate) {
    const totalDuration =
      endDate.getTime() - startDate.getTime();

    remainingDays = Math.ceil(
      (endDate.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    isExpired = now.getTime() >= endDate.getTime();

    hasStarted = now.getTime() >= startDate.getTime();

    if (!hasStarted) {
      remainingPercentage = 100;
    } else if (isExpired || totalDuration <= 0) {
      remainingPercentage = 0;
    } else {
      const remainingDuration =
        endDate.getTime() - now.getTime();

      remainingPercentage = Math.min(
        100,
        Math.max(0, (remainingDuration / totalDuration) * 100)
      );
    }
  }

  const displayRemainingDays = Math.max(remainingDays, 0);

  /*
   * Subscription progress bar color.
   */
  const getProgressBarColor = () => {
    if (isExpired) {
      return "rgb(239, 68, 68)";
    }

    if (!hasStarted) {
      return "rgb(52, 211, 153)";
    }

    if (displayRemainingDays > 10) {
      return "rgb(52, 211, 153)";
    }

    const dangerProgress = Math.min(
      1,
      Math.max(0, (10 - displayRemainingDays) / 7)
    );

    const startColor = {
      r: 52,
      g: 211,
      b: 153,
    };

    const endColor = {
      r: 239,
      g: 68,
      b: 68,
    };

    const red = Math.round(
      startColor.r +
      (endColor.r - startColor.r) * dangerProgress
    );

    const green = Math.round(
      startColor.g +
      (endColor.g - startColor.g) * dangerProgress
    );

    const blue = Math.round(
      startColor.b +
      (endColor.b - startColor.b) * dangerProgress
    );

    return `rgb(${red}, ${green}, ${blue})`;
  };

  const progressBarColor = getProgressBarColor();

  const statusText = isExpired
    ? "Subscription Ended"
    : !hasStarted
      ? "Subscription Not Started"
      : subscription.status === "Active"
        ? "Active"
        : subscription.status;

  /*
   * Storage calculations.
   */
  const usedGB = storage?.usedGB ?? 0;

  const storageLimit =
    storage?.storageLimitGb ?? subscription.storageLimitGb;

  const remainingGB = Math.max(storageLimit - usedGB, 0);

  const storagePercentage =
    storageLimit > 0
      ? Math.min((usedGB / storageLimit) * 100, 100)
      : 0;

  const getStorageColor = () => {
    if (storagePercentage >= 90) {
      return {
        bar: "bg-red-500",
        text: "text-red-400",
        badge:
          "border-red-900/60 bg-red-950/30 text-red-400",
        label: "Almost Full",
      };
    }

    if (storagePercentage >= 75) {
      return {
        bar: "bg-amber-500",
        text: "text-amber-400",
        badge:
          "border-amber-900/60 bg-amber-950/30 text-amber-400",
        label: "Running Low",
      };
    }

    return {
      bar: "bg-emerald-500",
      text: "text-emerald-400",
      badge:
        "border-emerald-900/60 bg-emerald-950/30 text-emerald-400",
      label: "Within Limit",
    };
  };

  const storageColor = getStorageColor();

  /*
   * Event and image usage calculations.
   */
  const eventLimit = Math.max(subscription.maxEvents, 0);
  const imageLimit = Math.max(subscription.maxImages, 0);

  const eventPercentage =
    eventLimit > 0
      ? Math.min((totalEvents / eventLimit) * 100, 100)
      : 0;

  const imagePercentage =
    imageLimit > 0
      ? Math.min((totalImages / imageLimit) * 100, 100)
      : 0;

  const remainingEvents = Math.max(eventLimit - totalEvents, 0);
  const remainingImages = Math.max(imageLimit - totalImages, 0);

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) {
      return {
        bar: "bg-red-500",
        text: "text-red-400",
        badge:
          "border-red-900/60 bg-red-950/30 text-red-400",
        label: "Almost Full",
      };
    }

    if (percentage >= 75) {
      return {
        bar: "bg-amber-500",
        text: "text-amber-400",
        badge:
          "border-amber-900/60 bg-amber-950/30 text-amber-400",
        label: "Running Low",
      };
    }

    return {
      bar: "bg-emerald-500",
      text: "text-emerald-400",
      badge:
        "border-emerald-900/60 bg-emerald-950/30 text-emerald-400",
      label: "Within Limit",
    };
  };

  const eventColor = getUsageColor(eventPercentage);
  const imageColor = getUsageColor(imagePercentage);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-800 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-xl bg-zinc-800 p-3">
              <CalendarDays className="h-5 w-5 text-zinc-300" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-zinc-500">
                Current Subscription
              </p>

              <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-white">
                {subscription.plan} Plan
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${isExpired
                  ? "border-red-900/60 bg-red-950/30 text-red-400"
                  : subscription.status === "Active"
                    ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-400"
                    : "border-amber-900/60 bg-amber-950/30 text-amber-400"
                }`}
            >
              {statusText}
            </span>

            <div className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-400/10 via-zinc-900 to-zinc-950 px-4 py-2.5 shadow-lg shadow-black/10">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700" />

              <div className="pl-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-400/70">
                  Plan Value
                </p>

                <p className="mt-0.5 text-lg font-bold tracking-tight text-white">
                  ₹{subscription.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription dates + progress */}
      <div className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">
              Start Date
            </p>

            <p className="mt-2 text-base font-semibold text-white">
              {formatDate(startDate)}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">
              End Date
            </p>

            <p className="mt-2 text-base font-semibold text-white">
              {endDate ? formatDate(endDate) : "No expiry date"}
            </p>
          </div>
        </div>

        {/* Subscription Progress */}
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Subscription Remaining
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {isExpired
                  ? "Your subscription period has ended."
                  : !hasStarted
                    ? "Your subscription has not started yet."
                    : `${displayRemainingDays} ${displayRemainingDays === 1 ? "day" : "days"
                    } remaining`}
              </p>
            </div>

            {!isExpired && endDate ? (
              <span className="text-sm font-semibold text-white">
                {displayRemainingDays}{" "}
                {displayRemainingDays === 1 ? "day" : "days"} left
              </span>
            ) : null}
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${remainingPercentage}%`,
                backgroundColor: progressBarColor,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-[11px] text-zinc-600">
            <span>{formatDate(startDate)}</span>

            <span>
              {endDate ? formatDate(endDate) : "No expiry"}
            </span>
          </div>
        </div>

        {/* Limits and Usage */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {/* Storage Usage */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-zinc-400" />

                <span className="text-xs text-zinc-500">
                  Storage Usage
                </span>
              </div>

              {!storageLoading &&
                !storageError &&
                storageLimit > 0 && (
                  <span
                    className={`rounded-full border px-2 py-1 text-[9px] font-medium ${storageColor.badge}`}
                  >
                    {storageColor.label}
                  </span>
                )}
            </div>

            {storageLoading ? (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-7 w-32 rounded bg-zinc-800" />
                <div className="h-2 w-full rounded-full bg-zinc-800" />

                <div className="flex justify-between">
                  <div className="h-3 w-16 rounded bg-zinc-800" />
                  <div className="h-3 w-20 rounded bg-zinc-800" />
                </div>
              </div>
            ) : storageError ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-red-400">
                  Unable to load usage
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Please refresh the page to try again.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold tracking-tight text-white">
                    {usedGB.toFixed(3)}
                  </p>

                  <p className="text-xs text-zinc-500">
                    / {storageLimit.toLocaleString("en-IN")} GB
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${storageColor.bar}`}
                    style={{
                      width: `${storagePercentage}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-medium ${storageColor.text}`}
                  >
                    {storagePercentage.toFixed(1)}% used
                  </span>

                  <span className="text-right text-[11px] text-zinc-500">
                    {remainingGB.toFixed(3)} GB left
                  </span>
                </div>

                <p className="mt-3 border-t border-zinc-800 pt-3 text-[11px] text-zinc-600">
                  {storage?.objectCount.toLocaleString("en-IN") ?? 0} R2 objects
                </p>
              </>
            )}
          </div>

          {/* Events Usage */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-zinc-400" />

                <span className="text-xs text-zinc-500">
                  Events Usage
                </span>
              </div>

              {eventLimit > 0 && (
                <span
                  className={`rounded-full border px-2 py-1 text-[9px] font-medium ${eventColor.badge}`}
                >
                  {eventColor.label}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <p className="text-2xl font-bold tracking-tight text-white">
                {totalEvents.toLocaleString("en-IN")}
              </p>

              <p className="text-xs text-zinc-500">
                / {eventLimit.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${eventColor.bar}`}
                style={{
                  width: `${eventPercentage}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className={`text-[11px] font-medium ${eventColor.text}`}>
                {eventPercentage.toFixed(1)}% used
              </span>

              <span className="text-right text-[11px] text-zinc-500">
                {eventLimit > 0
                  ? `${remainingEvents.toLocaleString("en-IN")} left`
                  : "No limit configured"}
              </span>
            </div>

            <p className="mt-3 border-t border-zinc-800 pt-3 text-[11px] text-zinc-600">
              Active studio events
            </p>
          </div>

          {/* Images Usage */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-zinc-400" />

                <span className="text-xs text-zinc-500">
                  Images Usage
                </span>
              </div>

              {imageLimit > 0 && (
                <span
                  className={`rounded-full border px-2 py-1 text-[9px] font-medium ${imageColor.badge}`}
                >
                  {imageColor.label}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <p className="text-2xl font-bold tracking-tight text-white">
                {totalImages.toLocaleString("en-IN")}
              </p>

              <p className="text-xs text-zinc-500">
                / {imageLimit.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${imageColor.bar}`}
                style={{
                  width: `${imagePercentage}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className={`text-[11px] font-medium ${imageColor.text}`}>
                {imagePercentage.toFixed(1)}% used
              </span>

              <span className="text-right text-[11px] text-zinc-500">
                {imageLimit > 0
                  ? `${remainingImages.toLocaleString("en-IN")} left`
                  : "No limit configured"}
              </span>
            </div>

            <p className="mt-3 border-t border-zinc-800 pt-3 text-[11px] text-zinc-600">
              Images across active events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}