"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const features = [
    {
        title: "One platform",
        description: "Keep projects, clients and team connected.",
    },
    {
        title: "Less admin",
        description: "Simplify selections, documents and payroll.",
    },
    {
        title: "More room to grow",
        description: "Show up professionally, online and off.",
    },
];

const tiers = [
    {
        tier: "Basic",
        number: "01",
        name: "Basic",
        price: "₹1,999",
        period: "/ month",
        tag: "For studios getting started",
        items: [
            "3 Events",
            "3 GB Storage",
            "2,000 Images per event",
            "1 Month Plan Duration",
        ],
        cta: "Choose Basic",
        featured: false,
    },
    {
        tier: "Pro",
        number: "02",
        name: "Pro",
        price: "₹4,999",
        period: "/ 3 months",
        tag: "For growing photography studios",
        items: [
            "6 Events",
            "6 GB Storage",
            "5,000 Images per event",
            "3 Months Plan Duration",
        ],
        cta: "Choose Pro",
        featured: false,
    },
    {
        tier: "Premium",
        number: "03",
        name: "Premium",
        price: "₹9,999",
        period: "/ 6 months",
        tag: "For established studios",
        items: [
            "20 Events",
            "20 GB Storage",
            "2,000 Images per event",
            "6 Months Plan Duration",
            "Premium Profile",
        ],
        cta: "Choose Premium",
        featured: true,
    },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function BuiltAroundYouSection() {
    const shouldReduceMotion = useReducedMotion();
    const reduceMotion = shouldReduceMotion ?? false;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 639px)");

        setIsMobile(mediaQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    const hidden = reduceMotion ? false : { opacity: 0, y: 28 };

    const visible = {
        opacity: 1,
        y: 0,
    };

    return (
        <>
            {/* Built Around You */}
            <section>
                <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10">
                    {/* Left Content */}
                    <div>
                        <motion.p
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{
                                duration: reduceMotion ? 0 : 0.6,
                                ease,
                            }}
                            className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]"
                        >
                            Built around you
                        </motion.p>

                        <motion.h2
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{
                                duration: reduceMotion ? 0 : 0.8,
                                delay: reduceMotion ? 0 : 0.12,
                                ease,
                            }}
                            className="mt-6 text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl"
                        >
                            Create more.
                            <br />
                            Juggle less.
                        </motion.h2>

                        <motion.p
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{
                                duration: reduceMotion ? 0 : 0.7,
                                delay: reduceMotion ? 0 : 0.24,
                                ease,
                            }}
                            className="mt-6 text-xs leading-6 text-[#F4F1EA]/60"
                        >
                            Studios · Wedding photographers
                            <br />
                            Videographers · Event companies
                        </motion.p>
                    </div>

                    {/* Feature Rows */}
                    <div className="text-sm">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, x: 35 }
                                }
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{
                                    duration: reduceMotion ? 0 : 0.75,
                                    delay: reduceMotion
                                        ? 0
                                        : index * 0.16,
                                    ease,
                                }}
                                className="group relative grid gap-2 border-t border-white/10 py-7 sm:grid-cols-[1fr_1fr]"
                            >
                                <motion.span
                                    aria-hidden="true"
                                    initial={
                                        reduceMotion
                                            ? false
                                            : { scaleX: 0 }
                                    }
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{
                                        duration: reduceMotion ? 0 : 0.65,
                                        delay: reduceMotion
                                            ? 0
                                            : index * 0.16 + 0.12,
                                        ease,
                                    }}
                                    className="absolute left-0 top-0 h-px w-16 origin-left bg-[#FFC93C]"
                                />

                                <p className="font-normal transition-colors duration-300 group-hover:text-[#FFC93C]">
                                    {feature.title}
                                </p>

                                <p className="text-sm text-[#F4F1EA]/55 sm:text-xs">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="scroll-mt-4">
                <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8 sm:px-8 lg:px-10">
                    {/* Pricing Heading */}
                    <motion.div
                        initial={hidden}
                        whileInView={visible}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.8,
                            ease,
                        }}
                    >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFC93C]">
                            Room to grow
                        </p>

                        <h2 className="mt-5 text-3xl font-normal tracking-tight sm:text-4xl">
                            Your next chapter starts here.
                        </h2>
                    </motion.div>

                    {/* Trial Plan */}
                    <motion.div
                        initial={hidden}
                        whileInView={visible}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.75,
                            delay: reduceMotion ? 0 : 0.12,
                            ease,
                        }}
                        className="relative mt-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1E2125] p-6 sm:p-8"
                    >
                        <div
                            aria-hidden="true"
                            className="absolute left-0 top-0 h-[3px] w-full bg-[#FFC93C]"
                        />

                        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFC93C]">
                                    Start with a trial
                                </p>

                                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <h3 className="text-3xl font-normal tracking-tight sm:text-4xl">
                                        ₹0
                                    </h3>
                                    <span className="text-xs text-[#F4F1EA]/50">
                                        / 3 days
                                    </span>
                                </div>

                                <p className="mt-3 text-sm text-[#F4F1EA]/60">
                                    Try Picknnovate with the essentials before choosing a plan.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {["1 Event", "1 GB Storage", "450 Images", "3 Days"].map(
                                        (item) => (
                                            <span
                                                key={item}
                                                className="rounded-full border border-white/10 px-3 py-2 text-[11px] text-[#F4F1EA]/75"
                                            >
                                                {item}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            <Link
                                href="/signup"
                                className="group/cta flex shrink-0 items-center justify-between gap-8 rounded-lg bg-[#FFC93C] px-5 py-4 text-xs font-semibold text-[#14161A] transition-all duration-300 hover:brightness-95 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFC93C]"
                            >
                                <span>Start Trial</span>
                                <span
                                    aria-hidden="true"
                                    className="text-base transition-transform duration-300 group-hover/cta:translate-x-1"
                                >
                                    →
                                </span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Paid Plan Cards */}
                    <div className="mt-8 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        {tiers.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial={
                                    reduceMotion
                                        ? false
                                        : {
                                              opacity: 0,
                                              y: 45,
                                          }
                                }
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    once: true,
                                    amount: 0.2,
                                }}
                                transition={{
                                    duration: reduceMotion ? 0 : 0.8,
                                    delay: reduceMotion ? 0 : i * 0.14,
                                    ease,
                                }}
                                whileHover={
                                    reduceMotion
                                        ? undefined
                                        : {
                                              y: -8,
                                              transition: {
                                                  duration: 0.3,
                                                  ease,
                                              },
                                          }
                                }
                                className={`group relative flex h-full min-h-[470px] flex-col overflow-hidden rounded-2xl p-6 transition-shadow duration-500 sm:p-7 ${
                                    t.featured
    ? "z-10 bg-[#FFC93C] text-[#14161A] shadow-[0_24px_60px_rgba(255,201,60,0.12)] hover:shadow-[0_28px_70px_rgba(255,241,234,0.16)] lg:-translate-y-3"
    : "border border-white/[0.07] bg-[#1E2125] text-[#F4F1EA] shadow-[0_15px_40px_rgba(0,0,0,0.12)] hover:border-[#FFC93C]/30 hover:shadow-[0_22px_50px_rgba(0,0,0,0.2)]"
                                }`}
                            >
                                {/* Top Accent: yellow on dark cards, black on Premium */}
                                <div
                                    aria-hidden="true"
                                   className={`absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
    t.featured
        ? "bg-[#F4F1EA]"
        : "bg-[#FFC93C]"
}`}
                                />

                                {/* Large Background Number */}
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none absolute -right-2 top-14 select-none text-[150px] font-semibold leading-none tracking-tighter transition-transform duration-700 group-hover:-translate-y-2 ${
                                        t.featured
                                            ? "text-[#14161A]/[0.055]"
                                            : "text-[#F4F1EA]/[0.035]"
                                    }`}
                                >
                                    {t.number}
                                </span>

                                <div className="relative flex flex-1 flex-col">
                                    {/* Plan Label */}
                                    <div className="flex items-center justify-between gap-3">
                                        <span
                                            className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                                                t.featured
                                                    ? "text-[#14161A]/60"
                                                    : "text-[#F4F1EA]/45"
                                            }`}
                                        >
                                            {t.tier}
                                        </span>

                                        {t.featured && (
                                            <span className="rounded-sm bg-[#14161A] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#FFC93C]">
                                                Most popular
                                            </span>
                                        )}
                                    </div>

                                    {/* Plan Name and Price */}
                                    <div className="mt-8">
                                        <h3 className="text-3xl font-normal tracking-tight sm:text-[34px]">
                                            {t.name}
                                        </h3>

                                        <p
                                            className={`mt-3 text-xs ${
                                                t.featured
                                                    ? "text-[#14161A]/65"
                                                    : "text-[#F4F1EA]/50"
                                            }`}
                                        >
                                            {t.tag}
                                        </p>

                                        <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                            <span className="text-3xl font-normal tracking-tight sm:text-4xl">
                                                {t.price}
                                            </span>
                                            <span
                                                className={`text-[11px] ${
                                                    t.featured
                                                        ? "text-[#14161A]/60"
                                                        : "text-[#F4F1EA]/45"
                                                }`}
                                            >
                                                {t.period}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div
                                        className={`my-7 h-px w-full ${
                                            t.featured
                                                ? "bg-[#14161A]/20"
                                                : "bg-white/10"
                                        }`}
                                    />

                                    {/* Plan Features */}
                                    <div className="flex-1">
                                        <ul className="space-y-4 text-xs">
                                            {t.items.map((item, itemIndex) => (
                                                <motion.li
                                                    key={item}
                                                    initial={
                                                        reduceMotion
                                                            ? false
                                                            : {
                                                                  opacity: 0,
                                                                  x: -10,
                                                              }
                                                    }
                                                    whileInView={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    viewport={{
                                                        once: true,
                                                        amount: 0.2,
                                                    }}
                                                    transition={{
                                                        duration: reduceMotion
                                                            ? 0
                                                            : isMobile
                                                              ? 0.25
                                                              : 0.45,
                                                        delay: reduceMotion
                                                            ? 0
                                                            : isMobile
                                                              ? i * 0.07 +
                                                                0.08 +
                                                                itemIndex * 0.035
                                                              : i * 0.14 +
                                                                0.25 +
                                                                itemIndex * 0.08,
                                                        ease,
                                                    }}
                                                    className="flex items-start gap-3"
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`mt-[1px] text-sm leading-none ${
                                                            t.featured
                                                                ? "text-[#14161A]"
                                                                : "text-[#FFC93C]"
                                                        }`}
                                                    >
                                                        ✓
                                                    </span>

                                                    <span className="leading-5">
                                                        {item}
                                                    </span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        href="#contact"
                                        className={`group/cta mt-10 flex items-center justify-between rounded-lg px-5 py-4 text-xs font-semibold transition-all duration-300 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFC93C] ${
                                            t.featured
                                                ? "bg-[#14161A] text-[#F4F1EA] hover:bg-black"
                                                : "bg-[#2E3136] text-[#F4F1EA] hover:bg-[#383C42]"
                                        }`}
                                    >
                                        <span>{t.cta}</span>

                                        <span
                                            aria-hidden="true"
                                            className="text-base transition-transform duration-300 group-hover/cta:translate-x-1"
                                        >
                                            →
                                        </span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Custom Package Contact Section */}
                    <motion.div
                        initial={hidden}
                        whileInView={visible}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.7,
                            delay: reduceMotion ? 0 : 0.12,
                            ease,
                        }}
                        className="mt-8 flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-[#1E2125] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
                    >
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFC93C]">
                                Need something different?
                            </p>

                            <h3 className="mt-3 text-2xl font-normal leading-tight tracking-tight sm:text-3xl">
                                You can customize a package to fit your studio.
                            </h3>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#F4F1EA]/65 sm:text-base">
                                Need different event, storage, or image limits? Contact us to create a package that fits your studio’s needs.
                            </p>
                        </div>

                        <a
                            href="#contact"
                            className="group/cta flex shrink-0 items-center justify-between gap-8 rounded-lg bg-[#2E3136] px-5 py-4 text-xs font-semibold text-[#F4F1EA] transition-all duration-300 hover:bg-[#383C42] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFC93C]"
                        >
                            <span>Contact Us</span>
                            <span
                                aria-hidden="true"
                                className="text-base transition-transform duration-300 group-hover/cta:translate-x-1"
                            >
                                →
                            </span>
                        </a>
                    </motion.div>

                    {/* Pricing Footer */}
                    <motion.div
                        initial={hidden}
                        whileInView={visible}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.65,
                            delay: reduceMotion ? 0 : 0.2,
                            ease,
                        }}
                    >
                        <p className="mt-6 text-[11px] text-[#F4F1EA]/55">
                            Prices and plan limits are subject to confirmation.
                        </p>

                        <p className="mt-3 text-sm">
                            One connected platform. Fewer disconnected tools.
                        </p>
                    </motion.div>
                </div>
            </section>
        </>
    );
}