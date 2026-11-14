"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  Palette
  Espresso brown  #2b1a12 (deep #1c100a)
  Velvet crimson  #6e1126
  Romance red     #b8142f
  Champagne silk  #efdcbf (light #f7ecd8)

  This file is fully self-contained: the animation helpers (Text, Reveal) are
  defined below, so the "./componants" import is no longer needed.
*/

/* ----------------------------- Images (fast) ----------------------------- */

// Optimised Unsplash URL: auto format (WebP/AVIF), cropped, compressed, exact width
const img = (id: string, w: number, q: number = 70): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=${q}&w=${w}`;

// Responsive set: the phone downloads the small file, the desktop the big one
const srcSet = (id: string, widths: number[], q: number = 70): string =>
  widths.map((w) => `${img(id, w, q)} ${w}w`).join(", ");

const ID = {
  wedding: "photo-1519741497674-611481863552",
  portrait: "photo-1537633552985-df8429e8048b",
  events: "photo-1511285560929-80b456fea0bc",
  details: "photo-1532712938310-34cb3982ef74",
  couple: "photo-1523438885200-e635ba2c371e",
  beginnings: "photo-1529636798458-92182e662485",
  camera: "photo-1492691527719-9d1e07e534b4",
};

const portfolioPhotos = [
  { id: ID.wedding, title: "Wedding Stories", category: "Wedding" },
  { id: ID.portrait, title: "Timeless Moments", category: "Portrait" },
  { id: ID.events, title: "Celebrations", category: "Events" },
  { id: ID.details, title: "The Details", category: "Editorial" },
  { id: ID.couple, title: "Forever Together", category: "Wedding" },
  { id: ID.beginnings, title: "Beautiful Beginnings", category: "Portrait" },
];

const services = [
  { title: "Wedding Photography", description: "Every emotion, every detail and every unforgettable moment captured with care." },
  { title: "Portrait Photography", description: "Beautiful portraits that express personality, character and individuality." },
  { title: "Event Photography", description: "Preserving the energy and emotion of your most meaningful celebrations." },
  { title: "Cinematic Films", description: "Thoughtfully crafted films that bring your memories back to life." },
];

const packages = [
  {
    name: "Essential",
    description: "A beautiful collection of photographs capturing the moments that matter most.",
    features: ["Professional photography", "Curated edited photographs", "Private online gallery", "Digital delivery"],
  },
  {
    name: "Signature",
    description: "A complete photography experience for your most important celebrations.",
    features: ["Extended photography coverage", "Premium photo editing", "Private online gallery", "Highlight film", "Priority delivery"],
    featured: true,
  },
  {
    name: "Luxury",
    description: "An elevated experience with thoughtful details and exceptional storytelling.",
    features: ["Full-day photography coverage", "Premium cinematic film", "Fine-art photo collection", "Private online gallery", "Personal consultation"],
  },
];

const benefits = [
  "Carefully curated photography",
  "Professional editing and retouching",
  "Beautifully organised galleries",
  "High-resolution photo delivery",
  "Personalised client experience",
  "Memories preserved for a lifetime",
];

const navLeft = [["Home", "#home"], ["Portfolio", "#portfolio"], ["Services", "#services"]];
const navRight = [["About", "#about"], ["Packages", "#packages"], ["Contact", "#contact"]];

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Italiana&family=Pinyon+Script&display=swap";

const styles = `
.f-display { font-family: 'Italiana', 'Cormorant Garamond', serif; }
.f-script  { font-family: 'Pinyon Script', cursive; }
.f-serif   { font-family: 'Cormorant Garamond', Georgia, serif; }

/* children of a staggered <Reveal> start hidden, GSAP then reveals them one by one */
.rv-kids > * { opacity: 0; }

