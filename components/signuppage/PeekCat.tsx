"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// eye geometry in the cat's 158x237 viewBox
const EYES = [
  { cx: 55, cy: 110.5, rx: 16.5, ry: 17 },
  { cx: 105, cy: 111, rx: 13.5, ry: 17.5 },
];
const PUPIL = { rx: 5.5, ry: 8.5 };
const W = 158;

const CSS = `
.peek-cat img{display:block;width:100%;height:100%;user-select:none}
.peek-cat svg{position:absolute;inset:0;width:100%;height:100%}
.peek-cat .pupil{fill:#000}
.peek-cat .lid{fill:#000;transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);transition:transform 70ms ease-in}
.peek-cat[data-blink="true"] .lid{transform:scaleY(1)}
@media (max-width:899px){.peek-cat{display:none!important}}
`;

const BOX_STYLE: CSSProperties = {
  position: "fixed",
  left: "clamp(16px,5vw,96px)",
  bottom: 0,
  width: "clamp(150px,14vw,230px)",
  aspectRatio: "158/237",
  transformOrigin: "50% 100%",
  pointerEvents: "none",
  zIndex: 5,
};

export default function PeekCat() {
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cat = catRef.current;
    if (!cat) return;
    const pupils = Array.from(cat.querySelectorAll<SVGEllipseElement>(".pupil"));
    // reduced motion: pupils still follow the cursor, but no head tilt / blinking
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const target = { x: window.innerWidth * 0.6, y: window.innerHeight * 0.4 };
    const cur = EYES.map(() => ({ x: 0, y: 0 }));
    let tilt = 0;
    let raf = 0;
    let blinkTimer: ReturnType<typeof setTimeout>;

    const onMove = (e: PointerEvent) => {
      if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
      target.x = e.clientX;
      target.y = e.clientY;
    };
    // when an input is focused (keyboard / tab), look at it
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (!el.matches?.("input, textarea, select")) return;
      const r = el.getBoundingClientRect();
      target.x = r.left + Math.min(r.width * 0.3, 120);
      target.y = r.top + r.height / 2;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("focusin", onFocus);

    const tick = () => {
      const b = cat.getBoundingClientRect();
      // cat hidden / not laid out yet: skip this frame (avoids divide-by-zero -> NaN)
      if (!b.width) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const s = b.width / W;
      EYES.forEach((e, i) => {
        const dx = (target.x - (b.left + e.cx * s)) / s;
        const dy = (target.y - (b.top + e.cy * s)) / s;
        const d = Math.hypot(dx, dy) || 1;
        const p = Math.min(1, d / 70); // pupils ease to center when cursor is close
        const mx = e.rx - PUPIL.rx - 1.5;
        const my = e.ry - PUPIL.ry - 1.5;
        if (!Number.isFinite(cur[i].x) || !Number.isFinite(cur[i].y)) cur[i] = { x: 0, y: 0 };
        cur[i].x += ((dx / d) * mx * p - cur[i].x) * 0.22;
        cur[i].y += ((dy / d) * my * p - cur[i].y) * 0.22;
        // never write a bad number into the SVG
        if (Number.isFinite(cur[i].x) && Number.isFinite(cur[i].y)) {
          pupils[i]?.setAttribute("transform", `translate(${cur[i].x.toFixed(2)} ${cur[i].y.toFixed(2)})`);
        }
      });
      // slight head tilt toward the cursor
      const g = Math.max(-1, Math.min(1, (target.x - (b.left + b.width / 2)) / (window.innerWidth * 0.5))) * 3;
      tilt += (g - tilt) * 0.08;
      if (!reduce) cat.style.transform = `rotate(${tilt.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const blink = () => {
      cat.dataset.blink = "true";
      setTimeout(() => delete cat.dataset.blink, 150);
      blinkTimer = setTimeout(blink, 2500 + Math.random() * 3500);
    };
    if (!reduce) blink();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(blinkTimer);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <div className="peek-cat" ref={catRef} aria-hidden="true" style={BOX_STYLE}>
      <style>{CSS}</style>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/cat.png" alt="" draggable={false} />
      <svg viewBox="0 0 158 237">
        <defs>
          <clipPath id="peekcat-e0"><ellipse cx="55" cy="110.5" rx="16" ry="16.5" /></clipPath>
          <clipPath id="peekcat-e1"><ellipse cx="105" cy="111" rx="13" ry="17" /></clipPath>
        </defs>
        <g clipPath="url(#peekcat-e0)">
          <ellipse className="pupil" cx="55" cy="110.5" rx="5.5" ry="8.5" />
        </g>
        <g clipPath="url(#peekcat-e1)">
          <ellipse className="pupil" cx="105" cy="111" rx="5.5" ry="8.5" />
        </g>
        {/* eyelids sit outside the clip and are bigger than the eyes, so a closed eye shows no yellow rim */}
        <ellipse className="lid" cx="55" cy="111.2" rx="20.5" ry="21" />
        <ellipse className="lid" cx="105.5" cy="111.5" rx="17.5" ry="21" />
      </svg>
    </div>
  );
}