"use client";

import { useEffect, useId, useRef } from "react";

/**
 * KoiPond
 * Drop this as the FIRST child inside <WaterRippleCard>. WaterRippleCard is not edited.
 *
 * - Sits at -z-20, under WaterRippleCard's ripple canvas (-z-10), so the click and
 *   cursor ripples still draw on top of the koi.
 * - pointer-events: none. Clicks, links and the ripple behave exactly as before.
 *   (It only listens, passively, to pointerdown on the card to make nearby koi dart away.)
 * - The koi swim a smooth loop around the whole card. One requestAnimationFrame loop
 *   writes SVG transforms directly, with no React re-renders. It pauses when the card
 *   is off-screen or the tab is hidden.
 * - prefers-reduced-motion: koi and flowers are drawn still, no loop.
 */

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const wrapPi = (a: number) => {
    while (a > Math.PI) a -= TAU;
    while (a < -Math.PI) a += TAU;
    return a;
};

// ---- Tuning ---------------------------------------------------------------
const SIZE_A = 0.6; // koi 1 size (1 = original drawing, 220px long)
const SIZE_B = 0.5; // koi 2 size
const SIZE_SMALL = 0.38; // the single koi on phones
const SPEED_A = 52; // px/s cruising speed, koi 1 (a lap takes about 45s on desktop)
const SPEED_B = 46; // px/s cruising speed, koi 2
const TURN_RATE = 1.3; // max turn in rad/s (lower = wider corners)
const LOOKAHEAD = 90; // px ahead on the loop that the koi aims at (bigger = smoother, looser)
const LOOP_INSET = 0.2; // how far the loop sits inside the card edge (fraction of the short side)
const SCARE_RADIUS = 240; // px: how close a click must be to startle a koi
// ---------------------------------------------------------------------------

const N = 240; // points that describe the loop

type Fish = {
    x: number;
    y: number;
    h: number; // heading, radians
    av: number; // angular velocity, rad/s
    speed: number;
    base: number;
    idx: number; // where the koi is on the loop
    phase: number;
    size: number;
    boost: number;
    fleeUntil: number;
    fx: number;
    fy: number;
};

type Decor = {
    kind: "pad" | "lotus" | "pod";
    fx: number;
    fy: number;
    rot: number;
    s: number;
    ph: number;
    sm?: { fx: number; fy: number; s: number }; // phone layout. No sm = hidden on phones
};

const DECOR: Decor[] = [
    { kind: "pad", fx: 0.49, fy: 0.02, rot: 20, s: 1.05, ph: 0 },
    { kind: "lotus", fx: 0.52, fy: 0.14, rot: 0, s: 0.55, ph: 0.6 },
    { kind: "pad", fx: 0.63, fy: 0.96, rot: 200, s: 1.1, ph: 1.7 },
    { kind: "lotus", fx: 0.615, fy: 0.79, rot: 0, s: 1, ph: 2.3 },
    { kind: "pad", fx: 0.975, fy: 0.09, rot: 165, s: 1, ph: 3.1, sm: { fx: 0.93, fy: 0.06, s: 0.7 } },
    { kind: "lotus", fx: 0.972, fy: 0.118, rot: 0, s: 0.62, ph: 3.7, sm: { fx: 0.9, fy: 0.075, s: 0.5 } },
    { kind: "pad", fx: 0.94, fy: 0.99, rot: 250, s: 0.9, ph: 4.4, sm: { fx: 0.86, fy: 0.97, s: 0.7 } },
    { kind: "pod", fx: 0.88, fy: 0.88, rot: 0, s: 1, ph: 5.2 },
];