html { -webkit-text-size-adjust: 100%; }
img { max-width: 100%; }
`;

/* --------------------------- Animation helpers --------------------------- */

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/*
  <Text>  splits a sentence into words (or letters) and reveals them one after
  another when the text scrolls into view (top to bottom).
  manual = true  -> does not animate by itself (the hero timeline controls it)
  edge   = true  -> for text at the very bottom of the page (footer)
*/
type TextProps = {
  text: string;
  split?: "words" | "chars";
  className?: string;
  manual?: boolean;
  edge?: boolean;
  delay?: number; // seconds before it starts
  stagger?: number; // seconds between pieces
  duration?: number;
  y?: number;
};

function Text({
  text,
  split = "words",
  className = "",
  manual = false,
  edge = false,
  delay = 0,
  stagger,
  duration = 1,
  y = 28,
}: TextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    if (manual) return;
    const el = ref.current;
    if (!el) return;
    const pieces = el.querySelectorAll<HTMLElement>(".t-piece");

    if (prefersReducedMotion()) {
      gsap.set(pieces, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        pieces,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          stagger: stagger ?? (split === "chars" ? 0.05 : 0.035),
          scrollTrigger: { trigger: el, start: edge ? "top 100%" : "top 90%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <span key={wi}>
            <span className="inline-block whitespace-nowrap">
              {split === "chars" ? (
                Array.from(word).map((ch, ci) => (
                  <span key={ci} className="t-piece inline-block" style={{ opacity: 0 }}>
                    {ch}
                  </span>
                ))
              ) : (
                <span className="t-piece inline-block" style={{ opacity: 0 }}>
                  {word}
                </span>
              )}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

/*
  <Reveal>  fades + slides a block in when it scrolls into view.
  stagger > 0 -> animates the direct children one after another instead.
*/
type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "article" | "section";
  y?: number;
  x?: number; // horizontal slide (desktop only, ignored on phones)
  scale?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  edge?: boolean;
};

function Reveal({
  children,
  className = "",
  as = "div",
  y = 50,
  x = 0,
  scale = 1,
  duration = 1.1,
  delay = 0,
  stagger = 0,
  edge = false,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as as ElementType;
  const staggerKids = stagger > 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets: Element[] = staggerKids ? Array.from(el.children) : [el];

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1 });
      return;
    }

    const dx = window.innerWidth >= 768 ? x : 0;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y, x: dx, scale },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration,
          delay,
          ease: "power3.out",
          stagger: staggerKids ? stagger : 0,
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: edge ? "top 100%" : "top 88%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${className} ${staggerKids ? "rv-kids" : ""}`}
      style={staggerKids ? undefined : { opacity: 0 }}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------- Header -------------------------------- */

