
"use client";

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

function getGoogleMapsUrl(
  otherLinks: string | null,
  address: string | null,
  location: string | null
) {
  const otherLink = otherLinks?.trim();

  if (otherLink) {
    try {
      const parsedUrl = new URL(otherLink);

      if (
        parsedUrl.protocol === "https:" ||
        parsedUrl.protocol === "http:"
      ) {
        return otherLink;
      }
    } catch {
      // Use address as fallback.
    }
  }

  const addressText = [address, location]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(", ");

  if (!addressText) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    addressText
  )}`;
}

function CoverBackground({
  imageUrl,
}: {
  imageUrl: string | null;
}) {
  if (!imageUrl) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <img
        src={imageUrl}
        alt=""
        className="h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[#38251f]/60" />
    </div>
  );
}

export default function Template3({
  profile,
}: StudioProfileTemplateProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const photos = profile.portfolioPhotos ?? [];
  const packages = profile.packages ?? [];

  const visiblePhotos = showAllPhotos
    ? photos
    : photos.slice(0, 7);

  const mapsUrl = getGoogleMapsUrl(
    profile.otherLinks,
    profile.address,
    profile.location
  );

  const phone = profile.phoneNumber?.replace(/[^\d+]/g, "");
  const ownerPhone = profile.ownerPhone?.replace(/[^\d+]/g, "");

  const socialLinks = [
    { label: "Instagram", url: profile.instagramUrl },
    { label: "Facebook", url: profile.facebookUrl },
    { label: "YouTube", url: profile.youtubeUrl },
    { label: "Website", url: profile.websiteUrl },
  ].filter(
    (item): item is { label: string; url: string } =>
      Boolean(item.url?.trim())
  );

  const navigation = [
    { label: "Home", href: "#home" },
    { label: "Packages", href: "#packages" },
    { label: "About", href: "#about" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <main
      id="home"
      className="min-h-screen overflow-x-hidden bg-[#38251f] font-sans text-[#f5e9dc] selection:bg-[#d5a16f] selection:text-[#38251f]"
    >
      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-[#d6a779]/20 bg-[#38251f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">

          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt={`${profile.studioName} logo`}
                className="h-10 w-10 shrink-0 rounded-full border border-[#d5a16f]/40 object-contain"
              />
            )}

            <span className="max-w-[220px] break-words font-serif text-lg font-semibold tracking-wide text-[#f5e5d3] sm:text-xl">
              {profile.studioName}
            </span>
          </a>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-7 text-xs font-medium tracking-wider text-[#e5d2c0] md:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[#d9a674]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* MOBILE HAMBURGER */}

          <button
            type="button"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((previous) => !previous)}
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[6px] rounded-lg border border-[#d5a16f]/40 text-[#e5c5a7] transition hover:bg-[#d5a16f]/10 md:hidden"
          >
            <span
              className={`h-[2px] w-5 rounded-full bg-current transition duration-300 ${
                menuOpen
                  ? "translate-y-[8px] rotate-45"
                  : ""
              }`}
            />

            <span
              className={`h-[2px] w-5 rounded-full bg-current transition duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`h-[2px] w-5 rounded-full bg-current transition duration-300 ${
                menuOpen
                  ? "-translate-y-[8px] -rotate-45"
                  : ""
              }`}
            />
          </button>
        </div>

        {/* MOBILE MENU */}

        <div
          id="mobile-navigation"
          className={`absolute inset-x-0 top-full z-50 overflow-hidden border-b border-[#d5a16f]/30 bg-[#38251f] shadow-2xl transition-all duration-300 md:hidden ${
            menuOpen
              ? "visible max-h-96 opacity-100"
              : "invisible max-h-0 opacity-0"
          }`}
        >
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-3">
            {navigation.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between py-4 text-sm font-medium tracking-wide text-[#f0dfce] transition hover:text-[#d5a16f] ${
                  index !== navigation.length - 1
                    ? "border-b border-[#d5a16f]/15"
                    : ""
                }`}
              >
                {item.label}
                <span className="text-[#d5a16f]">→</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* 1. STUDIO INTRODUCTION */}

      <section className="relative isolate overflow-hidden border-b border-[#d5a16f]/20">
        <CoverBackground imageUrl={profile.coverPhotoUrl} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-28">
          <div className="max-w-4xl">

            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#d5a16f] sm:text-xs">
              Welcome to our studio
            </p>

            <h1 className="break-words font-serif text-4xl font-semibold leading-tight text-[#f5e5d3] sm:text-5xl lg:text-7xl">
              {profile.studioName}
            </h1>

            {profile.shortTagline && (
              <p className="mt-6 max-w-2xl break-words font-serif text-lg italic leading-relaxed text-[#e2b48d] sm:text-xl lg:text-2xl">
                {profile.shortTagline}
              </p>
            )}

            {profile.description && (
              <p className="mt-7 max-w-3xl whitespace-pre-line break-words text-sm leading-8 text-[#e3d3c6]/90 sm:text-base sm:leading-9">
                {profile.description}
              </p>
            )}

            <a
              href="#packages"
              className="mt-9 inline-flex items-center gap-4 border border-[#d5a16f] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e9c39c] transition duration-300 hover:bg-[#d5a16f] hover:text-[#38251f] sm:text-xs"
            >
              Explore Our Packages
              <span aria-hidden="true">→</span>
            </a>

          </div>
        </div>
      </section>

      {/* 2. PACKAGES */}

      {packages.length > 0 && (
        <section
          id="packages"
          className="scroll-mt-24 bg-[#eee2d5] px-5 py-16 text-[#38251f] sm:px-8 sm:py-24 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">

            <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">

              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a16c4d] sm:text-xs">
                Thoughtfully designed for you
              </p>

              <h2 className="font-serif text-4xl font-semibold sm:text-5xl lg:text-6xl">
                Our Packages
              </h2>

              <div className="mx-auto mt-6 h-px w-20 bg-[#b47c52]" />

              <p className="mt-6 break-words text-sm leading-7 text-[#795e4e]">
                Discover our collections and find the perfect experience for your special moments.
              </p>

            </div>

            <div
              className={`grid items-stretch gap-6 sm:gap-8 ${
                packages.length === 1
                  ? "mx-auto max-w-lg grid-cols-1"
                  : packages.length === 2
                    ? "mx-auto max-w-4xl grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {packages.map((item, index) => (
                <article
                  key={item.id}
                  className="group relative flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#c18e65]/40 bg-[#d7ad82] p-7 shadow-[0_12px_35px_rgba(56,37,31,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(56,37,31,0.18)] sm:p-9"
                >

                  <div className="mb-7 flex items-center justify-between gap-3">

                    <span className="inline-block max-w-full break-words rounded-full bg-[#694437] px-5 py-2.5 text-xs font-semibold tracking-wide text-[#f5e5d3] sm:text-sm">
                      {item.name}
                    </span>

                    <span className="shrink-0 font-serif text-sm italic text-[#795039]/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                  </div>

                  {item.price?.trim() && (
                    <div className="mb-7 border-b border-[#795039]/20 pb-6">
                      <p className="break-words font-serif text-3xl font-semibold leading-tight text-[#38251f] sm:text-4xl">
                        {item.price}
                      </p>
                    </div>
                  )}

                  {item.description?.trim() && (
                    <p className="flex-1 whitespace-pre-line break-words text-sm leading-8 text-[#51372d]">
                      {item.description}
                    </p>
                  )}

                  <a
                    href="#contact"
                    className="mt-9 flex w-full items-center justify-center gap-3 rounded-full border border-[#694437] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#51372d] transition duration-300 hover:bg-[#694437] hover:text-[#f5e5d3] sm:text-xs"
                  >
                    Enquire About This Package
                    <span aria-hidden="true">→</span>
                  </a>

                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. ABOUT THE STUDIO */}

      {(profile.additionalInfo ||
        profile.description ||
        profile.ownerName ||
        profile.ownerPhone) && (
        <section
          id="about"
          className="relative isolate scroll-mt-24 overflow-hidden border-b border-[#d5a16f]/20 bg-[#493027]"
        >
          <CoverBackground imageUrl={profile.coverPhotoUrl} />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-14">

            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-3 rounded-[2rem] border border-[#d5a16f]/40" />

              <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#38251f]/80 p-10 sm:min-h-[340px]">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt={`${profile.studioName} logo`}
                    className="max-h-52 max-w-full object-contain sm:max-h-64"
                  />
                ) : (
                  <p className="break-words text-center font-serif text-3xl text-[#d5a16f]">
                    {profile.studioName}
                  </p>
                )}
              </div>
            </div>

            <div>

              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#d5a16f] sm:text-xs">
                Behind every beautiful moment
              </p>

              <h2 className="break-words font-serif text-3xl font-semibold leading-tight text-[#f5e5d3] sm:text-4xl lg:text-5xl">
                About Our Studio
              </h2>

              <div className="mt-6 h-px w-16 bg-[#d5a16f]" />

              {(profile.additionalInfo || profile.description) && (
                <p className="mt-7 whitespace-pre-line break-words text-sm leading-8 text-[#e5d5c8] sm:text-base sm:leading-9">
                  {profile.additionalInfo || profile.description}
                </p>
              )}

              {(profile.ownerName || profile.ownerPhone) && (
                <div className="mt-9 border-l-2 border-[#d5a16f] pl-5">

                  {profile.ownerName && (
                    <>
                      <p className="break-words font-serif text-xl italic text-[#e4b98f] sm:text-2xl">
                        {profile.ownerName}
                      </p>

                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5a16f]/70">
                        Studio Owner
                      </p>
                    </>
                  )}

                  {profile.ownerPhone && (
                    <a
                      href={ownerPhone ? `tel:${ownerPhone}` : undefined}
                      className="mt-3 inline-block text-sm text-[#e5d5c8] transition hover:text-[#d5a16f]"
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

      {/* 4. ADDITIONAL STUDIO DETAILS */}

      {(profile.location ||
        profile.address ||
        profile.phoneNumber ||
        profile.email) && (
        <section className="relative isolate overflow-hidden border-b border-[#d5a16f]/20 bg-[#38251f]">

          <CoverBackground imageUrl={profile.coverPhotoUrl} />

          <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-20">

            <div className="mb-10 text-center">

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d5a16f]">
                The little details
              </p>

              <h2 className="font-serif text-3xl text-[#f5e5d3] sm:text-4xl">
                More About Our Studio
              </h2>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {profile.phoneNumber && (
                <div className="rounded-2xl border border-[#d5a16f]/20 bg-[#493027]/85 p-6 backdrop-blur-sm">

                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5a16f]">
                    Phone
                  </p>

                  {phone ? (
                    <a
                      href={`tel:${phone}`}
                      className="break-words text-sm text-[#f5e5d3] hover:text-[#d5a16f]"
                    >
                      {profile.phoneNumber}
                    </a>
                  ) : (
                    <p className="break-words text-sm text-[#f5e5d3]">
                      {profile.phoneNumber}
                    </p>
                  )}

                </div>
              )}

              {profile.email && (
                <div className="rounded-2xl border border-[#d5a16f]/20 bg-[#493027]/85 p-6 backdrop-blur-sm">

                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5a16f]">
                    Email
                  </p>

                  <a
                    href={`mailto:${profile.email}`}
                    className="break-all text-sm text-[#f5e5d3] hover:text-[#d5a16f]"
                  >
                    {profile.email}
                  </a>

                </div>
              )}

              {(profile.address || profile.location) && (
                <div className="rounded-2xl border border-[#d5a16f]/20 bg-[#493027]/85 p-6 backdrop-blur-sm">

                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5a16f]">
                    Location
                  </p>

                  <p className="whitespace-pre-line break-words text-sm leading-7 text-[#f5e5d3]">
                    {[profile.address, profile.location]
                      .filter((value): value is string =>
                        Boolean(value?.trim())
                      )
                      .join(", ")}
                  </p>

                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#d5a16f] hover:text-[#f5e5d3]"
                    >
                      View on Google Maps
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}

                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* 5. PORTFOLIO - COLLAGE MASONRY */}

      {photos.length > 0 && (
        <section
          id="portfolio"
          className="scroll-mt-24 bg-[#eee2d5] px-4 py-16 text-[#38251f] sm:px-8 sm:py-24 lg:px-12"
        >
          <div className="mx-auto max-w-[1500px]">

            <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">

              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a16c4d] sm:text-xs">
                Moments preserved forever
              </p>

              <h2 className="font-serif text-4xl font-semibold sm:text-5xl lg:text-6xl">
                Our Portfolio
              </h2>

              <div className="mx-auto mt-6 h-px w-20 bg-[#b47c52]" />

              <p className="mt-6 break-words text-sm leading-7 text-[#795e4e]">
                A collection of stories, emotions and beautiful memories captured through our lens.
              </p>

            </div>

            {/* LARGER MASONRY COLLAGE */}

            <div className="columns-2 gap-3 sm:columns-2 sm:gap-5 md:columns-2 lg:columns-3 xl:columns-3">

              {visiblePhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-xl border border-[#c9a98d]/40 bg-white/50 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:mb-5 sm:rounded-2xl ${
                    index === 0 || index === 4
                      ? "sm:mb-6"
                      : ""
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt={`${profile.studioName} portfolio photograph ${index + 1}`}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="block h-auto w-full object-contain transition-transform duration-500 hover:scale-[1.025]"
                  />
                </div>
              ))}

            </div>

            {/* VIEW MORE / SHOW LESS */}

            {photos.length > 7 && (
              <div className="mt-12 flex justify-center">

                <button
                  type="button"
                  onClick={() => {
                    setShowAllPhotos((previous) => !previous);
                  }}
                  aria-expanded={showAllPhotos}
                  className="inline-flex min-w-[190px] items-center justify-center gap-4 rounded-full border border-[#a16c4d] bg-[#38251f] px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f5e5d3] shadow-lg transition duration-300 hover:bg-[#a16c4d] hover:text-white"
                >
                  {showAllPhotos ? "Show Less" : "View More"}

                  <span
                    className={`transition-transform duration-300 ${
                      showAllPhotos ? "rotate-180" : ""
                    }`}
                  >
                    ↓
                  </span>
                </button>

              </div>
            )}

          </div>
        </section>
      )}

      {/* 6. CONTACT AND FOOTER */}

      <footer
        id="contact"
        className="relative isolate scroll-mt-24 overflow-hidden bg-[#38251f] px-6 pt-16 sm:px-10 sm:pt-20"
      >

        <CoverBackground imageUrl={profile.coverPhotoUrl} />

        <div className="relative z-10 mx-auto max-w-7xl">

          <div className="grid gap-12 border-b border-[#d5a16f]/25 pb-12 md:grid-cols-2 md:gap-16">

            {/* STUDIO BRANDING */}

            <div>

              <a
                href="#home"
                className="inline-flex max-w-full items-center gap-4"
              >
                {profile.logoUrl && (
                  <img
                    src={profile.logoUrl}
                    alt={`${profile.studioName} logo`}
                    className="h-12 w-12 shrink-0 rounded-full object-contain"
                  />
                )}

                <span className="break-words font-serif text-2xl font-semibold text-[#f5e5d3] sm:text-3xl">
                  {profile.studioName}
                </span>
              </a>

              {profile.shortTagline && (
                <p className="mt-5 max-w-md break-words font-serif text-base italic leading-relaxed text-[#d5a16f] sm:text-lg">
                  {profile.shortTagline}
                </p>
              )}

              {profile.description && (
                <p className="mt-5 max-w-md whitespace-pre-line break-words text-sm leading-7 text-[#e5d5c8]/80">
                  {profile.description}
                </p>
              )}

              {socialLinks.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">

                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[#d5a16f]/35 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#e5c5a7] transition hover:bg-[#d5a16f] hover:text-[#38251f]"
                    >
                      {link.label}
                    </a>
                  ))}

                </div>
              )}

            </div>

            {/* CONTACT INFORMATION */}

            <div>

              <h3 className="mb-7 font-serif text-2xl text-[#f5e5d3]">
                Get In Touch
              </h3>

              <div className="space-y-6">

                {profile.phoneNumber && (
                  <div>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d5a16f]">
                      Phone
                    </p>

                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="break-words text-sm text-[#e5d5c8] transition hover:text-[#d5a16f]"
                      >
                        {profile.phoneNumber}
                      </a>
                    ) : (
                      <p className="break-words text-sm text-[#e5d5c8]">
                        {profile.phoneNumber}
                      </p>
                    )}

                  </div>
                )}

                {profile.email && (
                  <div>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d5a16f]">
                      Email
                    </p>

                    <a
                      href={`mailto:${profile.email}`}
                      className="break-all text-sm text-[#e5d5c8] transition hover:text-[#d5a16f]"
                    >
                      {profile.email}
                    </a>

                  </div>
                )}

                {(profile.address || profile.location) && (
                  <div>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d5a16f]">
                      Address
                    </p>

                    <p className="whitespace-pre-line break-words text-sm leading-7 text-[#e5d5c8]">
                      {[profile.address, profile.location]
                        .filter((value): value is string =>
                          Boolean(value?.trim())
                        )
                        .join(", ")}
                    </p>

                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs font-semibold text-[#d5a16f] hover:text-[#f5e5d3]"
                      >
                        Get Directions →
                      </a>
                    )}

                  </div>
                )}

              </div>
            </div>

          </div>

          {/* COPYRIGHT */}

          <div className="flex flex-col items-center justify-between gap-4 py-7 text-center sm:flex-row sm:text-left">

            <p className="text-[10px] leading-6 text-[#e5d5c8]/65 sm:text-xs">
              © {new Date().getFullYear()} {profile.studioName}. All rights reserved.
            </p>

            <a
              href="#home"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5a16f] transition hover:text-[#f5e5d3]"
            >
              Back to Top ↑
            </a>

          </div>

        </div>
      </footer>
    </main>
  );
}
