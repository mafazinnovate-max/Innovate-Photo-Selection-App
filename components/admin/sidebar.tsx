"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

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

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const [logoZoom, setLogoZoom] = useState(1);
  const [logoPositionX, setLogoPositionX] = useState(0);
  const [logoPositionY, setLogoPositionY] = useState(0);

  /* -----------------------------
     Studio Logo
  ----------------------------- */

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

        setLogoUrl(data.logoUrl ?? null);

        const savedZoom = localStorage.getItem("studioLogoZoom");
        const savedX = localStorage.getItem("studioLogoPositionX");
        const savedY = localStorage.getItem("studioLogoPositionY");

        setLogoZoom(savedZoom ? Number(savedZoom) : 1);
        setLogoPositionX(savedX ? Number(savedX) : 0);
        setLogoPositionY(savedY ? Number(savedY) : 0);

        setLogoLoaded(true);
      } catch (error) {
        console.error("Failed to load studio logo:", error);

        setLogoUrl(null);
        setLogoLoaded(true);
      }
    };

    loadLogo();

    window.addEventListener("studio-logo-changed", loadLogo);

    return () => {
      window.removeEventListener("studio-logo-changed", loadLogo);
    };
  }, []);

  /* -----------------------------
     Match Settings crop geometry

     Settings crop:
     176px x 176px

     Desktop sidebar:
     80px x 80px

     Mobile:
     40px x 40px
  ----------------------------- */

  const desktopScale = 80 / 176;
  const mobileScale = 40 / 176;

  const desktopPositionX = logoPositionX * desktopScale;
  const desktopPositionY = logoPositionY * desktopScale;

  const mobilePositionX = logoPositionX * mobileScale;
  const mobilePositionY = logoPositionY * mobileScale;

  /*
   * Settings uses p-4 on a 176px image.
   *
   * 16 / 176 = 9.09%
   *
   * We use the same proportional padding
   * on the smaller sidebar images.
   */

  const desktopPadding = 80 * (16 / 176);
  const mobilePadding = 40 * (16 / 176);

  /* -----------------------------
     Logout
  ----------------------------- */

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out. Please try again.");
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          className="rounded-lg p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          <Menu size={24} />
        </button>

        {logoLoaded && logoUrl ? (
          <Link
            href="/settings#branding"
            aria-label="Manage studio logo"
            className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900"
          >
            <Image
              src={logoUrl}
              alt="Studio logo"
              width={40}
              height={40}
              priority
              className="h-full w-full object-contain"
              style={{
                padding: `${mobilePadding}px`,
                transform: `translate(${mobilePositionX}px, ${mobilePositionY}px) scale(${logoZoom})`,
              }}
            />
          </Link>
        ) : (
          <Link
            href="/settings#branding"
            aria-label="Add studio logo"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-zinc-700 bg-zinc-900 text-xl text-zinc-500 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
          >
            +
          </Link>
        )}
      </header>

      {/* Mobile overlay */}
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
        className={`fixed left-0 top-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex min-h-[120px] items-center justify-center px-6 py-5">
          {logoLoaded && logoUrl ? (
            <Link
              href="/settings#branding"
              aria-label="Manage studio logo"
              className="relative h-20 w-20 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 shadow-lg"
            >
              <Image
                src={logoUrl}
                alt="Studio logo"
                width={80}
                height={80}
                priority
                className="h-full w-full object-contain"
                style={{
                  padding: `${desktopPadding}px`,
                  transform: `translate(${desktopPositionX}px, ${desktopPositionY}px) scale(${logoZoom})`,
                }}
              />
            </Link>
          ) : (
            <Link
              href="/settings#branding"
              aria-label="Add studio logo"
              className="group flex flex-col items-center gap-2"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-zinc-700 bg-zinc-900 text-2xl text-zinc-500 transition group-hover:border-zinc-500 group-hover:bg-zinc-800 group-hover:text-white">
                +
              </div>

              <span className="text-xs font-medium text-zinc-500 transition group-hover:text-white">
                Add Logo
              </span>
            </Link>
          )}

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="absolute right-4 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-black shadow-lg"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}