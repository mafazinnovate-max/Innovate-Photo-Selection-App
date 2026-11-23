
"use client";

import { motion, useReducedMotion } from "motion/react";

export default function WebsiteSection() {
    const shouldReduceMotion = useReducedMotion();

    const reveal = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 35,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.8,
                ease: "easeOut" as const,
            },
        },
    };

    const previewReveal = {
        hidden: {
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.82,
            rotate: shouldReduceMotion ? 0 : 7,
            y: shouldReduceMotion ? 0 : 55,
        },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 3,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 1.1,
                ease: [0.22, 1, 0.36, 1] as const,
            },
        },
    };

    return (
        <section
            id="website"
            className="scroll-mt-4 overflow-hidden bg-[#F4F1EA] text-[#14161A]"
        >
            <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10">

                {/* Left content */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ staggerChildren: 0.16 }}
                >
                    <motion.p
                        variants={reveal}
                        className="text-[10px] font-semibold uppercase tracking-wider"
                    >
                        Make it yours
                    </motion.p>

                    <motion.h2
                        variants={reveal}
                        className="mt-8 text-[clamp(2.25rem,10vw,3.75rem)] font-normal leading-[1.08] tracking-tight"
                    >
                        Your business.
                        <br />
                        Your impression.
                        <br />
                        Your style.
                    </motion.h2>

                    <motion.p
                        variants={reveal}
                        className="mt-8 text-base text-[#14161A]/60"
                    >
                        Pick a template. Add your story. Go live.
                    </motion.p>

                    <motion.div variants={reveal}>
                        <a
                            href="/signup"
                            className="mt-8 inline-block rounded-lg bg-[#14161A] px-7 py-3.5 text-xs font-semibold text-[#F4F1EA] transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14161A]"
                        >
                            Start Free Trial
                        </a>
                    </motion.div>

                    <motion.p
                        variants={reveal}
                        className="mt-8 text-[11px] text-[#14161A]/55"
                    >
                        Templates&nbsp;&nbsp;/&nbsp;&nbsp;Customization&nbsp;&nbsp;/&nbsp;&nbsp;Services &amp; pricing
                    </motion.p>
                </motion.div>

                {/* Right website preview */}
                <div className="mx-auto w-full max-w-[560px] px-2 py-8 sm:px-4 lg:ml-auto lg:mr-0">
                    <motion.div
                        aria-hidden="true"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                        variants={previewReveal}
                        className="flex w-full flex-col rounded-3xl bg-[#14161A] p-6 text-[#F4F1EA] shadow-[0_24px_60px_rgba(20,22,26,0.18)] sm:rounded-[28px] sm:p-10 md:aspect-[1.18/1]"
                    >
                        <motion.p
                            variants={reveal}
                            className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]"
                        >
                            Your studio
                        </motion.p>

                        <motion.div
                            variants={reveal}
                            className="mt-4 h-px w-full bg-white/10"
                        />

                        <motion.p
                            variants={reveal}
                            className="mt-8 text-3xl font-normal leading-[1.1] tracking-tight sm:text-5xl"
                        >
                            Designed
                            <br />
                            to make
                            <br />
                            an Impression.
                        </motion.p>

                       <motion.div
    variants={{
     hidden: {
    opacity: 0,
    y: -45,
    scale: 0.96,
},
visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
        delay: 0.65,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
    },
},
    }}
    className="mt-8 rounded-xl bg-[#FFC93C] px-4 py-3 text-lg font-normal text-[#14161A] sm:px-5 sm:py-4 sm:text-xl md:mt-auto"
>
    Packages &amp; Services
</motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
