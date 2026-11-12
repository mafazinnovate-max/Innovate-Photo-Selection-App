"use client";

/*
  componants.tsx
  Everything animated lives in this one file:
    - ScrollReveal     word / letter text animation (the engine)
    - T                small text helper used all over the page (wraps ScrollReveal)
    - AnimatedContent  block / staggered children reveal
  Usage:  import { T, AnimatedContent } from "./componants";
*/

import {
  Children,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ------------------------------------------------------------------ */
/*  ScrollReveal                                                       */
/* ------------------------------------------------------------------ */

const SCRUB_SPAN = 0.5;
// Clip box for the "rise" effect. Generous enough that script-font swashes and descenders
// (the tail of "y", "g", "p" in Pinyon Script) are never cut off while a word rises.
const RISE_MASK = "inset(-0.5em -1em -0.4em -1em)";

// Elements that start playing within this window after mount are treated as part of the
// page-load intro, so their `wait` (choreography delay) applies. Later scroll reveals skip it.
const INTRO_WINDOW_MS = 1500;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Resolves once web fonts have settled (or after a safety timeout), so text never animates in
// with the fallback font and then swaps mid-animation. Shared by every element on the page.
let fontsGate: Promise<void> | null = null;
const fontsReady = (): Promise<void> => {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  if (!fontsGate) {
    const settled = new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    )
      .then(() => document.fonts.ready)
      .then(() => undefined);
    fontsGate = Promise.race([settled, sleep(1500)]);
  }
  return fontsGate;
};

// Resolves when every <img> inside `root` has loaded (or failed), capped by a timeout.
const imagesReady = (root: HTMLElement, timeout = 1200): Promise<void> => {
  const pending = Array.from(root.querySelectorAll("img"))
    .filter((img) => !img.complete)
    .map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    );
  if (!pending.length) return Promise.resolve();
  return Promise.race([Promise.all(pending).then(() => undefined), sleep(timeout)]);
};

type Effect = "fade" | "rise" | "flip" | "scale";
type SplitBy = "words" | "chars" | "lines";

type Look = {
  effect: Effect;
  masked: boolean;
  baseOpacity: number;
  blur: number;
  offset: number;
  highlightColor: string;
  /** easing applied to each piece's own progress (0..1 -> 0..1) */
  ease: (t: number) => number;
};

const clampToScroll = (position: string) =>
  typeof position === "string" && !position.startsWith("clamp(") ? `clamp(${position})` : position;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smooth = (value: number) => value * value * (3 - 2 * value);
const easeBack = (value: number, overshoot: number) => {
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted * shifted * shifted + overshoot * shifted * shifted;
};
const glowAt = (t: number) =>
  t <= 0 || t >= 1 ? 0 : t < 0.35 ? smooth(t / 0.35) : 1 - smooth((t - 0.35) / 0.65);

const paintPiece = (piece: HTMLElement, t: number, look: Look) => {
  let reveal = t;
  let fadeIn = t;
  let motion = "";
  if (look.effect === "rise") {
    reveal = look.ease(t);
    // opacity follows its own smooth curve over the first ~65% of the piece's time, instead of
    // the (already fast) motion curve, so each letter fades in softly rather than popping
    fadeIn = smooth(clamp01(t / 0.65));
    if (reveal < 1) {
      motion = look.masked
        ? `translateY(${((1 - reveal) * 100).toFixed(2)}%) translateY(${((1 - reveal) * 0.45).toFixed(3)}em)`
        : `translateY(${((1 - reveal) * 0.8).toFixed(3)}em)`;
    }
  } else if (look.effect === "flip") {
    reveal = easeBack(t, 1.2);
    fadeIn = clamp01(t * 2);
    if (t < 1) motion = `perspective(6em) rotateX(${((1 - reveal) * 90).toFixed(2)}deg)`;
  } else if (look.effect === "scale") {
    reveal = easeBack(t, 1.6);
    fadeIn = clamp01(t * 1.6);
    if (t < 1) motion = `scale(${(0.35 + 0.65 * reveal).toFixed(4)})`;
  }
  if (look.highlightColor) fadeIn = Math.max(fadeIn, clamp01(t / 0.35));
  const settle = clamp01(reveal);
  const lift = look.offset * (1 - settle);
  piece.style.opacity = t >= 1 ? "" : (look.baseOpacity + (1 - look.baseOpacity) * fadeIn).toFixed(3);
  piece.style.transform = [lift ? `translateY(${lift.toFixed(2)}px)` : "", motion]
    .filter(Boolean)
    .join(" ");
  piece.style.filter = look.blur && settle < 1 ? `blur(${(look.blur * (1 - settle)).toFixed(2)}px)` : "";
  if (look.highlightColor) {
    const glow = glowAt(t);
    piece.style.color =
      glow > 0.002
        ? `color-mix(in srgb, ${look.highlightColor} ${(glow * 100).toFixed(1)}%, currentColor)`
        : "";
  }
};

