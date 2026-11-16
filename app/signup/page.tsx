"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import PeekCat from "@/components/signuppage/PeekCat";


type Step = 1 | 2;

/* ---------- UI tokens (styling only) ----------
   bg        #16171b   page
   card      #23262c   form card
   field     #1d1f24   inputs
   border    #3a3d44   input border / #2f3238 card border
   cream     #f5f1e8   primary text
   muted     #a9abb0 / #8f9299
   yellow    #ffc93c   accent (hover #ffd75e)
*/
const inputClass =
    "w-full rounded-[14px] border border-[#3a3d44] bg-[#1d1f24] px-4 py-3.5 text-sm text-[#f5f1e8] outline-none transition placeholder:text-[#8f9299] focus:border-[#ffc93c] focus:ring-2 focus:ring-[#ffc93c]/25";

const labelClass =
    "mb-2 block text-sm font-semibold text-[#f5f1e8]";

const primaryButtonClass =
    "w-full rounded-[14px] bg-[#ffc93c] px-5 py-4 text-sm font-bold text-[#16171b] transition hover:bg-[#ffd75e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc93c]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#23262c] disabled:cursor-not-allowed disabled:opacity-50";

const eyeButtonClass =
    "absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8f9299] transition hover:text-[#ffc93c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc93c]/50";

export default function SignupPage() {
    const [step, setStep] = useState<Step>(1);

    const [studioName, setStudioName] = useState("");
    const [studioEmail, setStudioEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [adminContact, setAdminContact] = useState("");
    const [adminEmail, setAdminEmail] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadLogo = async () => {
            try {
                const response = await fetch("/api/public-logo");
                const data = await response.json();

                if (data.success && data.logoUrl) {
                    setLogoUrl(data.logoUrl);
                }
            } catch (error) {
                console.error(
                    "Failed to load Picknovate logo:",
                    error
                );
            }
        };

        loadLogo();
    }, []);

    function handleNext() {
        setError("");

        if (
            !studioName.trim() ||
            !studioEmail.trim() ||
            !firstName.trim() ||
            !secondName.trim() ||
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

        const adminName = `${firstName.trim()} ${secondName.trim()}`;

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
        <main className="min-h-screen bg-[#16171b] text-[#f5f1e8]">
            <PeekCat />
            <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
                {/* Top */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center"
                    >
                        {logoUrl && (
                            <Image
                                src={logoUrl}
                                alt="Picknnovate"
                                width={96}
                                height={96}
                                priority
                                className="h-16 w-16 rounded-2xl object-contain sm:h-20 sm:w-20"
                            />
                        )}
                    </Link>
                </div>

                {/* Signup */}
                <div className="flex flex-1 items-center justify-center py-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex rounded-full border border-[#3a3d44] bg-[#1d1f24] px-4 py-2 text-xs font-semibold tracking-wide text-[#ffc93c]">
                                3-Day Free Trial
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-[#f5f1e8] sm:text-4xl">
                                Create your account
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-[#a9abb0]">
                                Start your photography workflow
                                with Picknnovate.
                            </p>
                        </div>

                        <div className="rounded-[28px] border border-[#2f3238] bg-[#23262c] p-6 sm:p-9">
                            {step === 1 ? (
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9abb0]">
                                            Step 1 of 2
                                        </p>

                                        <h2 className="mt-2 text-xl font-bold text-[#f5f1e8]">
                                            Studio details
                                        </h2>
                                    </div>

                                    {/* Studio Name */}
                                    <div>
                                        <label
                                            htmlFor="studioName"
                                            className={labelClass}
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
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Studio Email */}
                                    <div>
                                        <label
                                            htmlFor="studioEmail"
                                            className={labelClass}
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
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Admin Name */}
                                    <div>
                                        <label className={labelClass}>
                                            Admin Name
                                        </label>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <input
                                                id="firstName"
                                                type="text"
                                                value={firstName}
                                                onChange={(event) =>
                                                    setFirstName(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="First Name"
                                                autoComplete="given-name"
                                                className={inputClass}
                                            />

                                            <input
                                                id="secondName"
                                                type="text"
                                                value={secondName}
                                                onChange={(event) =>
                                                    setSecondName(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Second Name"
                                                autoComplete="family-name"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    {/* Admin Contact */}
                                    <div>
                                        <label
                                            htmlFor="adminContact"
                                            className={labelClass}
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
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Admin Email */}
                                    <div>
                                        <label
                                            htmlFor="adminEmail"
                                            className={labelClass}
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
                                            className={inputClass}
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
                                        className={primaryButtonClass}
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
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9abb0]">
                                            Step 2 of 2
                                        </p>

                                        <h2 className="mt-2 text-xl font-bold text-[#f5f1e8]">
                                            Create your login
                                        </h2>
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label
                                            htmlFor="username"
                                            className={labelClass}
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
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className={labelClass}
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
                                                value={password}
                                                onChange={(event) =>
                                                    setPassword(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Create a password"
                                                autoComplete="new-password"
                                                className={`${inputClass} pr-12`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (value) => !value
                                                    )
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className={eyeButtonClass}
                                            >
                                                {showPassword ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        className="h-5 w-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 3l18 18"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M10.58 10.58a2 2 0 102.83 2.83"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9.88 4.24A10.45 10.45 0 0112 4c5.25 0 8.5 5 8.5 5a16.7 16.7 0 01-3.12 3.67M6.61 6.61C4.26 8.11 3.5 9 3.5 9s3.25 5 8.5 5c.73 0 1.42-.08 2.06-.22"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        className="h-5 w-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z"
                                                        />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="2.5"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className={labelClass}
                                        >
                                            Confirm Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={confirmPassword}
                                                onChange={(event) =>
                                                    setConfirmPassword(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Confirm your password"
                                                autoComplete="new-password"
                                                className={`${inputClass} pr-12`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (value) => !value
                                                    )
                                                }
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide confirm password"
                                                        : "Show confirm password"
                                                }
                                                className={eyeButtonClass}
                                            >
                                                {showConfirmPassword ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        className="h-5 w-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 3l18 18"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M10.58 10.58a2 2 0 102.83 2.83"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9.88 4.24A10.45 10.45 0 0112 4c5.25 0 8.5 5 8.5 5a16.7 16.7 0 01-3.12 3.67M6.61 6.61C4.26 8.11 3.5 9 3.5 9s3.25 5 8.5 5c.73 0 1.42-.08 2.06-.22"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        className="h-5 w-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z"
                                                        />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="2.5"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
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
                                        className={primaryButtonClass}
                                    >
                                        {loading
                                            ? "Creating Account..."
                                            : "Start Free Trial"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        disabled={loading}
                                        className="w-full text-sm text-[#a9abb0] transition hover:text-[#ffc93c] focus-visible:outline-none focus-visible:text-[#ffc93c] disabled:opacity-50"
                                    >
                                        ← Back
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Login link BELOW the box */}
                        <p className="mt-6 text-center text-sm text-[#a9abb0]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-[#ffc93c] transition hover:underline"
                            >
                                Login
                            </Link>
                        </p>

                        <p className="mt-4 text-center text-xs leading-5 text-[#8f9299]">
                            3 days free · No commitment
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}