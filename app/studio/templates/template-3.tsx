
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

export default function Template3({
  profile,
}: StudioProfileTemplateProps) {
  const photos = profile.portfolioPhotos;

  const socialLinks = [
    { label: "Facebook", url: profile.facebookUrl },
    { label: "Instagram", url: profile.instagramUrl },
    { label: "YouTube", url: profile.youtubeUrl },
    { label: "Website", url: profile.websiteUrl },
    { label: "Other", url: profile.otherLinks },
  ].filter(
    (item): item is { label: string; url: string } =>
      Boolean(item.url?.trim())
  );

  const phone = profile.phoneNumber?.replace(/[^\d+]/g, "");

  return (
    <main className="min-h-screen overflow-hidden bg-[#171416] text-[#f1e5d9]">

      {/* Navigation */}
      <header className="border-b border-white/10 bg-[#a15e43]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-10">
          <a href="#home" className="flex items-center gap-3">
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt={`${profile.studioName} logo`}
                className="h-9 w-9 rounded-full object-cover"
              />
            )}
            <span className="hidden text-sm font-bold uppercase tracking-wider sm:block">
              {profile.studioName}
            </span>
          </a>

          <nav className="flex items-center gap-4 text-[10px] font-medium sm:gap-8 sm:text-xs">
            <a href="#home" className="hover:text-black">Home</a>
            <a href="#portfolio" className="hover:text-black">Discover Studio</a>
            <a href="#services" className="hover:text-black">Features</a>
            <a href="#about" className="hover:text-black">About</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="border-b-[45px] border-[#171416] bg-[#4d3027]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-2 md:items-center md:px-12 lg:py-16">
          <div>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">
              [ {profile.studioName} ]
            </h1>

            {profile.shortTagline && (
              <p className="mt-5 text-sm italic text-[#d7a17d]">
                {profile.shortTagline}
              </p>
            )}

            <p className="mt-5 text-sm leading-7 text-[#e2d3c8]">
              {profile.description}
            </p>

            <a
              href="#portfolio"
              className="mt-7 inline-block border border-[#d7a17d] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#d7a17d] transition hover:bg-[#d7a17d] hover:text-[#30201b]"
            >
              Explore Our Work
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.slice(0, 3).map((photo, index) => (
              <div
                key={photo.id}
                className={`overflow-hidden ${
                  index === 0 ? "aspect-[4/5]" : "aspect-square"
                } ${index === 0 ? "row-span-2" : ""}`}
              >
                <img
                  src={photo.imageUrl}
                  alt="Studio photography"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {photos.length === 0 && profile.coverPhotoUrl && (
              <img
                src={profile.coverPhotoUrl}
                alt="Studio cover"
                className="col-span-2 aspect-[16/9] w-full object-cover"
              />
            )}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {photos.length > 0 && (
        <section id="portfolio" className="border-b-[45px] border-[#171416]">
          <div className="bg-[#5b3b30] px-5 py-8 text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Our Portfolio
            </h2>
            <p className="mt-2 text-xs italic text-[#d7a17d]">
              Moments That Last Forever
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#4d3027]/30" />
            <div className="relative mx-auto grid max-w-7xl gap-1 px-3 py-7 sm:grid-cols-3 sm:px-6">
              {photos.slice(0, 6).map((photo, index) => (
                <div
                  key={photo.id}
                  className={`overflow-hidden ${
                    index === 1 ? "aspect-[4/5]" : "aspect-[5/4]"
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt="Portfolio photograph"
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {photos.length > 0 && (
        <section id="services" className="border-b-[45px] border-[#171416] bg-[#a15e43] py-8">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-[#fff0e3]">
                Our Services
              </h2>
              <p className="mt-2 text-xs text-[#f0d3c1]">
                Capturing special moments for every occasion
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {photos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt="Photography service"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About / Owner */}
      <section id="about" className="border-b-[45px] border-[#171416] bg-[#d6b9a9] text-[#493027]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[0.8fr_1.5fr]">
          <div className="flex items-center justify-center bg-[#eee3dc] px-8 py-12">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={`${profile.studioName} logo`}
                className="h-36 w-36 rounded-full object-cover sm:h-48 sm:w-48"
              />
            ) : (
              <div className="text-center">
                <p className="font-serif text-2xl">
                  {profile.studioName}
                </p>
              </div>
            )}
          </div>

          <div className="px-7 py-12 sm:px-12">
            <div className="bg-[#a15e43] px-6 py-4">
              <h2 className="font-serif text-2xl font-bold text-[#fff0e3] sm:text-3xl">
                Welcome To My Little Corner
              </h2>
            </div>

            {profile.ownerName && (
              <p className="mt-7 font-serif text-xl italic text-[#7c4937]">
                {profile.ownerName}
              </p>
            )}

            <p className="mt-5 text-sm leading-8">
              {profile.additionalInfo || profile.description}
            </p>

            {profile.ownerPhone && (
              <p className="mt-5 text-sm font-semibold">
                Contact: {profile.ownerPhone}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Packages */}
      {profile.packages.length > 0 && (
        <section id="packages" className="border-b-[45px] border-[#171416] px-5 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 grid gap-8 md:grid-cols-2 md:items-center">
              <div className="overflow-hidden">
                {profile.coverPhotoUrl && (
                  <img
                    src={profile.coverPhotoUrl}
                    alt="Studio photography"
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}
              </div>

              <div className="text-center">
                <h2 className="font-serif text-4xl font-bold">
                  Our Packages
                </h2>
                <p className="mt-3 text-xs italic text-[#d7a17d]">
                  Find the experience that suits you
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[#a15e43] p-5 sm:p-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {profile.packages.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col rounded-[2rem] bg-[#d5a06e] px-6 py-8 text-[#30201b] shadow-lg"
                  >
                    <h3 className="mb-7 rounded-full bg-[#694437] px-5 py-3 text-center text-sm font-bold text-[#f2dfce]">
                      {item.name}
                    </h3>

                    <p className="flex-1 whitespace-pre-line text-sm leading-7">
                      {item.description}
                    </p>

                    <a
                      href="#contact"
                      className="mt-7 rounded-full border border-[#694437] py-3 text-center text-xs font-bold uppercase tracking-wider transition hover:bg-[#694437] hover:text-white"
                    >
                      Enquire Now
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Studio introduction */}
      <section className="border-b border-[#d7a17d]/30 px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#d7a17d]">
              {profile.studioName}
            </h2>
            {profile.shortTagline && (
              <p className="mt-3 text-sm italic">
                {profile.shortTagline}
              </p>
            )}
            <p className="mt-5 text-sm leading-7 text-white/60">
              {profile.description}
            </p>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {photos.slice(0, 2).map((photo) => (
                <img
                  key={photo.id}
                  src={photo.imageUrl}
                  alt="Studio work"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Social links and contact */}
      <section id="contact" className="border-b-[45px] border-[#171416] px-6 py-12 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-6 font-serif text-xl text-[#d7a17d]">
              Get In Touch
            </h3>

            <div className="space-y-4 text-sm text-white/70">
              {profile.address && <p>{profile.address}</p>}
              {profile.location && <p>{profile.location}</p>}
              {profile.phoneNumber && <p>Phone: {profile.phoneNumber}</p>}
              {profile.email && <p>Email: {profile.email}</p>}
            </div>
          </div>

          <div className="border-l border-[#d7a17d]/50 pl-7">
            <h3 className="mb-6 font-serif text-xl text-[#d7a17d]">
              Contact Us
            </h3>

            <div className="space-y-4 text-sm text-white/70">
              {phone && (
                <a href={`tel:${phone}`} className="block hover:text-[#d7a17d]">
                  Call: {profile.phoneNumber}
                </a>
              )}

              {profile.email && (
                <a href={`mailto:${profile.email}`} className="block hover:text-[#d7a17d]">
                  {profile.email}
                </a>
              )}

              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-[#d7a17d]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing photograph */}
      {profile.coverPhotoUrl && (
        <section className="relative">
          <img
            src={profile.coverPhotoUrl}
            alt={`${profile.studioName} photography`}
            loading="lazy"
            className="max-h-[650px] min-h-[280px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-10 text-center">
            <h2 className="font-serif text-2xl font-bold sm:text-4xl">
              {profile.studioName}
            </h2>
            {profile.shortTagline && (
              <p className="mt-3 text-sm text-[#f1d3bd]">
                {profile.shortTagline}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#a15e43] px-5 py-6 text-center text-xs text-[#fff0e3]">
        © {new Date().getFullYear()} {profile.studioName}. All rights reserved.
      </footer>
    </main>
  );
}
