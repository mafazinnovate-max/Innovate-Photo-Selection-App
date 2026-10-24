
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
     * Last 3 days remaining.
     *
     * Show a SEPARATE contact/renewal popup.
     *
     * This does NOT replace or merge with the
     * existing subscription warning below.
     */
    if (remainingDays > 0 && remainingDays <= 3) {
      const alertKey = `subscription-renewal-contact-${subscription.id}`;

      if (!alertsHandledThisPageLoad.has(alertKey)) {
        alertsHandledThisPageLoad.add(alertKey);

        toast.warning(
          ({ closeToast }) => (
            <div className="relative pr-6">
              <div className="font-semibold">
                Ready to continue with Picknovate?
              </div>

              <div className="mt-1 text-sm">
                Renew your subscription before it expires.
              </div>

              <div className="mt-2 flex flex-col gap-1">
                <a
                  href="tel:+918438430504"
                  className="font-semibold underline"
                >
                  +91 84384 30504
                </a>

                <a
                  href="tel:+918925363228"
                  className="font-semibold underline"
                >
                  +91 89253 63228
                </a>
              </div>

              <button
                type="button"
                onClick={closeToast}
                aria-label="Close"
                className="absolute right-0 top-0 text-lg font-bold opacity-70 transition hover:opacity-100"
              >
                ×
              </button>
            </div>
          ),
          {
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            draggable: false,
            pauseOnHover: true,
          },
        );
      }

      /*
       * IMPORTANT:
       * Do NOT return here.
       *
       * The existing subscription warning below
       * must also be shown separately.
       */
    }

    /*
     * 4 days or less remaining.
     *
     * EXISTING POPUP — KEPT UNCHANGED.
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
