"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

type StudioProfileTemplateProps = {
  profile: {
    studioName: string;
    logoUrl: string | null;
    description: string | null;
    shortTagline: string | null;
    coverPhotoUrl: string | null;
    ownerName: string | null;
    ownerPhone: string | null;
    phoneNumber: string | null;
    email: string | null;
    address: string | null;
    location: string | null;
    instagramUrl: string | null;
    websiteUrl: string | null;
    facebookUrl: string | null;
    youtubeUrl: string | null;
    otherLinks: string | null;
    additionalInfo: string | null;
    packages: {
      id: string;
      name: string;
      price: string;
      description: string;
    }[];
    portfolioPhotos: {
      id: string;
      imageUrl: string;
    }[];
  };
};

const INITIAL_PORTFOLIO_COUNT = 7;

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function toHref(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;

  const cleaned = value.trim();

  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const url = new URL(cleaned);
      return ["http:", "https:"].includes(url.protocol)
        ? url.href
        : null;
    } catch {
      return null;
    }
  }

  if (cleaned.startsWith("@")) {
    return `https://www.instagram.com/${cleaned.slice(1)}`;
  }

  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(cleaned)) {
    return `https://${cleaned}`;
  }

  return null;
}

function toTel(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const number = value.trim().replace(/[^\d+]/g, "");
  return number ? `tel:${number}` : null;
}

function Photo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

