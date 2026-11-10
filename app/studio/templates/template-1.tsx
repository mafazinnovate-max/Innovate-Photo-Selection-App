
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

export default function Template1({
  profile,
}: StudioProfileTemplateProps) {
  const photos = profile.portfolioPhotos;

  const socialLinks = [
    { label: "Facebook", url: profile.facebookUrl },
    { label: "Instagram", url: profile.instagramUrl },
    { label: "YouTube", url: profile.youtubeUrl },
    { label: "Website", url: profile.websiteUrl },
    { label: "Location", url: profile.otherLinks },
  ].filter(
    (item): item is { label: string; url: string } =>
      Boolean(item.url?.trim())
  );

  const phone = profile.phoneNumber?.replace(/[^\d+]/g, "");

  return (
    <main className="min-h-screen overflow-hidden bg-[#52392e] text-[#f2e7d8]">

      {/* Navigation */}
      <header className="sticky top-0 z-30 bg-[#52392e]">
        <nav className="mx-auto flex max-w-7xl items-center justify-center gap-7 px-5 py-5 text-xs font-medium sm:gap-12 sm:text-sm">
          <a href="#home" className="transition hover:text-[#d5a36e]">Home</a>
          <a href="#portfolio" className="font-bold text-[#d5a36e]">Discover Studio</a>
          <a href="#services" className="transition hover:text-[#d5a36e]">Features</a>
          <a href="#about" className="transition hover:text-[#d5a36e]">About</a>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="mx-auto grid max-w-7xl md:grid-cols-2">
        <div className="relative min-h-[360px] bg-[#d8cfc4] md:min-h-[520px]">
          {profile.coverPhotoUrl && (
            <img
              src={profile.coverPhotoUrl}
              alt={`${profile.studioName} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt={`${profile.studioName} logo`}
              className="mb-5 h-14 w-14 rounded-full object-cover"
            />
          )}

          <h1 className="text-3xl font-serif sm:text-4xl">
            [ {profile.studioName} ]
          </h1>

          {profile.shortTagline && (
            <p className="mt-5 text-sm italic text-[#d5a36e]">
              {profile.shortTagline}
            </p>
          )}

          <p className="mt-5 text-sm leading-7 text-[#e2d5c7]">
            {profile.description}
          </p>

          {photos.length > 0 && (
            <div className="mt-7 grid grid-cols-2 gap-2">
              {photos.slice(0, 4).map((photo) => (
                <img
                  key={photo.id}
                  src={photo.imageUrl}
                  alt="Studio photography"
                  className="h-24 w-full object-cover sm:h-32"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Portfolio */}
      {photos.length > 0 && (
        <section id="portfolio" className="px-5 py-20 sm:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-3xl sm:text-4xl">
                Our Portfolio
              </h2>
              <p className="mt-2 text-xs italic text-[#d5a36e]">
                Memories Through Our Lens
              </p>
            </div>

            <div className="grid grid-cols-2 items-center gap-3 md:grid-cols-3 md:gap-6">
              {photos.slice(0, 6).map((photo, index) => (
                <div
                  key={photo.id}
                  className={`overflow-hidden ${
                    index === 1
                      ? "row-span-2 aspect-[3/4]"
                      : "aspect-[3/4]"
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
        <section id="services" className="bg-[#d0a06c] py-10 text-[#52392e]">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between px-5 pb-5 sm:px-10">
              <div>
                <h2 className="font-serif text-2xl">Our Services</h2>
                <p className="mt-1 text-xs">
                  Capturing moments for every occasion
                </p>
              </div>
              <a
                href="#contact"
                className="rounded-full bg-[#eee5d9] px-5 py-2 text-xs font-bold"
              >
                View more
              </a>
            </div>

            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
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
      <section id="about" className="px-5 py-24 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#d5a36e]">
              A little about us
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
              Welcome To Our Little Corner
            </h2>

            {profile.ownerName && (
              <p className="mt-5 text-lg italic text-[#d5a36e]">
                {profile.ownerName}
              </p>
            )}

            <p className="mt-5 text-sm leading-8 text-[#e2d5c7]">
              {profile.additionalInfo || profile.description}
            </p>

            {profile.ownerPhone && (
              <p className="mt-5 text-sm text-[#d5a36e]">
                Contact: {profile.ownerPhone}
              </p>
            )}
          </div>

          <div className="border-l-4 border-[#d0a06c] bg-[#604438] p-8 sm:p-12">
            <p className="font-serif text-2xl leading-relaxed text-[#e7c59f]">
              "Every photograph holds a memory, and every memory deserves to
              last forever."
            </p>
            <p className="mt-6 text-xs uppercase tracking-widest text-[#d5a36e]">
              {profile.studioName}
            </p>
          </div>
        </div>
      </section>

      {/* Packages */}
      {profile.packages.length > 0 && (
        <section id="packages" className="bg-[#e7ddd1] px-5 py-20 text-[#52392e] sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-center font-serif text-3xl sm:text-4xl">
              Our Packages
            </h2>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {profile.packages.map((item) => (
                <article
                  key={item.id}
                  className="relative flex flex-col rounded-[2rem] bg-[#d0a06c] px-7 pb-8 pt-10 text-center shadow-md"
                >
                  <h3 className="absolute -top-4 left-1/2 w-max -translate-x-1/2 rounded-full bg-[#52392e] px-7 py-2 text-sm font-semibold text-[#f2e7d8]">
                    {item.name}
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-left text-sm leading-7 text-[#39261e]">
                    {item.description}
                  </p>

                  <a
                    href="#contact"
                    className="mt-7 rounded-full border border-[#52392e] py-3 text-xs font-bold uppercase tracking-wider transition hover:bg-[#52392e] hover:text-white"
                  >
                    Enquire Now
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="px-5 py-20 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2">
          <div>
            <h3 className="mb-5 font-serif text-xl text-[#d5a36e]">
              Your memories, beautifully preserved
            </h3>
            <ul className="space-y-4 text-sm leading-6 text-[#e2d5c7]">
              <li>Unlimited photo and video uploads</li>
              <li>Automatic photo categories</li>
              <li>Duplicate photo finder</li>
              <li>Voice messages from guests</li>
              <li>Convenient photo selection</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-serif text-xl text-[#d5a36e]">
              A better photography experience
            </h3>
            <ul className="space-y-4 text-sm leading-6 text-[#e2d5c7]">
              <li>Full-resolution downloads</li>
              <li>Easy sharing through links and QR codes</li>
              <li>Separate albums for every occasion</li>
              <li>Simple access for family and friends</li>
              <li>Beautifully delivered memories</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer brand */}
      <section className="bg-[#d0a06c] px-5 py-12 text-[#52392e] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-serif text-3xl">
              [ {profile.studioName} ]
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7">
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
                  className="h-36 w-full object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 bg-[#e7ddd1] px-5 py-5 text-xs font-semibold text-[#52392e]">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#b47c45]"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Contact */}
      <footer id="contact" className="bg-[#52392e] px-5 py-12 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2">
          <div>
            <h3 className="mb-5 font-serif text-xl">Contact Us</h3>
            {profile.phoneNumber && (
              <p className="mb-3 text-sm">Phone: {profile.phoneNumber}</p>
            )}
            {profile.email && (
              <p className="mb-3 break-all text-sm">Email: {profile.email}</p>
            )}
            {profile.address && (
              <p className="text-sm leading-7">{profile.address}</p>
            )}
            {profile.location && (
              <p className="mt-2 text-sm">{profile.location}</p>
            )}
          </div>

          <div>
            <h3 className="mb-5 font-serif text-xl">Get In Touch</h3>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="mb-3 block text-sm text-[#d5a36e]"
              >
                Call {profile.phoneNumber}
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="block break-all text-sm text-[#d5a36e]"
              >
                {profile.email}
              </a>
            )}
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-6 text-center text-[10px] tracking-widest text-white/40">
          © {new Date().getFullYear()} {profile.studioName}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
