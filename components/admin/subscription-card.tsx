"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Database,
  HardDrive,
  Image as ImageIcon,
  Users,
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
  maxCustomers: number;
  maxImages: number;
}

export default function SubscriptionCard({
  subscription,
}: {
  subscription: SubscriptionInfo | null;
}) {
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  /*
   * Set the current time only after the component mounts.
   *
   * This prevents a server/client hydration mismatch while still
   * allowing the subscription information to update while the page
   * remains open.
   */
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now());
    };

    updateTime();

    const interval = window.setInterval(
      updateTime,
      60 * 1000
    );

    return () => {
      window.clearInterval(interval);
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
   *
   * This keeps server and client rendering deterministic and avoids
   * the hydration mismatch caused by calling new Date() directly
   * during the initial render.
   */
  const now = currentTime
    ? new Date(currentTime)
    : startDate;

  let totalDays = 0;
  let remainingDays = 0;
  let remainingPercentage = 100;
  let isExpired = false;
  let hasStarted = true;

  if (endDate) {
    const totalDuration =
      endDate.getTime() - startDate.getTime();

    totalDays = Math.max(
      1,
      Math.ceil(
        totalDuration /
          (1000 * 60 * 60 * 24)
      )
    );

    remainingDays = Math.ceil(
      (endDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    isExpired =
      now.getTime() >= endDate.getTime();

    hasStarted =
      now.getTime() >= startDate.getTime();

    /*
     * Subscription has not started yet.
     * Keep the bar completely full.
     */
    if (!hasStarted) {
      remainingPercentage = 100;
    }

    /*
     * Subscription has expired.
     * Empty the bar completely.
     */
    else if (isExpired) {
      remainingPercentage = 0;
    }

    /*
     * Active subscription.
     * Calculate the percentage of time still remaining.
     */
    else {
      const remainingDuration =
        endDate.getTime() - now.getTime();

      remainingPercentage = Math.min(
        100,
        Math.max(
          0,
          (remainingDuration /
            totalDuration) *
            100
        )
      );
    }
  }

  const displayRemainingDays = Math.max(
    remainingDays,
    0
  );

  /*
   * Bar colour:
   *
   * More than 10 days:
   * Green
   *
   * 10 days or fewer:
   * Gradually changes from green -> light red -> strong red
   *
   * 3 days or fewer:
   * Full red
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
      Math.max(
        0,
        (10 - displayRemainingDays) / 7
      )
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
        (endColor.r - startColor.r) *
          dangerProgress
    );

    const green = Math.round(
      startColor.g +
        (endColor.g - startColor.g) *
          dangerProgress
    );

    const blue = Math.round(
      startColor.b +
        (endColor.b - startColor.b) *
          dangerProgress
    );

    return `rgb(${red}, ${green}, ${blue})`;
  };

  const progressBarColor =
    getProgressBarColor();

  const statusText = isExpired
    ? "Subscription Ended"
    : !hasStarted
      ? "Subscription Not Started"
      : subscription.status === "Active"
        ? "Active"
        : subscription.status;

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
              className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                isExpired
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
              {endDate
                ? formatDate(endDate)
                : "No expiry date"}
            </p>
          </div>
        </div>

        {/* Progress */}
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
                    : `${displayRemainingDays} ${
                        displayRemainingDays === 1
                          ? "day"
                          : "days"
                      } remaining`}
              </p>
            </div>

            {!isExpired && endDate ? (
              <span className="text-sm font-semibold text-white">
                {displayRemainingDays}{" "}
                {displayRemainingDays === 1
                  ? "day"
                  : "days"}{" "}
                left
              </span>
            ) : null}
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${remainingPercentage}%`,
                backgroundColor:
                  progressBarColor,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-[11px] text-zinc-600">
            <span>
              {formatDate(startDate)}
            </span>

            <span>
              {endDate
                ? formatDate(endDate)
                : "No expiry"}
            </span>
          </div>
        </div>

        {/* Limits */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-zinc-400" />

              <span className="text-xs text-zinc-500">
                Storage
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-white">
              {subscription.storageLimitGb} GB
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              R2 storage limit
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-zinc-400" />

              <span className="text-xs text-zinc-500">
                Events
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-white">
              {subscription.maxEvents.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Maximum events
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-400" />

              <span className="text-xs text-zinc-500">
                Customers
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-white">
              {subscription.maxCustomers.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Maximum customers
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-zinc-400" />

              <span className="text-xs text-zinc-500">
                Images
              </span>
            </div>

            <p className="mt-2 text-xl font-bold text-white">
              {subscription.maxImages.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Maximum images
            </p>
          </div>
        </div>

        {/* R2 placeholder */}
        <div className="mt-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-4">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" />

            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-300">
                R2 Storage Usage
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Used storage will be connected when
                the R2 storage integration is completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}