export default function Template1({
  profile,
}: StudioProfileTemplateProps) {
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const studioName = profile.studioName?.trim() || "Our Studio";
  const packages = profile.packages ?? [];
  const portfolioPhotos = profile.portfolioPhotos ?? [];

  const visiblePhotos = showAllPortfolio
    ? portfolioPhotos
    : portfolioPhotos.slice(0, INITIAL_PORTFOLIO_COUNT);

  const phoneHref = toTel(profile.phoneNumber);
  const ownerPhoneHref = toTel(profile.ownerPhone);

  const instagramHref = toHref(profile.instagramUrl);
  const websiteHref = toHref(profile.websiteUrl);
  const facebookHref = toHref(profile.facebookUrl);
  const youtubeHref = toHref(profile.youtubeUrl);
  const otherHref = toHref(profile.otherLinks);

  const mapHref =
    otherHref ??
    (hasText(profile.address) || hasText(profile.location)
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [profile.address, profile.location].filter(Boolean).join(", ")
        )}`
      : null);

  const hasAbout =
    hasText(profile.ownerName) ||
    hasText(profile.additionalInfo) ||
    hasText(profile.description);

  const navItems = [
    { label: "Home", href: "#home" },
    ...(packages.length ? [{ label: "Packages", href: "#packages" }] : []),
    ...(hasAbout ? [{ label: "About", href: "#about" }] : []),
    ...(portfolioPhotos.length
      ? [{ label: "Portfolio", href: "#portfolio" }]
      : []),
    { label: "Contact", href: "#contact" },
  ];

  const togglePortfolio = () => {
    if (showAllPortfolio) {
      document
        .getElementById("portfolio")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setShowAllPortfolio((current) => !current);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#0c0a09] text-[#f7e7ce]">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap");

        html {
          scroll-behavior: smooth;
        }

        /* Scale rem-based sizing up on very large (2K / 4K) displays */
        @media (min-width: 2560px) {
          html {
            font-size: 112.5%;
          }
        }

        @media (min-width: 3200px) {
          html {
            font-size: 125%;
          }
        }

        .editorial-serif {
          font-family: "Cormorant Garamond", Georgia, serif;
        }

        .editorial-sans {
          font-family: "DM Sans", Arial, sans-serif;
        }

        .editorial-section {
          scroll-margin-top: 88px;
        }

        .editorial-nav-link {
          position: relative;
        }

        .editorial-nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 0;
          height: 1px;
          background: #cfa94a;
          transition: width 250ms ease;
        }

        .editorial-nav-link:hover::after {
          width: 100%;
        }

        .editorial-card {
          transition: transform 300ms ease, box-shadow 300ms ease;
        }

        .editorial-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-[#d4b46a]/15 bg-[#7a4e27]/95 backdrop-blur-xl">
        <nav className="mx-auto flex min-h-[68px] max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-8 lg:gap-5 lg:px-12 xl:gap-8 2xl:max-w-[1800px]">
          <a
            href="#home"
            onClick={closeMenu}
            className="flex min-w-0 items-center gap-3"
          >
            {profile.logoUrl && !logoFailed ? (
              <img
                src={profile.logoUrl}
                alt={`${studioName} logo`}
                className="h-10 w-10 shrink-0 rounded-full border border-[#f7e7ce]/50 bg-[#f7e7ce] object-contain p-1"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="editorial-serif flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f7e7ce]/50 text-lg font-semibold">
                {studioName.charAt(0).toUpperCase()}
              </span>
            )}

            <span className="editorial-serif min-w-0 break-words text-base font-semibold leading-tight tracking-wide text-[#fbefd9] min-[400px]:text-lg sm:text-xl lg:max-w-[260px] xl:max-w-[380px]">
              {studioName}
            </span>
          </a>

          <div className="editorial-sans hidden items-center gap-5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#efdcb8] lg:flex xl:gap-7 xl:tracking-[0.16em]">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="editorial-nav-link whitespace-nowrap transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            className="editorial-sans hidden shrink-0 whitespace-nowrap rounded-full border border-[#f2dfb8]/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#fbefd9] transition-all hover:bg-[#f2dfb8] hover:text-[#2b1a12] lg:inline-flex"
          >
            Get in touch
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f2dfb8]/60 text-[#fbefd9] transition-colors hover:bg-[#f2dfb8]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2dfb8] lg:hidden"
          >
            <span className="flex flex-col gap-1" aria-hidden="true">
              <span
                className={`block h-0.5 w-5 rounded bg-current transition-transform duration-300 ${
                  menuOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded bg-current transition-opacity duration-300 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded bg-current transition-transform duration-300 ${
                  menuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </nav>

        {/* MOBILE / TABLET MENU */}
        <div
          id="mobile-nav"
          aria-hidden={!menuOpen}
          className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-in-out lg:hidden ${
            menuOpen
              ? "visible grid-rows-[1fr] opacity-100"
              : "invisible grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="editorial-sans mx-auto flex max-w-[1500px] flex-col border-t border-white/10 px-4 pb-5 pt-1 sm:px-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                  className="block border-b border-white/10 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#efdcb8] transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              ))}

              <a
                href="#contact"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[#f2dfb8]/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#fbefd9] transition-all hover:bg-[#f2dfb8] hover:text-[#2b1a12] sm:self-start"
              >
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section
        id="home"
        className="editorial-section relative flex min-h-[70vh] items-center overflow-hidden bg-[#0c0a09] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28"
      >
        {profile.coverPhotoUrl && !coverFailed && (
          <>
            <img
              src={profile.coverPhotoUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
              onError={() => setCoverFailed(true)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c0a09]/70 via-[#0c0a09]/55 to-[#0c0a09]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0c0a09]/80 via-[#0c0a09]/35 to-transparent" />
          </>
        )}

        <div className="relative z-10 mx-auto w-full max-w-[1320px] 2xl:max-w-[1600px]">
          <div className="max-w-[720px] 2xl:max-w-[860px]">
            <div className="mb-5 h-px w-16 bg-[#b8923f]" />

            <p className="editorial-sans mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c9a55a] min-[400px]:tracking-[0.32em] sm:text-[11px]">
              Photography · Stories · Memories
            </p>

            <h1 className="editorial-serif break-words text-4xl font-semibold leading-[1] tracking-tight text-[#f7e7ce] min-[400px]:text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl">
              {studioName}
            </h1>

            {hasText(profile.shortTagline) && (
              <p className="editorial-serif mt-5 break-words text-xl italic text-[#d4b06a] sm:text-2xl 2xl:text-3xl">
                {profile.shortTagline}
              </p>
            )}

            {hasText(profile.description) && (
              <p className="editorial-sans mt-6 max-w-[560px] break-words text-sm leading-7 text-[#d9ccb4] sm:text-base sm:leading-8 2xl:max-w-[640px] 2xl:text-lg">
                {profile.description}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              {packages.length > 0 && (
                <a
                  href="#packages"
                  className="editorial-sans inline-flex items-center gap-3 rounded-full bg-[#9a6a36] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#b8844a] sm:px-7"
                >
                  Explore Packages <span>↗</span>
                </a>
              )}

              {portfolioPhotos.length > 0 && (
                <a
                  href="#portfolio"
                  className="editorial-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-[#e3d3b5] hover:text-white"
                >
                  View Our Work
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PACKAGES */}
      {packages.length > 0 && (
        <section
          id="packages"
          className="editorial-section bg-[#2e1f17] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px]">
            <div className="mb-10 grid grid-cols-1 items-end gap-6 md:grid-cols-[0.8fr_1.2fr] lg:mb-14">
              <div className="min-w-0">
                <p className="editorial-sans mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d1ae62]">
                  Thoughtfully curated
                </p>

                <h2 className="editorial-serif break-words text-4xl font-semibold leading-tight text-[#fbefd9] sm:text-5xl lg:text-6xl">
                  Our Packages
                </h2>
              </div>

              <p className="editorial-sans max-w-[500px] text-sm leading-7 text-[#dccfb6] md:justify-self-end">
                Every moment deserves to be remembered. Explore our
                photography packages and find the experience that feels right
                for your story.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:gap-6">
              {packages.map((item, index) => (
                <article
                  key={item.id}
                  className="editorial-card flex min-h-[280px] min-w-0 flex-col rounded-[22px] border border-[#e8cf9c]/30 bg-[#ecd9b0] p-5 text-[#2a1a11] sm:min-h-[330px] sm:p-7"
                >
                  <div className="mb-7 flex items-center justify-between">
                    <span className="editorial-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a5530]">
                      Package {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#8a5a2b]" />
                  </div>

                  <h3 className="editorial-serif break-words text-3xl font-semibold leading-tight sm:text-4xl">
                    {item.name}
                  </h3>

                  {hasText(item.price) && (
                    <p className="editorial-serif mt-4 break-words text-3xl font-semibold text-[#7d4f24] sm:text-4xl">
                      {item.price}
                    </p>
                  )}

                  <div className="my-6 h-px w-full bg-[#9a7a45]/35" />

                  {hasText(item.description) ? (
                    <p className="editorial-sans whitespace-pre-line break-words text-sm leading-7 text-[#4e3827]">
                      {item.description}
                    </p>
                  ) : (
                    <p className="editorial-sans text-sm leading-7 text-[#6e5840]">
                      A photography experience thoughtfully designed for your
                      special moments.
                    </p>
                  )}

                  <a
                    href="#contact"
                    className="editorial-sans mt-auto inline-flex items-center gap-2 pt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a2d18] hover:text-[#8a5a2b]"
                  >
                    Enquire about this package ↗
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. ABOUT */}
      {hasAbout && (
        <section
          id="about"
          className="editorial-section bg-[#d9c3a0] px-5 py-16 text-[#2a1c13] sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-8 md:grid-cols-[0.8fr_1.2fr] lg:gap-16 2xl:max-w-[1400px]">
            <div className="min-w-0">
              <p className="editorial-sans mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#7a5a2c]">
                A little about us
              </p>

              <h2 className="editorial-serif break-words text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Welcome to
                <br />
                {studioName}
              </h2>
            </div>

            <div className="relative min-w-0">
              {hasText(profile.description) && (
                <p className="editorial-sans whitespace-pre-line break-words text-sm leading-8 text-[#4a392b] sm:text-base">
                  {profile.description}
                </p>
              )}

              {hasText(profile.additionalInfo) && (
                <p className="editorial-sans mt-4 whitespace-pre-line break-words text-sm leading-8 text-[#4a392b] sm:text-base">
                  {profile.additionalInfo}
                </p>
              )}

              {hasText(profile.ownerName) && (
                <div className="mt-8 border-t border-[#6b4a26]/35 pt-5">
                  <p className="editorial-serif break-words text-2xl font-semibold">
                    {profile.ownerName}
                  </p>

                  <p className="editorial-sans mt-1 text-[10px] uppercase tracking-[0.2em] text-[#7a5a2c]">
                    Studio Owner
                  </p>

                  {hasText(profile.ownerPhone) && ownerPhoneHref && (
                    <a
                      href={ownerPhoneHref}
                      className="editorial-sans mt-3 inline-block break-words text-sm text-[#4a392b] hover:text-[#8a5a2b]"
                    >
                      {profile.ownerPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. PORTFOLIO - MASONRY COLLAGE */}
      {portfolioPhotos.length > 0 && (
        <section
          id="portfolio"
          className="editorial-section bg-[#2e1f17] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-10 flex flex-col items-center text-center">
              <p className="editorial-sans mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d1ae62]">
                A collection of moments
              </p>

              <h2 className="editorial-serif text-4xl font-semibold text-[#fbefd9] sm:text-5xl lg:text-6xl">
                Our Portfolio
              </h2>

              <p className="editorial-sans mt-3 max-w-[480px] text-sm leading-7 text-[#dccfb6]">
                A glimpse into the stories, people and beautiful moments
                we&apos;ve had the privilege to capture.
              </p>
            </div>

            {/* LARGER MASONRY COLLAGE */}

            <div className="columns-2 gap-3 sm:columns-2 sm:gap-5 md:columns-2 lg:columns-3 xl:columns-3">
              {visiblePhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`group mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-xl border border-[#e8cf9c]/15 bg-[#20150f] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:mb-5 sm:rounded-2xl ${
                    index === 0 || index === 4 ? "sm:mb-6" : ""
                  }`}
                >
                  <Photo
                    src={photo.imageUrl}
                    alt={`${studioName} portfolio photograph ${index + 1}`}
                    className="block h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </div>
              ))}
            </div>

            {/* VIEW MORE / SHOW LESS */}

            {portfolioPhotos.length > INITIAL_PORTFOLIO_COUNT && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={togglePortfolio}
                  aria-expanded={showAllPortfolio}
                  className="editorial-sans rounded-full border border-[#dcc18a]/70 px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fbefd9] transition-all hover:bg-[#dcc18a] hover:text-[#2a1a11]"
                >
                  {showAllPortfolio ? "Show Less" : "View More"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. CONTACT */}
      <section
        id="contact"
        className="editorial-section bg-[#0c0a09] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
      >
        <div className="mx-auto max-w-[1200px] 2xl:max-w-[1400px]">
          <div className="mb-12 text-center">
            <p className="editorial-sans mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#bf9b52]">
              Let us create something memorable
            </p>

            <h2 className="editorial-serif break-words text-4xl font-semibold text-[#f7e7ce] sm:text-5xl lg:text-6xl">
              Let&apos;s Connect
            </h2>

            <p className="editorial-sans mx-auto mt-4 max-w-[520px] text-sm leading-7 text-[#bdb09a]">
              Have a special moment coming up? We&apos;d love to hear from
              you. Reach out and let&apos;s talk about your ideas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 border-y border-[#8a6a3a]/40 py-9 md:grid-cols-2 md:gap-12">
            <div className="min-w-0">
              <h3 className="editorial-serif mb-6 text-2xl font-semibold text-[#dcbc78]">
                Studio Information
              </h3>

              <div className="space-y-5">
                {hasText(profile.phoneNumber) && (
                  <div>
                    <p className="editorial-sans mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a08c6a]">
                      Phone
                    </p>

                    {phoneHref ? (
                      <a
                        href={phoneHref}
                        className="editorial-sans break-words text-sm text-[#f1e4cc] hover:text-[#c9a557]"
                      >
                        {profile.phoneNumber}
                      </a>
                    ) : (
                      <p className="editorial-sans break-words text-sm text-[#f1e4cc]">
                        {profile.phoneNumber}
                      </p>
                    )}
                  </div>
                )}

                {hasText(profile.email) && (
                  <div>
                    <p className="editorial-sans mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a08c6a]">
                      Email
                    </p>

                    <a
                      href={`mailto:${profile.email}`}
                      className="editorial-sans break-all text-sm text-[#f1e4cc] hover:text-[#c9a557]"
                    >
                      {profile.email}
                    </a>
                  </div>
                )}

                {hasText(profile.address) && (
                  <div>
                    <p className="editorial-sans mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a08c6a]">
                      Address
                    </p>

                    <p className="editorial-sans whitespace-pre-line break-words text-sm leading-7 text-[#f1e4cc]">
                      {profile.address}
                    </p>
                  </div>
                )}

                {hasText(profile.location) && (
                  <div>
                    <p className="editorial-sans mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a08c6a]">
                      Location
                    </p>

                    <p className="editorial-sans break-words text-sm text-[#f1e4cc]">
                      {profile.location}
                    </p>
                  </div>
                )}

                {mapHref && (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editorial-sans inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c9a557] hover:text-white"
                  >
                    View location on map ↗
                  </a>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="editorial-serif mb-6 text-2xl font-semibold text-[#dcbc78]">
                Find Us Online
              </h3>

              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                {[
                  { label: "Instagram", href: instagramHref },
                  { label: "Website", href: websiteHref },
                  { label: "Facebook", href: facebookHref },
                  { label: "YouTube", href: youtubeHref },
                ]
                  .filter((item) => item.href)
                  .map((item) => (
                    <a
                      key={item.label}
                      href={item.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editorial-sans flex min-h-[58px] min-w-0 items-center justify-between border border-[#7a5d35]/60 px-4 text-xs font-medium text-[#eadcc2] transition-all hover:border-[#c9a557] hover:bg-[#4a3220]/35 hover:text-white"
                    >
                      {item.label}
                      <span className="text-[#c9a557]">↗</span>
                    </a>
                  ))}
              </div>

              {!instagramHref &&
                !websiteHref &&
                !facebookHref &&
                !youtubeHref && (
                  <p className="editorial-sans text-sm leading-7 text-[#bdb09a]">
                    Social media links will appear here when added to the
                    studio profile.
                  </p>
                )}

              {hasText(profile.otherLinks) && !otherHref && (
                <p className="editorial-sans mt-5 break-all text-xs leading-6 text-[#bdb09a]">
                  {profile.otherLinks}
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="min-w-0">
              <p className="editorial-serif break-words text-2xl font-semibold text-[#dcbc78]">
                {studioName}
              </p>

              {hasText(profile.shortTagline) && (
                <p className="editorial-sans mt-1 break-words text-xs text-[#a89878]">
                  {profile.shortTagline}
                </p>
              )}
            </div>

            <a
              href="#home"
              className="editorial-sans shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9a557] hover:text-white"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#8f6f3f]/30 bg-[#0c0a09] px-5 py-6 sm:px-8 lg:px-12">
        <div className="editorial-sans mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 text-center text-[10px] tracking-[0.08em] text-[#968868] sm:flex-row sm:text-left 2xl:max-w-[1800px]">
          <p className="break-words">
            © {new Date().getFullYear()} {studioName}. All rights reserved.
          </p>

          <a href="#home" className="hover:text-[#c9a557]">
            Made for memories.
          </a>
        </div>
      </footer>
    </main>
  );
}