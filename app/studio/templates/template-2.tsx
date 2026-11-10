
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
      description: string;
    }[];
    portfolioPhotos: {
      id: string;
      imageUrl: string;
    }[];
  };
};

export default function Template2({
  profile,
}: StudioProfileTemplateProps) {
  const photos = profile.portfolioPhotos;

  const socialLinks = [
    { label: "Instagram", url: profile.instagramUrl },
    { label: "Facebook", url: profile.facebookUrl },
    { label: "YouTube", url: profile.youtubeUrl },
    { label: "Website", url: profile.websiteUrl },
    { label: "Other", url: profile.otherLinks },
  ].filter(
    (item): item is { label: string; url: string } =>
      Boolean(item.url?.trim())
  );

  const phoneLink = profile.phoneNumber?.replace(/[^\d+]/g, "");

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      {/* Navigation */}
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#home" className="flex items-center gap-3">
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt={`${profile.studioName} logo`}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <span className="text-lg font-bold uppercase tracking-wider">
              {profile.studioName}
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-widest text-white/70 md:flex">
            <a href="#home" className="transition hover:text-yellow-400">Home</a>
            <a href="#portfolio" className="transition hover:text-yellow-400">Portfolio</a>
            <a href="#services" className="transition hover:text-yellow-400">Services</a>
            <a href="#about" className="transition hover:text-yellow-400">About</a>
            <a href="#packages" className="transition hover:text-yellow-400">Packages</a>
            <a href="#contact" className="transition hover:text-yellow-400">Contact</a>
          </nav>

          <a
            href="#contact"
            className="rounded-full bg-yellow-400 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-yellow-300"
          >
            Let's Talk
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative flex min-h-[650px] items-center bg-zinc-900">
        {profile.coverPhotoUrl && (
          <img
            src={profile.coverPhotoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-28 sm:px-8">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.35em] text-yellow-400">
            Photography • Creativity • Memories
          </p>

          <h1 className="max-w-4xl text-5xl font-black uppercase leading-tight sm:text-7xl lg:text-8xl">
            {profile.studioName}
          </h1>

          {profile.shortTagline && (
            <p className="mt-7 max-w-2xl text-lg text-white/80 sm:text-2xl">
              {profile.shortTagline}
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#portfolio"
              className="rounded-full bg-yellow-400 px-8 py-4 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-yellow-300"
            >
              Explore Our Work
            </a>
            <a
              href="#contact"
              className="rounded-full border border-white/50 px-8 py-4 text-sm font-bold uppercase tracking-wider transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Yellow tagline strip */}
      <section className="bg-yellow-400 px-5 py-8 text-center text-black">
        <p className="text-xl font-black uppercase tracking-wider sm:text-3xl">
          {profile.shortTagline || profile.studioName}
        </p>
      </section>

      {/* Introduction */}
      {profile.description && (
        <section className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
            Welcome to our studio
          </p>
          <h2 className="text-3xl font-black uppercase sm:text-5xl">
            Every Moment Has a Story
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-white/60">
            {profile.description}
          </p>
        </section>
      )}

      {/* Portfolio */}
      {photos.length > 0 && (
        <section id="portfolio" className="bg-zinc-950 px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                Our creations
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                Selected Portfolio
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group aspect-[4/5] overflow-hidden bg-zinc-900"
                >
                  <img
                    src={photo.imageUrl}
                    alt="Studio portfolio"
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {photos.length > 0 && (
        <section id="services" className="px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                What we do
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                Our Services
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {photos.slice(0, 6).map((photo, index) => (
                <div key={photo.id} className="relative aspect-[5/4] overflow-hidden bg-zinc-900">
                  <img
                    src={photo.imageUrl}
                    alt={`Photography service ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                    <span className="text-sm font-bold uppercase tracking-wider">
                      Photography
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Owner introduction */}
      {(profile.ownerName || profile.ownerPhone) && (
        <section id="about" className="bg-zinc-950 px-5 py-24 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                The person behind the vision
              </p>
              <h2 className="mt-5 text-4xl font-black uppercase sm:text-5xl">
                Meet Our Founder
              </h2>
              {profile.ownerName && (
                <p className="mt-7 text-2xl font-bold text-yellow-400">
                  {profile.ownerName}
                </p>
              )}
              {profile.ownerPhone && (
                <p className="mt-3 text-white/60">
                  {profile.ownerPhone}
                </p>
              )}
            </div>

            <div className="border-l-4 border-yellow-400 py-5 pl-7">
              <p className="text-lg leading-9 text-white/65">
                {profile.additionalInfo ||
                  profile.description ||
                  "Creating meaningful memories through photography."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Packages */}
      {profile.packages.length > 0 && (
        <section id="packages" className="px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                Choose your experience
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                Our Packages
              </h2>
            </div>

            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {profile.packages.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col border border-white/10 bg-zinc-950 p-8 transition hover:border-yellow-400/70"
                >
                  <h3 className="text-2xl font-black uppercase text-yellow-400">
                    {item.name}
                  </h3>
                  <p className="mt-5 flex-1 whitespace-pre-line text-sm leading-7 text-white/60">
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

      {/* Contact */}
      <section id="contact" className="bg-yellow-400 px-5 py-24 text-black sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em]">
            Let's create something memorable
          </p>
          <h2 className="mt-5 text-4xl font-black uppercase sm:text-6xl">
            Let's Work Together
          </h2>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {phoneLink && (
              <a
                href={`tel:${phoneLink}`}
                className="rounded-full bg-black px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-zinc-800"
              >
                Call Us
              </a>
            )}

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="rounded-full border-2 border-black px-8 py-4 text-sm font-bold uppercase tracking-wider transition hover:bg-black hover:text-white"
              >
                Email Us
              </a>
            )}
          </div>

          <div className="mt-10 space-y-2 text-sm">
            {profile.address && <p>{profile.address}</p>}
            {profile.location && <p>{profile.location}</p>}
            {profile.email && <p>{profile.email}</p>}
            {profile.phoneNumber && <p>{profile.phoneNumber}</p>}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-9 flex flex-wrap justify-center gap-6">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black uppercase tracking-widest underline underline-offset-4 hover:opacity-60"
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
        <p className="text-lg font-black uppercase tracking-wider">
          {profile.studioName}
        </p>
        <p className="mt-3 text-xs text-white/40">
          {profile.shortTagline}
        </p>
        <p className="mt-6 text-[10px] uppercase tracking-widest text-white/30">
          © {new Date().getFullYear()} {profile.studioName}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
