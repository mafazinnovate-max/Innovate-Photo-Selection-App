"use client";

import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);

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

        if (res.ok) {
            router.replace("/events");
            return; // IMPORTANT
        }

        setIsLoading(false);
        alert("Invalid Credentials");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md rounded-2xl bg-zinc-900 p-6"
            >
                <div className="mb-8 flex flex-col items-center">
                    <Image
                        src="/innovate-logo.png"
                        alt="logo"
                        width={210}
                        height={70}
                        priority
                        className="h-auto object-contain"
                    />
                </div>
                <h1 className="text-3xl font-bold text-white text-center">
                    Admin Panel
                </h1>

                <p className="mt-2 mb-4 text-sm text-zinc-400 text-center">
                    Sign in to access the dashboard
                </p>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 pr-12 text-white outline-none"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    disabled={isLoading}
                    type="submit"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white p-3 font-medium text-black"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Signing In...
                        </>
                    ) : (
                        "Login"
                    )}
                </button>
            </form>
        </div>
    );
}