// Lives in its own component so opening the mobile menu never re-renders the page
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const linkCls = "f-serif text-[13px] tracking-[0.14em] text-[#efdcbf]/80 transition hover:text-white";
  const mobileLinks = [...navLeft, ...navRight.slice(0, 2)];

  return (
    <header
      data-hero="nav"
      style={{ opacity: 0 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-[#efdcbf]/20 bg-[#2b1a12]/70 pt-[env(safe-area-inset-top)] backdrop-blur-md"
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center">
          <div className="hidden gap-6 md:flex lg:gap-8">
            {navLeft.map(([label, href]) => (
              <a key={label} href={href} className={linkCls}>
                {label}
              </a>
            ))}
          </div>

          <button
            type="button"
            className="-ml-2 flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`h-px w-6 bg-[#efdcbf] transition duration-300 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-[#efdcbf] transition duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-px w-6 bg-[#efdcbf] transition duration-300 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>

        <a
          href="#home"
          aria-label="Picknnovate home"
          className="f-display flex h-10 w-10 items-center justify-center rounded-full border border-[#efdcbf]/60 text-lg text-[#efdcbf] transition hover:border-[#b8142f] hover:bg-[#b8142f] sm:h-11 sm:w-11"
        >
          P
        </a>

        <div className="flex items-center justify-end gap-6 lg:gap-8">
          <div className="hidden gap-6 md:flex lg:gap-8">
            {navRight.slice(0, 2).map(([label, href]) => (
              <a key={label} href={href} className={linkCls}>
                {label}
              </a>
            ))}
          </div>
          <a href="#contact" className={linkCls}>
            Contact
          </a>
        </div>
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`overflow-hidden border-t border-[#efdcbf]/15 bg-[#1c100a]/95 transition-all duration-500 md:hidden ${
          menuOpen ? "visible max-h-96 opacity-100" : "invisible max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-4">
          {mobileLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="f-serif border-b border-[#efdcbf]/10 py-3.5 text-base tracking-[0.14em] text-[#efdcbf]/85 last:border-b-0 hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function PremiumTemplate() {
  const rootRef = useRef<HTMLElement>(null);

  // One smooth-scroll engine, driven by GSAP's ticker so Lenis and ScrollTrigger never drift apart
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true }); // phone address bar must not re-trigger layout

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (!prefersReducedMotion()) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        anchors: true, // #links glide instead of jumping
      });
      lenis.on("scroll", ScrollTrigger.update);
      const l = lenis;
      tick = (time: number) => l.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // Re-measure every scroll trigger when layout may have changed
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    document.fonts?.addEventListener?.("loadingdone", refresh);
    window.addEventListener("load", refresh);
    window.addEventListener("orientationchange", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("orientationchange", refresh);
      document.fonts?.removeEventListener?.("loadingdone", refresh);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  /*
    HERO SEQUENCE (one GSAP timeline, always in this order):
    1. menu bar  2. PICKNNOVATE  3. "Photography"
    4. the three images (they wait here until they have really loaded)
    5. "The PORTFOLIO"  6. tagline  7. button
  */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const all = <E extends HTMLElement>(selector: string) => Array.from(root.querySelectorAll<E>(selector));

    const nav = all("[data-hero='nav']");
    const title = all("[data-hero='title'] .t-piece");
    const script = all("[data-hero='script'] .t-piece");
    const frames = all("[data-hero='frame']");
    const heading = all("[data-hero='heading'] .t-piece");
    const tagline = all("[data-hero='tagline'] .t-piece");
    const button = all("[data-hero='button']");

    if (prefersReducedMotion()) {
      gsap.set([...nav, ...title, ...script, ...frames, ...heading, ...tagline, ...button], { opacity: 1 });
      return;
    }

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;

    // Resolves when every hero image is downloaded (or after 3.5s, so the page never hangs)
    const heroImages = all<HTMLImageElement>("img[data-hero-img]");
    const imagesReady: Promise<void> = Promise.race([
      Promise.all(
        heroImages.map(
          (im) =>
            new Promise<void>((resolve) => {
              if (im.complete && im.naturalWidth > 0) return resolve();
              im.addEventListener("load", () => resolve(), { once: true });
              im.addEventListener("error", () => resolve(), { once: true });
            })
        )
      ).then(() => undefined),
      wait(3500),
    ]);

    // Give the web fonts a short moment so the title does not jump when they arrive
    const fontsReady: Promise<unknown> = Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(500)]);

    fontsReady.then(() => {
      if (cancelled) return;

      // Soft, gentle easing + GPU transforms = smooth motion with no sudden "jump" at the start
      const timeline = gsap.timeline({ defaults: { ease: "power3.out", force3D: true } });
      tl = timeline;

      timeline
        // 1. menu bar
        .fromTo(nav, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.7, clearProps: "transform" })
        // 2. title, letter by letter
        .fromTo(
          title,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.04, clearProps: "transform" },
          "-=0.45"
        )
        // 3. "Photography"
        .fromTo(
          script,
          { opacity: 0, y: 16, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, clearProps: "transform,filter" },
          "-=0.7"
        )
        .addLabel("images", "-=0.5")
        // wait here (only if needed) until the images are really loaded
        .call(
          () => {
            timeline.pause();
            imagesReady.then(() => {
              if (!cancelled) timeline.resume();
            });
          },
          undefined,
          "images"
        )
        // 4. the three images
        .fromTo(
          frames,
          { opacity: 0, y: 44, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: "power2.out",
            stagger: { each: 0.1, from: "center" },
            clearProps: "transform",
          },
          "images"
        )
        // 5. heading under the images
        .fromTo(
          heading,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.03, clearProps: "transform" },
          "-=0.7"
        )
        // 6. tagline
        .fromTo(
          tagline,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.02, clearProps: "transform" },
          "-=0.6"
        )
        // 7. button
        .fromTo(
          button,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8, clearProps: "transform" },
          "-=0.5"
        );
    });

    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  return (
    <main ref={rootRef} className="f-serif min-h-screen overflow-x-hidden bg-[#1c100a] text-[#f7ecd8]">
      {/* Start connecting to the image + font servers immediately */}
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={FONTS_URL} />
      <style>{styles}</style>

      <Header />

      {/* Hero */}
      <section
        id="home"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28"
      >
        <div className="absolute inset-0">
          {/* same file as the centre photo, so the browser downloads it only once */}
          <img
            src={img(ID.wedding, 800)}
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-125 object-cover blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#6e1126]/80 via-[#2b1a12]/80 to-[#1c100a]" />
        </div>

        <div className="relative z-10 w-full max-w-6xl">
          {/* 1 + 2. Title lockup */}
          <div className="relative z-20 text-center">
            <h1
              data-hero="title"
              className="f-display text-[clamp(1.9rem,9.5vw,7rem)] leading-none tracking-[0.1em] text-[#efdcbf] sm:tracking-[0.12em]"
            >
              <Text text="PICKNNOVATE" split="chars" manual />
            </h1>
            <p
              data-hero="script"
              className="f-script mt-1 text-[clamp(2rem,8vw,4.5rem)] leading-tight text-[#f7ecd8] lg:-mt-4"
            >
              <Text text="Photography" manual />
            </p>
          </div>

          {/* 3. Triptych images */}
          <div className="relative z-10 mt-6 grid grid-cols-3 items-center gap-2 sm:mt-8 sm:gap-5 lg:mt-6 lg:gap-6">
            <div
              data-hero="frame"
              style={{ opacity: 0 }}
              className="aspect-[3/4] overflow-hidden border border-[#efdcbf]/25"
            >
              <img
                data-hero-img
                src={img(ID.portrait, 600)}
                srcSet={srcSet(ID.portrait, [300, 600, 900])}
                sizes="(min-width: 1024px) 380px, 33vw"
                alt="Portrait"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div
              data-hero="frame"
              style={{ opacity: 0 }}
              className="aspect-[3/4.6] overflow-hidden border border-[#efdcbf]/40 shadow-2xl shadow-black/60"
            >
              <img
                data-hero-img
                src={img(ID.wedding, 800)}
                srcSet={srcSet(ID.wedding, [300, 600, 800, 1100])}
                sizes="(min-width: 1024px) 380px, 33vw"
                alt="Wedding"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div
              data-hero="frame"
              style={{ opacity: 0 }}
              className="aspect-[3/4] overflow-hidden border border-[#efdcbf]/25"
            >
              <img
                data-hero-img
                src={img(ID.couple, 600)}
                srcSet={srcSet(ID.couple, [300, 600, 900])}
                sizes="(min-width: 1024px) 380px, 33vw"
                alt="Couple"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* 4. Text under the images */}
          <div className="mt-8 text-center sm:mt-10">
            <h2 data-hero="heading" className="text-3xl text-[#efdcbf] sm:text-5xl">
              <Text text="The" className="italic" manual />{" "}
              <Text text="PORTFOLIO" split="chars" className="f-display tracking-[0.1em]" manual />
            </h2>
            <p
              data-hero="tagline"
              className="mx-auto mt-3 max-w-xs text-[10px] tracking-[0.22em] text-[#efdcbf]/60 sm:max-w-none sm:text-xs sm:tracking-[0.3em]"
            >
              <Text text="PRESERVING YOUR SPECIAL DAY FOR ETERNITY" manual />
            </p>
            <a
              data-hero="button"
              style={{ opacity: 0 }}
              href="#portfolio"
              className="mt-6 inline-block bg-[#b8142f] px-8 py-3.5 text-xs tracking-[0.2em] text-[#f7ecd8] transition-colors hover:bg-[#efdcbf] hover:text-[#6e1126] sm:mt-8 sm:px-9"
            >
              VIEW THE WORK
            </a>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-[#f7ecd8] px-5 py-16 text-[#2b1a12] sm:px-6 sm:py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-center md:gap-12">
          <h2 className="f-display text-3xl leading-tight sm:text-5xl">
            <Text text="Photography is more than an image." />{" "}
            <Text text="It is a feeling." className="f-script text-4xl text-[#b8142f] sm:text-6xl" />
          </h2>
          <div>
            <p className="text-base leading-7 text-[#2b1a12]/75 sm:text-lg sm:leading-8">
              <Text
                text="At Picknnovate, we celebrate the beauty of real moments. From intimate celebrations to grand occasions, our approach is centred on creativity, emotion and timeless storytelling."
                stagger={0.02}
                y={18}
              />
            </p>
            <Reveal y={20} delay={0.2} className="mt-6 sm:mt-8">
              <a href="#about" className="inline-block border-b border-[#6e1126] pb-1 text-sm italic text-[#6e1126]">
                More about us
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="bg-[#2b1a12] px-5 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end sm:gap-6">
            <h2 className="f-display text-3xl text-[#efdcbf] sm:text-5xl">
              <Text text="Wedding" split="chars" />{" "}
              <Text text="collection" className="f-script text-4xl text-[#b8142f] sm:text-6xl" />
            </h2>
            <p className="max-w-sm text-base italic leading-7 text-[#efdcbf]/60">
              <Text text="Real emotions and intimate moments, captured through our lens." stagger={0.03} y={18} />
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:pb-10">
            {portfolioPhotos.map((photo, i) => (
              <div key={photo.title} className={i === 1 || i === 4 ? "lg:translate-y-10" : ""}>
                <Reveal y={60} scale={0.96} duration={1.2} delay={(i % 3) * 0.12}>
                  <div className="group relative overflow-hidden">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={img(photo.id, 800)}
                        srcSet={srcSet(photo.id, [480, 800, 1100])}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        alt={photo.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#6e1126]/90 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 p-5 sm:p-7">
                      <p className="text-sm italic text-[#efdcbf]/80">{photo.category}</p>
                      <h3 className="f-display mt-1 text-xl tracking-wide sm:text-2xl">{photo.title}</h3>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-[#6e1126] px-5 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="f-display mb-10 text-center text-3xl text-[#efdcbf] sm:mb-16 sm:text-5xl">
            <Text text="Our" split="chars" />{" "}
            <Text text="Services" className="f-script text-4xl sm:text-6xl" />
          </h2>

          <div className="grid md:grid-cols-2">
            {services.map((s, i) => (
              <Reveal key={s.title} y={40} delay={(i % 2) * 0.12}>
                <article className="border-b border-[#efdcbf]/20 px-2 py-8 sm:px-5 sm:py-10 md:px-10">
                  <h3 className="f-display text-2xl tracking-wide text-[#efdcbf] sm:text-3xl">{s.title}</h3>
                  <p className="mt-3 max-w-md text-base leading-7 text-[#f7ecd8]/70 sm:mt-4 sm:text-lg">
                    {s.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-[#efdcbf] px-5 py-16 text-[#2b1a12] sm:px-6 sm:py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center md:gap-14">
          <Reveal className="overflow-hidden" x={-60} y={30} duration={1.4}>
            <img
              src={img(ID.camera, 900)}
              srcSet={srcSet(ID.camera, [600, 900, 1200])}
              sizes="(min-width: 768px) 50vw, 100vw"
              alt="Photographer working with a camera"
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </Reveal>

          <div>
            <p className="f-script text-3xl text-[#b8142f] sm:text-4xl">
              <Text text="Our philosophy" />
            </p>
            <h2 className="f-display mt-3 text-3xl leading-tight sm:mt-4 sm:text-5xl lg:text-6xl">
              <Text text="Creating art from the moments that matter." stagger={0.06} />
            </h2>
            <p className="mt-6 text-base leading-7 text-[#2b1a12]/80 sm:mt-8 sm:text-lg sm:leading-8">
              <Text
                text="We are passionate about capturing the natural beauty of every moment. Our philosophy is simple: create photographs that feel just as beautiful years from now as they did on the day they were taken."
                stagger={0.02}
                y={18}
              />
            </p>
            <p className="mt-4 text-base leading-7 text-[#2b1a12]/80 sm:mt-5 sm:text-lg sm:leading-8">
              <Text
                text="Every detail deserves attention. Every story deserves to be told. And every memory deserves to last forever."
                stagger={0.02}
                y={18}
              />
            </p>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="bg-[#1c100a] px-5 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="f-display text-3xl text-[#efdcbf] sm:text-5xl">
              <Text text="Our" split="chars" />{" "}
              <Text text="Packages" className="f-script text-4xl text-[#b8142f] sm:text-6xl" />
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base italic leading-7 text-[#efdcbf]/60 sm:mt-5 sm:text-lg">
              <Text
                text="Thoughtfully designed experiences for every occasion and every beautiful story."
                stagger={0.03}
                y={18}
              />
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {packages.map((p, i) => (
              <Reveal
                key={p.name}
                className={`h-full ${i === 2 ? "md:col-span-2 lg:col-span-1" : ""}`}
                y={60}
                duration={1.2}
                delay={(i % 3) * 0.14}
              >
                <article
                  className={`flex h-full flex-col border p-6 sm:p-8 ${
                    p.featured ? "border-[#b8142f] bg-[#b8142f] text-[#f7ecd8]" : "border-[#efdcbf]/15 bg-[#2b1a12]"
                  }`}
                >
                  {p.featured && <span className="f-script mb-2 text-2xl">Recommended</span>}
                  <h3 className="f-display text-2xl tracking-wide sm:text-3xl">{p.name}</h3>
                  <p
                    className={`mt-4 text-base leading-7 sm:mt-5 sm:text-lg lg:min-h-24 ${
                      p.featured ? "text-[#f7ecd8]/85" : "text-[#efdcbf]/60"
                    }`}
                  >
                    {p.description}
                  </p>
                  <div className={`my-6 border-t sm:my-8 ${p.featured ? "border-[#f7ecd8]/30" : "border-[#efdcbf]/15"}`} />
                  <ul className="flex-1 space-y-3 sm:space-y-4">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-3 text-base">
                        <span className={p.featured ? "text-[#efdcbf]" : "text-[#b8142f]"}>✦</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`mt-8 block border px-5 py-3.5 text-center text-xs tracking-[0.2em] transition-colors sm:mt-10 ${
                      p.featured
                        ? "border-[#efdcbf] bg-[#efdcbf] text-[#6e1126] hover:bg-transparent hover:text-[#efdcbf]"
                        : "border-[#efdcbf]/50 text-[#efdcbf] hover:border-[#b8142f] hover:bg-[#b8142f]"
                    }`}
                  >
                    ENQUIRE NOW
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#2b1a12] px-5 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center md:gap-14">
          <div>
            <h2 className="f-display text-3xl leading-tight text-[#efdcbf] sm:text-5xl">
              <Text text="More than photography. An experience." stagger={0.06} />
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#efdcbf]/60 sm:mt-7 sm:text-lg sm:leading-8">
              <Text
                text="From the first conversation to the final delivery, every step should feel thoughtful, effortless and memorable."
                stagger={0.02}
                y={18}
              />
            </p>
          </div>
          <Reveal as="ul" className="grid gap-x-5 sm:grid-cols-2" y={30} duration={0.9} stagger={0.1}>
            {benefits.map((b) => (
              <li key={b} className="border-b border-[#efdcbf]/15 py-4 text-base text-[#f7ecd8]/85 sm:py-5 sm:text-lg">
                {b}
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Call to action */}
      <section className="relative overflow-hidden px-5 py-20 text-center sm:px-6 sm:py-32">
        <div className="absolute inset-0">
          <img
            src={img(ID.events, 1200, 60)}
            srcSet={srcSet(ID.events, [700, 1200, 1800], 60)}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#6e1126]/85 to-[#1c100a]/90" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="f-script text-3xl text-[#efdcbf] sm:text-4xl">
            <Text text="Let's create something beautiful" />
          </p>
          <h2 className="f-display mt-4 text-3xl leading-tight sm:mt-5 sm:text-5xl lg:text-6xl">
            <Text text="Your story deserves to be remembered." stagger={0.06} />
          </h2>
          <Reveal y={24} delay={0.3} className="mt-8 sm:mt-10">
            <a
              href="#contact"
              className="inline-block bg-[#b8142f] px-8 py-3.5 text-xs tracking-[0.2em] transition-colors hover:bg-[#efdcbf] hover:text-[#6e1126] sm:px-10 sm:py-4"
            >
              START YOUR JOURNEY
            </a>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-[#1c100a] px-5 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
          <div className="sm:col-span-2 md:col-span-1">
            <h2 className="f-display text-xl tracking-[0.15em] text-[#efdcbf] sm:text-2xl">
              <Text text="PICKNNOVATE" split="chars" edge />
            </h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-[#efdcbf]/50 sm:mt-5">
              <Text
                text="Celebrating stories, capturing emotions and preserving beautiful memories through photography."
                stagger={0.02}
                y={18}
                edge
              />
            </p>
          </div>

          <div>
            <h3 className="f-script text-3xl text-[#b8142f]">
              <Text text="Explore" edge />
            </h3>
            <Reveal edge y={20} className="mt-4 flex flex-col gap-3 text-base text-[#efdcbf]/60">
              {[...navLeft, ...navRight.slice(0, 2)].map(([label, href]) => (
                <a key={label} href={href} className="hover:text-white">
                  {label}
                </a>
              ))}
            </Reveal>
          </div>

          <div>
            <h3 className="f-script text-3xl text-[#b8142f]">
              <Text text="Get in touch" edge />
            </h3>
            <p className="mt-4 text-base leading-7 text-[#efdcbf]/60">
              <Text
                text="Have a story to tell or an occasion to celebrate? We would love to hear from you."
                stagger={0.02}
                y={18}
                edge
              />
            </p>
            <Reveal edge y={16} className="mt-5">
              <a href="#home" className="inline-block border-b border-[#b8142f] pb-1 text-sm italic text-[#efdcbf]">
                Back to top
              </a>
            </Reveal>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-[#efdcbf]/10 pt-6 text-center sm:mt-16 sm:pt-7">
          <p className="text-[10px] tracking-[0.2em] text-[#efdcbf]/35 sm:text-xs">
            <Text text={`© ${new Date().getFullYear()} Picknnovate. All rights reserved.`} stagger={0.02} y={12} edge />
          </p>
        </div>
      </footer>
    </main>
  );
}

