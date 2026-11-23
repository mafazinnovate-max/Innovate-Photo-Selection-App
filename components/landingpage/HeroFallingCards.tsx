
"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroFallingCards() {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const cards = container.querySelectorAll(".hero-falling-card");

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
                        cards,
                        {
                            y: -80,
                            opacity: 0,
                        },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            stagger: 0.2,
                            ease: "bounce.out",
                            scrollTrigger: {
                                trigger: container,
                                start: "top 85%",
                                once: true,
                            },
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
        <div
            ref={containerRef}
            className="mt-8 space-y-2 pb-2 sm:mt-12"
        >
            <div className="hero-falling-card -rotate-[2deg] rounded-xl bg-[#FFC93C] px-4 py-3 text-lg font-normal sm:px-5 sm:py-4 sm:text-xl text-[#14161A]">
                <span className="mr-6 text-[10px] font-semibold">01</span>
                 Grow your brand 
            </div>

            <div className="hero-falling-card -rotate-[1.5deg] rounded-xl bg-[#F4F1EA] px-4 py-3 text-lg font-normal sm:px-5 sm:py-4 sm:text-xl text-[#14161A]">
                <span className="mr-6 text-[10px] font-semibold text-[#14161A]/60">02</span>
                Run your studio
            </div>

            <div className="hero-falling-card rotate-[2deg] rounded-xl bg-[#3A3F2E] px-4 py-3 text-lg font-normal sm:px-5 sm:py-4 sm:text-xl text-[#F4F1EA]/85">
                <span className="mr-6 text-[10px] font-semibold">03</span>
                 Select photos
            </div>
        </div>
    );
}
