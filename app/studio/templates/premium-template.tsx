"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import BlurText from "./BlurText";

const handleAnimationComplete = () => {
  console.log("Animation completed!");
};

/*
  Palette
  Espresso brown  #2b1a12 (deep #1c100a)
  Velvet crimson  #6e1126
  Romance red     #b8142f
  Champagne silk  #efdcbf (light #f7ecd8)
*/

const U = (id: string, w: number = 1000): string => `https://images.unsplash.com/${id}?w=${w}`;

const portfolioPhotos = [
  { image: U("photo-1519741497674-611481863552"), title: "Wedding Stories", category: "Wedding" },
  { image: U("photo-1537633552985-df8429e8048b"), title: "Timeless Moments", category: "Portrait" },
  { image: U("photo-1511285560929-80b456fea0bc"), title: "Celebrations", category: "Events" },
  { image: U("photo-1532712938310-34cb3982ef74"), title: "The Details", category: "Editorial" },
  { image: U("photo-1523438885200-e635ba2c371e"), title: "Forever Together", category: "Wedding" },
  { image: U("photo-1529636798458-92182e662485"), title: "Beautiful Beginnings", category: "Portrait" },
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

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Italiana&family=Pinyon+Script&display=swap');

.f-display { font-family: 'Italiana', 'Cormorant Garamond', serif; }
.f-script  { font-family: 'Pinyon Script', cursive; }
.f-serif   { font-family: 'Cormorant Garamond', Georgia, serif; }

@keyframes rise {
  from { opacity: 0; transform: translateY(48px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }

.hero-in   { opacity: 0; animation: rise 1.4s cubic-bezier(.2,.7,.2,1) forwards; }
.hero-fade { opacity: 0; animation: fade 1.8s ease forwards; }

@media (prefers-reduced-motion: reduce) {
  .hero-in, .hero-fade { animation: none; opacity: 1; }
}
`;

export default function PremiumTemplate() {
  // Lenis smooth scrolling
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.3,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true, // #links glide instead of jumping
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  const linkCls =
    "f-serif text-[13px] tracking-[0.14em] text-[#efdcbf]/80 transition hover:text-white";

  return (
    <main className="f-serif min-h-screen overflow-x-hidden bg-[#1c100a] text-[#f7ecd8]">
      <style>{styles}</style>

      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#efdcbf]/20 bg-[#2b1a12]/60 backdrop-blur-md">
        <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-3 lg:px-10">
          <div className="hidden gap-8 md:flex">
            {navLeft.map(([label, href]) => (
              <a key={label} href={href} className={linkCls}>{label}</a>
            ))}
          </div>
          <span className="md:hidden" />

          <a
            href="#home"
            aria-label="Piccnovate home"
            className="f-display flex h-11 w-11 items-center justify-center rounded-full border border-[#efdcbf]/60 text-lg text-[#efdcbf] transition hover:bg-[#b8142f] hover:border-[#b8142f]"
          >
            P
          </a>

          <div className="flex justify-end gap-8">
            <div className="hidden gap-8 md:flex">
              {navRight.slice(0, 2).map(([label, href]) => (
                <a key={label} href={href} className={linkCls}>{label}</a>
              ))}
            </div>
            <a href="#contact" className={linkCls}>Contact</a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28">
        <div className="absolute inset-0">
          <img
            src={U("photo-1519741497674-611481863552", 2200)}
            alt=""
            className="h-full w-full scale-110 object-cover blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#6e1126]/80 via-[#2b1a12]/80 to-[#1c100a]" />
        </div>

        <div className="relative z-10 w-full max-w-6xl">
          {/* Title lockup */}
          <div className="hero-fade relative z-20 text-center" style={{ animationDelay: ".2s" }}>
            <h1 className="f-display text-5xl tracking-[0.12em] text-[#efdcbf] sm:text-7xl lg:text-[7rem] lg:leading-none">
              PICCNOVATE
            </h1>
            <p className="f-script -mt-2 text-4xl text-[#f7ecd8] sm:text-6xl lg:-mt-6 lg:text-7xl">
              Photography
            </p>
          </div>

          {/* Triptych */}
          <div className="relative z-10 -mt-6 grid grid-cols-3 items-center gap-3 sm:gap-6 lg:-mt-10">
            <div className="hero-in aspect-[3/4] overflow-hidden border border-[#efdcbf]/25" style={{ animationDelay: ".5s" }}>
              <img src={U("photo-1537633552985-df8429e8048b")} alt="Portrait" className="h-full w-full object-cover" />
            </div>
            <div className="hero-in aspect-[3/4.6] overflow-hidden border border-[#efdcbf]/40 shadow-2xl shadow-black/60" style={{ animationDelay: ".3s" }}>
              <img src={U("photo-1519741497674-611481863552", 1400)} alt="Wedding" className="h-full w-full object-cover" />
            </div>
            <div className="hero-in aspect-[3/4] overflow-hidden border border-[#efdcbf]/25" style={{ animationDelay: ".7s" }}>
              <img src={U("photo-1523438885200-e635ba2c371e")} alt="Couple" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Portfolio line */}
          <div className="hero-fade mt-10 text-center" style={{ animationDelay: "1.2s" }}>
            <h2 className="text-4xl text-[#efdcbf] sm:text-5xl">
              <span className="italic">The</span>{" "}
              <span className="f-display tracking-[0.1em]">PORTFOLIO</span>
            </h2>
            <BlurText
              text="PRESERVING YOUR SPECIAL DAY FOR ETERNITY"
              effect="blur"
              animateBy="words"
              direction="bottom"
              staggerFrom="start"
              trigger="view"
              delay={200}
              stepDuration={0.35}
              blur={10}
              distance={55}
              onAnimationComplete={handleAnimationComplete}
              className="mt-3 justify-center text-xs tracking-[0.3em] text-[#efdcbf]/60"
            />
            <a
              href="#portfolio"
              className="mt-8 inline-block bg-[#b8142f] px-9 py-3.5 text-xs tracking-[0.2em] text-[#f7ecd8] transition hover:bg-[#efdcbf] hover:text-[#6e1126]"
            >
              VIEW THE WORK
            </a>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-[#f7ecd8] px-6 py-24 text-[#2b1a12] lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
          <h2 className="f-display text-4xl leading-tight sm:text-5xl">
            Photography is more than an image.{" "}
            <span className="f-script text-5xl text-[#b8142f] sm:text-6xl">It is a feeling.</span>
          </h2>
          <div>
            <p className="text-lg leading-8 text-[#2b1a12]/75">
              At Piccnovate, we celebrate the beauty of real moments. From intimate
              celebrations to grand occasions, our approach is centred on creativity,
              emotion and timeless storytelling.
            </p>
            <a href="#about" className="mt-8 inline-block border-b border-[#6e1126] pb-1 text-sm italic text-[#6e1126]">
              More about us
            </a>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="bg-[#2b1a12] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <h2 className="f-display text-4xl text-[#efdcbf] sm:text-5xl">
              Wedding <span className="f-script text-5xl text-[#b8142f] sm:text-6xl">collection</span>
            </h2>
            <p className="max-w-sm text-base italic leading-7 text-[#efdcbf]/60">
              Real emotions and intimate moments, captured through our lens.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioPhotos.map((photo, i) => (
              <div
                key={photo.title}
                className={`group relative overflow-hidden ${i === 1 || i === 4 ? "lg:translate-y-10" : ""}`}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#6e1126]/90 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-7">
                  <p className="text-sm italic text-[#efdcbf]/80">{photo.category}</p>
                  <h3 className="f-display mt-1 text-2xl tracking-wide">{photo.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-[#6e1126] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="f-display mb-16 text-center text-4xl text-[#efdcbf] sm:text-5xl">
            Our <span className="f-script text-5xl sm:text-6xl">Services</span>
          </h2>

          <div className="grid md:grid-cols-2">
            {services.map((s) => (
              <article key={s.title} className="border-b border-[#efdcbf]/20 px-5 py-10 md:px-10">
                <h3 className="f-display text-3xl tracking-wide text-[#efdcbf]">{s.title}</h3>
                <p className="mt-4 max-w-md text-lg leading-7 text-[#f7ecd8]/70">{s.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-[#efdcbf] px-6 py-24 text-[#2b1a12] lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2 md:items-center">
          <div className="overflow-hidden">
            <img
              src={U("photo-1492691527719-9d1e07e534b4", 1200)}
              alt="Photographer working with a camera"
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
            />
          </div>

          <div>
            <p className="f-script text-4xl text-[#b8142f]">Our philosophy</p>
            <BlurText
              text="Creating art from the moments that matter."
              effect="blur"
              animateBy="words"
              direction="bottom"
              staggerFrom="start"
              trigger="view"
              delay={200}
              stepDuration={0.35}
              blur={10}
              distance={55}
              onAnimationComplete={handleAnimationComplete}
              className="f-display mt-4 text-4xl leading-tight sm:text-6xl"
            />
            <p className="mt-8 text-lg leading-8 text-[#2b1a12]/80">
              We are passionate about capturing the natural beauty of every moment. Our
              philosophy is simple: create photographs that feel just as beautiful years
              from now as they did on the day they were taken.
            </p>
            <p className="mt-5 text-lg leading-8 text-[#2b1a12]/80">
              Every detail deserves attention. Every story deserves to be told. And every
              memory deserves to last forever.
            </p>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="bg-[#1c100a] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="f-display text-4xl text-[#efdcbf] sm:text-5xl">
              Our <span className="f-script text-5xl text-[#b8142f] sm:text-6xl">Packages</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg italic leading-7 text-[#efdcbf]/60">
              Thoughtfully designed experiences for every occasion and every beautiful story.
            </p>
          </div>

          <div className="grid gap-7 lg:grid-cols-3">
            {packages.map((p) => (
              <article
                key={p.name}
                className={`flex flex-col border p-8 ${
                  p.featured
                    ? "border-[#b8142f] bg-[#b8142f] text-[#f7ecd8]"
                    : "border-[#efdcbf]/15 bg-[#2b1a12]"
                }`}
              >
                {p.featured && <span className="f-script mb-2 text-2xl">Recommended</span>}
                <h3 className="f-display text-3xl tracking-wide">{p.name}</h3>
                <p className={`mt-5 min-h-20 text-lg leading-7 ${p.featured ? "text-[#f7ecd8]/85" : "text-[#efdcbf]/60"}`}>
                  {p.description}
                </p>
                <div className={`my-8 border-t ${p.featured ? "border-[#f7ecd8]/30" : "border-[#efdcbf]/15"}`} />
                <ul className="flex-1 space-y-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-base">
                      <span className={p.featured ? "text-[#efdcbf]" : "text-[#b8142f]"}>✦</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-10 block border px-5 py-3.5 text-center text-xs tracking-[0.2em] transition ${
                    p.featured
                      ? "border-[#efdcbf] bg-[#efdcbf] text-[#6e1126] hover:bg-transparent hover:text-[#efdcbf]"
                      : "border-[#efdcbf]/50 text-[#efdcbf] hover:border-[#b8142f] hover:bg-[#b8142f]"
                  }`}
                >
                  ENQUIRE NOW
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#2b1a12] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2 md:items-center">
          <div>
            <BlurText
              text="More than photography. An experience."
              effect="blur"
              animateBy="words"
              direction="bottom"
              staggerFrom="start"
              trigger="view"
              delay={200}
              stepDuration={0.35}
              blur={10}
              distance={55}
              onAnimationComplete={handleAnimationComplete}
              className="f-display text-4xl leading-tight text-[#efdcbf] sm:text-5xl"
            />
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#efdcbf]/60">
              From the first conversation to the final delivery, every step should feel
              thoughtful, effortless and memorable.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {benefits.map((b) => (
              <li key={b} className="border-b border-[#efdcbf]/15 py-5 text-lg text-[#f7ecd8]/85">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to action */}
      <section className="relative overflow-hidden px-6 py-32 text-center">
        <div className="absolute inset-0">
          <img src={U("photo-1511285560929-80b456fea0bc", 1800)} alt="" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#6e1126]/85 to-[#1c100a]/90" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="f-script text-4xl text-[#efdcbf]">Let's create something beautiful</p>
          <BlurText
              text="Your story deserves to be remembered."
              effect="blur"
              animateBy="words"
              direction="bottom"
              staggerFrom="start"
              trigger="view"
              delay={200}
              stepDuration={0.35}
              blur={10}
              distance={55}
              onAnimationComplete={handleAnimationComplete}
              className="f-display mt-5 justify-center text-4xl leading-tight sm:text-6xl"
            />
          <a
            href="#contact"
            className="mt-10 inline-block bg-[#b8142f] px-10 py-4 text-xs tracking-[0.2em] transition hover:bg-[#efdcbf] hover:text-[#6e1126]"
          >
            START YOUR JOURNEY
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1c100a] px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-3">
          <div>
            <h2 className="f-display text-2xl tracking-[0.15em] text-[#efdcbf]">PICCNOVATE</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#efdcbf]/50">
              Celebrating stories, capturing emotions and preserving beautiful memories
              through photography.
            </p>
          </div>

          <div>
            <h3 className="f-script text-3xl text-[#b8142f]">Explore</h3>
            <div className="mt-4 flex flex-col gap-3 text-base text-[#efdcbf]/60">
              {[...navLeft, ...navRight.slice(0, 2)].map(([label, href]) => (
                <a key={label} href={href} className="hover:text-white">{label}</a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="f-script text-3xl text-[#b8142f]">Get in touch</h3>
            <p className="mt-4 text-base leading-7 text-[#efdcbf]/60">
              Have a story to tell or an occasion to celebrate? We would love to hear from you.
            </p>
            <a href="#home" className="mt-5 inline-block border-b border-[#b8142f] pb-1 text-sm italic text-[#efdcbf]">
              Back to top
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-7xl border-t border-[#efdcbf]/10 pt-7 text-center">
          <p className="text-xs tracking-[0.2em] text-[#efdcbf]/35">
            © {new Date().getFullYear()} Piccnovate. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}