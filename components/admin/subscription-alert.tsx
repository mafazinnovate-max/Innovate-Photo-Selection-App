"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

interface SubscriptionAlertProps {
  subscription: {
    id: string;
    startDate: string;
    endDate: string | null;
  } | null;
}

/*
 * Prevent duplicate notifications caused by React/Next.js
 * development remounting.
 *
 * This variable survives component remounts but is
 * reset when the browser page is actually refreshed.
 */
const alertsHandledThisPageLoad = new Set<string>();

export default function SubscriptionAlert({
  subscription,
}: SubscriptionAlertProps) {
  useEffect(() => {
    if (!subscription?.endDate) {
      return;
    }

    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    const now = new Date();

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const remainingDays = Math.ceil(
      (endDate.getTime() - now.getTime()) /
        millisecondsPerDay,
    );

    /*
     * Subscription already ended.
     *
     * Show once per actual page load/refresh.
     */
    if (now.getTime() >= endDate.getTime()) {
      const alertKey = `subscription-ended-${subscription.id}`;

      if (alertsHandledThisPageLoad.has(alertKey)) {
        return;
      }

      alertsHandledThisPageLoad.add(alertKey);

      toast.error(
        "Your subscription has ended. Please contact the administrator to renew your subscription.",
      );

      return;
    }

    /*
     * Subscription has not started yet.
     */
    if (now.getTime() < startDate.getTime()) {
      return;
    }

    /*
     * Exactly 10 days remaining.
     *
     * Show only once for this subscription.
     */
    if (remainingDays === 10) {
      const storageKey = `subscription-10-day-alert-${subscription.id}`;

      const alreadyShown = localStorage.getItem(storageKey);

      if (!alreadyShown) {
        const alertKey = `subscription-10-day-${subscription.id}`;

        if (alertsHandledThisPageLoad.has(alertKey)) {
          return;
        }

        alertsHandledThisPageLoad.add(alertKey);

        toast.warning(
          "Your subscription will expire in 10 days. Please contact the administrator if you need to renew your subscription.",
        );

        localStorage.setItem(storageKey, "true");
      }

      return;
    }

    /*
     * 4 days or less remaining.
     *
     * Show once per actual page load/refresh.
     *
     * The module-level Set prevents React/Next.js
     * development remounts from showing it twice.
     *
     * A real browser refresh reloads this module,
     * so the notification appears again as required.
     */
    if (remainingDays > 0 && remainingDays <= 4) {
      const alertKey = `subscription-warning-${subscription.id}`;

      if (alertsHandledThisPageLoad.has(alertKey)) {
        return;
      }

      alertsHandledThisPageLoad.add(alertKey);

      toast.warning(
        `Your subscription will expire in ${remainingDays} ${
          remainingDays === 1 ? "day" : "days"
        }. Please contact the administrator to renew your subscription.`,
      );
    }
  }, [subscription]);

  return null;
}