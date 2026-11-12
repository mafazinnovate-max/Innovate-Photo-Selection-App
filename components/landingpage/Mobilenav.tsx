"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Menu button for the top nav on phones / small tablets (hidden from md up)  */
/*  Closed: a button the same size as "Start Free Trial". Open: it grows into  */
/*  a dark panel anchored to the top-right corner of the nav.                  */
/* -------------------------------------------------------------------------- */

const ease = [0.22, 1, 0.36, 1] as const;

const DARK = "#14161A";
const CREAM = "#F4F1EA";

// Closed size matches the other nav buttons (text-xs + py-3 = 40px tall).
const CLOSED = { width: 84, height: 40, radius: 8 };
const OPEN = { width: 240, height: 240, radius: 22 };

type MenuItem = { label: string; href: string };

const items: MenuItem[] = [
    { label: "Features", href: "#features" },
    { label: "Website", href: "#website" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQs", href: "#faqs" },
    { label: "Login", href: "/login" },
];

/* -------------------------------------------------------------------------- */
/*  Menu link with the letter-roll hover                                       */
/* -------------------------------------------------------------------------- */

function MenuButton({
    label,
    href,
    isOpen,
    index,
    onSelect,
}: {
    label: string;
    href: string;
    isOpen: boolean;
    index: number;
    onSelect: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    const animatingRef = useRef(false);
    const pendingLeaveRef = useRef(false);
    const chars = label.split("");
    const lockDuration = 30 * chars.length + 300;

    const handleEnter = useCallback(() => {
        pendingLeaveRef.current = false;
        if (hovered) return;
        setHovered(true);
        animatingRef.current = true;
        setTimeout(() => {
            animatingRef.current = false;
            if (pendingLeaveRef.current) {
                pendingLeaveRef.current = false;
                setHovered(false);
            }
        }, lockDuration);
    }, [hovered, lockDuration]);

    const handleLeave = useCallback(() => {
        if (animatingRef.current) {
            pendingLeaveRef.current = true;
        } else {
            setHovered(false);
        }
    }, []);

    return (
        <motion.div
            className="w-full"
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{
                duration: 0.4,
                delay: isOpen ? 0.4 + 0.08 * index : 0,
                ease,
            }}
        >
            {/* Full-width row = hover target. Same roll as the floating menu:
                letters roll up and are replaced by an identical copy. */}
            <Link
                href={href}
                onClick={onSelect}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onTouchStart={handleEnter}
                onFocus={handleEnter}
                onBlur={handleLeave}
                tabIndex={isOpen ? 0 : -1}
                aria-label={label}
                className="flex w-full cursor-pointer justify-center py-1.5 outline-none"
            >
                <span
                    className="flex overflow-hidden text-[20px] font-semibold uppercase leading-none"
                    style={{
                        color: CREAM,
                        letterSpacing: "-0.03em",
                        height: "1em",
                    }}
                    aria-hidden="true"
                >
                    {chars.map((char, i) => (
                        <span
                            key={i}
                            className="inline-block overflow-hidden"
                            style={{ height: "1em" }}
                        >
                            <span
                                className="flex flex-col"
                                style={{
                                    transitionProperty: "transform",
                                    transitionDuration: hovered ? "800ms" : "0ms",
                                    transitionDelay: hovered ? `${30 * i}ms` : "0ms",
                                    transform: hovered ? "translateY(-50%)" : "translateY(0%)",
                                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                                }}
                            >
                                <span
                                    className="block"
                                    style={{ height: "1em", lineHeight: "1em" }}
                                >
                                    {char}
                                </span>
                                <span
                                    className="block"
                                    style={{ height: "1em", lineHeight: "1em" }}
                                >
                                    {char}
                                </span>
                            </span>
                        </span>
                    ))}
                </span>
            </Link>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Menu                                                                       */
/* -------------------------------------------------------------------------- */

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setIsOpen(false), []);

    // Close on outside tap, Escape, or when the screen grows to the desktop layout.
    useEffect(() => {
        if (!isOpen) return;

        const onPointerDown = (e: PointerEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        const mq = window.matchMedia("(min-width: 768px)");
        const onChange = () => {
            if (mq.matches) setIsOpen(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("keydown", onKey);
        mq.addEventListener("change", onChange);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("keydown", onKey);
            mq.removeEventListener("change", onChange);
        };
    }, [isOpen]);

    return (
        // The wrapper keeps the closed button's footprint in the nav row; the panel
        // is positioned absolutely from its top-right corner and grows over the page.
        <div
            ref={containerRef}
            className="relative z-50 h-10 shrink-0 md:hidden"
            style={{ width: CLOSED.width }}
        >
            <motion.div
                className="absolute right-0 top-0 flex flex-col overflow-hidden"
                initial={false}
                onClick={() => {
                    if (!isOpen) setIsOpen(true);
                }}
                style={{
                    maxWidth: "calc(100vw - 2rem)",
                    cursor: isOpen ? "default" : "pointer",
                    boxShadow: isOpen
                        ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)"
                        : "0 0 0 0 rgba(0,0,0,0)",
                    transition: "box-shadow 0.4s ease",
                }}
                animate={{
                    width: isOpen ? OPEN.width : CLOSED.width,
                    height: isOpen ? OPEN.height : CLOSED.height,
                    borderRadius: isOpen ? OPEN.radius : CLOSED.radius,
                }}
                transition={{
                    duration: 0.8,
                    ease,
                    height: { duration: isOpen ? 0.8 : 0.45, ease },
                }}
            >
                {/* Cream background (matches the Login button) */}
                <div className="absolute inset-0" style={{ backgroundColor: CREAM }} />

                {/* Dark circle expanding from the bottom */}
                <motion.div
                    className="absolute left-1/2"
                    initial={false}
                    style={{
                        width: "200%",
                        height: "200%",
                        borderRadius: "50%",
                        x: "-50%",
                        backgroundColor: DARK,
                    }}
                    animate={{ bottom: isOpen ? "-20%" : "-200%" }}
                    transition={{
                        duration: 0.8,
                        ease,
                        delay: isOpen ? 0.1 : 0,
                    }}
                />

                {/* Top bar: Menu label + hamburger (stays at the top of the panel) */}
                <motion.div
                    role="button"
                    tabIndex={0}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                    className="relative z-10 flex w-full shrink-0 cursor-pointer items-center justify-between outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setIsOpen((v) => !v);
                        }
                    }}
                    initial={false}
                    animate={{
                        paddingLeft: isOpen ? 24 : 12,
                        paddingRight: isOpen ? 24 : 12,
                        height: isOpen ? 56 : CLOSED.height,
                    }}
                    transition={{ duration: 0.8, ease }}
                >
                    <motion.span
                        className="text-xs font-semibold leading-none"
                        initial={false}
                        animate={{ color: isOpen ? CREAM : DARK }}
                        transition={{ duration: 0.3, ease }}
                    >
                        Menu
                    </motion.span>

                    <div className="relative flex h-[20px] w-[20px] items-center justify-center">
                        <motion.span
                            className="absolute block h-[2px] w-[16px] rounded-full"
                            initial={false}
                            animate={{
                                rotate: isOpen ? 45 : 0,
                                y: isOpen ? 0 : -3,
                                backgroundColor: isOpen ? CREAM : DARK,
                            }}
                            transition={{ duration: 0.4, ease }}
                        />
                        <motion.span
                            className="absolute block h-[2px] w-[16px] rounded-full"
                            initial={false}
                            animate={{
                                rotate: isOpen ? -45 : 0,
                                y: isOpen ? 0 : 3,
                                backgroundColor: isOpen ? CREAM : DARK,
                            }}
                            transition={{ duration: 0.4, ease }}
                        />
                    </div>
                </motion.div>

                {/* Menu items */}
                <div
                    id="mobile-menu"
                    aria-hidden={!isOpen}
                    className="relative z-10 flex flex-col items-center justify-center pb-4"
                    style={{
                        pointerEvents: isOpen ? "auto" : "none",
                        opacity: isOpen ? 1 : 0,
                        flex: isOpen ? 1 : 0,
                        overflow: "hidden",
                    }}
                >
                    {items.map((item, idx) => (
                        <MenuButton
                            key={item.label}
                            label={item.label}
                            href={item.href}
                            isOpen={isOpen}
                            index={idx}
                            onSelect={close}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}