/** One koi, head toward +x. Drawn inline so its tail can be swung from the loop. */
function KoiShape({ id, tailRef }: { id: (n: string) => string; tailRef: (el: SVGGElement | null) => void }) {
    return (
        <>
                    <use href={`#${id("kb")}`} transform="translate(9 15)" fill="#17181D" opacity="0.13" />
                    <g ref={tailRef}>
                        <path d="M-96,0 C-112,-8 -128,-26 -170,-46 C-158,-26 -156,-12 -150,0 C-156,12 -158,26 -170,46 C-128,26 -112,8 -96,0 Z" fill="#EF6B5B" opacity="0.88" />
                        <path d="M-100,0 L-164,-38 M-100,0 L-156,-18 M-100,0 L-152,0 M-100,0 L-156,18 M-100,0 L-164,38" stroke="#D93B30" strokeWidth="0.9" fill="none" opacity="0.7" />
                    </g>
                    <path d="M64,21 C52,43 30,57 4,55 C22,43 34,31 42,18 Z" fill="#EF6B5B" opacity="0.9" />
                    <path d="M64,-21 C52,-43 30,-57 4,-55 C22,-43 34,-31 42,-18 Z" fill="#EF6B5B" opacity="0.9" />
                    <path d="M60,22 L12,50 M52,20 L22,52 M60,-22 L12,-50 M52,-20 L22,-52" stroke="#D93B30" strokeWidth="0.8" opacity="0.6" />
                    <path d="M-18,21 C-26,34 -40,41 -54,39 C-44,31 -36,25 -28,17 Z" fill="#EF6B5B" opacity="0.85" />
                    <path d="M-18,-21 C-26,-34 -40,-41 -54,-39 C-44,-31 -36,-25 -28,-17 Z" fill="#EF6B5B" opacity="0.85" />
                    <use href={`#${id("kb")}`} fill={`url(#${id("kg")})`} />
                    <g clipPath={`url(#${id("kc")})`}>
                        <rect x="-110" y="-30" width="230" height="60" fill={`url(#${id("sc")})`} opacity="0.22" />
                        <path d="M52,-28 C70,-26 76,-8 64,6 C54,16 34,14 30,2 C26,-12 36,-27 52,-28 Z" fill="#F4F1EA" />
                        <path d="M-6,-12 C8,-22 26,-18 24,-4 C22,10 2,20 -10,10 C-18,2 -14,-6 -6,-12 Z" fill="#F4F1EA" />
                        <path d="M-60,-10 C-48,-18 -34,-12 -36,2 C-38,14 -56,14 -66,6 Z" fill="#F4F1EA" />
                        <ellipse cx="14" cy="14" rx="9" ry="6" fill="#EF7B3A" opacity="0.9" />
                        <circle cx="50" cy="-4" r="3" fill="#17181D" opacity="0.75" />
                        <circle cx="-18" cy="-2" r="2.4" fill="#17181D" opacity="0.7" />
                        <circle cx="-48" cy="2" r="2" fill="#17181D" opacity="0.65" />
                        <ellipse cx="20" cy="-17" rx="70" ry="4.5" fill="#fff" opacity="0.2" />
                        <path d="M-100,0 L112,0" stroke="#8F1F1A" strokeWidth="1.2" opacity="0.28" />
                    </g>
                    <path d="M74,-20 C70,-8 70,8 74,20" fill="none" stroke="#8F1F1A" strokeWidth="1.2" opacity="0.4" />
                    <path d="M118,0 L128,-6 M118,0 L128,6" stroke="#B02A20" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="96" cy="-14" r="4" fill="#17181D" />
                    <circle cx="96" cy="14" r="4" fill="#17181D" />
                    <circle cx="97.2" cy="-15.2" r="1.1" fill="#F4F1EA" />
                    <circle cx="97.2" cy="12.8" r="1.1" fill="#F4F1EA" />
        </>
    );
}

