
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const distance = 65 + ((i * 17) % 75);
    const size = i % 6 === 0 ? 3 : 2;

    return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size,
        warm: i % 7 === 0,
    };
});

export default function PicknovateIntro() {
    const rootRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<HTMLObjectElement>(null);

    const [visible, setVisible] = useState(false);
    const [svgReady, setSvgReady] = useState(false);

    // Start the intro and announce its initial state.
    useLayoutEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            document.documentElement.dataset.picknovateIntro = "complete";
            return;
        }

        document.documentElement.dataset.picknovateIntro = "playing";
        setVisible(true);
    }, []);

    // Lock background scrolling during the intro.
    useLayoutEffect(() => {
        if (!visible) return;

        const html = document.documentElement;
        const body = document.body;

        const previousHtmlOverflow = html.style.overflow;
        const previousBodyOverflow = body.style.overflow;

        html.style.overflow = "hidden";
        body.style.overflow = "hidden";

        return () => {
            html.style.overflow = previousHtmlOverflow;
            body.style.overflow = previousBodyOverflow;
        };
    }, [visible]);

    useLayoutEffect(() => {
        if (!visible || !svgReady) return;

        const root = rootRef.current;
        const svgObject = svgRef.current;

        if (!root || !svgObject) return;

        const svgDoc = svgObject.contentDocument;

        const completeIntro = () => {
            document.documentElement.dataset.picknovateIntro = "complete";

            window.dispatchEvent(
                new Event("picknovate:intro-complete")
            );

            setVisible(false);
        };

        if (!svgDoc) {
            console.error("Picknovate intro: SVG document could not be loaded.");
            completeIntro();
            return;
        }

        const whiteSymbol = svgDoc.getElementById("symbol-white");
        const upperGold = svgDoc.getElementById("symbol-gold-upper");
        const lowerGold = svgDoc.getElementById("symbol-gold-lower");
        const wordmark = svgDoc.getElementById("wordmark");

        if (!whiteSymbol || !upperGold || !lowerGold || !wordmark) {
            console.error("Picknovate intro: SVG logo layers are missing.");
            completeIntro();
            return;
        }

        const logoLayers = [
            whiteSymbol,
            upperGold,
            lowerGold,
            wordmark,
        ];

        const glow = root.querySelector(".intro-glow");
        const impact = root.querySelector(".intro-impact");
        const impactRing = root.querySelector(".intro-impact-ring");
        const impactFlash = root.querySelector(".intro-impact-flash");
        const sweep = root.querySelector(".intro-sweep");
        const flare = root.querySelector(".intro-flare");
        const line = root.querySelector(".intro-line");
        const tagline = root.querySelector(".intro-tagline");
        const particleElements = root.querySelectorAll(".intro-particle");

        const travelX = Math.max(window.innerWidth * 0.75, 450);
        const travelY = Math.max(window.innerHeight * 0.65, 400);

        const tl = gsap.timeline({
            onComplete: completeIntro,
        });

        gsap.set(whiteSymbol, {
            autoAlpha: 0,
            x: -travelX,
            y: -travelY * 0.08,
            rotation: -35,
            scale: 0.82,
            transformOrigin: "50% 50%",
        });

        gsap.set(upperGold, {
            autoAlpha: 0,
            x: travelX,
            y: -travelY,
            rotation: 55,
            scale: 0.72,
            transformOrigin: "50% 50%",
        });

        gsap.set(lowerGold, {
            autoAlpha: 0,
            x: travelX * 0.85,
            y: travelY,
            rotation: -40,
            scale: 0.78,
            transformOrigin: "50% 50%",
        });

        gsap.set(wordmark, {
            autoAlpha: 0,
            y: 35,
            scale: 0.94,
            transformOrigin: "50% 50%",
        });

        gsap.set(glow, {
            autoAlpha: 0,
            scale: 0.4,
        });

        gsap.set(impact, {
            autoAlpha: 1,
        });

        gsap.set(impactRing, {
            autoAlpha: 0,
            scale: 0.45,
        });

        gsap.set(impactFlash, {
            autoAlpha: 0,
            scale: 0.65,
        });

        gsap.set(flare, {
            autoAlpha: 0,
            scaleX: 0,
            transformOrigin: "center",
        });

        gsap.set(sweep, {
            xPercent: -180,
            autoAlpha: 0,
        });

        gsap.set(line, {
            scaleX: 0,
            transformOrigin: "center",
        });

        gsap.set(tagline, {
            autoAlpha: 0,
            y: 12,
        });

        gsap.set(particleElements, {
            autoAlpha: 0,
            scale: 0,
            x: 0,
            y: 0,
        });

        tl.to(glow, {
            autoAlpha: 0.55,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
        }, 0)

        // Logo pieces assemble from outside the screen.
        .to(whiteSymbol, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
        }, 0.25)

        .to(upperGold, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
        }, 0.55)

        .to(lowerGold, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
        }, 0.75)

        // A subtle settling motion after assembly.
        .to(upperGold, {
            rotation: -5,
            duration: 0.22,
            ease: "power2.out",
        }, 1.75)

        .to(upperGold, {
            rotation: 0,
            duration: 0.32,
            ease: "elastic.out(1, 0.55)",
        }, 1.97)

        .to(lowerGold, {
            scale: 1.025,
            duration: 0.22,
            ease: "power2.out",
        }, 1.75)

        .to(lowerGold, {
            scale: 1,
            duration: 0.35,
            ease: "power2.out",
        }, 1.97)

        // Soft impact glow behind the assembled logo.
        .to(impactFlash, {
            autoAlpha: 0.65,
            scale: 1.15,
            duration: 0.28,
            ease: "power2.out",
        }, 1.75)

        .to(impactFlash, {
            autoAlpha: 0,
            scale: 1.5,
            duration: 0.65,
            ease: "power2.out",
        }, 1.98)

        // Restrained translucent shockwave.
        .to(impactRing, {
            autoAlpha: 0.55,
            scale: 1.35,
            duration: 0.65,
            ease: "power2.out",
        }, 1.75)

        .to(impactRing, {
            autoAlpha: 0,
            scale: 1.65,
            duration: 0.4,
            ease: "power2.in",
        }, 2.15)

        // Dust particles spread out from the logo.
        .to(particleElements, {
            autoAlpha: 0.8,
            scale: 1,
            duration: 0.25,
            stagger: {
                each: 0.012,
                from: "random",
            },
            ease: "power2.out",
        }, 1.78)

        .to(particleElements, {
            x: (i) => particles[i].x,
            y: (i) => particles[i].y,
            autoAlpha: 0,
            scale: 0.25,
            duration: 0.9,
            stagger: {
                each: 0.008,
                from: "random",
            },
            ease: "power2.out",
        }, 1.95)

        // Wordmark appears after the symbol settles.
        .to(wordmark, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            ease: "power3.out",
        }, 2.05)

        // Soft reflection passes across the finished logo.
        .to(sweep, {
            xPercent: 420,
            autoAlpha: 0.7,
            duration: 0.8,
            ease: "power2.inOut",
        }, 2.4)

        .to(sweep, {
            autoAlpha: 0,
            duration: 0.2,
        }, 3.1)

        // A very subtle finishing light.
        .to(flare, {
            autoAlpha: 0.45,
            scaleX: 1,
            duration: 0.4,
            ease: "power2.out",
        }, 2.25)

        .to(flare, {
            autoAlpha: 0,
            duration: 0.45,
            ease: "power2.in",
        }, 2.65)

        .to(line, {
            scaleX: 1,
            duration: 0.5,
            ease: "power3.inOut",
        }, 2.8)

        .to(tagline, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
        }, 2.9)

        .to({}, {
            duration: 0.35,
        })

        .to(root, {
            autoAlpha: 0,
            scale: 1.025,
            duration: 0.55,
            ease: "power2.inOut",
        });

        return () => {
            tl.kill();

            gsap.killTweensOf(logoLayers);

            gsap.killTweensOf([
                glow,
                impact,
                impactRing,
                impactFlash,
                sweep,
                flare,
                line,
                tagline,
                ...Array.from(particleElements),
            ]);
        };
    }, [visible, svgReady]);

    if (!visible) return null;

    return (
        <div
            ref={rootRef}
            className="fixed inset-0 z-[100] flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#14161A]"
        >
            {/* Soft ambient background */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,241,234,0.055)_0%,transparent_55%)]" />

            <div className="intro-glow pointer-events-none absolute left-1/2 top-1/2 h-[min(75vw,580px)] w-[min(75vw,580px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F4F1EA]/10 blur-[110px]" />

            <div className="relative z-10 flex w-full flex-col items-center px-6">
                <div className="relative flex h-[min(78vw,370px)] w-[min(78vw,370px)] items-center justify-center">

                    {/* Soft impact reaction */}
                    <div className="intro-impact pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="intro-impact-ring h-[62%] w-[62%] rounded-full border border-[#F4F1EA]/25 shadow-[0_0_35px_rgba(244,241,234,0.08)]" />
                    </div>

                    <div className="intro-impact-flash pointer-events-none absolute inset-[15%] rounded-full bg-[radial-gradient(circle,rgba(244,241,234,0.16)_0%,rgba(244,241,234,0.035)_45%,transparent_75%)] blur-2xl" />

                    {/* Particle burst */}
                    {particles.map((particle) => (
                        <span
                            key={particle.id}
                            className={`intro-particle pointer-events-none absolute left-1/2 top-1/2 rounded-full ${
                                particle.warm
                                    ? "bg-[#D8C69B]"
                                    : "bg-[#F4F1EA]"
                            } shadow-[0_0_8px_rgba(244,241,234,0.35)]`}
                            style={{
                                width: particle.size,
                                height: particle.size,
                                marginLeft: -particle.size / 2,
                                marginTop: -particle.size / 2,
                            }}
                        />
                    ))}

                    {/* Logo */}
                    <div className="relative z-10 h-full w-full">
                        <object
                            ref={svgRef}
                            data="/picknovate-intro/logo-layers.svg"
                            type="image/svg+xml"
                            aria-label="Picknovate logo"
                            onLoad={() => setSvgReady(true)}
                            className="pointer-events-none h-full w-full"
                        />

                        {/* Soft white reflection */}
                        <div className="intro-flare pointer-events-none absolute left-[18%] right-[18%] top-1/2 h-px bg-gradient-to-r from-transparent via-[#F4F1EA]/80 to-transparent shadow-[0_0_12px_2px_rgba(244,241,234,0.2)]" />

                        <div className="intro-sweep pointer-events-none absolute inset-y-0 left-0 z-20 w-[38%] -skew-x-[22deg] bg-gradient-to-r from-transparent via-[#F4F1EA]/40 to-transparent blur-md" />
                    </div>
                </div>

                {/* Brand underline */}
                <div className="intro-line mt-5 h-px w-40 bg-gradient-to-r from-transparent via-[#F4F1EA]/60 to-transparent shadow-[0_0_10px_rgba(244,241,234,0.18)] sm:w-56" />

                {/* Tagline */}
                <p className="intro-tagline mt-5 text-center text-[9px] font-medium uppercase tracking-[0.35em] text-[#F4F1EA]/70 sm:text-[10px]">
                    Your creative business, simplified.
                </p>
            </div>

            {/* Cinematic edge shading */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.28)_100%)]" />
        </div>
    );
}
