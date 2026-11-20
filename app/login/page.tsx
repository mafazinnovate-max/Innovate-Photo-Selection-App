"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    UserRound,
    LockKeyhole,
    Eye,
    EyeOff,
    Loader2,
    ArrowUpRight,
} from "lucide-react";

const Y = "#FFC21A";
const BG = "#0F0F10";

/* -------------------------------------------------------------------------- */
/* Background                                                                  */
/* -------------------------------------------------------------------------- */

function Backdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
                background: `
                    radial-gradient(55% 60% at 72% 50%, rgba(255,170,30,0.10) 0%, rgba(255,170,30,0.04) 45%, transparent 72%),
                    radial-gradient(38% 16% at 70% 91%, rgba(255,194,26,0.13) 0%, transparent 72%),
                    radial-gradient(130% 95% at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%),
                    ${BG}
                `,
            }}
        />
    );
}

/* -------------------------------------------------------------------------- */
/* RESPONSIVE LOGIN FORM                                                       */
/* -------------------------------------------------------------------------- */

type LoginFormProps = {
    logoUrl: string | null;
    variant?: "desktop" | "standalone";
    username: string;
    setUsername: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    showPassword: boolean;
    setShowPassword: (value: boolean) => void;
    isLoading: boolean;
    handleLogin: (e: FormEvent<HTMLFormElement>) => void;
};

