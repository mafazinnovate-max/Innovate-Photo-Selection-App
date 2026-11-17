import { Inter } from "next/font/google";
import { prisma } from "@/lib/prisma";

export default async function Home() {
    const superAdmin = await prisma.superAdmin.findFirst({
        select: {
            logoUrl: true,
        },
    });

    const logo = superAdmin?.logoUrl ? (
        <img
            src={superAdmin.logoUrl}
            alt="Picknovate"
            width={64}
            height={64}
            loading="eager"
            className="h-14 w-14 rounded-xl object-contain sm:h-16 sm:w-16"
        />
    ) : null;

    return (
        <main
            className={`${inter.className} isolate min-h-screen overflow-x-clip scroll-smooth bg-[#14161A] text-[#F4F1EA] selection:bg-[#FFC93C] selection:text-[#14161A]`}
        >
            {/* <PicknovateIntro /> */}
            <LandingPageSmoothScroll />
            <CursorRibbon />

            {/* Navigation */}
            <Navbar logo={logo} />

            {/* Hero */}
            <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-10 lg:grid-cols-2 lg:px-10 lg:pb-24 lg:pt-12">

                <HeroContentReveal />

                <div
                    aria-hidden="true"
                    className="w-full rounded-3xl bg-[#25282C] p-6 sm:rounded-[28px] sm:p-8 lg:ml-auto lg:max-w-[560px] lg:p-10"
                >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                        Your studio, in sync.
                    </p>

                    <p className="mt-6 text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl lg:text-[40px]">
                        Space for
                        <br />
                        your photo selection?
                    </h2>

                    <p className="mt-5 max-w-xl text-zinc-500">
                        Start your free 3-day trial and experience
                        Picknnovate with your own photography workflow.
                    </p>

                    <Link
                        href="/signup"
                        className="mt-8 rounded-2xl bg-white px-8 py-4 font-semibold text-black transition hover:bg-zinc-200"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </section>

            {/* Essentials */}
            <EssentialsSection />


            {/* Website / Make it yours */}
            <WebsiteSection />


            {/* Built around you */}
            <BuiltAroundYouSection />


            {/* FAQ + CTA */}
            <FAQCTASection />


            {/* Footer */}
            <Footer />


        </main>
    );
}