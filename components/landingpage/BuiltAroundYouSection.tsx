
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
        tier: "Tier 01",
        number: "01",
        name: "Starter",
        tag: "For solo photographers",
        lead: null,
        items: [
            "Photo Selection (5 Galleries)",
            "Project Management",
            "Quotations & Invoices",
            "Digital Contracts",
        ],
        cta: "Get Started",
        featured: false,
    },
    {
        tier: "Tier 02",
        number: "02",
        name: "Professional",
        tag: "Your complete studio toolkit",
        lead: "Everything in Starter, plus:",
        items: [
            "Unlimited Photo Selection",
            "Attendance & Crew Logs",
            "Automated Payslips",
            "Business Website Builder",
        ],
        cta: "Choose Professional",
        featured: true,
    },
    {
        tier: "Tier 03",
        number: "03",
        name: "Business",
        tag: "For growing production agencies",
        lead: "Professional Features, plus:",
        items: [
            "Multi-Brand Websites",
            "Advanced Storage Limits",
            "Custom Domain & White-label",
            "Dedicated Account Manager",
            
        ],
        cta: "Get Started",
        featured: false,
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

    const hidden = reduceMotion
        ? false
        : { opacity: 0, y: 28 };

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

                    {/* Pricing Cards */}
                    <div className="mt-14 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">

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
                                className={`group relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-2xl p-6 transition-shadow duration-500 sm:p-7 ${
                                    t.featured
                                        ? "z-10 bg-[#FFC93C] text-[#14161A] shadow-[0_24px_60px_rgba(255,201,60,0.12)] lg:-translate-y-3"
                                        : "border border-white/[0.07] bg-[#1E2125] text-[#F4F1EA] shadow-[0_15px_40px_rgba(0,0,0,0.12)] hover:border-[#FFC93C]/30 hover:shadow-[0_22px_50px_rgba(0,0,0,0.2)]"
                                } ${
                                    i === 2
                                        ? "sm:col-span-2 lg:col-span-1"
                                        : ""
                                }`}
                            >
                                {/* Top Accent */}
                                <div
                                    aria-hidden="true"
                                    className={`absolute left-0 top-0 h-[3px] w-full origin-left transition-transform duration-500 group-hover:scale-x-100 ${
                                        t.featured
                                            ? "bg-[#14161A]"
                                            : "scale-x-0 bg-[#FFC93C]"
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

                                    {/* Tier Label */}
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

                                    {/* Plan Name */}
                                    <div className="mt-10">
                                        <h3
                                            className={`text-3xl font-normal tracking-tight sm:text-[34px] ${
                                                t.featured
                                                    ? "sm:text-[40px]"
                                                    : ""
                                            }`}
                                        >
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
                                    </div>

                                    {/* Divider */}
                                    <div
                                        className={`my-8 h-px w-full ${
                                            t.featured
                                                ? "bg-[#14161A]/20"
                                                : "bg-white/10"
                                        }`}
                                    />

                                    {/* Features */}
                                    <div className="flex-1">
                                        {t.lead && (
                                            <p className="mb-6 text-[11px] font-semibold">
                                                {t.lead}
                                            </p>
                                        )}

                                        <ul className="space-y-5 text-xs">
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
                                                        duration: reduceMotion ? 0 : isMobile ? 0.25 : 0.45,
                                                        delay: reduceMotion
                                                            ? 0
                                                            : isMobile
                                                              ? i * 0.07 + 0.08 + itemIndex * 0.035
                                                              : i * 0.14 + 0.25 + itemIndex * 0.08,
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
                                        href="/signup"
                                        className={`group/cta mt-12 flex items-center justify-between rounded-lg px-5 py-4 text-xs font-semibold transition-all duration-300 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFC93C] ${
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
