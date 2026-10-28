"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import PicknovateLoader from "@/components/admin/picknovate-loader";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
} from "lucide-react";

interface SubscriptionInfo {
  id: string;
  startDate: string;
  endDate: string | null;
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  subscription,
}: {
  subscription?: SubscriptionInfo | null;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [studioName, setStudioName] = useState("Your Studio");

  const [logoZoom, setLogoZoom] = useState(1);
  const [logoPositionX, setLogoPositionX] = useState(0);
  const [logoPositionY, setLogoPositionY] = useState(0);

  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // Hide the navigation loader when the destination route becomes active.
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/api/upload-logo", {
          cache: "no-store",
        });

        if (!response.ok) {
          setLogoUrl(null);
          setLogoLoaded(true);
          return;
        }

        const data = await response.json();

        setStudioName(data.studioName ?? "Your Studio");
        setLogoUrl(data.logoUrl ?? null);

        setLogoZoom(
          typeof data.logoZoom === "number"
            ? data.logoZoom
            : 1
        );

        setLogoPositionX(
          typeof data.logoPositionX === "number"
            ? data.logoPositionX
            : 0
        );

        setLogoPositionY(
          typeof data.logoPositionY === "number"
            ? data.logoPositionY
            : 0
        );

        setLogoLoaded(true);
      } catch (error) {
        console.error(
          "Failed to load studio logo:",
          error
        );

        setLogoUrl(null);
        setLogoLoaded(true);
      }
    };

    loadLogo();

    window.addEventListener(
      "studio-logo-changed",
      loadLogo
    );

    return () => {
      window.removeEventListener(
        "studio-logo-changed",
        loadLogo
      );
    };
  }, []);

  /*
   * Keep the subscription countdown updated while
   * the sidebar remains open.
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

  /*
   * Calculate the subscription countdown.
   *
   * Only show the sidebar warning when:
   * - 4 days remain
   * - 3 days remain
   * - 2 days remain
   * - 1 day remains
   * - Subscription has ended
   */
  const getSubscriptionMessage = () => {
    if (
      !subscription?.endDate ||
      currentTime === null
    ) {
      return null;
    }

    const endDate = new Date(
      subscription.endDate
    );

    const now = new Date(currentTime);

    const remainingDays = Math.ceil(
      (endDate.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    if (now.getTime() >= endDate.getTime()) {
      return {
        type: "ended" as const,
        text: "Subscription ended",
      };
    }

    if (remainingDays >= 1 && remainingDays <= 4) {
      return {
        type: "warning" as const,
        text: `Subscription ends in ${remainingDays} ${remainingDays === 1 ? "day" : "days"
          }`,
      };
    }

    return null;
  };

  const subscriptionMessage =
    getSubscriptionMessage();

  /*
   * Logo display size
   * Medium-large on desktop, compact on mobile.
   */
  const desktopLogoSize = 96;
  const mobileLogoSize = 44;

  const desktopScale =
    desktopLogoSize / 176;

  const mobileScale =
    mobileLogoSize / 176;

  const desktopPositionX =
    logoPositionX * desktopScale;

  const desktopPositionY =
    logoPositionY * desktopScale;

  const mobilePositionX =
    logoPositionX * mobileScale;

  const mobilePositionY =
    logoPositionY * mobileScale;

  const desktopPadding =
    desktopLogoSize * (16 / 176);

  const mobilePadding =
    mobileLogoSize * (16 / 176);

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      localStorage.removeItem("studioLogo");
      localStorage.removeItem("studioLogoZoom");
      localStorage.removeItem(
        "studioLogoPositionX"
      );
      localStorage.removeItem(
        "studioLogoPositionY"
      );

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      alert(
        "Unable to log out. Please try again."
      );
    }
  };

  return (
    <>
      {/* Main content navigation loader. The sidebar remains visible. */}
      {isNavigating && (
  <div
    className="fixed bottom-0 left-0 right-0 top-16 z-30 flex items-center justify-center bg-black lg:left-72 lg:top-0"
    role="status"
    aria-label="Loading page"
  >
    <PicknovateLoader />
  
  </div>
)}

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          className="shrink-0 rounded-lg p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          <Menu size={24} />
        </button>

        <Link
          href="/settings#branding"
          aria-label="Manage studio branding"
          className="flex min-w-0 max-w-[220px] items-center gap-3"
        >
          {logoLoaded && logoUrl ? (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 shadow-md">
              <Image
                src={logoUrl}
                alt="Studio logo"
                width={44}
                height={44}
                priority
                className="h-full w-full object-contain"
                style={{
                  padding: `${mobilePadding}px`,
                  transform: `translate(${mobilePositionX}px, ${mobilePositionY}px) scale(${logoZoom})`,
                }}
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-700 bg-zinc-900 text-xl text-zinc-500">
              +
            </div>
          )}

          <span className="min-w-0 max-w-[165px] break-words text-center text-[11px] font-semibold uppercase leading-[15px] tracking-[0.13em] text-zinc-200 sm:max-w-[210px] sm:text-[12px] sm:leading-4">
            {studioName}
          </span>
        </Link>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 ease-in-out ${isOpen
          ? "translate-x-0"
          : "-translate-x-full"
          } lg:translate-x-0`}
      >
        {/* Branding */}
        <div className="relative flex min-h-[190px] flex-col items-center justify-center px-6 py-7">
          <Link
            href="/settings#branding"
            aria-label="Manage studio branding"
            className="group flex flex-col items-center"
          >
            {logoLoaded && logoUrl ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 shadow-xl transition duration-300 group-hover:border-zinc-500 group-hover:shadow-2xl">
                <Image
                  src={logoUrl}
                  alt="Studio logo"
                  width={96}
                  height={96}
                  priority
                  className="h-full w-full object-contain"
                  style={{
                    padding: `${desktopPadding}px`,
                    transform: `translate(${desktopPositionX}px, ${desktopPositionY}px) scale(${logoZoom})`,
                  }}
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-zinc-700 bg-zinc-900 text-3xl text-zinc-500 transition group-hover:border-zinc-500 group-hover:bg-zinc-800 group-hover:text-white">
                +
              </div>
            )}

            {/* Studio Name */}
            <div className="mt-4 w-full max-w-[220px] text-center">
              <h2 className="w-full break-words text-center text-[15px] font-semibold uppercase leading-6 tracking-[0.18em] text-white">
                {studioName}
              </h2>

              <div className="mx-auto mt-3 h-px w-10 bg-zinc-700 transition-all duration-300 group-hover:w-16 group-hover:bg-zinc-500" />
            </div>

            {!logoUrl && logoLoaded && (
              <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition group-hover:text-zinc-300">
                Add Logo
              </span>
            )}
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link

    key={item.name}
    href={item.href}
    onClick={() => {
        setIsOpen(false);

        if (pathname !== item.href) {
            setIsNavigating(true);
        }
    }}
    className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
        isActive
            ? "bg-white text-black shadow-lg"
            : "text-zinc-400 hover:-translate-y-1 hover:scale-[1.03] hover:bg-zinc-900 hover:text-white hover:shadow-[0_12px_30px_rgba(255,255,255,0.08)]"
    }`}