function LoginForm({
    logoUrl,
    variant = "desktop",
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    handleLogin,
}: LoginFormProps) {
    const standalone = variant === "standalone";

    return (
        <form
            onSubmit={handleLogin}
            /* RESPONSIVE FIX: standalone form fills a growing card (flex-1)
               and keeps a minimum gap between its sections so nothing
               overlaps or spills out when the card is short. */
            className={`pk-login-form flex h-full w-full flex-col items-center justify-between text-center ${
                standalone
                    ? "flex-1 gap-[clamp(16px,3.5svh,36px)] text-white"
                    : "text-[#141414]"
            }`}
        >
            {/* Logo and heading */}
            <div className="flex w-full shrink-0 flex-col items-center">
                <div
                    className={`mb-[clamp(14px,1.8cqw,30px)] flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] p-[clamp(6px,0.65cqw,12px)] ${
                        standalone
                            ? "h-[clamp(76px,12cqw,110px)] w-[clamp(76px,12cqw,110px)] bg-[#141414] shadow-[0_5px_20px_rgba(0,0,0,0.35)]"
                            : "h-[clamp(60px,6.8cqw,110px)] w-[clamp(60px,6.8cqw,110px)] bg-[#141414] shadow-[0_5px_16px_rgba(0,0,0,0.2)]"
                    }`}
                >
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Picknovate Logo"
                            width={160}
                            height={160}
                            loading="eager"
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        /* RESPONSIVE FIX: fallback text is sized to fit the
                           logo box so it is never clipped. */
                        <span
                            className={`whitespace-nowrap font-bold tracking-[0.12em] ${
                                standalone
                                    ? "text-[8px]"
                                    : "text-[clamp(6px,0.7cqw,13px)]"
                            }`}
                            style={{ color: Y }}
                        >
                            PICKNNOVATE
                        </span>
                    )}
                </div>

                <p
                    className={`text-[clamp(11px,1.1cqw,18px)] font-semibold uppercase tracking-[0.32em] ${
                        standalone ? "text-[#FFC21A]" : "text-[#28231E]"
                    }`}
                >
                    Welcome back
                </p>

                <h1
                    className={`mt-[clamp(5px,0.6cqw,10px)] font-extrabold leading-[1.1] tracking-[-0.045em] ${
                        standalone
                            ? "text-[clamp(30px,5.5cqw,48px)] text-white"
                            : "text-[clamp(27px,3cqw,48px)] text-[#171513]"
                    }`}
                >
                    Admin Panel
                </h1>

                <p
                    className={`mt-[clamp(7px,0.8cqw,13px)] text-[clamp(12px,1.3cqw,21px)] leading-[1.5] ${
                        standalone ? "text-white/65" : "text-[#49423B]"
                    }`}
                >
                    Sign in to access your dashboard.
                </p>
            </div>

            {/* Username and password */}
            <div className="w-full shrink-0 space-y-[clamp(16px,1.6cqw,26px)] text-left">
                {/* Username */}
                <div>
                    <label
                        htmlFor={`username-${variant}`}
                        className={`mb-[clamp(6px,0.6cqw,10px)] block text-[clamp(13px,1.3cqw,21px)] font-bold leading-[1.5] ${
                            standalone ? "text-white/90" : "text-[#211E1A]"
                        }`}
                    >
                        Username
                    </label>

                    <div
                        className={`flex h-[clamp(48px,4.5cqw,74px)] items-center gap-[clamp(10px,1cqw,16px)] px-[clamp(14px,1.4cqw,23px)] text-[clamp(14px,1.55cqw,25px)] ${
                            standalone
                                ? "rounded-[18px] border border-white/15 bg-black/25 shadow-inner"
                                : "rounded-full border border-[#B9AA99]/60 bg-white/45 shadow-sm"
                        }`}
                    >
                        {!standalone && (
                            <UserRound
                                size="1.35em"
                                strokeWidth={2}
                                className="shrink-0 text-[#28231E]"
                            />
                        )}

                        <input
                            id={`username-${variant}`}
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                            className={`min-w-0 flex-1 bg-transparent text-[clamp(13px,1.3cqw,21px)] outline-none ${
                                standalone
                                    ? "text-white placeholder:text-white/45"
                                    : "text-[#211E1A] placeholder:text-[#6A6158]"
                            }`}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label
                        htmlFor={`password-${variant}`}
                        className={`mb-[clamp(6px,0.6cqw,10px)] block text-[clamp(13px,1.3cqw,21px)] font-bold leading-[1.5] ${
                            standalone ? "text-white/90" : "text-[#211E1A]"
                        }`}
                    >
                        Password
                    </label>

                    <div
                        className={`flex h-[clamp(48px,4.5cqw,74px)] items-center gap-[clamp(10px,1cqw,16px)] px-[clamp(14px,1.4cqw,23px)] text-[clamp(14px,1.55cqw,25px)] ${
                            standalone
                                ? "rounded-[18px] border border-white/20 bg-black/25 shadow-inner"
                                : "rounded-full border border-[#B9AA99]/60 bg-white/45 shadow-sm"
                        }`}
                    >
                        {!standalone && (
                            <LockKeyhole
                                size="1.35em"
                                strokeWidth={2}
                                className="shrink-0 text-[#28231E]"
                            />
                        )}

                        <input
                            id={`password-${variant}`}
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            className={`min-w-0 flex-1 bg-transparent text-[clamp(13px,1.3cqw,21px)] outline-none ${
                                standalone
                                    ? "text-white placeholder:text-white/45"
                                    : "text-[#211E1A] placeholder:text-[#6A6158]"
                            }`}
                        />

                        {/* Password visibility toggle */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            className={`shrink-0 transition-colors duration-200 ${
                                standalone
                                    ? "text-white/65 hover:text-[#FFC21A]"
                                    : "text-[#28231E] hover:text-[#B47C00]"
                            }`}
                        >
                            {showPassword ? (
                                <EyeOff size="1.4em" strokeWidth={2} />
                            ) : (
                                <Eye size="1.4em" strokeWidth={2} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Login button and security message */}
            <div className="flex w-full shrink-0 flex-col items-center">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`group flex h-[clamp(50px,5.1cqw,84px)] w-full shrink-0 items-center justify-center gap-[clamp(10px,1cqw,16px)] border-0 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC21A]/35 disabled:cursor-not-allowed disabled:opacity-60 ${
                        standalone
                            ? "rounded-[18px] bg-gradient-to-r from-[#FFC21A] via-[#FFD85A] to-[#FFC21A] text-[#171513] shadow-[0_8px_25px_rgba(255,194,26,0.22)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_12px_32px_rgba(255,194,26,0.32)]"
                            : "rounded-full bg-[#171513] text-white shadow-[0_8px_18px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:bg-[#30291D] hover:shadow-[0_12px_28px_rgba(255,194,26,0.18)]"
                    }`}
                >
                    {isLoading ? (
                        <>
                            <Loader2
                                size="1.4em"
                                className="animate-spin"
                            />

                            <span className="text-[clamp(14px,1.45cqw,24px)] font-bold">
                                Signing In...
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-[clamp(14px,1.45cqw,24px)] font-bold">
                                Login
                            </span>

                            <ArrowUpRight
                                size="1.5em"
                                strokeWidth={2.2}
                                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                            />
                        </>
                    )}
                </button>

                <div className="mt-[clamp(14px,1.5cqw,24px)] flex shrink-0 items-center justify-center gap-[clamp(7px,0.7cqw,12px)]">
                    <span
                        className="h-[clamp(8px,0.95cqw,15px)] w-[clamp(8px,0.95cqw,15px)] rounded-full"
                        style={{ background: Y }}
                    />

                    <span
                        className={`text-[clamp(11px,1.1cqw,18px)] font-semibold uppercase leading-[1.2] tracking-[0.12em] ${
                            standalone ? "text-white/75" : "text-[#302A24]"
                        }`}
                    >
                        Secure studio access
                    </span>
                </div>

                <p
    className={`mt-[clamp(16px,1.5cqw,22px)] text-[clamp(14px,1.35cqw,19px)] font-semibold ${
        standalone ? "text-white/80" : "text-[#49423B]"
    }`}
>
    New to Picknnovate?{" "}
    <Link
        href="/signup"
        className={`ml-1 inline-block font-extrabold underline underline-offset-4 transition-all duration-200 hover:scale-105 ${
            standalone
                ? "text-[#FFC21A] hover:text-[#FFD85A]"
                : "text-[#A66F00] hover:text-[#171513]"
        }`}
    >
        Sign up
    </Link>
</p>

                {!standalone && (
                    <p className="mt-[clamp(9px,0.9cqw,15px)] shrink-0 text-[clamp(10px,1cqw,16px)] leading-[1.2] text-[#6A6158]">
                        Your creative business, simplified.
                    </p>
                )}
            </div>
        </form>
    );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                   */
