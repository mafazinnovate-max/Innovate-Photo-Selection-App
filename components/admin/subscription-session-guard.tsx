"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface SubscriptionSessionGuardProps {
    endDate: string | null;
    isActive: boolean;
}

export default function SubscriptionSessionGuard({
    endDate,
    isActive,
}: SubscriptionSessionGuardProps) {
    const router = useRouter();
    const logoutStarted = useRef(false);

    useEffect(() => {
        if (!endDate) {
            return;
        }

        const expiryTime = new Date(
            endDate.replace("Z", "") + "+05:30"
        ).getTime();

        console.log("END DATE FROM SERVER:", endDate);
        console.log("CALCULATED EXPIRY TIME:", expiryTime);

        const logoutAdmin = async (
            reason: "subscription" | "inactive"
        ) => {
            if (logoutStarted.current) {
                return;
            }

            logoutStarted.current = true;

            try {
                await fetch("/api/logout", {
                    method: "POST",
                });
            } catch (error) {
                console.error(
                    "Automatic logout failed:",
                    error
                );
            }

            if (reason === "inactive") {
                toast.error(
                    "Your account is inactive. You have been logged out."
                );
            } else {
                toast.error(
                    "Your subscription has expired. You have been logged out."
                );
            }

            router.replace("/login");
        };

        const checkExpiry = async () => {
            if (Date.now() >= expiryTime) {
                console.log("SUBSCRIPTION EXPIRY TRIGGERED");
                console.log("CURRENT TIME:", Date.now());
                console.log("EXPIRY TIME:", expiryTime);

                logoutAdmin("subscription");
                return;
            }

            try {
                const response = await fetch(
                    "/api/admin/studio",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                if (
                    !data.success ||
                    !data.studio?.isActive
                ) {
                    console.log(
                        "INACTIVE STATUS TRIGGERED"
                    );

                    console.log(
                        "STUDIO DATA:",
                        JSON.stringify(data, null, 2)
                    );

                    logoutAdmin("inactive");
                }
            } catch (error) {
                console.error(
                    "Active status check failed:",
                    error
                );
            }
        };

        checkExpiry();

        const interval = window.setInterval(
            checkExpiry,
            1000
        );

        return () => {
            window.clearInterval(interval);
        };
    }, [endDate, isActive, router]);

    return null;
}