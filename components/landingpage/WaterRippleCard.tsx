"use client";

import {
    useCallback,
    useEffect,
    useRef,
    type MouseEvent,
    type PointerEvent,
    type ReactNode,
} from "react";
import { motion, type HTMLMotionProps } from "motion/react";

/**
 * WaterRippleCard
 * Wrap ONLY the yellow CTA card with this. It renders a <div> that takes your
 * existing className, so size, padding, radius, colour and alignment stay
 * exactly as they are. The water layer is absolutely positioned behind the
 * content, never takes pointer events, and only runs after a click or tap.
 */

// ---- Tuning ---------------------------------------------------------------
const CELL = 4; // px per simulation cell (bigger = lighter, softer)
const STEPS_PER_FRAME = 2; // wave speed (about 340px/s at CELL 4)
const DAMPING = 0.988; // closer to 1 = longer ripple
const IMPULSE = 26; // stone strength (lower = gentler)
const SIGMA = 9; // stone size in cells (bigger = softer, wider rings)
const ALPHA_GAIN = 0.16; // how visible the rings are
const MAX_ALPHA = 0.6;
const MOVE_IMPULSE = 0.6; // brush strength per drop (lower = subtler)
const MOVE_SIGMA = 8; // brush width in cells (bigger = smoother, wider wake)
const MOVE_SPACING = 6; // px between drops along the cursor path (smaller = smoother line)
const MOVE_MAX_DROPS = 10; // safety cap per mouse event
const MOVE_FULL_SPEED = 0.9; // cursor speed (px/ms) that gives the full brush strength
const CREST = [255, 232, 150]; // light side of a wave (on #FFC93C)
const TROUGH = [205, 140, 0]; // shadow side of a wave
// ---------------------------------------------------------------------------

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
    children: ReactNode;
};

type Sim = {
    w: number;
    h: number;
    cur: Float32Array;
    prev: Float32Array;
    img: ImageData | null;
    raf: number;
    running: boolean;
};

