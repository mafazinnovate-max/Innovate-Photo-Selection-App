
"use client";

import { motion, useReducedMotion } from "motion/react";

const footerCols = [
    {
        title: "Product",
        links: [
            { label: "Smart Photo Selection", href: "#features" },
            { label: "Project Records", href: "#features" },
            { label: "Quotations & Contracts", href: "#features" },
            { label: "Team & Payslips", href: "#features" },
            { label: "Website Builder", href: "#website" },
        ],
    },
    {
        title: "Solutions",
        links: [
            { label: "Wedding Studios", href: "#" },
            { label: "Commercial Photography", href: "#" },
            { label: "Videographers", href: "#" },
            { label: "Event Companies", href: "#" },
            { label: "Pricing Plans", href: "#pricing" },
        ],
    },
    {
        title: "Company & Legal",
        links: [
            { label: "About Us", href: "#" },
            { label: "FAQs", href: "#faqs" },
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
            { label: "Support & Contact", href: "#contact" },
        ],
    },
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
            amount: 0.2,
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
            className="relative overflow-hidden bg-[#F4F1EA] text-[#14161A]"
        >
            {/* Animated wave transition */}
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
                    {/* Charcoal wave */}
                    <path
                        d="
                            M0 0 H1440 V80
                            C1200 120 960 35 720 80
                            C480 125 240 40 0 80 Z

                            M1440 0 H2880 V80
                            C2640 120 2400 35 2160 80
                            C1920 125 1680 40 1440 80 Z
                        "
                        fill="#14161A"
                    />

                    {/* Yellow flowing accent */}
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

                {/* Subtle secondary wave */}
                <div
                    className={`footer-wave-glow absolute -bottom-10 left-0 h-16 w-[200%] rounded-[50%] ${
                        reduceMotion ? "footer-wave-static" : ""
                    }`}
                />
            </div>

            {/* Footer content */}
            <div className="relative z-10 px-6 pb-6 pt-[145px] sm:px-10 sm:pt-[175px] lg:px-16">
                <div className="mx-auto max-w-[1440px]">
                    {/* Brand introduction */}
                    <div className="grid gap-10 border-b border-[#14161A]/10 pb-12 md:grid-cols-2 md:items-start lg:gap-20">
                        <motion.div {...reveal(0)}>
                            <h2 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl lg:text-5xl">
                                Picknnovate
                            </h2>

                            <p className="mt-3 text-sm font-medium text-[#14161A]/70 sm:text-base">
                                Your creative business, simplified.
                            </p>
                        </motion.div>

                        <motion.p
                            {...reveal(0.12)}
                            className="max-w-md text-sm leading-7 text-[#14161A]/65 sm:text-base"
                        >
                            One connected workspace for photography studios
                            and creative businesses.
                        </motion.p>
                    </div>

                    {/* Links and contact */}
                    <div className="grid gap-12 py-12 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.15fr_1.35fr] lg:gap-10">
                        {footerCols.map((column, index) => (
                            <motion.div
                                key={column.title}
                                {...reveal(index * 0.1)}
                            >
                                <h3 className="mb-6 inline-block rounded-md bg-[#FFC93C] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                                    {column.title}
                                </h3>

                                <ul className="space-y-4">
                                    {column.links.map((link, linkIndex) => (
                                        <motion.li
                                            key={link.label}
                                            initial={{
                                                opacity: reduceMotion ? 1 : 0,
                                                x: reduceMotion ? 0 : -8,
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
                                                duration: reduceMotion ? 0 : 0.4,
                                                delay: reduceMotion
                                                    ? 0
                                                    : index * 0.08 +
                                                      linkIndex * 0.055,
                                                ease,
                                            }}
                                        >
                                            <a
                                                href={link.href}
                                                className="group inline-flex items-center gap-2 text-sm text-[#14161A]/65 transition-colors duration-300 hover:text-[#14161A]"
                                            >
                                                <span>{link.label}</span>
                                                <span className="translate-x-[-4px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                                    ↗
                                                </span>
                                            </a>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}

                        {/* Contact card */}
                        <motion.div
                            {...reveal(0.25)}
                            whileHover={
                                reduceMotion ? undefined : { y: -5 }
                            }
                            transition={{
                                duration: 0.35,
                                ease,
                            }}
                            className="rounded-[24px] bg-[#14161A] p-6 text-[#F4F1EA] shadow-[0_18px_45px_rgba(20,22,26,0.13)] sm:p-7"
                        >
                            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#FFC93C]">
                                Get in touch
                            </p>

                            <h3 className="text-xl font-semibold tracking-tight">
                                Contact us
                            </h3>

                            <div className="mt-7 space-y-6">
                                <div>
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FFC93C]">
                                        Phone
                                    </p>
                                    <a
                                        href="tel:+91XXXXXXXXXX"
                                        className="text-sm text-white/75 transition-colors hover:text-[#FFC93C]"
                                    >
                                        +91 84384 30504
                                    </a>
                                </div>

                                <div>
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FFC93C]">
                                        Email
                                    </p>
                                    <a
                                        href="mailto:YOUR_EMAIL_ADDRESS"
                                        className="break-all text-sm text-white/75 transition-colors hover:text-[#FFC93C]"
                                    >
                                        innovateweddingcompany@gmail.com
                                    </a>
                                </div>

                                <div>
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FFC93C]">
                                        Address
                                    </p>
                                    <p className="text-sm leading-6 text-white/65">
                                        Innovate Wedding Company,
                                        Pattakasalianvilai Rd, Vattakarai,
                                        Maravankudieruppu, Nagercoil,
                                        Tamil Nadu 629002
                                    </p>
                                </div>
                            </div>

                            {/* Social links */}
                            <div className="mt-7 flex items-center gap-3">
                                <motion.a
                                    href="YOUR_INSTAGRAM_URL"
                                    aria-label="Instagram"
                                    whileHover={
                                        reduceMotion ? undefined : {
                                            y: -4,
                                            rotate: -6,
                                        }
                                    }
                                    whileTap={{ scale: 0.92 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-lg font-semibold text-[#FFC93C] transition-colors hover:border-[#FFC93C]/50 hover:bg-[#FFC93C]/10"
                                >
                                    ◎
                                </motion.a>

                                <motion.a
                                    href="YOUR_LINKEDIN_URL"
                                    aria-label="LinkedIn"
                                    whileHover={
                                        reduceMotion ? undefined : {
                                            y: -4,
                                            rotate: 6,
                                        }
                                    }
                                    whileTap={{ scale: 0.92 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-sm font-bold text-[#FFC93C] transition-colors hover:border-[#FFC93C]/50 hover:bg-[#FFC93C]/10"
                                >
                                    in
                                </motion.a>

                                <motion.a
                                    href="YOUR_YOUTUBE_URL"
                                    aria-label="YouTube"
                                    whileHover={
                                        reduceMotion ? undefined : {
                                            y: -4,
                                            rotate: -6,
                                        }
                                    }
                                    whileTap={{ scale: 0.92 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-sm font-bold text-[#FFC93C] transition-colors hover:border-[#FFC93C]/50 hover:bg-[#FFC93C]/10"
                                >
                                    ▶
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Copyright */}
                    <motion.div
                        {...reveal(0)}
                        className="flex flex-col gap-3 border-t border-[#14161A]/10 pt-6 text-center text-xs text-[#14161A]/50 sm:flex-row sm:items-center sm:justify-between sm:text-left"
                    >
                        <p>
                            © {new Date().getFullYear()} Picknnovate. All
                            Rights Reserved.
                        </p>

                        <p className="font-medium tracking-wide">
                            Made for creative businesses.
                        </p>
                    </motion.div>
                </div>
            </div>

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
                }

                .footer-wave-glow {
                    background: rgba(255, 201, 60, 0.12);
                    filter: blur(22px);
                    animation: picknovate-wave-float 12s ease-in-out infinite;
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