export default function KoiPond() {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const id = (n: string) => `${uid}-${n}`;

    const rootRef = useRef<HTMLDivElement>(null);
    const koiRefs = useRef<(SVGGElement | null)[]>([]);
    const tailRefs = useRef<(SVGGElement | null)[]>([]);
    const decorRefs = useRef<(SVGGElement | null)[]>([]);

    useEffect(() => {
        const root = rootRef.current;
        const parent = root?.parentElement;
        if (!root || !parent) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let w = 0;
        let h = 0;
        let small = false;
        let scale = 1;
        let t = 0;
        let raf = 0;
        let visible = true;
        let last = 0;
        let ready = false;

        // The loop: a rounded rectangle that runs around the full card
        const px = new Float32Array(N);
        const py = new Float32Array(N);
        const cum = new Float32Array(N + 1);

        const fish: Fish[] = [
            { x: 0, y: 0, h: 0, av: 0, speed: SPEED_A, base: SPEED_A, idx: 0, phase: 0, size: SIZE_A, boost: 0, fleeUntil: 0, fx: 0, fy: 0 },
            { x: 0, y: 0, h: 0, av: 0, speed: SPEED_B, base: SPEED_B, idx: N / 2, phase: 2.1, size: SIZE_B, boost: 0, fleeUntil: 0, fx: 0, fy: 0 },
        ];

        const activeCount = () => (small ? 1 : 2);

        const buildLoop = () => {
            const inset = clamp(Math.min(w, h) * LOOP_INSET, 30, 70);
            const a = Math.max(20, w / 2 - inset);
            const b = Math.max(20, h / 2 - inset);
            for (let i = 0; i < N; i++) {
                const th = (i / N) * TAU;
                const c = Math.cos(th);
                const s = Math.sin(th);
                // superellipse (n = 4): a smooth rounded rectangle
                px[i] = w / 2 + a * Math.sign(c) * Math.sqrt(Math.abs(c));
                py[i] = h / 2 + b * Math.sign(s) * Math.sqrt(Math.abs(s));
            }
            cum[0] = 0;
            for (let i = 0; i < N; i++) {
                const j = (i + 1) % N;
                cum[i + 1] = cum[i] + Math.hypot(px[j] - px[i], py[j] - py[i]);
            }
        };

        // Point on the loop `dist` px ahead of index i
        const ahead = (i: number, dist: number) => {
            let left = dist;
            for (let n = 0; n < N; n++) {
                const k = (i + n) % N;
                const nk = (k + 1) % N;
                const seg = cum[k + 1] - cum[k];
                if (left <= seg || n === N - 1) {
                    const f = seg > 0 ? clamp(left / seg, 0, 1) : 0;
                    return { x: px[k] + (px[nk] - px[k]) * f, y: py[k] + (py[nk] - py[k]) * f };
                }
                left -= seg;
            }
            return { x: px[i], y: py[i] };
        };

        const nearest = (x: number, y: number, from: number, range: number) => {
            let best = from;
            let bestD = Infinity;
            for (let o = -range; o <= range; o++) {
                const k = (((from + o) % N) + N) % N;
                const d = (px[k] - x) * (px[k] - x) + (py[k] - y) * (py[k] - y);
                if (d < bestD) {
                    bestD = d;
                    best = k;
                }
            }
            return best;
        };

        const place = (f: Fish) => {
            f.x = px[f.idx];
            f.y = py[f.idx];
            const p = ahead(f.idx, LOOKAHEAD);
            f.h = Math.atan2(p.y - f.y, p.x - f.x);
            f.av = 0;
        };

        const layout = () => {
            const r = root.getBoundingClientRect();
            if (r.width < 10 || r.height < 10) return;
            w = r.width;
            h = r.height;
            small = w < 640;
            scale = small ? 1 : clamp(w / 1136, 0.85, 1.15);
            fish[0].size = (small ? SIZE_SMALL : SIZE_A) * (small ? 1 : scale);
            fish[1].size = SIZE_B * scale;
            fish[0].base = SPEED_A * (small ? 0.7 : 1);
            buildLoop();
            if (!ready) {
                ready = true;
                fish.forEach(place);
            } else {
                fish.forEach((f) => {
                    f.fleeUntil = 0;
                    f.idx = nearest(f.x, f.y, f.idx, N / 2);
                    place(f);
                });
            }
        };

        const step = (dt: number) => {
            const n = activeCount();
            for (let i = 0; i < n; i++) {
                const f = fish[i];
                const fleeing = t < f.fleeUntil;

                let tx: number;
                let ty: number;
                if (fleeing) {
                    tx = f.fx;
                    ty = f.fy;
                } else {
                    const p = ahead(f.idx, LOOKAHEAD * (small ? 0.7 : 1));
                    tx = p.x;
                    ty = p.y;
                }
                let vx = tx - f.x;
                let vy = ty - f.y;
                const len = Math.hypot(vx, vy) || 1;
                vx /= len;
                vy /= len;

                const wm = 30;
                if (f.x < wm) vx += (wm - f.x) / wm;
                if (f.x > w - wm) vx -= (f.x - (w - wm)) / wm;
                if (f.y < wm) vy += (wm - f.y) / wm;
                if (f.y > h - wm) vy -= (f.y - (h - wm)) / wm;

                // Smooth steering: angular velocity eases toward what is needed
                const diff = wrapPi(Math.atan2(vy, vx) - f.h);
                const maxTurn = TURN_RATE + f.boost / 70;
                const wantAv = clamp(diff * 2, -maxTurn, maxTurn);
                f.av += (wantAv - f.av) * Math.min(1, dt * 3.5);
                f.h += f.av * dt;

                // Slow slightly in tight turns, burst forward after a startle
                const cruise = f.base * (1 - 0.3 * Math.min(1, Math.abs(f.av) / TURN_RATE));
                f.speed += (cruise + f.boost - f.speed) * Math.min(1, dt * 2.5);
                f.boost *= Math.exp(-dt * 1.7);

                f.x = clamp(f.x + Math.cos(f.h) * f.speed * dt, -20, w + 20);
                f.y = clamp(f.y + Math.sin(f.h) * f.speed * dt, -20, h + 20);

                // Track progress along the loop. After a startle, rejoin it from wherever the koi is.
                f.idx = fleeing ? nearest(f.x, f.y, f.idx, N / 2) : nearest(f.x, f.y, f.idx, 12);
            }
        };

        const draw = () => {
            const n = activeCount();
            for (let i = 0; i < 2; i++) {
                const g = koiRefs.current[i];
                const tail = tailRefs.current[i];
                if (!g) continue;
                if (i >= n) {
                    g.setAttribute("display", "none");
                    continue;
                }
                g.removeAttribute("display");
                const f = fish[i];
                const omega = TAU * (0.9 + f.speed / 60);
                const wob = Math.sin(t * omega + f.phase);
                const deg = (f.h * 180) / Math.PI + Math.sin(t * omega + f.phase + 1.57) * 2;
                g.setAttribute("transform", `translate(${f.x.toFixed(2)} ${f.y.toFixed(2)}) rotate(${deg.toFixed(2)}) scale(${f.size.toFixed(3)})`);
                if (tail) {
                    const swing = wob * (10 + Math.min(8, Math.abs(f.av) * 8)) - f.av * 6;
                    tail.setAttribute("transform", `rotate(${swing.toFixed(2)} -96 0)`);
                }
            }
            DECOR.forEach((d, i) => {
                const g = decorRefs.current[i];
                if (!g) return;
                if (small && !d.sm) {
                    g.setAttribute("display", "none");
                    return;
                }
                g.removeAttribute("display");
                const fx = small && d.sm ? d.sm.fx : d.fx;
                const fy = small && d.sm ? d.sm.fy : d.fy;
                const s = (small && d.sm ? d.sm.s : d.s) * (small ? 1 : scale);
                const bob = reduce ? 0 : Math.sin(t * 1.05 + d.ph) * 3;
                const drift = reduce ? 0 : Math.sin(t * 0.6 + d.ph) * 1.5;
                g.setAttribute(
                    "transform",
                    `translate(${(fx * w + drift).toFixed(2)} ${(fy * h + bob).toFixed(2)}) rotate(${d.rot}) scale(${s.toFixed(3)})`
                );
            });
        };

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            t += dt;
            step(dt);
            draw();
        };

        const start = () => {
            if (reduce || raf || !visible || !ready) return;
            last = performance.now();
            raf = requestAnimationFrame(frame);
        };
        const stop = () => {
            cancelAnimationFrame(raf);
            raf = 0;
        };

        layout();
        draw();
        if (!reduce) start();

        const ro = new ResizeObserver(() => {
            layout();
            draw();
            start();
        });
        ro.observe(root);

        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
        });
        io.observe(root);

        // Startle: a click near a koi makes it dart away, then it rejoins the loop.
        // Passive and read-only, so the ripple, links and buttons are not affected.
        const onDown = (e: PointerEvent) => {
            if (reduce || !ready) return;
            const r = root.getBoundingClientRect();
            const cx = e.clientX - r.left;
            const cy = e.clientY - r.top;
            for (let i = 0; i < activeCount(); i++) {
                const f = fish[i];
                const dx = f.x - cx;
                const dy = f.y - cy;
                const d = Math.hypot(dx, dy);
                if (d > SCARE_RADIUS) continue;
                const p = 1 - d / SCARE_RADIUS;
                f.boost = Math.max(f.boost, 60 + 100 * p);
                const nx = dx / (d || 1);
                const ny = dy / (d || 1);
                f.fx = clamp(f.x + nx * 220, 40, w - 40);
                f.fy = clamp(f.y + ny * 220, 40, h - 40);
                f.fleeUntil = t + 1.4;
            }
        };
        parent.addEventListener("pointerdown", onDown, { passive: true });

        return () => {
            stop();
            ro.disconnect();
            io.disconnect();
            parent.removeEventListener("pointerdown", onDown);
        };
    }, []);

    return (
        <div
            ref={rootRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 overflow-hidden rounded-[inherit]"
        >
            <svg width="100%" height="100%" className="absolute inset-0 block">
                <defs>
                    <path
                        id={id("kb")}
                        d="M118,0 C112,-14 90,-25 60,-27 C20,-29 -30,-21 -70,-9 C-86,-5 -96,-3 -104,0 C-96,3 -86,5 -70,9 C-30,21 20,29 60,27 C90,25 112,14 118,0 Z"
                    />
                    <clipPath id={id("kc")}>
                        <use href={`#${id("kb")}`} />
                    </clipPath>
                    <linearGradient id={id("kg")} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#E9614B" />
                        <stop offset="0.5" stopColor="#D93B30" />
                        <stop offset="1" stopColor="#B02A20" />
                    </linearGradient>
                    <pattern id={id("sc")} width="9" height="7" patternUnits="userSpaceOnUse">
                        <path d="M0,7 Q4.5,0 9,7" fill="none" stroke="#7A1812" strokeWidth="0.8" />
                    </pattern>

                    <path id={id("pt")} d="M0,0 C-11,-12 -13,-30 0,-50 C13,-30 11,-12 0,0 Z" />
                    <g id={id("lot")}>
                        <circle cx="6" cy="9" r="46" fill="#17181D" opacity="0.13" />
                        <g fill="#F7B0BC" stroke="#E8708A" strokeWidth="0.9" strokeLinejoin="round">
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                                <use key={a} href={`#${id("pt")}`} transform={`rotate(${a})`} />
                            ))}
                        </g>
                        <g transform="scale(.74) rotate(22.5)" fill="#F9C2CB" stroke="#E8708A" strokeWidth="1" strokeLinejoin="round">
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                                <use key={a} href={`#${id("pt")}`} transform={`rotate(${a})`} />
                            ))}
                        </g>
                        <g transform="scale(.46)" fill="#FBD3D9" stroke="#E8708A" strokeWidth="1.4" strokeLinejoin="round">
                            {[0, 60, 120, 180, 240, 300].map((a) => (
                                <use key={a} href={`#${id("pt")}`} transform={`rotate(${a})`} />
                            ))}
                        </g>
                        <circle r="9" fill="#E8708A" opacity="0.75" />
                        <circle r="5" fill="#F6D365" />
                    </g>

                    <path id={id("pp")} d="M0,0 L56,-16 A58,58 0 1 0 56,16 Z" />
                    <g id={id("pad")}>
                        <use href={`#${id("pp")}`} transform="translate(6 9)" fill="#17181D" opacity="0.13" />
                        <use href={`#${id("pp")}`} fill="#3E9B5E" stroke="#2A7D4B" strokeWidth="3" strokeLinejoin="round" />
                        <g fill="none" stroke="#7FCB7A" strokeWidth="2.2" strokeLinecap="round" opacity="0.75">
                            <path d="M-18,-8 A20,20 0 0 1 8,-20" />
                            <path d="M-30,6 A32,32 0 0 1 -6,-32" />
                            <path d="M-40,18 A44,44 0 0 1 -20,-38" />
                        </g>
                    </g>

                    <g id={id("pod")}>
                        <circle cx="4" cy="6" r="10" fill="#17181D" opacity="0.13" />
                        <circle r="10" fill="#6FBF7F" />
                        <g fill="#2A7D4B">
                            <circle cx="-4" cy="-4" r="1.8" />
                            <circle cx="4" cy="-4" r="1.8" />
                            <circle cx="-4" cy="4" r="1.8" />
                            <circle cx="4" cy="4" r="1.8" />
                            <circle r="1.8" />
                        </g>
                    </g>
                </defs>

                {/* Koi swim under the pads and flowers */}
                {[0, 1].map((i) => (
                    <g key={`k${i}`} ref={(el) => { koiRefs.current[i] = el; }} display="none">
                        <KoiShape id={id} tailRef={(el) => { tailRefs.current[i] = el; }} />
                    </g>
                ))}

                {DECOR.map((d, i) => (
                    <g key={`d${i}`} ref={(el) => { decorRefs.current[i] = el; }}>
                        <use href={`#${id(d.kind === "pad" ? "pad" : d.kind === "lotus" ? "lot" : "pod")}`} />
                    </g>
                ))}
            </svg>
        </div>
    );
}