>
    {!isActive && (
        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-all duration-700 group-hover:left-[120%]" />
    )}

    <Icon
        size={18}
        className={`relative z-10 transition-all duration-300 ${
            isActive
                ? ""
                : "group-hover:scale-125 group-hover:-rotate-3 group-hover:text-white"
        }`}
    />

    <span className="relative z-10 transition-all duration-300 group-hover:translate-x-0.5">
        {item.name}
    </span>
</Link>
              );
            })}
          </nav>

          {/* Subscription Countdown */}
          {subscriptionMessage && (
            <>
              <div
                className={`mt-6 rounded-xl border p-3 ${subscriptionMessage.type ===
                  "ended"
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-amber-500/30 bg-amber-500/10"
                  }`}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    size={17}
                    className={`mt-0.5 shrink-0 ${subscriptionMessage.type ===
                      "ended"
                      ? "text-red-400"
                      : "text-amber-400"
                      }`}
                  />

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold ${subscriptionMessage.type ===
                        "ended"
                        ? "text-red-400"
                        : "text-amber-400"
                        }`}
                    >
                      {subscriptionMessage.text}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                      Please contact the administrator
                      to renew your subscription.
                    </p>
                  </div>
                </div>
              </div>

              {subscriptionMessage.type ===
                "warning" &&
                (() => {
                  const endDate = subscription?.endDate
                    ? new Date(subscription.endDate)
                    : null;

                  const now = currentTime
                    ? new Date(currentTime)
                    : null;

                  const remainingDays =
                    endDate && now
                      ? Math.ceil(
                        (endDate.getTime() -
                          now.getTime()) /
                        (1000 *
                          60 *
                          60 *
                          24)
                      )
                      : null;

                  return (
                    remainingDays !== null &&
                    remainingDays >= 1 &&
                    remainingDays <= 3
                  );
                })() && (
                  <div className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.07] p-3 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                        <span className="text-sm text-cyan-400">
                          →
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-cyan-300">
                          Ready to continue with Picknovate?
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-zinc-400">
                          Renew your subscription before it
                          expires.
                        </p>

                        <div className="mt-2.5 space-y-1">
                          <a
                            href="tel:+918438430504"
                            className="block text-[10px] font-semibold text-cyan-400 transition hover:text-cyan-300"
                          >
                            +91 84384 30504
                          </a>

                          <a
                            href="tel:+918925363228"
                            className="block text-[10px] font-semibold text-cyan-400 transition hover:text-cyan-300"
                          >
                            +91 89253 63228
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Logout */}
        <div className="border-t border-zinc-800 p-4">
      <button
  type="button"
  onClick={() => setShowLogoutModal(true)}
  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 shadow-lg shadow-red-950/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:border-red-400/60 hover:bg-red-500 hover:text-white hover:shadow-[0_12px_30px_rgba(239,68,68,0.25)] active:translate-y-0 active:scale-[0.98]"
>
  <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[120%]" />

  <LogOut
    size={16}
    className="relative z-10 transition-all duration-300 group-hover:scale-125 group-hover:translate-x-0.5"
  />

  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
    Logout
  </span>
</button>
        </div>
      </aside>

      {showLogoutModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
      <h2 className="text-xl font-semibold text-white">
        Logout Confirmation
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        Are you sure you want to logout?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowLogoutModal(false)}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={logout}
          className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );

  
}