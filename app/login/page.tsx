"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
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
                    router.push("/events");
                }

                return;
            }

            setIsLoading(false);

            /*
             * Show the exact message returned by the API.
             *
             * Wrong credentials:
             * "Invalid username or password."
             *
             * Expired subscription:
             * "Your subscription has expired..."
             */
            toast.error(
                data.message ||
                    "Invalid username or password."
            );
        } catch (error) {
            console.error("Login request failed:", error);

            setIsLoading(false);

            toast.error(
                "Unable to login. Please try again."
            );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md rounded-2xl bg-zinc-900 p-6"
            >
                <div className="mb-8 flex flex-col items-center">
{logoUrl && (
    <Image
        src={logoUrl}
        alt="Picknnovate"
        width={140}
        height={140}
        priority
        className="h-36 w-36 rounded-2xl object-contain"
    />
)}
                </div>

                <h1 className="text-center text-3xl font-bold text-white">
                    Admin Panel
                </h1>

                <p className="mt-2 mb-4 text-center text-sm text-zinc-400">
                    Sign in to access the dashboard
                </p>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white"
                    />

                    <div className="relative">
                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 pr-12 text-white outline-none"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    (prev) => !prev
                                )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-white"
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
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
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