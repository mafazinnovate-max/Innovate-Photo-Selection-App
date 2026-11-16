
"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroTextReveal from "@/components/landingpage/HeroTextReveal";

gsap.registerPlugin(ScrollTrigger);

export default function HeroContentReveal() {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const elements = container.querySelectorAll(".hero-content-item");

        const mm = gsap.matchMedia();

        let cleanupMatchMedia: (() => void) | undefined;

        const startAnimation = () => {
            if (cleanupMatchMedia) return;

            mm.add(
                {
                    reduceMotion: "(prefers-reduced-motion: reduce)",
                    normalMotion: "(prefers-reduced-motion: no-preference)",
                },
                (context) => {
                    const { reduceMotion } = context.conditions as {
                        reduceMotion: boolean;
                        normalMotion: boolean;
                    };

                    if (reduceMotion) return;

                  const animation = gsap.fromTo(
                                 elements,
                                 {
                                     y: 25,
                                     opacity: 0,
                                 },
                                 {
                                     y: 0,
                                     opacity: 1,
                                     duration: 0.8,
                                     stagger: 0.18,
                                     ease: "power3.out",
                                                              }
                             );
                    

                    return () => animation.kill();
                }
            );

            cleanupMatchMedia = () => mm.revert();
        };

        const introIsPlaying =
            document.documentElement.dataset.picknovateIntro === "playing";

        if (introIsPlaying) {
            window.addEventListener(
                "picknovate:intro-complete",
                startAnimation,
                { once: true }
            );
        } else {
            startAnimation();
        }

        return () => {
            window.removeEventListener(
                "picknovate:intro-complete",
                startAnimation
            );

            cleanupMatchMedia?.();
        };
    }, []);

    return (
        <div ref={containerRef}>
            <p className="hero-content-item text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                Your creative business, simplified.
            </p>

            <HeroTextReveal />

            <p className="hero-content-item mt-8 max-w-md text-base leading-7 text-[#F4F1EA]/60">
                Selections, projects, documents, team and website.
                <br />
                Your photography business, in one place.
            </p>

            <div className="hero-content-item mt-8 flex flex-wrap items-center gap-3">
                <Link
                    href="/signup"
                    className="rounded-lg bg-[#FFC93C] px-7 py-3.5 text-xs font-semibold text-[#14161A] transition hover:bg-[#ffd666] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    Get Started
                </Link>

                <a
                    href="#features"
                    className="rounded-lg bg-[#25282C] px-7 py-3.5 text-xs font-semibold text-[#F4F1EA] transition hover:bg-[#2f3338] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC93C]"
                >
                    Explore Features
                </a>
            </div>

            <p className="hero-content-item mt-8 text-[11px] text-[#F4F1EA]/45">
                Built for photographers. Ready for growth.
            </p>
        </div>
    );
}