type ScrollRevealProps = {
  children: ReactNode;
  /** wrapper tag (inline span by default so it can sit inside any element) */
  as?: ElementType;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  baseOffset?: number;
  /** seconds between each word / character */
  stagger?: number;
  smoothing?: number;
  splitBy?: SplitBy;
  effect?: Effect;
  /** "enter" plays once when it scrolls into view, "scrub" follows the scroll position */
  mode?: "scrub" | "enter";
  /** seconds each piece takes (enter mode) */
  duration?: number;
  /** gsap ease name for each piece's motion, e.g. "power3.out", "expo.out", "power4.out" */
  ease?: string;
  /** seconds to hold before playing, only during the page-load intro (enter mode) */
  wait?: number;
  /** play right away on mount instead of waiting to scroll into view (enter mode) */
  immediate?: boolean;
  highlightColor?: string;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
};

export const ScrollReveal = ({
  children,
  as,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  baseOffset = 0,
  stagger = 0.05,
  smoothing = 0,
  splitBy = "words",
  effect = "fade",
  mode = "scrub",
  duration = 0.8,
  ease = "power3.out",
  wait = 0,
  immediate = false,
  highlightColor = "",
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
}: ScrollRevealProps) => {
  const Tag = (as ?? "span") as ElementType;
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const text = useMemo(() => {
    const parts = Children.toArray(children);
    return parts.every((part) => typeof part === "string" || typeof part === "number")
      ? parts.join("")
      : null;
  }, [children]);

  const splitText = useMemo(() => {
    if (text === null) return null;
    return text.split(/(\s+)/).map((word, index) =>
      word.trim() === "" ? (
        word
      ) : (
        <span className="scroll-reveal-word" key={index}>
          {splitBy === "chars" ? (
            Array.from(word).map((char, charIndex) => (
              <span className="scroll-reveal-piece" key={charIndex}>
                {char}
              </span>
            ))
          ) : (
            <span className="scroll-reveal-piece">{word}</span>
          )}
        </span>
      )
    );
  }, [text, splitBy]);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    const textEl = textRef.current;
    if (!el || !textEl) return;
    if (scrollContainerRef && !scrollContainerRef.current) return;

    const scroller: HTMLElement | Window = scrollContainerRef?.current || window;
    const wrappers = Array.from(el.querySelectorAll<HTMLElement>(".scroll-reveal-word"));
    const pieces: HTMLElement[] = wrappers.length
      ? Array.from(el.querySelectorAll<HTMLElement>(".scroll-reveal-piece"))
      : [textEl];
    const viewportHeight = () =>
      scroller instanceof HTMLElement ? scroller.clientHeight : window.innerHeight;
    const scrub = smoothing > 0 ? smoothing : true;
    const span = mode === "enter" ? Math.max(0.05, duration) : SCRUB_SPAN;
    const gap = Math.max(0, stagger);
    const look: Look = {
      effect,
      masked: effect === "rise" && wrappers.length > 0,
      baseOpacity,
      blur: enableBlur ? blurStrength : 0,
      offset: baseOffset,
      highlightColor,
      ease: gsap.parseEase(ease) as (t: number) => number,
    };
    const mm = gsap.matchMedia();
    const born = performance.now();
    let cancelled = false;

    // reduced motion: no animation, just show the text
    mm.add("(prefers-reduced-motion: reduce)", () => {
      el.style.visibility = "visible";
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const order = pieces.map((_, index) => index);
      const last = pieces.map(() => -1);
      const state = { p: 0 };
      let count = pieces.length;

      const measure = () => {
        if (splitBy !== "lines" || !wrappers.length) return;
        let line = -1;
        let top = -Infinity;
        wrappers.forEach((wrapper, index) => {
          const next = wrapper.offsetTop;
          if (Math.abs(next - top) > 2) {
            line += 1;
            top = next;
          }
          order[index] = line;
        });
        count = line + 1;
      };

      const total = () => span + Math.max(0, count - 1) * gap;

      const render = () => {
        const at = state.p * total();
        pieces.forEach((piece, index) => {
          const t = clamp01((at - order[index] * gap) / span);
          if (t === last[index]) return;
          last[index] = t;
          paintPiece(piece, t, look);
        });
      };

      // release GPU layers + clipping once the reveal has finished
      const release = () => {
        pieces.forEach((piece) => {
          piece.style.willChange = "";
        });
        wrappers.forEach((wrapper) => {
          wrapper.style.clipPath = "";
        });
      };

      measure();
      pieces.forEach((piece) => {
        piece.style.willChange =
          pieces.length > 80 ? "" : effect === "fade" && !baseOffset ? "opacity" : "opacity, transform";
        piece.style.transformOrigin = effect === "flip" ? "50% 100%" : "";
      });
      if (look.masked) {
        wrappers.forEach((wrapper) => {
          wrapper.style.clipPath = RISE_MASK;
        });
      }
      render();
      // the container starts hidden (see JSX) so SSR text never flashes; reveal it now that every
      // piece is in its start state
      el.style.visibility = "visible";

      if (mode === "enter") {
        let played = false;
        const play = () => {
          if (played) return;
          played = true;
          const hold = immediate || performance.now() - born < INTRO_WINDOW_MS ? wait : 0;
          fontsReady().then(() => {
            if (cancelled) return;
            gsap.to(state, {
              p: 1,
              duration: total(),
              delay: hold,
              ease: "none",
              onUpdate: render,
              onComplete: release,
            });
            if (baseRotation) gsap.to(el, { rotate: 0, duration: Math.min(total(), 1.4), ease: "power3.out" });
          });
        };
        const startAt = () => {
          const view = viewportHeight();
          const top =
            el.getBoundingClientRect().top -
            (scroller instanceof HTMLElement
              ? scroller.getBoundingClientRect().top + scroller.clientTop - scroller.scrollTop
              : -window.scrollY);
          const raw = top - view + 0.2 * Math.min(el.offsetHeight, view);
          return Math.min(raw, ScrollTrigger.maxScroll(scroller) - 1);
        };
        if (baseRotation) gsap.set(el, { transformOrigin: "0% 50%", rotate: baseRotation });
        if (immediate) {
          play();
        } else {
          ScrollTrigger.create({
            trigger: el,
            scroller,
            start: startAt,
            onEnter: play,
            onLeave: play,
            onRefresh: (self) => {
              if (self.progress > 0) play();
            },
          });
        }
      } else {
        if (baseRotation) {
          gsap.fromTo(
            el,
            { transformOrigin: "0% 50%", rotate: baseRotation },
            {
              ease: "none",
              rotate: 0,
              scrollTrigger: {
                trigger: el,
                scroller,
                start: "top bottom",
                end: clampToScroll(rotationEnd),
                scrub,
              },
            }
          );
        }
        gsap.to(state, {
          p: 1,
          ease: "none",
          onUpdate: render,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: () => `top bottom-=${0.2 * Math.min(el.offsetHeight, viewportHeight())}`,
            end: clampToScroll(wordAnimationEnd),
            scrub,
          },
        });
      }

      const resizeObserver =
        splitBy === "lines" && typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              measure();
              last.fill(-1);
              render();
            })
          : null;
      resizeObserver?.observe(textEl);

      return () => {
        resizeObserver?.disconnect();
        pieces.forEach((piece) => {
          piece.style.opacity = "";
          piece.style.transform = "";
          piece.style.transformOrigin = "";
          piece.style.filter = "";
          piece.style.color = "";
          piece.style.willChange = "";
        });
        wrappers.forEach((wrapper) => {
          wrapper.style.clipPath = "";
        });
      };
    });

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, [
    scrollContainerRef,
    text,
    splitBy,
    effect,
    mode,
    duration,
    ease,
    wait,
    immediate,
    highlightColor,
    enableBlur,
    baseOpacity,
    baseRotation,
    blurStrength,
    baseOffset,
    stagger,
    smoothing,
    rotationEnd,
    wordAnimationEnd,
  ]);

  return (
    <Tag
      ref={containerRef}
      className={`scroll-reveal ${containerClassName}`}
      style={{ visibility: "hidden" }} // revealed by the effect once start states are applied
    >
      {/* real text for screen readers / SEO; the animated copy is hidden from them */}
      {text !== null && <span className="sr-only">{text}</span>}
      <span
        ref={textRef}
        className={`scroll-reveal-text ${textClassName}`}
        aria-hidden={text === null ? undefined : true}
      >
        {splitText ?? children}
      </span>
    </Tag>
  );
};

