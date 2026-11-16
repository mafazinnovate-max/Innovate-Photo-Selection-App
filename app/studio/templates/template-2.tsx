
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

export default function Template2({
  profile,
}: StudioProfileTemplateProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);

  const photos = profile.portfolioPhotos;

  const visiblePhotos = showAllPortfolio
    ? photos
    : photos.slice(0, INITIAL_PORTFOLIO_COUNT);

  const socialLinks = [
    { label: "Instagram", url: profile.instagramUrl },
    { label: "Facebook", url: profile.facebookUrl },
    { label: "YouTube", url: profile.youtubeUrl },
    { label: "Website", url: profile.websiteUrl },
    { label: "Location", url: profile.otherLinks },
  ].filter(
    (item): item is { label: string; url: string } =>
      Boolean(item.url?.trim())
  );

  const phoneLink = profile.phoneNumber?.replace(/[^\d+]/g, "");

  const closeMenu = () => setMenuOpen(false);

  const togglePortfolio = () => {
    if (showAllPortfolio) {
      document.getElementById("portfolio")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setShowAllPortfolio((previous) => !previous);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      {/* Navigation */}
      <header className="relative z-50 border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5">
          <a
            href="#home"
            onClick={closeMenu}
            className="flex min-w-0 items-center gap-3"
          >
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt={`${profile.studioName} logo`}
                className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
              />
            )}

            <span className="truncate text-base font-bold uppercase tracking-wider sm:text-lg">
              {profile.studioName}
            </span>
          </a>

          <nav className="hidden items-center gap-5 text-xs font-semibold uppercase tracking-widest text-white/70 lg:flex xl:gap-8">
            <a href="#home" className="transition hover:text-yellow-400">
              Home
            </a>
            <a href="#packages" className="transition hover:text-yellow-400">
              Packages
            </a>
            <a href="#about" className="transition hover:text-yellow-400">
              About
            </a>
            <a href="#portfolio" className="transition hover:text-yellow-400">
              Portfolio
            </a>
            <a href="#contact" className="transition hover:text-yellow-400">
              Contact
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#contact"
              className="hidden rounded-full bg-yellow-400 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-yellow-300 sm:inline-flex"
            >
              Let's Talk
            </a>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-white/20 transition hover:border-yellow-400 lg:hidden"
            >
              <span
                className={`h-0.5 w-5 bg-white transition-all duration-300 ${
                  menuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-5 bg-white transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 w-5 bg-white transition-all duration-300 ${
                  menuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`absolute left-0 right-0 top-full overflow-hidden border-b border-white/10 bg-black transition-all duration-300 lg:hidden ${
            menuOpen
              ? "visible max-h-96 opacity-100"
              : "invisible max-h-0 opacity-0"
          }`}
        >
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-4 sm:px-8">
            {[
              { label: "Home", href: "#home" },
              { label: "Packages", href: "#packages" },
              { label: "About", href: "#about" },
              { label: "Portfolio", href: "#portfolio" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="border-b border-white/10 py-4 text-xs font-semibold uppercase tracking-widest text-white/75 transition hover:text-yellow-400 last:border-0"
              >
                {item.label}
              </a>
            ))}

            <a
              href="#contact"
              onClick={closeMenu}
              className="mt-4 rounded-full bg-yellow-400 px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-black transition hover:bg-yellow-300"
            >
              Let's Talk
            </a>
          </nav>
        </div>
      </header>

      {/* Hero - Studio Name */}
      <section
        id="home"
        className="relative flex min-h-[560px] items-center bg-zinc-900 sm:min-h-[650px]"
      >
        {profile.coverPhotoUrl && (
          <img
            src={profile.coverPhotoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:text-sm sm:tracking-[0.35em]">
            Photography • Creativity • Memories
          </p>

          <h1 className="max-w-4xl break-words text-4xl font-black uppercase leading-tight sm:text-7xl lg:text-8xl">
            {profile.studioName}
          </h1>

          {profile.shortTagline && (
            <p className="mt-6 max-w-2xl text-base text-white/80 sm:mt-7 sm:text-2xl">
              {profile.shortTagline}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
            <a
              href="#portfolio"
              className="rounded-full bg-yellow-400 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-yellow-300 sm:px-8 sm:py-4 sm:text-sm"
            >
              Explore Our Work
            </a>

            <a
              href="#contact"
              className="rounded-full border border-white/50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition hover:border-yellow-400 hover:text-yellow-400 sm:px-8 sm:py-4 sm:text-sm"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Yellow Tagline Strip */}
      <section className="bg-yellow-400 px-5 py-7 text-center text-black sm:py-8">
        <p className="break-words text-lg font-black uppercase tracking-wider sm:text-3xl">
          {profile.shortTagline || profile.studioName}
        </p>
      </section>

      {/* Packages - Second Section */}
      {profile.packages.length > 0 && (
        <section
          id="packages"
          className="scroll-mt-5 px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center sm:mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                Choose your experience
              </p>

              <h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">
                Our Packages
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {profile.packages.map((item) => (
                <article
                  key={item.id}
                  className="flex min-w-0 flex-col border border-white/10 bg-zinc-950 p-6 transition hover:border-yellow-400/70 sm:p-8"
                >
                  <h3 className="break-words text-xl font-black uppercase text-yellow-400 sm:text-2xl">
                    {item.name}
                  </h3>

                  {item.price?.trim() && (
                    <p className="mt-3 text-xl font-bold text-white">
                      {item.price}
                    </p>
                  )}

                  <p className="mt-5 flex-1 whitespace-pre-line break-words text-sm leading-7 text-white/60">
                    {item.description}
                  </p>

                  <a
                    href="#contact"
                    className="mt-8 block rounded-full bg-yellow-400 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-black transition hover:bg-yellow-300"
                  >
                    Get Started
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Studio About */}
      {profile.description && (
        <section
          id="about"
          className="scroll-mt-5 mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 sm:py-24"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
            Welcome to our studio
          </p>

          <h2 className="text-3xl font-black uppercase sm:text-5xl">
            Every Moment Has a Story
          </h2>

          <p className="mx-auto mt-6 max-w-3xl whitespace-pre-line break-words text-sm leading-8 text-white/60 sm:mt-7 sm:text-base">
            {profile.description}
          </p>
        </section>
      )}

      {/* Owner Introduction */}
      {(profile.ownerName || profile.ownerPhone || profile.additionalInfo) && (
        <section className="bg-zinc-950 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-center md:gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                The person behind the vision
              </p>

              <h2 className="mt-5 text-3xl font-black uppercase sm:text-5xl">
                Meet Our Founder
              </h2>

              {profile.ownerName && (
                <p className="mt-7 break-words text-2xl font-bold text-yellow-400">
                  {profile.ownerName}
                </p>
              )}

              {profile.ownerPhone && (
                <p className="mt-3 text-white/60">
                  {profile.ownerPhone}
                </p>
              )}
            </div>

            <div className="border-l-4 border-yellow-400 py-5 pl-6 sm:pl-7">
              <p className="whitespace-pre-line break-words text-base leading-8 text-white/65 sm:text-lg sm:leading-9">
                {profile.additionalInfo ||
                  profile.description ||
                  "Creating meaningful memories through photography."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Gallery */}
      {photos.length > 0 && (
        <section
          id="portfolio"
          className="scroll-mt-5 bg-zinc-950 px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-10 text-center sm:mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                Our creations
              </p>

              <h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">
                Selected Portfolio
              </h2>
            </div>

            <div className="columns-2 gap-3 sm:gap-5">
              {visiblePhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:mb-5 sm:rounded-2xl"
                >
                  <img
                    src={photo.imageUrl}
                    alt={`${profile.studioName} portfolio photograph ${index + 1}`}
                    loading="lazy"
                    className="block h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </div>
              ))}
            </div>

            {photos.length > INITIAL_PORTFOLIO_COUNT && (
              <div className="mt-10 flex justify-center sm:mt-12">
                <button
                  type="button"
                  onClick={togglePortfolio}
                  aria-expanded={showAllPortfolio}
                  className="rounded-full border border-yellow-400/70 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-yellow-400 hover:text-black"
                >
                  {showAllPortfolio ? "Show Less" : "View More"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact and Other Studio Details */}
      <section
        id="contact"
        className="scroll-mt-5 bg-yellow-400 px-5 py-16 text-black sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em]">
            Let's create something memorable
          </p>

          <h2 className="mt-5 text-3xl font-black uppercase sm:text-6xl">
            Let's Work Together
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
            {phoneLink && (
              <a
                href={`tel:${phoneLink}`}
                className="rounded-full bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-zinc-800 sm:px-8 sm:py-4 sm:text-sm"
              >
                Call Us
              </a>
            )}

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="rounded-full border-2 border-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition hover:bg-black hover:text-white sm:px-8 sm:py-4 sm:text-sm"
              >
                Email Us
              </a>
            )}
          </div>

          <div className="mt-8 space-y-2 break-words text-sm sm:mt-10">
            {profile.address && <p>{profile.address}</p>}
            {profile.location && <p>{profile.location}</p>}
            {profile.email && <p>{profile.email}</p>}
            {profile.phoneNumber && <p>{profile.phoneNumber}</p>}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-4 sm:mt-9">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-xs font-black uppercase tracking-widest underline underline-offset-4 transition hover:opacity-60"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-5 py-10 text-center sm:px-8">
        <p className="break-words text-lg font-black uppercase tracking-wider">
          {profile.studioName}
        </p>

        {profile.shortTagline && (
          <p className="mt-3 text-xs text-white/40">
            {profile.shortTagline}
          </p>
        )}

        <p className="mt-6 text-[10px] uppercase tracking-widest text-white/30">
          © {new Date().getFullYear()} {profile.studioName}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
