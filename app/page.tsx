
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { prisma } from "@/lib/prisma";
import CursorRibbon from "@/components/landingpage/CursorRibbons";
import HeroTextReveal from "@/components/landingpage/HeroTextReveal";
import HeroFallingCards from "@/components/landingpage/HeroFallingCards";
import HeroContentReveal from "@/components/landingpage/HeroContentReveal";
import { motion } from "motion/react";
import EssentialsSection from "@/components/landingpage/EssentialsSection";
import WebsiteSection from "@/components/landingpage/WebsiteSection";
import LandingPageSmoothScroll from "@/components/landingpage/LandingPageSmoothScroll";
import PicknovateIntro from "@/components/landingpage/PicknovateIntro";
import Navbar from "@/components/landingpage/Navbar";
import BuiltAroundYouSection from "@/components/landingpage/BuiltAroundYouSection";
import FAQCTASection from "@/components/landingpage/FAQCTASection";
import Footer from "@/components/landingpage/Footer";

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

// const footerCols = [
//     {
//         title: "Product",
//         links: [
//             { label: "Smart Photo Selection", href: "#features" },
//             { label: "Project Records", href: "#features" },
//             { label: "Quotations & Contracts", href: "#features" },
//             { label: "Team & Payslips", href: "#features" },
//             { label: "Website Builder", href: "#website" },
//         ],
//     },
//     {
//         title: "Solutions",
//         links: [
//             { label: "Wedding Studios", href: "#" },
//             { label: "Commercial Photography", href: "#" },
//             { label: "Videographers", href: "#" },
//             { label: "Event Companies", href: "#" },
//             { label: "Pricing Plans", href: "#pricing" },
//         ],
//     },
//     {
//         title: "Company & Legal",
//         links: [
//             { label: "About Us", href: "#" },
//             { label: "FAQs", href: "#faqs" },
//             { label: "Privacy Policy", href: "#" },
//             { label: "Terms of Service", href: "#" },
//             { label: "Support & Contact", href: "#contact" },
//         ],
//     },
// ];

export default async function Home() {
    const superAdmin = await prisma.superAdmin.findFirst({
        select: {
            logoUrl: true,
        },
    });

    const logo = superAdmin?.logoUrl ? (
        <Image
            src={superAdmin.logoUrl}
            alt="Picknovate"
            width={64}
            height={64}
            priority
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
                        your best work.
                    </p>

                    <HeroFallingCards />
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