/* ------------------------------------------------------------------ */
/*  T  (animated text helper used across the page)                     */
/* ------------------------------------------------------------------ */
/*
  - split="words" for body copy / script font (keeps cursive letters joined)
  - split="chars" for big display headings
  - delay = ms between each word / character
*/

type TProps = {
  text: string;
  split?: "words" | "chars";
  /** ms between each word / character */
  delay?: number;
  /** "load" plays on mount (nav, hero); "view" plays when scrolled into view */
  trigger?: "view" | "load";
  /** seconds to hold before playing during the page-load intro (hero choreography) */
  wait?: number;
  className?: string;
} & Record<string, any>;

export const T = ({ text, split = "words", delay, trigger = "view", className = "", ...rest }: TProps) => {
  // "amount" was an old BlurText option (used by EDGE); ScrollReveal handles page-bottom text on its own
  const { amount: _amount, ...props } = rest;

  return (
    <ScrollReveal
      mode="enter"
      immediate={trigger === "load"} // trigger="load": play on mount, don't wait for scroll
      effect="rise"
      splitBy={split === "chars" ? "chars" : "words"}
      enableBlur={split !== "chars"} // blur per word only, per-letter blur gets janky
      blurStrength={8}
      baseOpacity={0}
      baseRotation={0} // rotation doesn't apply to inline text
      duration={0.7}
      stagger={((delay ?? (split === "chars" ? 30 : 70)) * 0.7) / 1000}
      containerClassName={className}
      {...props}
    >
      {text}
    </ScrollReveal>
  );
};

