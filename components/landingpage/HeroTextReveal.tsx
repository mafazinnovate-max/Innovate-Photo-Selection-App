
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroTextReveal() {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const heading = headingRef.current;
        if (!heading) return;

        const lines = heading.querySelectorAll(".hero-reveal-line");
        const mm = gsap.matchMedia();

        let started = false;

        const startAnimation = () => {
            if (started) return;
            started = true;

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

                    if (reduceMotion) {
                        gsap.set(lines, {
                            yPercent: 0,
                            opacity: 1,
                        });
                        return;
                    }

                    const timeline = gsap.timeline({
                        defaults: {
                            ease: "power4.out",
                        },
                    });

                    timeline.fromTo(
                        lines,
                        {
                            yPercent: 110,
                            opacity: 0,
                        },
                        {
                            yPercent: 0,
                            opacity: 1,
                            duration: 1.1,
                            stagger: 0.18,
                        }
                    );

                    return () => timeline.kill();
                }
            );
        };

        const handleIntroComplete = () => {
            startAnimation();
        };

        if (
            document.documentElement.dataset.picknovateIntro === "playing"
        ) {
            window.addEventListener(
                "picknovate:intro-complete",
                handleIntroComplete
            );
        } else {
            startAnimation();
        }

        return () => {
            window.removeEventListener(
                "picknovate:intro-complete",
                handleIntroComplete
            );

            mm.revert();
        };
    }, []);

    return (
        <h1
            ref={headingRef}
            className="mt-8 text-[clamp(2.25rem,9.5vw,4.5rem)] font-medium leading-[1.05] tracking-tight lg:text-[84px]"
        >
            <span className="block overflow-hidden">
                <span className="hero-reveal-line block">
                    Less admin.
                </span>
            </span>

            <span className="block overflow-hidden">
                <span className="hero-reveal-line block">
                    Faster Workflow.
                </span>
            </span>
        </h1>
    );
}