/* -------------------------------------------------------------------------- */

export default function LoginPage() {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    /* Authentication state */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const year = new Date().getFullYear();

    /* Load existing public Picknovate logo */
    useEffect(() => {
        let active = true;

        const loadLogo = async () => {
            try {
                const response = await fetch("/api/public-logo");
                const data = await response.json();

                if (active && data.success && data.logoUrl) {
                    setLogoUrl(data.logoUrl);
                }
            } catch (error) {
                console.error("Failed to load logo:", error);
            }
        };

        loadLogo();

        return () => {
            active = false;
        };
    }, []);

    /* Login authentication */
    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.role === "superadmin") {
                    router.replace("/super-admin/dashboard");
                } else {
                    router.push("/dashboard");
                }

                return;
            }

            setIsLoading(false);

            toast.error(
                data.message || "Invalid username or password."
            );
        } catch (error) {
            console.error("Login request failed:", error);

            setIsLoading(false);

            toast.error("Unable to login. Please try again.");
        }
    };

    const loginFormProps = {
        logoUrl,
        username,
        setUsername,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        isLoading,
        handleLogin,
    };

    return (
        <main
            className="relative min-h-svh overflow-x-clip font-sans text-white"
            style={{ background: BG }}
        >
            <style jsx global>{`
                /* ----------------------------------------------------------
                   EXISTING ROBOT + LOGIN CARD ANIMATION
                   Preserved.
                ---------------------------------------------------------- */

                @keyframes pk-stage-move {
                    from {
                        transform: translate3d(30%, 0, 0);
                    }
                    to {
                        transform: translate3d(0, 0, 0);
                    }
                }

                @keyframes pk-stage-fade {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                /* Left-side content enters together */

                @keyframes pk-left-reveal {
                    from {
                        opacity: 0;
                        transform: translate3d(0, 16px, 0);
                    }
                    to {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }

                .pk-stage {
                    animation:
                        pk-stage-move 1.5s cubic-bezier(0.22, 1, 0.36, 1)
                            backwards,
                        pk-stage-fade 0.6s ease-out backwards;
                }

                .pk-left-reveal {
                    animation: pk-left-reveal 0.85s
                        cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                /* Original laptop and desktop composition sizing */

                .pk-desktop-stage {
                    --stage-w: min(
                        80vw,
                        calc((max(100svh, 600px) - 2rem) * 1.5),
                        2300px
                    );

                    --stage-shift: min(
                        calc((100% - var(--stage-w)) * 0.16),
                        12rem
                    );
                }

                /* Enlarge the composition on large monitors only */

                @media (min-width: 1920px) {
                    .pk-desktop-stage {
                        --stage-w: min(
                            88vw,
                            calc((max(100svh, 600px) - 2rem) * 1.5),
                            3000px
                        );

                        --stage-shift: min(
                            calc((100% - var(--stage-w)) * 0.16),
                            12rem
                        );
                    }
                }

                /* RESPONSIVE FIX: 1279.98px (not 1279px) so there is no gap
                   with Tailwind's xl (min-width: 1280px) at fractional
                   viewport widths, which would break the cqw sizing. */

                @media (max-width: 1279.98px) {
                    .pk-mobile-card {
                        container-type: inline-size;
                    }
                }

                /* RESPONSIVE FIX: card height is a minimum (same value as
                   the original fixed height), so it can grow with its
                   content instead of letting content spill out. */

                .pk-mobile-card {
                    min-height: max(
                        560px,
                        min(900px, calc(100svh - 48px))
                    );
                }

                /* RESPONSIVE FIX: short viewports (landscape phones, small
                   windows) - fit the card to its content instead of forcing
                   extra empty height. */

                @media (max-height: 600px) {
                    .pk-mobile-card {
                        min-height: 0;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .pk-stage,
                    .pk-left-reveal {
                        animation: none !important;
                    }
                }
            `}</style>

            <Backdrop />

            {/* ============================================================
                DESKTOP: 1280px AND ABOVE
                Existing robot + login card composition.
            ============================================================ */}

            <div className="pk-desktop-stage relative hidden h-svh min-h-[600px] overflow-hidden xl:block">
                {/* Robot + login panel: one composition */}
                <div
                    className="absolute inset-y-0 flex items-center"
                    style={{
                        width: "var(--stage-w)",
                        right: "var(--stage-shift)",
                    }}
                >
                    <div
                        className="pk-stage relative w-full"
                        style={{
                            aspectRatio: "3 / 2",
                            containerType: "inline-size",
                        }}
                    >
                        {/* Robot image */}
                        <div
                            className="absolute inset-0"
                            style={{
                                WebkitMaskImage:
                                    "linear-gradient(to right, transparent 0%, #000 12%, #000 96%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 4%, #000 94%, transparent 100%)",
                                maskImage:
                                    "linear-gradient(to right, transparent 0%, #000 12%, #000 96%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 4%, #000 94%, transparent 100%)",
                                WebkitMaskComposite: "source-in",
                                maskComposite: "intersect",
                            }}
                        >
                            <Image
                                src="/picknovate-robot.png"
                                alt="Picknovate robot holding the login panel"
                                fill
                                priority
                                sizes="(min-width: 1920px) 88vw, (min-width: 1280px) 80vw, 1px"
                                className="object-contain"
                            />
                        </div>

                        {/* Desktop LoginForm */}
                        <div
                            className="absolute"
                            style={{
                                left: "51.2%",
                                top: "10.5%",
                                width: "38.8%",
                                height: "74%",
                            }}
                        >
                            <LoginForm
                                {...loginFormProps}
                                variant="desktop"
                            />
                        </div>
                    </div>
                </div>

                {/* LEFT BRANDING */}
                <div
                    className="pk-left-reveal absolute inset-y-0 left-0 z-10 flex flex-col pb-[clamp(1.5rem,4.5svh,3.5rem)] pl-[clamp(3rem,6vw,9rem)] pr-[clamp(1rem,2vw,3rem)] pt-[clamp(1.5rem,4.5svh,3.5rem)]"
                    style={{
                        width: "calc(100% - var(--stage-w) * 0.8)",
                    }}
                >
                    <div className="my-auto flex flex-col">
                        {/* Brand */}
                        <div
                            className="relative flex items-center gap-[0.9em] text-[clamp(1rem,1.15vw,1.6rem)]"
                            style={{
                                top: "calc(-1 * clamp(1.5rem, 8svh, 6rem))",
                            }}
                        >
                            <span
                                className="h-[1.2em] w-[1.2em] rounded-full"
                                style={{
                                    background: Y,
                                    boxShadow:
                                        "0 0 16px rgba(255,194,26,.35)",
                                }}
                            />

                            <span className="font-bold tracking-[0.25em] text-white">
                                PICKNOVATE
                            </span>
                        </div>

                        {/* Eyebrow */}
                        <p
                            className="mt-[clamp(2rem,6svh,4.5rem)] text-[clamp(0.85rem,min(1.05vw,2svh),1.3rem)] font-bold uppercase leading-[1.3] tracking-[0.2em]"
                            style={{ color: Y }}
                        >
                            YOUR CREATIVE
                            <br />
                            WORKSPACE
                        </p>

                        {/* Headline */}
                        <h2 className="mt-[clamp(1rem,2.6svh,2rem)] text-[clamp(3rem,min(4.8vw,8.5svh),7rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-white">
                            Everything
                            <br />
                            in <span style={{ color: Y }}>sync.</span>
                        </h2>

                        {/* Description */}
                        <p className="mt-[clamp(1.25rem,3.2svh,2.5rem)] max-w-[32rem] text-[clamp(1rem,min(1.3vw,2.6svh),1.6rem)] leading-[1.45] text-white/75">
                            Your studio, projects, clients and creative work —
                            together in one connected workspace.
                        </p>

                        {/* Tagline */}
                        <div className="mt-[clamp(1.75rem,4.5svh,3.5rem)] flex flex-wrap items-center gap-x-4 gap-y-2">
                            <span
                                className="h-[3px] w-[clamp(2.5rem,3.6vw,5rem)] rounded-full"
                                style={{ background: Y }}
                            />

                            <span
                                className="text-[clamp(0.7rem,0.85vw,1.05rem)] font-semibold tracking-[0.2em]"
                                style={{ color: Y }}
                            >
                                CREATE MORE. JUGGLE LESS.
                            </span>
                        </div>
                    </div>

                    {/* Copyright */}
                    <p
                        className="text-[clamp(0.8rem,0.95vw,1.1rem)] text-white/55"
                        suppressHydrationWarning
                    >
                        © {year} Picknnovate
                    </p>
                </div>
            </div>

            {/* ============================================================
                BELOW 1280px
                Standalone dark login design based on your reference.
            ============================================================ */}

            <div className="relative z-10 flex min-h-svh w-full flex-col items-center justify-center gap-5 px-4 py-6 sm:px-6 sm:py-8 xl:hidden">
                {/* RESPONSIVE FIX: fixed height replaced by a min-height
                    (defined in the style block above) + flex column. */}
                <div
                    className="pk-mobile-card flex w-full max-w-[640px] flex-col rounded-[28px] border border-white/10 bg-[rgba(32,32,43,0.78)] p-[clamp(24px,6vw,52px)] shadow-[0_25px_80px_rgba(0,0,0,.5),0_0_60px_rgba(120,120,180,.08)] backdrop-blur-xl sm:rounded-[34px]"
                >
                    <LoginForm
                        {...loginFormProps}
                        variant="standalone"
                    />
                </div>

                <p className="shrink-0 text-center text-[clamp(12px,1.4vw,16px)] font-medium tracking-wide text-white/55">
                    Your creative business, simplified.
                </p>
            </div>
        </main>
    );
}