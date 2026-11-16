
"use client";

import { useState } from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "motion/react";

const faqs = [
    {
        q: "How does photo selection work?",
        a: "Share a gallery with your client. They view the photos and pick their favourites, and you receive the organized selection.",
    },
    {
        q: "Can I manage projects and documents?",
        a: "Yes. Keep every client, project record, quotation, invoice and contract in one place.",
    },
    {
        q: "Can I manage my team?",
        a: "Yes. Track attendance and crew logs, and automate payslips for your team.",
    },
    {
        q: "Can I build my own website?",
        a: "Yes. Pick a template, add your story and publish a website that feels like your brand.",
    },
    {
        q: "Can I showcase packages?",
        a: "Yes. Present your packages and services with pricing on your website.",
    },
    {
        q: "Are subscription plans available?",
        a: "Yes. Choose Starter, Professional or Business. Prices and plan limits are subject to confirmation.",
    },
];

export default function FAQCTASection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const reduceMotion = useReducedMotion();

    const reveal = reduceMotion
        ? {}
        : {
              initial: { opacity: 0, y: 35 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, amount: 0.2 },
              transition: {
                  duration: 0.75,
                  ease: [0.22, 1, 0.36, 1] as const,
              },
          };

    return (
        <>
            {/* FAQ */}
            <section
                id="faqs"
                className="scroll-mt-4 overflow-hidden border-t border-white/10"
            >
                <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10">
                    {/* FAQ Introduction */}
                    <motion.div {...reveal}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                            Good to know
                        </p>

                        <h2 className="mt-6 text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl">
                            A few quick
                            <br />
                            answers.
                        </h2>

                        <p className="mt-10 text-sm lg:mt-16">
                            What is Picknnovate?
                        </p>

                        <p className="mt-2 max-w-xs text-xs leading-5 text-[#F4F1EA]/55">
                            One platform for your studio, clients, team and online presence.
                        </p>

                        {!reduceMotion && (
                            <motion.div
                                aria-hidden="true"
                                className="mt-10 h-px w-20 origin-left bg-[#FFC93C]/60"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 1,
                                    delay: 0.3,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            />
                        )}
                    </motion.div>

                    {/* FAQ Accordion */}
                    <div>
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;

                            return (
                                <motion.div
                                    key={faq.q}
                                    initial={
                                        reduceMotion
                                            ? false
                                            : { opacity: 0, y: 22 }
                                    }
                                    whileInView={
                                        reduceMotion
                                            ? undefined
                                            : { opacity: 1, y: 0 }
                                    }
                                    viewport={{
                                        once: true,
                                        amount: 0.15,
                                    }}
                                    transition={{
                                        duration: reduceMotion ? 0 : 0.55,
                                        delay: reduceMotion
                                            ? 0
                                            : index * 0.07,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="border-t border-white/10 last:border-b"
                                >
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${index}`}
                                        onClick={() =>
                                            setOpenIndex(
                                                isOpen ? null : index
                                            )
                                        }
                                        className="group flex w-full cursor-pointer items-center justify-between gap-5 py-5 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFC93C]"
                                    >
                                        <span className="transition-colors duration-300 group-hover:text-[#FFC93C]">
                                            {faq.q}
                                        </span>

                                        <motion.span
                                            animate={{
                                                rotate: isOpen ? 45 : 0,
                                                scale: isOpen ? 1.1 : 1,
                                            }}
                                            transition={{
                                                duration: reduceMotion ? 0 : 0.3,
                                                ease: "easeInOut",
                                            }}
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#FFC93C]/30 text-lg leading-none text-[#FFC93C]"
                                            aria-hidden="true"
                                        >
                                            +
                                        </motion.span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                id={`faq-answer-${index}`}
                                                key="answer"
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                transition={{
                                                    height: {
                                                        duration: reduceMotion
                                                            ? 0
                                                            : 0.4,
                                                        ease: [
                                                            0.22,
                                                            1,
                                                            0.36,
                                                            1,
                                                        ],
                                                    },
                                                    opacity: {
                                                        duration: reduceMotion
                                                            ? 0
                                                            : 0.25,
                                                    },
                                                }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pb-5 pr-8 text-sm leading-6 text-[#F4F1EA]/55 sm:text-xs sm:leading-5">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="overflow-hidden">
                <div className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:px-10">
                    <motion.div
                        initial={
                            reduceMotion
                                ? false
                                : { opacity: 0, y: 45, scale: 0.98 }
                        }
                        whileInView={
                            reduceMotion
                                ? undefined
                                : { opacity: 1, y: 0, scale: 1 }
                        }
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.85,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative flex flex-col justify-between gap-10 overflow-hidden rounded-3xl bg-[#FFC93C] p-6 text-[#14161A] sm:rounded-[28px] sm:p-12 md:min-h-[300px] lg:flex-row lg:items-center"
                    >
                        {/* Decorative background detail */}
                        {!reduceMotion && (
                            <motion.div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-20 -top-36 h-80 w-80 rounded-full border border-[#14161A]/10 sm:-right-10 sm:-top-48 sm:h-[440px] sm:w-[440px]"
                                initial={{ scale: 0.7, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 1.2,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            />
                        )}

                        <div className="relative z-10">
                            <p className="text-[10px] font-semibold uppercase tracking-wider">
                                Less busywork. More possibility.
                            </p>

                            <h2 className="mt-6 text-4xl font-normal leading-[1.05] tracking-tight min-[420px]:text-5xl sm:text-6xl">
                                Make room
                                <br />
                                for creativity.
                            </h2>
                        </div>

                        <div className="relative z-10 flex w-full flex-col items-start gap-6 lg:mt-16 lg:w-[330px]">
                            <a
                                href="/signup"
                                className="group flex w-full items-center justify-center gap-3 rounded-lg bg-[#14161A] px-8 py-4 text-center text-xs font-semibold text-[#F4F1EA] transition-colors duration-300 hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14161A]"
                            >
                                Get Started Today Free
                                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>
                            </a>

                            <a
                                href="#pricing"
                                className="group text-xs font-medium"
                            >
                                Explore plans
                                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
