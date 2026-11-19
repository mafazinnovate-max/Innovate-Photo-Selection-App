"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import PeekCat from "@/components/signuppage/PeekCat";

type Step = 1 | 2;

type FieldId =
    | "studioName"
    | "studioEmail"
    | "firstName"
    | "secondName"
    | "adminContact"
    | "adminEmail"
    | "username"
    | "password"
    | "confirmPassword";

type Errors = Partial<Record<FieldId, string>>;

const STEP_ONE_ORDER: FieldId[] = [
    "studioName",
    "studioEmail",
    "firstName",
    "secondName",
    "adminContact",
    "adminEmail",
];

const STEP_TWO_ORDER: FieldId[] = ["username", "password", "confirmPassword"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- UI tokens (styling only) ----------
   bg        #16171b   page
   card      #23262c   form card
   field     #1d1f24   inputs
   border    #3a3d44   input border / #2f3238 card border
   cream     #f5f1e8   primary text
   muted     #a9abb0 / #8f9299
   yellow    #ffc93c   accent (hover #ffd75e)

   ---------- Responsive strategy (mobile-first) ----------
   base → lg   The PAGE scrolls. Card grows with its content, content is
               top-aligned (no vertical jump between step 1 and step 2),
               and the action button is sticky at the bottom of the screen
               in portrait so it is always reachable.
   lg and up   Original desktop layout: card capped at 760px, fixed header
               and footer, scrolling body.
*/

// text-base (16px) on purpose: iOS zooms the page when a focused input is < 16px.
const inputBase =
    "w-full scroll-my-24 touch-manipulation rounded-xl border bg-[#1d1f24] px-3.5 py-2.5 text-base text-[#f5f1e8] outline-none transition placeholder:text-[#8f9299] focus:ring-2 [&:-webkit-autofill]:[-webkit-text-fill-color:#f5f1e8] [&:-webkit-autofill]:[box-shadow:inset_0_0_0_1000px_#1d1f24] sm:py-2.5 sm:text-sm";

const inputOk =
    "border-[#3a3d44] focus:border-[#ffc93c] focus:ring-[#ffc93c]/25";

const inputInvalid =
    "border-red-500/60 focus:border-red-400 focus:ring-red-400/25";

const labelClass = "mb-1.5 block text-sm font-semibold text-[#f5f1e8]";

const primaryButtonClass =
    "w-full touch-manipulation rounded-xl bg-[#ffc93c] px-5 py-3 text-base font-bold text-[#16171b] transition hover:bg-[#ffd75e] active:bg-[#f0b82a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc93c]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#23262c] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

// 40x40 touch target, centred inside the input
const eyeButtonClass =
    "absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 touch-manipulation items-center justify-center rounded-lg text-[#8f9299] transition hover:text-[#ffc93c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc93c]/50";

/* ---------- Card layout ---------- */
// overflow-clip (not hidden) so the sticky footer can stick to the viewport
const cardClass =
    "flex w-full flex-col overflow-clip rounded-[20px] border border-[#2f3238] bg-[#23262c] sm:rounded-[24px] lg:min-h-0 lg:max-h-[700px] lg:flex-1";

const cardHeaderClass =
    "flex-none border-b border-[#2f3238] px-4 pb-3 pt-4 min-[400px]:px-5 sm:px-7 sm:pt-5";

const cardBodyClass =
    "min-h-0 flex-1 space-y-3.5 px-4 py-4 min-[400px]:px-5 sm:px-7 lg:overflow-y-auto [scrollbar-color:#3a3d44_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#3a3d44] [&::-webkit-scrollbar-track]:bg-transparent";

// Sticky on portrait phones/tablets, static in landscape and on desktop
const cardFooterClass =
    "sticky bottom-0 z-10 flex-none space-y-2 border-t border-[#2f3238] bg-[#23262c] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 min-[400px]:px-5 sm:px-7 sm:pb-5 sm:pt-3 landscape:static lg:static";

/* ---------- Small building blocks ---------- */
function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
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
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z"
            />
            <circle cx="12" cy="12" r="2.5" />
        </svg>
    );
}

function FieldMessage({
    id,
    error,
    hint,
}: {
    id: string;
    error?: string;
    hint?: string;
}) {
    if (error) {
        return (
            <p
                id={`${id}-error`}
                role="alert"
                className="mt-1 text-[13px] text-red-400"
            >
                {error}
            </p>
        );
    }

    if (hint) {
        return (
            <p id={`${id}-hint`} className="mt-1 text-xs text-[#8f9299]">
                {hint}
            </p>
        );
    }

    return null;
}

