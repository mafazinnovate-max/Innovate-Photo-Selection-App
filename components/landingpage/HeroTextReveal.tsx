"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroTextReveal() {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const heading = headingRef.current;
        if (!heading) return;

        const lines = heading.querySelectorAll(".hero-reveal-line");
        const interactiveLines = heading.querySelectorAll(
            ".hero-interactive-line"
        );
        const mm = gsap.matchMedia();

        let started = false;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // Push letters away from the cursor.
        const moveLetters = (
            line: HTMLElement,
            clientX: number,
            clientY: number,
            strength: number,
            radius: number
        ) => {
            const letters = line.querySelectorAll<HTMLElement>(
                ".hero-letter"
            );

            letters.forEach((letter) => {
                const rect = letter.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const dx = centerX - clientX;
                const dy = centerY - clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance >= radius || distance === 0) {
                    gsap.to(letter, {
                        x: 0,
                        y: 0,
                        rotation: 0,
                        duration: 0.22,
                        ease: "power2.out",
                        overwrite: "auto",
                    });
                    return;
                }

                const force = Math.pow(1 - distance / radius, 2);
                const pushX = (dx / distance) * strength * force;
                const pushY = (dy / distance) * strength * force;

                gsap.to(letter, {
                    x: pushX,
                    y: pushY,
                    rotation: (dx / distance) * 5 * force,
                    duration: 0.18,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            });
        };

        const resetLetters = (line: HTMLElement) => {
            const letters = line.querySelectorAll<HTMLElement>(
                ".hero-letter"
            );

            gsap.to(letters, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 0.3,
                ease: "power3.out",
                overwrite: "auto",
            });
        };

        const handlePointerMove = (event: Event) => {
            if (prefersReducedMotion) return;

            const pointerEvent = event as PointerEvent;
            const line = pointerEvent.currentTarget as HTMLElement;

            moveLetters(
                line,
                pointerEvent.clientX,
                pointerEvent.clientY,
                24,
                100
            );
        };

        const handlePointerLeave = (event: Event) => {
            if (prefersReducedMotion) return;

            const line = event.currentTarget as HTMLElement;
            resetLetters(line);
        };

        // Clicking any line shakes all three lines together.
        const handleClick = () => {
    if (prefersReducedMotion) return;

    const allLetters = heading.querySelectorAll<HTMLElement>(
        ".hero-letter"
    );

    gsap.killTweensOf(allLetters);

    const timeline = gsap.timeline();

    // Spread letters outward from the center of each line.
    timeline.to(allLetters, {
        x: (_index: number, target: HTMLElement) => {
            const line = target.parentElement;
            if (!line) return 0;

            const letters = Array.from(line.children);
            const index = letters.indexOf(target);
            const center = (letters.length - 1) / 2;

            return (index - center) * 6;
        },
        duration: 0.22,
        ease: "power3.out",
    });

    // Return all letters to their original positions.
    timeline.to(allLetters, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
    });
};

        interactiveLines.forEach((line) => {
            line.addEventListener("pointermove", handlePointerMove);
            line.addEventListener("pointerleave", handlePointerLeave);
            line.addEventListener("click", handleClick);
        });

        // Original entrance reveal — unchanged.
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
            interactiveLines.forEach((line) => {
                line.removeEventListener("pointermove", handlePointerMove);
                line.removeEventListener("pointerleave", handlePointerLeave);
                line.removeEventListener("click", handleClick);
            });

            window.removeEventListener(
                "picknovate:intro-complete",
                handleIntroComplete
            );

            mm.revert();
        };
    }, []);

    const renderInteractiveText = (text: string) =>
        Array.from(text).map((character, index) => (
            <span
                key={`${character}-${index}`}
                className="hero-letter inline-block"
                style={{ whiteSpace: "pre" }}
            >
                {character}
            </span>
        ));

    return (
        <h1
            ref={headingRef}
            className="mt-8 text-[clamp(2.25rem,9.5vw,4.5rem)] font-medium leading-[1.05] tracking-tight lg:text-[84px]"
        >
            <span className="block overflow-hidden">
                <span className="hero-reveal-line block">
                    <span className="hero-interactive-line inline-block">
                        {renderInteractiveText("Less admin.")}
                    </span>
                </span>
            </span>

            <span className="block overflow-hidden">
                <span className="hero-reveal-line block">
                    <span className="hero-interactive-line inline-block">
                        {renderInteractiveText("Faster")}
                    </span>
                </span>
            </span>

            <span className="block overflow-hidden">
                <span className="hero-reveal-line block">
                    <span className="hero-interactive-line inline-block">
                        {renderInteractiveText("Workflow.")}
                    </span>
                </span>
            </span>
        </h1>
    );
}