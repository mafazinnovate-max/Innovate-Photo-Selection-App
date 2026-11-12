import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { prisma } from "@/lib/prisma";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    display: "swap",
});

const faqs = [
    {
        q: "How does photo selection work?",
        a: "Share a gallery with your client. They view the photos and pick their favourites, and you receive the organized selection.",
    },
    {
        q: "Can I manage projects and documents?",
        a: "Yes. Keep every client, project record, quotation, invoice and contract in one place.",
    },
    {
        q: "Can I manage my team?",
        a: "Yes. Track attendance and crew logs, and automate payslips for your team.",
    },
    {
        q: "Can I build my own website?",
        a: "Yes. Pick a template, add your story and publish a website that feels like your brand.",
    },
    {
        q: "Can I showcase packages?",
        a: "Yes. Present your packages and services with pricing on your website.",
    },
    {
        q: "Are subscription plans available?",
        a: "Yes. Choose Starter, Professional or Business. Prices and plan limits are subject to confirmation.",
    },
];

const tiers = [
    {
        tier: "Tier 01",
        name: "Starter",
        tag: "For solo photographers",
        lead: null,
        items: [
            "Photo Selection (5 Galleries)",
            "Project Management",
            "Quotations & Invoices",
            "Digital Contracts",
        ],
        cta: "Get Started",
        featured: false,
    },
    {
        tier: "Tier 02",
        name: "Professional",
        tag: "Your complete studio toolkit",
        lead: "Everything in Starter, plus:",
        items: [
            "Unlimited Photo Selection",
            "Attendance & Crew Logs",
            "Automated Payslips",
            "Business Website Builder",
        ],
        cta: "Choose Professional",
        featured: true,
    },
    {
        tier: "Tier 03",
        name: "Business",
        tag: "For growing production agencies",
        lead: "Professional Features, plus:",
        items: [
            "Multi-Brand Websites",
            "Advanced Storage Limits",
            "Custom Domain & White-label",
            "Dedicated Account Manager",
        ],
        cta: "Get Started",
        featured: false,
    },
];

const footerCols = [
    {
        title: "Product",
        links: [
            "Smart Photo Selection",
            "Project Records",
            "Quotations & Contracts",
            "Team & Payslips",
            "Website Builder",
        ],
    },
    {
        title: "Solutions",
        links: [
            "Wedding Studios",
            "Commercial Photography",
            "Videographers",
            "Event Companies",
            "Pricing Plans",
        ],
    },
    {
        title: "Company & Legal",
        links: [
            "About Us",
            "FAQs",
            "Privacy Policy",
            "Terms of Service",
            "Support & Contact",
        ],
    },
];