function Field({
    id,
    label,
    error,
    hint,
    children,
}: {
    id: FieldId;
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label htmlFor={id} className={labelClass}>
                {label}
            </label>
            {children}
            <FieldMessage id={id} error={error} hint={hint} />
        </div>
    );
}

function StepProgress({ step }: { step: Step }) {
    return (
        <div
            className="mt-2.5 flex gap-2"
            role="progressbar"
            aria-label="Signup progress"
            aria-valuemin={1}
            aria-valuemax={2}
            aria-valuenow={step}
            aria-valuetext={`Step ${step} of 2`}
        >
            <span className="h-1 flex-1 rounded-full bg-[#ffc93c]" />
            <span
                className={`h-1 flex-1 rounded-full transition-colors ${
                    step === 2 ? "bg-[#ffc93c]" : "bg-[#3a3d44]"
                }`}
            />
        </div>
    );
}

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
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState("");
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
                console.error("Failed to load Picknovate logo:", error);
            }
        };

        loadLogo();
    }, []);

    // The page scrolls on phones/tablets, so start each step at the top
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [step]);

    /* ---------- helpers ---------- */
    function bind(id: FieldId, value: string, setter: (value: string) => void) {
        return {
            value,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                setter(event.target.value);

                if (errors[id]) {
                    setErrors((previous) => ({ ...previous, [id]: undefined }));
                }
            },
        };
    }

    function fieldProps(id: FieldId, extraClass = "") {
        const hasError = Boolean(errors[id]);

        return {
            id,
            "aria-invalid": hasError || undefined,
            "aria-describedby": hasError ? `${id}-error` : undefined,
            className: `${inputBase} ${hasError ? inputInvalid : inputOk} ${extraClass}`,
        };
    }

    function failWith(nextErrors: Errors, order: FieldId[]) {
        setErrors(nextErrors);

        const firstInvalid = order.find((id) => nextErrors[id]);

        if (firstInvalid) {
            // Focus + scroll the first problem into view (keeps phones from hunting for it)
            document.getElementById(firstInvalid)?.focus();
        }
    }

    /* ---------- step 1 ---------- */
    function handleNext(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");

        const next: Errors = {};

        if (!studioName.trim()) next.studioName = "Enter your studio name.";

        if (!studioEmail.trim()) {
            next.studioEmail = "Enter your studio email.";
        } else if (!EMAIL_PATTERN.test(studioEmail.trim())) {
            next.studioEmail = "Enter a valid studio email.";
        }

        if (!firstName.trim()) next.firstName = "Enter the admin's first name.";
        if (!secondName.trim()) next.secondName = "Enter the admin's second name.";

        if (!adminContact.trim()) {
            next.adminContact = "Enter a contact number.";
        } else if (adminContact.replace(/\D/g, "").length < 7) {
            next.adminContact = "Enter a valid phone number.";
        }

        if (!adminEmail.trim()) {
            next.adminEmail = "Enter the admin email.";
        } else if (!EMAIL_PATTERN.test(adminEmail.trim())) {
            next.adminEmail = "Enter a valid admin email.";
        }

        if (Object.values(next).some(Boolean)) {
            failWith(next, STEP_ONE_ORDER);
            return;
        }

        setErrors({});
        setStep(2);
    }

    function handleBack() {
        setErrors({});
        setFormError("");
        setStep(1);
    }

    /* ---------- step 2 ---------- */
    async function handleSignup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading || success) return;

        setFormError("");
        setSuccess("");

        const next: Errors = {};

        if (!username.trim()) next.username = "Choose a username.";

        if (!password) {
            next.password = "Create a password.";
        } else if (password.length < 8) {
            next.password = "Password must be at least 8 characters.";
        }

        if (!confirmPassword) {
            next.confirmPassword = "Confirm your password.";
        } else if (password !== confirmPassword) {
            next.confirmPassword = "Passwords do not match.";
        }

        if (Object.values(next).some(Boolean)) {
            failWith(next, STEP_TWO_ORDER);
            return;
        }

        setErrors({});

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
                setFormError(data.message || "Unable to create your account.");
                return;
            }

            setSuccess(
                "Your account has been created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch {
            setFormError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-dvh bg-[#16171b] text-[#f5f1e8] [-webkit-tap-highlight-color:transparent] [color-scheme:dark] lg:h-dvh lg:overflow-hidden">
            {/* Decorative: hidden on phones so it can never cover the form or button */}
            <div className="hidden md:block">
                <PeekCat />
            </div>

            <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] min-[400px]:px-4 sm:px-8 lg:h-full lg:min-h-0 lg:px-10 lg:py-6">
                {/* Top */}
                <div className="flex flex-none items-center justify-center sm:justify-start lg:absolute lg:left-10 lg:top-6">
                    <Link href="/" className="flex items-center">
                        {logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={logoUrl}
                                alt="Picknnovate"
                                width={96}
                                height={96}
                                loading="eager"
                                decoding="async"
                                className="h-10 w-10 rounded-xl object-contain sm:h-14 sm:w-14 lg:h-16 lg:w-16"
                            />
                        )}
                    </Link>
                </div>

                {/* Signup — top-aligned on phones (no jump between steps), centred from sm up */}
                <div className="flex flex-1 items-start justify-center py-2 sm:items-center sm:py-4 lg:min-h-0 lg:py-2">
                    <div className="flex w-full max-w-md flex-col lg:max-h-full lg:min-h-0">
                        <div className="mb-3 flex-none text-center sm:mb-4">
                            <div className="mb-2 inline-flex rounded-full border border-[#3a3d44] bg-[#1d1f24] px-3.5 py-1 text-xs font-semibold tracking-wide text-[#ffc93c]">
                                3-Day Free Trial
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-[#f5f1e8] sm:text-2xl">
                                Create your account
                            </h1>

                            <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-[#a9abb0] sm:max-w-none">
                                Start your photography workflow with Picknnovate.
                            </p>
                        </div>

                        <div className={cardClass}>
                            {step === 1 ? (
                                <form
                                    onSubmit={handleNext}
                                    noValidate
                                    className="flex min-h-0 flex-1 flex-col"
                                >
                                    {/* Header */}
                                    <div className={cardHeaderClass}>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9abb0]">
                                            Step 1 of 2
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold text-[#f5f1e8] sm:text-xl">
                                            Studio details
                                        </h2>

                                        <StepProgress step={step} />
                                    </div>

                                    {/* Fields */}
                                    <div className={cardBodyClass}>
                                        <Field
                                            id="studioName"
                                            label="Studio Name"
                                            error={errors.studioName}
                                        >
                                            <input
                                                {...fieldProps("studioName")}
                                                {...bind("studioName", studioName, setStudioName)}
                                                type="text"
                                                placeholder="Your studio name"
                                                autoComplete="organization"
                                                enterKeyHint="next"
                                            />
                                        </Field>

                                        <Field
                                            id="studioEmail"
                                            label="Studio Email"
                                            error={errors.studioEmail}
                                        >
                                            <input
                                                {...fieldProps("studioEmail")}
                                                {...bind("studioEmail", studioEmail, setStudioEmail)}
                                                type="email"
                                                inputMode="email"
                                                placeholder="studio@example.com"
                                                autoComplete="email"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                enterKeyHint="next"
                                            />
                                        </Field>

                                        {/* Admin Name: stacked on small phones, side by side from 420px */}
                                        <div>
                                            <label htmlFor="firstName" className={labelClass}>
                                                Admin Name
                                            </label>

                                            <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
                                                <div>
                                                    <input
                                                        {...fieldProps("firstName")}
                                                        {...bind("firstName", firstName, setFirstName)}
                                                        type="text"
                                                        placeholder="First Name"
                                                        autoComplete="given-name"
                                                        enterKeyHint="next"
                                                    />
                                                    <FieldMessage id="firstName" error={errors.firstName} />
                                                </div>

                                                <div>
                                                    <input
                                                        {...fieldProps("secondName")}
                                                        {...bind("secondName", secondName, setSecondName)}
                                                        type="text"
                                                        placeholder="Second Name"
                                                        aria-label="Second Name"
                                                        autoComplete="family-name"
                                                        enterKeyHint="next"
                                                    />
                                                    <FieldMessage id="secondName" error={errors.secondName} />
                                                </div>
                                            </div>
                                        </div>

                                        <Field
                                            id="adminContact"
                                            label="Admin Contact"
                                            error={errors.adminContact}
                                        >
                                            <input
                                                {...fieldProps("adminContact")}
                                                {...bind("adminContact", adminContact, setAdminContact)}
                                                type="tel"
                                                inputMode="tel"
                                                placeholder="Phone number"
                                                autoComplete="tel"
                                                enterKeyHint="next"
                                            />
                                        </Field>

                                        <Field
                                            id="adminEmail"
                                            label="Admin Email"
                                            error={errors.adminEmail}
                                        >
                                            <input
                                                {...fieldProps("adminEmail")}
                                                {...bind("adminEmail", adminEmail, setAdminEmail)}
                                                type="email"
                                                inputMode="email"
                                                placeholder="admin@example.com"
                                                autoComplete="email"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                enterKeyHint="go"
                                            />
                                        </Field>
                                    </div>

                                    {/* Footer (sticky on portrait phones) */}
                                    <div className={cardFooterClass}>
                                        <button type="submit" className={primaryButtonClass}>
                                            Next
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form
                                    onSubmit={handleSignup}
                                    noValidate
                                    className="flex min-h-0 flex-1 flex-col"
                                >
                                    {/* Header */}
                                    <div className={cardHeaderClass}>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9abb0]">
                                            Step 2 of 2
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold text-[#f5f1e8] sm:text-xl">
                                            Create your login
                                        </h2>

                                        <StepProgress step={step} />
                                    </div>

                                    {/* Fields */}
                                    <div className={cardBodyClass}>
                                        <Field
                                            id="username"
                                            label="Username"
                                            error={errors.username}
                                        >
                                            <input
                                                {...fieldProps("username")}
                                                {...bind("username", username, setUsername)}
                                                type="text"
                                                placeholder="Choose a username"
                                                autoComplete="username"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                enterKeyHint="next"
                                            />
                                        </Field>

                                        <Field
                                            id="password"
                                            label="Password"
                                            error={errors.password}
                                            hint="Use at least 8 characters."
                                        >
                                            <div className="relative">
                                                <input
                                                    {...fieldProps("password", "pr-12")}
                                                    {...bind("password", password, setPassword)}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a password"
                                                    autoComplete="new-password"
                                                    enterKeyHint="next"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((value) => !value)}
                                                    aria-label={
                                                        showPassword ? "Hide password" : "Show password"
                                                    }
                                                    aria-pressed={showPassword}
                                                    className={eyeButtonClass}
                                                >
                                                    <EyeIcon open={showPassword} />
                                                </button>
                                            </div>
                                        </Field>

                                        <Field
                                            id="confirmPassword"
                                            label="Confirm Password"
                                            error={errors.confirmPassword}
                                        >
                                            <div className="relative">
                                                <input
                                                    {...fieldProps("confirmPassword", "pr-12")}
                                                    {...bind(
                                                        "confirmPassword",
                                                        confirmPassword,
                                                        setConfirmPassword
                                                    )}
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm your password"
                                                    autoComplete="new-password"
                                                    enterKeyHint="go"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword((value) => !value)
                                                    }
                                                    aria-label={
                                                        showConfirmPassword
                                                            ? "Hide confirm password"
                                                            : "Show confirm password"
                                                    }
                                                    aria-pressed={showConfirmPassword}
                                                    className={eyeButtonClass}
                                                >
                                                    <EyeIcon open={showConfirmPassword} />
                                                </button>
                                            </div>
                                        </Field>
                                    </div>

                                    {/* Footer (sticky on portrait phones) */}
                                    <div className={cardFooterClass}>
                                        {formError && (
                                            <p
                                                role="alert"
                                                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                                            >
                                                {formError}
                                            </p>
                                        )}

                                        {success && (
                                            <p
                                                role="status"
                                                className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400"
                                            >
                                                {success}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || Boolean(success)}
                                            className={primaryButtonClass}
                                        >
                                            {loading ? "Creating Account..." : "Start Free Trial"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            disabled={loading || Boolean(success)}
                                            className="w-full touch-manipulation rounded-lg py-1.5 text-sm text-[#a9abb0] transition hover:text-[#ffc93c] focus-visible:text-[#ffc93c] focus-visible:outline-none disabled:opacity-50"
                                        >
                                            ← Back
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Login link BELOW the box */}
                        <p className="mt-3 flex-none text-center text-sm text-[#a9abb0]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="inline-block py-1 font-semibold text-[#ffc93c] transition hover:underline"
                            >
                                Login
                            </Link>
                        </p>

                        <p className="mt-1 flex-none text-center text-xs leading-5 text-[#8f9299]">
                            3 days free · No commitment
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}