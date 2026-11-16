
"use client";

import {
    Eye,
    EyeOff,
    Loader2,
    ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const loadLogo = async () => {
            try {
                const response = await fetch("/api/public-logo");
                const data = await response.json();

                if (data.success && data.logoUrl) {
                    setLogoUrl(data.logoUrl);
                }
            } catch (error) {
                console.error("Failed to load logo:", error);
            }
        };

        loadLogo();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

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

    return (
        <main className="relative flex min-h-screen overflow-hidden bg-[#14161A] font-sans text-[#F4F1EA]">

            {/* Background decoration */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-48 -top-48 h-[650px] w-[650px] rounded-full border border-[#FFC93C]/[0.07]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-28 -top-28 h-[450px] w-[450px] rounded-full border border-[#FFC93C]/[0.09]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-64 -right-40 h-[650px] w-[650px] rounded-full bg-[#FFC93C]/[0.035] blur-3xl"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[12%] top-[12%] h-2 w-2 rounded-full bg-[#FFC93C]/50"
            />

            {/* Main layout */}
            <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 lg:grid-cols-2">

                {/* Left branding section */}
                <section className="relative hidden flex-col justify-between overflow-hidden px-12 py-12 lg:flex xl:px-20 xl:py-16">

                    <div>
                        <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-[#FFC93C]" />

                            <span className="text-sm font-semibold tracking-[0.25em] text-[#F4F1EA]">
                                PICKNNOVATE
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 max-w-xl">
                        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#FFC93C]">
                            Your creative workspace
                        </p>

                        <h1 className="text-6xl font-semibold leading-[1.08] tracking-[-0.065em] text-[#F4F1EA] xl:text-7xl">
                            Everything
                            <br />
                            in sync
                            <span className="text-[#FFC93C]">.</span>
                        </h1>

                        <p className="mt-8 max-w-md text-base leading-8 text-[#F4F1EA]/50 xl:text-lg">
                            Your studio, projects, clients and creative
                            work — together in one connected workspace.
                        </p>

                        <div className="mt-12 flex items-center gap-4">
                            <span className="h-[2px] w-12 bg-[#FFC93C]" />

                            <span className="text-[11px] font-medium tracking-[0.2em] text-[#F4F1EA]/40">
                                CREATE MORE. JUGGLE LESS.
                            </span>
                        </div>
                    </div>

                    {/* Decorative circles */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-[17%] right-[8%] h-64 w-64 rounded-full border border-[#FFC93C]/10"
                    >
                        <div className="absolute inset-8 rounded-full border border-[#FFC93C]/15" />

                        <div className="absolute inset-[65px] rounded-full border border-[#FFC93C]/20" />

                        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFC93C]" />
                    </div>

                    <p className="text-xs tracking-wide text-[#F4F1EA]/30">
                        © {new Date().getFullYear()} Picknovate. All rights reserved.
                    </p>
                </section>

                {/* Login section */}
                <section className="relative flex min-h-screen items-center justify-center px-5 py-20 sm:px-10 lg:px-12">

                    {/* Mobile brand */}
                    <div className="absolute left-6 top-7 flex items-center gap-3 lg:hidden">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FFC93C]" />

                        <span className="text-xs font-semibold tracking-[0.22em] text-[#F4F1EA]/80">
                            PICKNOVATE
                        </span>
                    </div>

                    <div className="w-full max-w-[460px]">

                        {/* Login card */}
                        <div className="login-card-enter rounded-[28px] border border-white/[0.09] bg-[#1E2125] p-7 shadow-[0_35px_100px_rgba(0,0,0,0.4)] sm:rounded-[32px] sm:p-10">

                            {/* Logo and heading */}
                            <div className="mb-10 flex flex-col items-center text-center">

                                <div className="mb-7 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.07] bg-[#14161A] p-3 sm:h-32 sm:w-32">

                                    {logoUrl ? (
                                        <Image
                                            src={logoUrl}
                                            alt="Picknovate Logo"
                                            width={160}
                                            height={160}
                                            priority
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold tracking-[0.2em] text-[#FFC93C]">
                                            PICKNOVATE
                                        </span>
                                    )}
                                </div>

                                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#FFC93C]">
                                    Welcome back
                                </p>

                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F4F1EA] sm:text-4xl">
                                    Admin Panel
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-[#F4F1EA]/45">
                                    Sign in to access your dashboard.
                                </p>
                            </div>

                            {/* Login form */}
                            <form onSubmit={handleLogin}>

                                <div className="space-y-6">

                                    {/* Username */}
                                    <div>
                                        <label
                                            htmlFor="username"
                                            className="mb-2.5 block text-xs font-medium tracking-wide text-[#F4F1EA]/75"
                                        >
                                            Username
                                        </label>

                                        <input
                                            id="username"
                                            type="text"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) =>
                                                setUsername(e.target.value)
                                            }
                                            autoComplete="username"
                                            className="h-14 w-full rounded-xl border border-white/[0.09] bg-[#14161A] px-4 text-sm text-[#F4F1EA] outline-none transition-all duration-300 placeholder:text-[#F4F1EA]/25 hover:border-white/20 focus:border-[#FFC93C]/70 focus:ring-4 focus:ring-[#FFC93C]/10"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2.5 block text-xs font-medium tracking-wide text-[#F4F1EA]/75"
                                        >
                                            Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }
                                                autoComplete="current-password"
                                                className="h-14 w-full rounded-xl border border-white/[0.09] bg-[#14161A] px-4 pr-12 text-sm text-[#F4F1EA] outline-none transition-all duration-300 placeholder:text-[#F4F1EA]/25 hover:border-white/20 focus:border-[#FFC93C]/70 focus:ring-4 focus:ring-[#FFC93C]/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((prev) => !prev)
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F4F1EA]/35 transition-colors duration-200 hover:text-[#FFC93C]"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={19} />
                                                ) : (
                                                    <Eye size={19} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Login button */}
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="group mt-9 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#FFC93C] px-5 text-sm font-bold text-[#14161A] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFD45F] hover:shadow-[0_12px_35px_rgba(255,201,60,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            Login

                                            <ArrowUpRight
                                                size={18}
                                                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                                            />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Secure access */}
                            <div className="mt-9 flex items-center justify-center gap-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#FFC93C]" />

                                <span className="text-[10px] font-medium uppercase tracking-[0.17em] text-[#F4F1EA]/35">
                                    Secure studio access
                                </span>
                            </div>
                        </div>

                        <p className="mt-7 text-center text-xs tracking-wide text-[#F4F1EA]/30">
                            Your creative business, simplified.
                        </p>
                    </div>
                </section>
            </div>

            {/* Card entrance animation */}
            <style jsx global>{`
                @keyframes loginCardEnter {
                    from {
                        opacity: 0;
                        transform: translateY(28px) scale(0.975);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .login-card-enter {
                    animation: loginCardEnter 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .login-card-enter {
                        animation: none;
                    }
                }
            `}</style>
        </main>
    );
}
