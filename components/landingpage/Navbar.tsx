
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "motion/react";

type NavbarProps = {
    logo: ReactNode;
};

const navLinks = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#features"},
    { label: "Pricing", href: "#pricing" },
    { label: "FAQs", href: "#faqs" },
    { label: "Contact", href: "#contact" },
];

export default function Navbar({ logo }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [visible, setVisible] = useState(true);
    const [compact, setCompact] = useState(false);

    const lastScrollY = useRef(0);
    const shouldReduceMotion = useReducedMotion();

    // Scroll direction controls the header.
    useEffect(() => {
        lastScrollY.current = window.scrollY;

        const handleScroll = () => {
            const currentY = window.scrollY;
            const difference = currentY - lastScrollY.current;

            if (menuOpen) {
                setVisible(true);
                lastScrollY.current = currentY;
                return;
            }

            if (currentY < 50) {
                setVisible(true);
                setCompact(false);
            } else if (difference > 5 && currentY > 120) {
                setVisible(false);
                setCompact(true);
            } else if (difference < -5) {
                setVisible(true);
                setCompact(true);
            }

            lastScrollY.current = currentY;
        };

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [menuOpen]);

    // Keep the header visible whenever the menu opens.
    useEffect(() => {
        if (menuOpen) {
            setVisible(true);
        }
    }, [menuOpen]);

    // Lock background scrolling while keeping the menu independently scrollable.
    useEffect(() => {
        if (!menuOpen) return;

        const html = document.documentElement;
        const body = document.body;

        const previousHtmlOverflow = html.style.overflow;
        const previousBodyOverflow = body.style.overflow;
        const previousBodyOverscroll = body.style.overscrollBehavior;

        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        body.style.overscrollBehavior = "none";

        return () => {
            html.style.overflow = previousHtmlOverflow;
            body.style.overflow = previousBodyOverflow;
            body.style.overscrollBehavior = previousBodyOverscroll;
        };
    }, [menuOpen]);

    // Close menu with Escape.
    useEffect(() => {
        if (!menuOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    // Close the mobile menu if the viewport becomes desktop-sized.
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const handleResize = () => {
            if (mediaQuery.matches) {
                setMenuOpen(false);
            }
        };

        mediaQuery.addEventListener("change", handleResize);

        return () => {
            mediaQuery.removeEventListener("change", handleResize);
        };
    }, []);

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            {/* Header Layout Spacer */}
            <div aria-hidden="true" className="h-[88px]" />

            {/* Main Header */}
            <motion.header
                initial={false}
                animate={{
                    y: visible ? 0 : "-110%",
                }}
                transition={{
                    duration: shouldReduceMotion ? 0 : 0.35,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="fixed left-0 top-0 z-50 w-full"
            >
                <div
                    className={`border-b border-white/10 bg-[#14161A]/95 backdrop-blur-xl transition-[padding] duration-300 ${
                        compact ? "py-2" : "py-3"
                    }`}
                >
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">

                        {/* Logo */}
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="relative z-50 flex items-center"
                            aria-label="Picknovate Home"
                        >
                            {logo}
                        </Link>

                        {/* Desktop Navigation */}
                        <nav
                            aria-label="Main navigation"
                            className="hidden items-center gap-10 text-xs font-medium text-[#F4F1EA]/70 lg:flex"
                        >
                            {navLinks.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="transition-colors duration-200 hover:text-[#FFC93C]"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden items-center gap-3 lg:flex">
                            <Link
                                href="/login"
                                className="rounded-lg bg-[#F4F1EA] px-6 py-3 text-xs font-semibold text-[#14161A] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC93C]"
                            >
                                Login
                            </Link>

                            <Link
                                href="/signup"
                                className="rounded-lg bg-[#FFC93C] px-6 py-3 text-xs font-semibold text-[#14161A] transition hover:bg-[#ffd666] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Sign Up
                            </Link>
                        </div>

                        {/* Custom Mobile Hamburger */}
                        <div className="flex items-center lg:hidden">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                aria-label={menuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={menuOpen}
                                aria-controls="mobile-navigation"
                                className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] transition-all duration-300 hover:border-[#FFC93C]/50 hover:bg-[#FFC93C]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC93C]"
                            >
                                <span className="relative flex h-5 w-6 items-center justify-center">

                                    {/* Top Line */}
                                    <motion.span
                                        animate={{
                                            y: menuOpen ? 0 : -6,
                                            rotate: menuOpen ? 45 : 0,
                                            width: menuOpen ? 23 : 20,
                                            backgroundColor: menuOpen
                                                ? "#FFC93C"
                                                : "#F4F1EA",
                                        }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0 : 0.3,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className="absolute h-[2px] rounded-full"
                                    />

                                    {/* Middle Line */}
                                    <motion.span
                                        animate={{
                                            opacity: menuOpen ? 0 : 1,
                                            scaleX: menuOpen ? 0 : 1,
                                        }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0 : 0.18,
                                        }}
                                        className="absolute h-[2px] w-3 rounded-full bg-[#FFC93C]"
                                    />

                                    {/* Bottom Line */}
                                    <motion.span
                                        animate={{
                                            y: menuOpen ? 0 : 6,
                                            rotate: menuOpen ? -45 : 0,
                                            width: menuOpen ? 23 : 16,
                                            backgroundColor: menuOpen
                                                ? "#FFC93C"
                                                : "#F4F1EA",
                                        }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0 : 0.3,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className="absolute h-[2px] rounded-full"
                                    />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        id="mobile-navigation"
                        data-lenis-prevent
                        role="dialog"
                        aria-modal="true"
                        aria-label="Picknovate navigation menu"
                        initial={{
                            opacity: 0,
                            x: shouldReduceMotion ? 0 : "100%",
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        exit={{
                            opacity: 0,
                            x: shouldReduceMotion ? 0 : "100%",
                        }}
                        transition={{
                            duration: shouldReduceMotion ? 0 : 0.38,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="fixed inset-0 z-40 h-[100dvh] overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#14161A] px-6 pb-8 pt-[108px] touch-pan-y [-webkit-overflow-scrolling:touch] sm:px-10"
                    >
                        <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">

                            {/* Menu Heading */}
                            <div className="mb-5 flex shrink-0 items-center gap-3 sm:mb-7">
                                <span className="h-px flex-1 bg-white/15" />

                                <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.25em] text-[#FFC93C] sm:text-[10px] sm:tracking-[0.3em]">
                                    Explore Picknovate
                                </span>

                                <span className="h-px flex-1 bg-white/15" />
                            </div>

                            {/* Navigation Links */}
                            <nav
                                aria-label="Mobile navigation"
                                className="flex shrink-0 flex-col"
                            >
                                {navLinks.map((item, index) => (
                                    <motion.a
                                        key={item.label}
                                        href={item.href}
                                        onClick={closeMenu}
                                        initial={{
                                            opacity: 0,
                                            x: shouldReduceMotion ? 0 : -15,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0 : 0.28,
                                            delay: shouldReduceMotion ? 0 : index * 0.045,
                                            ease: "easeOut",
                                        }}
                                        className="group flex min-h-[50px] items-center justify-between border-b border-white/10 py-3 text-[18px] font-medium tracking-tight text-[#F4F1EA]/90 transition-colors duration-300 hover:text-[#FFC93C] sm:min-h-[56px] sm:text-[21px]"
                                    >
                                        <span className="relative py-1">
                                            {item.label}
                                            <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#FFC93C] transition-transform duration-300 ease-out group-hover:scale-x-100" />
                                        </span>

                                        <motion.span
                                            initial={false}
                                            animate={{
                                                opacity: 0,
                                                x: 0,
                                            }}
                                            className="text-base text-[#FFC93C] transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                                            aria-hidden="true"
                                        >
                                            ↗
                                        </motion.span>
                                    </motion.a>
                                ))}
                            </nav>

                            {/* Login and Free Trial */}
                            <div className="mt-6 grid shrink-0 grid-cols-2 gap-3 sm:mt-8">
                                <Link
                                    href="/login"
                                    onClick={closeMenu}
                                    className="flex min-h-[52px] items-center justify-center rounded-xl border border-white/20 px-3 text-sm font-semibold text-[#F4F1EA] transition-all duration-200 hover:border-[#FFC93C]/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFC93C]"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/signup"
                                    onClick={closeMenu}
                                    className="flex min-h-[52px] items-center justify-center rounded-xl bg-[#FFC93C] px-2 text-center text-[13px] font-bold text-[#14161A] transition-colors duration-200 hover:bg-[#ffd666] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:text-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>

                            {/* Menu Footer */}
                            <div className="mt-6 shrink-0 pb-2 text-center">
                                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/30">
                                    Built for creative studios
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
