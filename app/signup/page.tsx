"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type Step = 1 | 2;

export default function SignupPage() {
    const [step, setStep] = useState<Step>(1);

    const [studioName, setStudioName] = useState("");
    const [studioEmail, setStudioEmail] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminContact, setAdminContact] = useState("");
    const [adminEmail, setAdminEmail] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleNext() {
        setError("");

        if (
            !studioName.trim() ||
            !studioEmail.trim() ||
            !adminName.trim() ||
            !adminContact.trim() ||
            !adminEmail.trim()
        ) {
            setError("Please fill in all the details.");
            return;
        }

        if (!studioEmail.includes("@")) {
            setError("Please enter a valid studio email.");
            return;
        }

        if (!adminEmail.includes("@")) {
            setError("Please enter a valid admin email.");
            return;
        }

        setStep(2);
    }

    function handleBack() {
        setError("");
        setStep(1);
    }

    async function handleSignup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!username.trim() || !password || !confirmPassword) {
            setError("Please fill in all the account details.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studioName,
                    studioEmail,
                    adminName,
                    adminContact,
                    adminEmail,
                    username,
                    password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                        "Unable to create your account."
                );
                return;
            }

            setSuccess(
                "Your account has been created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch {
            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
                {/* Top */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center"
                    >
                        <Image
                            src="/picknovate-logo.png"
                            alt="Picknnovate"
                            width={64}
                            height={64}
                            priority
                            className="h-12 w-12 rounded-xl object-contain sm:h-14 sm:w-14"
                        />
                    </Link>
                </div>

                {/* Signup */}
                <div className="flex flex-1 items-center justify-center py-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium tracking-wide text-zinc-300">
                                3-Day Free Trial
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Create your account
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-zinc-500">
                                Start your photography workflow
                                with Picknnovate.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                            {step === 1 ? (
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                                            Step 1 of 2
                                        </p>

                                        <h2 className="mt-2 text-xl font-semibold">
                                            Studio details
                                        </h2>
                                    </div>

                                    {/* Studio Name */}
                                    <div>
                                        <label
                                            htmlFor="studioName"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Studio Name
                                        </label>

                                        <input
                                            id="studioName"
                                            type="text"
                                            value={studioName}
                                            onChange={(event) =>
                                                setStudioName(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Your studio name"
                                            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                        />
                                    </div>

                                    {/* Studio Email */}
                                    <div>
                                        <label
                                            htmlFor="studioEmail"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Studio Email
                                        </label>

                                        <input
                                            id="studioEmail"
                                            type="email"
                                            value={studioEmail}
                                            onChange={(event) =>
                                                setStudioEmail(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="studio@example.com"
                                            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                        />
                                    </div>

                                    {/* Admin Name */}
                                    <div>
                                        <label
                                            htmlFor="adminName"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Admin Name
                                        </label>

                                        <input
                                            id="adminName"
                                            type="text"
                                            value={adminName}
                                            onChange={(event) =>
                                                setAdminName(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Your full name"
                                            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                        />
                                    </div>

                                    {/* Admin Contact */}
                                    <div>
                                        <label
                                            htmlFor="adminContact"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Admin Contact
                                        </label>

                                        <input
                                            id="adminContact"
                                            type="tel"
                                            value={adminContact}
                                            onChange={(event) =>
                                                setAdminContact(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Phone number"
                                            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                        />
                                    </div>

                                    {/* Admin Email */}
                                    <div>
                                        <label
                                            htmlFor="adminEmail"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Admin Email
                                        </label>

                                        <input
                                            id="adminEmail"
                                            type="email"
                                            value={adminEmail}
                                            onChange={(event) =>
                                                setAdminEmail(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="admin@example.com"
                                            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                        />
                                    </div>

                                    {error && (
                                        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                                    >
                                        Next
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSignup}
                                    className="space-y-5"
                                >
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                                            Step 2 of 2
                                        </p>

                                        <h2 className="mt-2 text-xl font-semibold">
                                            Create your login
                                        </h2>
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label
                                            htmlFor="username"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Username
                                        </label>

                                        <input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(event) =>
                                                setUsername(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Choose a username"
                                            autoComplete="username"
                                            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Password
                                        </label>

                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Create a password"
                                            autoComplete="new-password"
                                            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Confirm Password
                                        </label>

                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                        />
                                    </div>

                                    {error && (
                                        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                            {error}
                                        </p>
                                    )}

                                    {success && (
                                        <p className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                                            {success}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading
                                            ? "Creating Account..."
                                            : "Start Free Trial"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        disabled={loading}
                                        className="w-full text-sm text-zinc-500 transition hover:text-white disabled:opacity-50"
                                    >
                                        ← Back
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Login link BELOW the box */}
                        <p className="mt-6 text-center text-sm text-zinc-500">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-white transition hover:text-zinc-300"
                            >
                                Login
                            </Link>
                        </p>

                        <p className="mt-4 text-center text-xs leading-5 text-zinc-600">
                            3 days free · No commitment
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}