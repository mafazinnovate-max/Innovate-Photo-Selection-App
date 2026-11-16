
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPageSmoothScroll() {
    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        let lenis: Lenis | null = null;

        const startLenis = () => {
            if (lenis || mediaQuery.matches) return;

            lenis = new Lenis({
                autoRaf: false,
                lerp: 0.1,
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 1,
            });

            lenis.on("scroll", ScrollTrigger.update);

            const update = (time: number) => {
                lenis?.raf(time * 1000);
            };

            gsap.ticker.add(update);
            gsap.ticker.lagSmoothing(0);

            (lenis as Lenis & { __gsapUpdate?: (time: number) => void })
                .__gsapUpdate = update;
        };

        const stopLenis = () => {
            if (!lenis) return;

            const update = (
                lenis as Lenis & { __gsapUpdate?: (time: number) => void }
            ).__gsapUpdate;

            if (update) {
                gsap.ticker.remove(update);
            }

            lenis.off("scroll", ScrollTrigger.update);
            lenis.destroy();
            lenis = null;

            gsap.ticker.lagSmoothing(500, 33);
        };

        const handleMotionPreference = () => {
            if (mediaQuery.matches) {
                stopLenis();
            } else {
                startLenis();
            }

            ScrollTrigger.refresh();
        };

        startLenis();

        mediaQuery.addEventListener("change", handleMotionPreference);

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleMotionPreference
            );

            stopLenis();
        };
    }, []);

    return null;
}