/* ------------------------------------------------------------------ */
/*  AnimatedContent                                                    */
/* ------------------------------------------------------------------ */

type AnimatedContentProps = {
  children: ReactNode;
  /** wrapper tag, e.g. "ul" when the children are <li> */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** px the content travels */
  distance?: number;
  direction?: "vertical" | "horizontal";
  /** travel from the opposite side (up / left instead of down / right) */
  reverse?: boolean;
  /** seconds */
  duration?: number;
  ease?: string;
  animateOpacity?: boolean;
  initialOpacity?: number;
  /** starting scale (1 = no scale) */
  scale?: number;
  /** starting blur in px (0 = none; keep 0 on big images for smoothness) */
  blur?: number;
  /** seconds between children; > 0 animates each direct child in turn */
  stagger?: number;
  staggerFrom?: "start" | "end" | "center" | "edges" | "random";
  /** 0..1 how far into the viewport the element must be before it plays */
  threshold?: number;
  /** seconds */
  delay?: number;
  /** hold the animation until every <img> inside has loaded (hero photos) */
  waitForImages?: boolean;
  onComplete?: () => void;
};

export function AnimatedContent({
  children,
  as,
  className = "",
  style,
  distance = 60,
  direction = "vertical",
  reverse = false,
  duration = 1,
  ease = "power3.out",
  animateOpacity = true,
  initialOpacity = 0,
  scale = 1,
  blur = 0,
  stagger = 0,
  staggerFrom = "start",
  threshold = 0.1,
  delay = 0,
  waitForImages = false,
  onComplete,
}: AnimatedContentProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const doneRef = useRef(onComplete);

  useLayoutEffect(() => {
    doneRef.current = onComplete;
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(el, { visibility: "visible" });
        return;
      }

      const kids = gsap.utils.toArray<HTMLElement>(el.children);
      const targets = stagger > 0 && kids.length ? kids : [el];

      const axis = direction === "horizontal" ? "x" : "y";
      const offset = reverse ? -distance : distance;

      const from: gsap.TweenVars = {
        [axis]: offset,
        scale,
        opacity: animateOpacity ? initialOpacity : 1,
        willChange: blur > 0 ? "transform,opacity,filter" : "transform,opacity",
      };
      const to: gsap.TweenVars = {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease,
        delay,
        stagger: stagger > 0 ? { each: stagger, from: staggerFrom } : 0,
        paused: true, // started below, once the trigger fires and (optionally) images are ready
        onComplete: () => {
          // release GPU layers + inline transforms once settled
          gsap.set(targets, { clearProps: "transform,opacity,filter,willChange" });
          doneRef.current?.();
        },
      };
      if (blur > 0) {
        from.filter = `blur(${blur}px)`;
        to.filter = "blur(0px)";
      }

      const tween = gsap.fromTo(targets, from, to);
      gsap.set(el, { visibility: "visible" }); // reveal wrapper now that start state is applied

      let started = false;
      const go = () => {
        if (started) return;
        started = true;
        const ready = waitForImages ? Promise.all([fontsReady(), imagesReady(el)]) : fontsReady();
        ready.then(() => {
          if (!cancelled) tween.play();
        });
      };

      ScrollTrigger.create({
        trigger: el,
        start: `clamp(top ${Math.round((1 - threshold) * 100)}%)`,
        once: true,
        onEnter: go,
        onLeave: go,
        onRefresh: (self) => {
          if (self.progress > 0) go();
        },
      });
    }, el);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [
    distance,
    direction,
    reverse,
    duration,
    ease,
    animateOpacity,
    initialOpacity,
    scale,
    blur,
    stagger,
    staggerFrom,
    threshold,
    delay,
    waitForImages,
  ]);

  return (
    <Tag ref={ref} className={className} style={{ visibility: "hidden", ...style }}>
      {children}
    </Tag>
  );
}