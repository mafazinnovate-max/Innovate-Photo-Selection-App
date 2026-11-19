
"use client";

import { motion, useReducedMotion } from "motion/react";

const quickLinks = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQs", href: "#faqs" },
    { label: "Contact Us", href: "#contact" },
];

const solutionLinks = [
    { label: "Audience Growth" },
    { label: "Photo Selection"},
    { label: "Studio Management" },
    { label: "Client Management" },
    { label: "Booking & Scheduling", href: "#features" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Footer() {
    const reduceMotion = useReducedMotion();

    const reveal = (delay = 0) => ({
        initial: {
            opacity: reduceMotion ? 1 : 0,
            y: reduceMotion ? 0 : 24,
        },
        whileInView: {
            opacity: 1,
            y: 0,
        },
        viewport: {
            once: true,
            amount: 0.15,
        },
        transition: {
            duration: reduceMotion ? 0 : 0.7,
            delay: reduceMotion ? 0 : delay,
            ease,
        },
    });

    return (
        <footer
            id="contact"
            className="relative isolate overflow-hidden text-[#14161A]"
        >
            {/* ANIMATED WAVE TRANSITION */}
                        <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 top-[100px] z-0 bg-[#F4F1EA] sm:top-[130px]"
            />

            <div
                className="pointer-events-none absolute left-0 top-0 z-0 h-[125px] w-full overflow-hidden sm:h-[155px]"
                aria-hidden="true"
            >
                <svg
                    className={`footer-wave absolute bottom-0 left-0 h-full w-[200%] ${
                        reduceMotion ? "footer-wave-static" : ""
                    }`}
                    viewBox="0 0 2880 180"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* CHARCOAL WAVE */}

                    <path
                        d="
                            M0 80
                            C240 40 480 125 720 80
                            C960 35 1200 120 1440 80
                            C1680 40 1920 125 2160 80
                            C2400 35 2640 120 2880 80
                            V180 H0 Z
                        "
                        fill="#F4F1EA"
/>

                    {/* YELLOW FLOWING ACCENT */}

                    <path
                        d="
                            M0 88
                            C240 48 480 132 720 88
                            C960 44 1200 128 1440 88
                            C1680 48 1920 132 2160 88
                            C2400 44 2640 128 2880 88
                            L2880 105
                            C2640 145 2400 61 2160 105
                            C1920 149 1680 65 1440 105
                            C1200 145 960 61 720 105
                            C480 149 240 65 0 105 Z
                        "
                        fill="#FFC93C"
                    />
                </svg>

                {/* SUBTLE SECONDARY WAVE */}

                <div
                    className={`footer-wave-glow absolute -bottom-10 left-0 h-16 w-[200%] rounded-[50%] ${
                        reduceMotion ? "footer-wave-static" : ""
                    }`}
                />
            </div>

            {/* BRAND HEADER */}

            <div className="relative z-10 px-5 pt-[145px] sm:px-8 sm:pt-[175px] lg:px-12">
                <div className="mx-auto max-w-[1440px]">
                    <motion.div
                        {...reveal(0)}
                        className="flex flex-col justify-between gap-5 rounded-t-[26px] bg-gradient-to-r from-[#F4F1EA] via-[#F8EBCB] to-[#FFE08A] px-6 py-8 text-[#14161A] sm:flex-row sm:items-center sm:px-10 sm:py-9 lg:px-12 lg:py-10"
                    >
                        <h2 className="text-3xl font-bold tracking-[-0.065em] sm:text-4xl lg:text-[46px]">
                            Picknnovate
                        </h2>

                        <p className="max-w-[340px] text-xs font-medium leading-5 text-[#14161A]/75 sm:text-right sm:text-[13px] sm:leading-6">
                            One connected workspace for photography studios
                            and creative businesses.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* MAIN DARK FOOTER */}

            <div className="relative z-10 bg-[#14161A] px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
                <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 lg:grid-cols-[1.65fr_0.85fr] lg:gap-7">

                    {/* QUICK LINKS + SOLUTIONS CARD */}

                    <motion.div
                        {...reveal(0.08)}
                        className="rounded-[24px] border border-white/[0.12] bg-[#17191D] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.16)] sm:p-7 lg:p-9"
                    >
                        <div className="grid grid-cols-1 gap-8 min-[420px]:grid-cols-2 sm:gap-12">

                            {/* QUICK LINKS */}

                            <div>
                                <h3 className="mb-5 inline-flex min-w-[120px] justify-center rounded-[4px] bg-[#FFC93C] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#14161A]">
                                    Quick Links
                                </h3>

                                <ul className="space-y-3.5">
                                    {quickLinks.map((link, index) => (
                                        <motion.li
                                            key={link.label}
                                            initial={{
                                                opacity: reduceMotion ? 1 : 0,
                                                x: reduceMotion ? 0 : -10,
                                            }}
                                            whileInView={{
                                                opacity: 1,
                                                x: 0,
                                            }}
                                            viewport={{
                                                once: true,
                                                amount: 0.3,
                                            }}
                                            transition={{
                                                duration: reduceMotion ? 0 : 0.45,
                                                delay: reduceMotion
                                                    ? 0
                                                    : index * 0.07,
                                                ease,
                                            }}
                                        >
                                            <a
                                                href={link.href}
                                                className="group flex w-fit items-center gap-2 text-[12px] text-white/65 transition-colors duration-300 hover:text-[#FFC93C] sm:text-[13px]"
                                            >
                                                <span className="h-1 w-1 shrink-0 rounded-full bg-[#FFC93C]" />

                                                <span>{link.label}</span>

                                                <span className="translate-x-[-4px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                                    ↗
                                                </span>
                                            </a>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* SOLUTIONS */}

                            <div>
                                <h3 className="mb-5 inline-flex min-w-[120px] justify-center rounded-[4px] bg-[#FFC93C] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#14161A]">
                                    Solutions
                                </h3>

                                <ul className="space-y-3.5">
                                    {solutionLinks.map((link, index) => (
                                        <motion.li
                                            key={link.label}
                                            initial={{
                                                opacity: reduceMotion ? 1 : 0,
                                                x: reduceMotion ? 0 : -10,
                                            }}
                                            whileInView={{
                                                opacity: 1,
                                                x: 0,
                                            }}
                                            viewport={{
                                                once: true,
                                                amount: 0.3,
                                            }}
                                            transition={{
                                                duration: reduceMotion ? 0 : 0.45,
                                                delay: reduceMotion
                                                    ? 0
                                                    : 0.12 + index * 0.07,
                                                ease,
                                            }}
                                        >
                                            <a
                                                href={link.href}
                                                className="group flex w-fit items-center gap-2 text-[12px] text-white/65 transition-colors duration-300 hover:text-[#FFC93C] sm:text-[13px]"
                                            >
                                                <span className="h-1 w-1 shrink-0 rounded-full bg-[#FFC93C]" />

                                                <span>{link.label}</span>

                                                <span className="translate-x-[-4px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                                    ↗
                                                </span>
                                            </a>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* STAY CONNECTED */}

                        <motion.div
                            {...reveal(0.2)}
                            className="mt-8 rounded-[15px] border border-[#FFC93C]/30 bg-[#0D0E10] p-4 sm:ml-[22%] sm:max-w-[440px] sm:p-5"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#FFC93C]">
                                Stay Connected
                            </p>

                            <p className="mt-2 text-[11px] leading-5 text-white/65 sm:text-xs">
                                Follow us for creative inspiration,
                                product updates and everything happening
                                at Picknnovate.
                            </p>

                            <div className="mt-4 flex items-center gap-2.5">

                                <motion.a
                                    href="YOUR_INSTAGRAM_URL"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    whileHover={
                                        reduceMotion
                                            ? undefined
                                            : { y: -4, rotate: -6 }
                                    }
                                    whileTap={
                                        reduceMotion
                                            ? undefined
                                            : { scale: 0.92 }
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-white/15 bg-white/[0.06] text-lg text-[#FFC93C] transition-colors hover:border-[#FFC93C] hover:bg-[#FFC93C]/10"
                                >
                                    ◎
                                </motion.a>

                                <motion.a
                                    href="YOUR_LINKEDIN_URL"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                    whileHover={
                                        reduceMotion
                                            ? undefined
                                            : { y: -4, rotate: 5 }
                                    }
                                    whileTap={
                                        reduceMotion
                                            ? undefined
                                            : { scale: 0.92 }
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-white/15 bg-white/[0.06] text-sm font-bold text-[#FFC93C] transition-colors hover:border-[#FFC93C] hover:bg-[#FFC93C]/10"
                                >
                                    in
                                </motion.a>

                                <motion.a
                                    href="YOUR_YOUTUBE_URL"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="YouTube"
                                    whileHover={
                                        reduceMotion
                                            ? undefined
                                            : { y: -4, rotate: -5 }
                                    }
                                    whileTap={
                                        reduceMotion
                                            ? undefined
                                            : { scale: 0.92 }
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-white/15 bg-white/[0.06] text-sm font-bold text-[#FFC93C] transition-colors hover:border-[#FFC93C] hover:bg-[#FFC93C]/10"
                                >
                                    ▶
                                </motion.a>

                            </div>
                        </motion.div>
                    </motion.div>

                    {/* CONTACT CARD */}

                    <motion.div
                        {...reveal(0.18)}
                        whileHover={
                            reduceMotion
                                ? undefined
                                : {
                                      y: -5,
                                      transition: { duration: 0.3, ease },
                                  }
                        }
                        className="rounded-[24px] border border-white/[0.12] bg-[#17191D] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.16)] sm:p-7 lg:p-9"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FFC93C]">
                            Contact Us
                        </p>

                        {/* PHONE */}

                        <div className="mt-6">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FFC93C]/80">
                                Phone
                            </p>

                            <a
                                href="tel:+918438430504"
                                className="inline-block text-lg font-medium tracking-tight text-white transition-colors duration-300 hover:text-[#FFC93C] sm:text-xl"
                            >
                                +91 84384 30504
                            </a>
                        </div>

                        {/* EMAIL */}

                        <div className="mt-7">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FFC93C]/80">
                                Email
                            </p>

                            <a
                                href="mailto:innovateweddingcompany@gmail.com"
                                className="break-all text-[12px] leading-6 text-white/70 transition-colors duration-300 hover:text-[#FFC93C] sm:text-[13px]"
                            >
                                innovateweddingcompany@gmail.com
                            </a>
                        </div>

                        {/* LOCATION */}

                        <div className="mt-7">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FFC93C]/80">
                                Location
                            </p>

                            <p className="text-[12px] leading-6 text-white/65 sm:text-[13px]">
                                Innovate Wedding Company,
                                Pattakasalianvilai Rd, Vattakarai,
                                Maravankudieruppu, Nagercoil,
                                Tamil Nadu 629002
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* LARGE PICKNNOVATE WATERMARK */}

            <div className="relative flex h-[100px] items-center justify-center overflow-hidden bg-gradient-to-r from-[#F4F1EA] via-[#F8EBCB] to-[#FFE08A] sm:h-[130px] lg:h-[155px]">
                <motion.h2
                    {...reveal(0)}
                    className="whitespace-nowrap text-[clamp(4.5rem,16vw,13rem)] font-black leading-none tracking-[-0.085em] text-[#14161A]/[0.085] select-none"
                >
                    Picknnovate
                </motion.h2>
            </div>

            {/* COPYRIGHT */}

            <div className="bg-[#0D0E10] px-5 py-6 sm:py-7">
                <motion.p
                    {...reveal(0)}
                    className="text-center text-[10px] font-medium tracking-wide text-white/45 sm:text-[11px]"
                >
                    © {new Date().getFullYear()} Picknnovate. All Rights Reserved.
                </motion.p>
            </div>

            {/* FOOTER ANIMATION STYLES */}

            <style jsx global>{`
                @keyframes picknovate-wave-flow {
                    from {
                        transform: translateX(0);
                    }

                    to {
                        transform: translateX(-50%);
                    }
                }

                @keyframes picknovate-wave-float {
                    0%,
                    100% {
                        transform: translateX(0) translateY(0);
                    }

                    50% {
                        transform: translateX(-2%) translateY(5px);
                    }
                }

                .footer-wave {
                    animation: picknovate-wave-flow 28s linear infinite;
                    will-change: transform;
                }

                .footer-wave-glow {
                    background: rgba(255, 201, 60, 0.12);
                    filter: blur(22px);
                    animation: picknovate-wave-float 12s ease-in-out infinite;
                    will-change: transform;
                }

                .footer-wave-static {
                    animation: none !important;
                }

                @media (max-width: 639px) {
                    .footer-wave {
                        animation-duration: 19s;
                    }

                    .footer-wave-glow {
                        animation-duration: 10s;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .footer-wave,
                    .footer-wave-glow {
                        animation: none !important;
                    }
                }
            `}</style>
        </footer>
    );
}