export default function WaterRippleCard({
    children,
    className = "",
    onPointerDown: userPointerDown,
    onClick: userClick,
    onPointerMove: userPointerMove,
    onPointerLeave: userPointerLeave,
    ...rest
}: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const lastMove = useRef({ x: 0, y: 0, t: 0, has: false });
    const sim = useRef<Sim>({
        w: 0,
        h: 0,
        cur: new Float32Array(0),
        prev: new Float32Array(0),
        img: null,
        raf: 0,
        running: false,
    });

    const resize = useCallback(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;
        const r = wrap.getBoundingClientRect();
        const w = Math.max(4, Math.ceil(r.width / CELL));
        const h = Math.max(4, Math.ceil(r.height / CELL));
        const s = sim.current;
        if (w === s.w && h === s.h) return;
        canvas.width = w;
        canvas.height = h;
        s.w = w;
        s.h = h;
        s.cur = new Float32Array(w * h);
        s.prev = new Float32Array(w * h);
        s.img = canvas.getContext("2d")?.createImageData(w, h) ?? null;
    }, []);

    useEffect(() => {
        resize();
        const wrap = wrapRef.current;
        if (!wrap) return;
        const ro = new ResizeObserver(resize);
        ro.observe(wrap);
        const s = sim.current;
        return () => {
            ro.disconnect();
            cancelAnimationFrame(s.raf);
        };
    }, [resize]);

    const loop = useCallback(() => {
        const s = sim.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx || !s.img) {
            s.running = false;
            return;
        }
        const { w, h } = s;

        for (let k = 0; k < STEPS_PER_FRAME; k++) {
            const { cur, prev } = s;
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const i = y * w + x;
                    prev[i] =
                        ((cur[i - 1] + cur[i + 1] + cur[i - w] + cur[i + w]) * 0.5 -
                            prev[i]) *
                        DAMPING;
                }
            }
            s.cur = prev;
            s.prev = cur;
        }

        const { cur } = s;
        const data = s.img.data;
        let energy = 0;
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = y * w + x;
                const slope = cur[i - 1] - cur[i + 1] + (cur[i - w] - cur[i + w]);
                const a = MAX_ALPHA * (1 - Math.exp(-Math.abs(slope) * ALPHA_GAIN)); // soft curve, no hard edges
                const c = slope > 0 ? CREST : TROUGH;
                const p = i * 4;
                data[p] = c[0];
                data[p + 1] = c[1];
                data[p + 2] = c[2];
                data[p + 3] = a * 255;
                const m = Math.abs(cur[i]);
                if (m > energy) energy = m;
            }
        }
        ctx.putImageData(s.img, 0, 0);

        if (energy > 0.05) {
            s.raf = requestAnimationFrame(loop);
        } else {
            s.running = false;
            ctx.clearRect(0, 0, w, h);
            s.cur.fill(0);
            s.prev.fill(0);
        }
    }, []);

    const ripple = useCallback(
        (clientX: number, clientY: number, strength = IMPULSE, sigma = SIGMA) => {
            const wrap = wrapRef.current;
            if (!wrap) return;
            const rect = wrap.getBoundingClientRect();

            // Reduced motion: one soft ring
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                const ring = ringRef.current;
                if (ring) {
                    ring.style.left = `${clientX - rect.left}px`;
                    ring.style.top = `${clientY - rect.top}px`;
                    ring.animate(
                        [
                            { transform: "translate(-50%,-50%) scale(0.2)", opacity: 0.5 },
                            { transform: "translate(-50%,-50%) scale(1)", opacity: 0 },
                        ],
                        { duration: 700, easing: "ease-out" }
                    );
                }
                return;
            }

            resize();
            const s = sim.current;
            if (!s.img) return;
            const { w, h, cur } = s;
            const gx = ((clientX - rect.left) / rect.width) * w;
            const gy = ((clientY - rect.top) / rect.height) * h;
            const r = Math.ceil(sigma * 3);
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    const x = Math.round(gx + dx);
                    const y = Math.round(gy + dy);
                    if (x < 1 || y < 1 || x > w - 2 || y > h - 2) continue;
                    const i = y * w + x;
                    cur[i] = Math.max(
                        -60,
                        cur[i] - strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma))
                    );
                }
            }

            if (!s.running) {
                s.running = true;
                s.raf = requestAnimationFrame(loop);
            }
        },
        [loop, resize]
    );

    // Mouse, touch and pen. Never blocks the click, so links and buttons work as before.
    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        userPointerDown?.(e);
        if (e.pointerType === "mouse" && e.button !== 0) return;
        ripple(e.clientX, e.clientY);
    };

    // Keyboard activation (Enter or Space on a focused button or link): ripple from its centre
    const onClick = (e: MouseEvent<HTMLDivElement>) => {
        userClick?.(e);
        if (e.detail !== 0) return;
        const t = (e.target as HTMLElement).getBoundingClientRect();
        ripple(t.left + t.width / 2, t.top + t.height / 2);
    };

    // Moving the mouse across the card leaves a soft wake behind the cursor
    const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        userPointerMove?.(e);
        if (e.pointerType !== "mouse") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const m = lastMove.current;
        const now = performance.now();
        if (!m.has) {
            m.x = e.clientX;
            m.y = e.clientY;
            m.t = now;
            m.has = true;
            return;
        }
        const dx = e.clientX - m.x;
        const dy = e.clientY - m.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return;
        const speed = dist / Math.max(1, now - m.t);
        // Slow brush = barely a ripple, quicker brush = a stronger wake
        const k = Math.min(1, Math.max(0.12, speed / MOVE_FULL_SPEED));
        const drops = Math.min(MOVE_MAX_DROPS, Math.max(1, Math.round(dist / MOVE_SPACING)));
        const gap = dist / drops;
        const strength = MOVE_IMPULSE * k * (gap / MOVE_SPACING);
        // Lay drops along the whole path so the wake is one smooth line, not separate rings
        for (let n = 1; n <= drops; n++) {
            const f = n / drops;
            ripple(m.x + dx * f, m.y + dy * f, strength, MOVE_SIGMA);
        }
        m.x = e.clientX;
        m.y = e.clientY;
        m.t = now;
    };

    const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
        userPointerLeave?.(e);
        lastMove.current.has = false;
    };

    return (
        <motion.div
            {...rest}
            ref={wrapRef}
            onPointerDown={onPointerDown}
            onClick={onClick}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className={`relative isolate ${className}`}
        >
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-[inherit] blur-[0.6px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
            >
                <div
                    ref={ringRef}
                    className="absolute h-[320px] w-[320px] rounded-full border-2 border-[#14161A]/20 opacity-0"
                />
            </div>
            {children}
        </motion.div>
    );
}