export default async function Home() {
    const superAdmin = await prisma.superAdmin.findFirst({
        select: {
            logoUrl: true,
        },
    });

    const logo = superAdmin?.logoUrl ? (
        <Image
            src={superAdmin.logoUrl}
            alt="Picknnovate"
            width={64}
            height={64}
            priority
            className="h-14 w-14 rounded-xl object-contain sm:h-16 sm:w-16"
        />
    ) : null;

    return (
        <main
            className={`${inter.className} min-h-screen scroll-smooth bg-[#14161A] text-[#F4F1EA] selection:bg-[#FFC93C] selection:text-[#14161A]`}
        >
            {/* Navigation */}
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
                <Link href="/" className="flex items-center">
                    {logo}
                </Link>

                <div className="hidden items-center gap-12 text-xs font-medium text-[#F4F1EA]/70 md:flex">
                    <a href="#features" className="transition hover:text-white">Features</a>
                    <a href="#website" className="transition hover:text-white">Website</a>
                    <a href="#pricing" className="transition hover:text-white">Pricing</a>
                    <a href="#faqs" className="transition hover:text-white">FAQs</a>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="rounded-lg bg-[#F4F1EA] px-6 py-3 text-xs font-semibold text-[#14161A] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC93C] sm:px-8"
                    >
                        Login
                    </Link>

                    <Link
                        href="/signup"
                        className="rounded-lg bg-[#FFC93C] px-5 py-3 text-xs font-semibold text-[#14161A] transition hover:bg-[#ffd666] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-7"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-10 sm:px-8 lg:grid-cols-2 lg:px-10 lg:pb-24 lg:pt-12">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                        Your creative business, simplified.
                    </p>

                    <h1 className="mt-8 text-6xl font-medium leading-[1.02] tracking-tight sm:text-7xl lg:text-[84px]">
                        Less admin.
                        <br />
                        More creating.
                    </h1>

                    <p className="mt-8 max-w-md text-base leading-7 text-[#F4F1EA]/60">
                        Selections, projects, documents, team and website.
                        <br />
                        Your photography business, in one place.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            href="/signup"
                            className="rounded-lg bg-[#FFC93C] px-7 py-3.5 text-xs font-semibold text-[#14161A] transition hover:bg-[#ffd666] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Get Started
                        </Link>

                        <a
                            href="#features"
                            className="rounded-lg bg-[#25282C] px-7 py-3.5 text-xs font-semibold text-[#F4F1EA] transition hover:bg-[#2f3338] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC93C]"
                        >
                            Explore Features
                        </a>
                    </div>

                    <p className="mt-8 text-[11px] text-[#F4F1EA]/45">
                        Built for photographers. Ready for growth.
                    </p>
                </div>

                <div
                    aria-hidden="true"
                    className="rounded-[28px] bg-[#25282C] p-8 sm:p-10 lg:ml-auto lg:w-full lg:max-w-[560px]"
                >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                        Your studio, in sync.
                    </p>

                    <p className="mt-6 text-4xl font-normal leading-[1.1] tracking-tight sm:text-[40px]">
                        Space for
                        <br />
                        your best work.
                    </p>

                    <div className="mt-12 space-y-2 pb-2">
                        <div className="-rotate-[2deg] rounded-xl bg-[#FFC93C] px-5 py-4 text-xl font-normal text-[#14161A]">
                            <span className="mr-6 text-[10px] font-semibold">01</span>
                            Select photos
                        </div>
                        <div className="-rotate-[1.5deg] rounded-xl bg-[#F4F1EA] px-5 py-4 text-xl font-normal text-[#14161A]">
                            <span className="mr-6 text-[10px] font-semibold text-[#14161A]/60">02</span>
                            Run your studio
                        </div>
                        <div className="rotate-[2deg] rounded-xl bg-[#3A3F2E] px-5 py-4 text-xl font-normal text-[#F4F1EA]/85">
                            <span className="mr-6 text-[10px] font-semibold">03</span>
                            Grow your brand
                        </div>
                    </div>
                </div>
            </section>

            {/* Essentials */}
            <section id="features" className="scroll-mt-4 border-t border-white/10">
                <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                                The essentials
                            </p>
                            <h2 className="mt-5 text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl">
                                One workspace.
                                <br />
                                Every moving part.
                            </h2>
                        </div>

                        <p className="text-xs text-[#F4F1EA]/60 md:mr-[22%]">
                            Less switching. More momentum.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-3 md:h-[490px] md:grid-cols-3 md:grid-rows-[repeat(6,minmax(0,1fr))]">
                        {/* 01 */}
                        <div className="flex min-h-[320px] flex-col rounded-2xl bg-[#FFC93C] p-7 text-[#14161A] md:col-start-1 md:row-span-6 md:row-start-1 md:min-h-0">
                            <span className="text-[10px] font-semibold">01</span>
                            <h3 className="mt-4 text-3xl font-normal leading-tight tracking-tight">
                                Smart photo
                                <br />
                                selection
                            </h3>
                            <p className="mt-auto text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-[40px]">
                                PICK.
                                <br />
                                LOVE.
                                <br />
                                DELIVER.
                            </p>
                        </div>

                        <div className="flex min-h-[150px] flex-col rounded-2xl bg-[#1E2125] p-6 md:min-h-0 md:col-start-2 md:row-span-3 md:row-start-1">
                            <span className="text-[10px] font-semibold text-[#FFC93C]">02</span>
                            <h3 className="mt-3 text-xl font-normal tracking-tight">
                                Projects &amp; files
                            </h3>
                            <p className="mt-auto text-xs text-[#F4F1EA]/55">
                                Every client. Every file. In order.
                            </p>
                        </div>

                        <div className="flex min-h-[150px] flex-col rounded-2xl bg-[#1E2125] p-6 md:min-h-0 md:col-start-2 md:row-span-3 md:row-start-4">
                            <span className="text-[10px] font-semibold text-[#FFC93C]">03</span>
                            <h3 className="mt-3 text-xl font-normal tracking-tight">
                                Contracts &amp; quotes
                            </h3>
                            <p className="mt-auto text-xs text-[#F4F1EA]/55">
                                Professional documents, simplified.
                            </p>
                        </div>

                        <div className="flex min-h-[150px] flex-col rounded-2xl bg-[#1E2125] p-6 md:min-h-0 md:col-start-3 md:row-span-2 md:row-start-1">
                            <span className="text-[10px] font-semibold text-[#FFC93C]">04</span>
                            <h3 className="mt-3 text-xl font-normal tracking-tight">
                                Attendance &amp; payslips
                            </h3>
                            <p className="mt-auto text-xs text-[#F4F1EA]/55">
                                Keep your team on track.
                            </p>
                        </div>

                        <div className="flex min-h-[150px] flex-col rounded-2xl bg-[#343A2B] p-6 md:min-h-0 md:col-start-3 md:row-span-2 md:row-start-3">
                            <span className="text-[10px] font-semibold text-[#FFC93C]">05</span>
                            <h3 className="mt-3 text-xl font-normal tracking-tight">
                                Website builder
                            </h3>
                            <p className="mt-auto text-xs text-[#F4F1EA]/55">
                                Make your business feel like you.
                            </p>
                        </div>

                        <div className="flex min-h-[150px] flex-col rounded-2xl bg-[#1E2125] p-6 md:min-h-0 md:col-start-3 md:row-span-2 md:row-start-5">
                            <span className="text-[10px] font-semibold text-[#FFC93C]">06</span>
                            <h3 className="mt-3 text-xl font-normal tracking-tight">
                                Packages &amp; services
                            </h3>
                            <p className="mt-auto text-xs text-[#F4F1EA]/55">
                                Show your value. Share your pricing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Website / Make it yours */}
            <section id="website" className="scroll-mt-4 overflow-hidden bg-[#F4F1EA] text-[#14161A]">
                <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:px-10">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider">
                            Make it yours
                        </p>

                        <h2 className="mt-8 text-5xl font-normal leading-[1.08] tracking-tight sm:text-6xl">
                            Your business.
                            <br />
                            Your website.
                            <br />
                            Your style.
                        </h2>

                        <p className="mt-8 text-base text-[#14161A]/60">
                            Pick a template. Add your story. Go live.
                        </p>

                        <Link
                            href="/signup"
                            className="mt-8 inline-block rounded-lg bg-[#14161A] px-7 py-3.5 text-xs font-semibold text-[#F4F1EA] transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14161A]"
                        >
                            Create Your Website
                        </Link>

                        <p className="mt-8 text-[11px] text-[#14161A]/55">
                            Templates&nbsp;&nbsp;/&nbsp;&nbsp;Customization&nbsp;&nbsp;/&nbsp;&nbsp;Services &amp; pricing
                        </p>
                    </div>

                    <div
                        aria-hidden="true"
                        className="mx-auto w-full max-w-[560px] rotate-[4deg] rounded-[28px] bg-[#14161A] p-8 text-[#F4F1EA] sm:p-10 lg:ml-auto"
                    >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                            Your studio
                        </p>
                        <div className="mt-4 h-px w-full bg-white/10" />

                        <p className="mt-8 origin-left -rotate-[3deg] text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl">
                            Create
                            <br />
                            something
                            <br />
                            worth seeing.
                        </p>

                        <div className="mt-8 rotate-[3deg] rounded-xl bg-[#FFC93C] px-5 py-4 text-xl font-normal text-[#14161A]">
                            Packages &amp; Services
                        </div>
                    </div>
                </div>
            </section>

            {/* Built around you */}
            <section>
                <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:px-10">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                            Built around you
                        </p>
                        <h2 className="mt-6 text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl">
                            Create more.
                            <br />
                            Juggle less.
                        </h2>
                        <p className="mt-6 text-xs leading-6 text-[#F4F1EA]/60">
                            Studios · Wedding photographers
                            <br />
                            Videographers · Event companies
                        </p>
                    </div>

                    <div className="text-sm">
                        {[
                            ["One platform", "Keep projects, clients and team connected."],
                            ["Less admin", "Simplify selections, documents and payroll."],
                            ["More room to grow", "Show up professionally, online and off."],
                        ].map(([title, desc]) => (
                            <div
                                key={title}
                                className="grid gap-2 border-t border-white/10 py-7 sm:grid-cols-[1fr_1fr]"
                            >
                                <p className="font-normal">{title}</p>
                                <p className="text-xs text-[#F4F1EA]/55">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="scroll-mt-4">
                <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8 sm:px-8 lg:px-10">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                        Room to grow
                    </p>
                    <h2 className="mt-5 text-3xl font-normal tracking-tight sm:text-4xl">
                        Your next chapter starts here.
                    </h2>

                    <div className="mt-10 grid gap-3 md:grid-cols-3">
                        {tiers.map((t) => (
                            <div
                                key={t.name}
                                className={`flex flex-col rounded-2xl p-6 ${
                                    t.featured
                                        ? "bg-[#FFC93C] text-[#14161A]"
                                        : "bg-[#1E2125] text-[#F4F1EA]"
                                }`}
                            >
                                <div className="flex items-center justify-between text-[10px] font-semibold uppercase">
                                    <span className={t.featured ? "" : "text-[#F4F1EA]/60"}>
                                        {t.tier}
                                    </span>
                                    {t.featured && <span>Most popular</span>}
                                </div>

                                <h3 className="mt-5 text-3xl font-normal tracking-tight">
                                    {t.name}
                                </h3>
                                <p
                                    className={`mt-2 text-xs ${
                                        t.featured ? "text-[#14161A]/70" : "text-[#F4F1EA]/55"
                                    }`}
                                >
                                    {t.tag}
                                </p>

                                <div
                                    className={`my-6 h-px w-full ${
                                        t.featured ? "bg-[#14161A]/20" : "bg-white/10"
                                    }`}
                                />

                                {t.lead && (
                                    <p className="mb-3 text-xs font-semibold">{t.lead}</p>
                                )}

                                <ul className="mb-10 space-y-3 text-xs">
                                    {t.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>

                                <Link
                                    href="/signup"
                                    className={`mt-auto rounded-lg px-6 py-3.5 text-center text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC93C] ${
                                        t.featured
                                            ? "bg-[#14161A] text-[#F4F1EA] hover:bg-black"
                                            : "bg-[#2E3136] text-[#F4F1EA] hover:bg-[#383c42]"
                                    }`}
                                >
                                    {t.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    <p className="mt-4 text-[11px] text-[#F4F1EA]/55">
                        Prices and plan limits are subject to confirmation.
                    </p>
                    <p className="mt-3 text-sm">
                        One connected platform. Fewer disconnected tools.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section id="faqs" className="scroll-mt-4 border-t border-white/10">
                <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:px-10">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                            Good to know
                        </p>
                        <h2 className="mt-6 text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl">
                            A few quick
                            <br />
                            answers.
                        </h2>

                        <p className="mt-16 text-sm">What is Picknnovate?</p>
                        <p className="mt-2 max-w-xs text-xs leading-5 text-[#F4F1EA]/55">
                            One platform for your studio, clients, team and online presence.
                        </p>
                    </div>

                    <div>
                        {faqs.map((f) => (
                            <details
                                key={f.q}
                                className="group border-t border-white/10 last:border-b"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-sm marker:hidden [&::-webkit-details-marker]:hidden">
                                    {f.q}
                                    <span className="text-lg leading-none text-[#FFC93C] transition-transform group-open:rotate-45">
                                        +
                                    </span>
                                </summary>
                                <p className="pb-5 pr-8 text-xs leading-5 text-[#F4F1EA]/55">
                                    {f.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section>
                <div className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:px-10">
                    <div className="flex flex-col justify-between gap-10 rounded-[28px] bg-[#FFC93C] p-8 text-[#14161A] sm:p-12 md:min-h-[300px] md:flex-row md:items-center">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider">
                                Less busywork. More possibility.
                            </p>
                            <h2 className="mt-6 text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl">
                                Make room
                                <br />
                                for creativity.
                            </h2>
                        </div>

                        <div className="flex flex-col items-start gap-6 md:mt-16 md:w-[330px]">
                            <Link
                                href="/signup"
                                className="w-full rounded-lg bg-[#14161A] px-8 py-4 text-center text-xs font-semibold text-[#F4F1EA] transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14161A]"
                            >
                                Get Started Today Free
                            </Link>
                            <a href="#pricing" className="text-xs font-medium">
                                Explore plans
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10">
                <div className="mx-auto w-full max-w-7xl px-6 pt-12 sm:px-8 lg:px-10">
                    <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
                        <div>
                            {logo}
                            <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                                Your creative business, simplified.
                            </p>
                            <p className="mt-5 max-w-xs text-[11px] leading-5 text-[#F4F1EA]/55">
                                One connected workspace for photography studios and creative businesses.
                            </p>
                        </div>

                        {footerCols.map((col) => (
                            <div key={col.title}>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                                    {col.title}
                                </p>
                                <ul className="mt-5 space-y-3 text-[11px] text-[#F4F1EA]/60">
                                    {col.links.map((l) => (
                                        <li key={l}>
                                            <a href="#" className="transition hover:text-white">
                                                {l}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-[10px] text-[#F4F1EA]/55 sm:flex-row">
                        <p>© {new Date().getFullYear()} Picknnovate. All Rights Reserved.</p>
                        <p className="flex items-center gap-8">
                            <span>Built with precision for visual creators</span>
                            <span className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#FFC93C]" />
                                Global Cloud Ready
                            </span>
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}