
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Camera,
    Check,
    Eye,
    EyeOff,
    KeyRound,
    LogOut,
    Mail,
    ShieldCheck,
    Upload,
    UserRound,
    X,
} from "lucide-react";

type ProfileForm = {
    name: string;
    username: string;
    email: string;
    logoUrl: string;
};

type PasswordForm = {
    current: string;
    next: string;
    confirm: string;
};

export default function SuperAdminSettingsPage() {
    const router = useRouter();
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<ProfileForm>({
        name: "",
        username: "",
        email: "",
        logoUrl: "",
    });

    const [passwords, setPasswords] = useState<PasswordForm>({
        current: "",
        next: "",
        confirm: "",
    });

    const [showPasswords, setShowPasswords] = useState(false);
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [logoName, setLogoName] = useState("");
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState<"success" | "error">("success");

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [originalLogoUrl, setOriginalLogoUrl] = useState("");

    const showMessage = (message: string, type: "success" | "error" = "success") => {
        setNotice(message);
        setNoticeType(type);
    };

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                const response = await fetch("/api/super-admin/settings/profile", {
                    method: "GET",
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        router.replace("/login");
                        return;
                    }

                    throw new Error(data.message || "Unable to load profile.");
                }

                if (!active) return;

                const loadedProfile = data.profile;

                setProfile({
                    name: loadedProfile.name ?? "",
                    username: loadedProfile.username ?? "",
                    email: loadedProfile.email ?? "",
                    logoUrl: loadedProfile.logoUrl ?? "",
                });

                setOriginalLogoUrl(loadedProfile.logoUrl ?? "");
            } catch (error) {
                if (active) {
                    showMessage(
                        error instanceof Error ? error.message : "Unable to load profile.",
                        "error"
                    );
                }
            } finally {
                if (active) setLoadingProfile(false);
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, [router]);

    useEffect(() => {
        if (!selectedLogo) {
            setLogoPreview("");
            return;
        }

        const previewUrl = URL.createObjectURL(selectedLogo);
        setLogoPreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [selectedLogo]);

    const updateProfile = (field: keyof ProfileForm, value: string) => {
        setProfile((current) => ({ ...current, [field]: value }));
        setNotice("");
    };

    const updatePassword = (field: keyof PasswordForm, value: string) => {
        setPasswords((current) => ({ ...current, [field]: value }));
        setNotice("");
    };

    async function handleSaveProfile() {
        if (savingProfile) return;

        setSavingProfile(true);
        setNotice("");

        try {
            const response = await fetch("/api/super-admin/settings/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profile.name,
                    username: profile.username,
                    email: profile.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    router.replace("/login");
                    return;
                }

                throw new Error(data.message || "Unable to save profile.");
            }

            setProfile((current) => ({
                ...current,
                ...data.profile,
            }));

            showMessage(data.message || "Profile saved successfully.");
        } catch (error) {
            showMessage(
                error instanceof Error ? error.message : "Unable to save profile.",
                "error"
            );
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword() {
        if (changingPassword) return;

        if (!passwords.current || !passwords.next || !passwords.confirm) {
            showMessage("Fill in all three password fields.", "error");
            return;
        }

        if (passwords.next.length < 8) {
            showMessage("New password must be at least 8 characters.", "error");
            return;
        }

        if (passwords.next !== passwords.confirm) {
            showMessage("New password and confirmation do not match.", "error");
            return;
        }

        setChangingPassword(true);
        setNotice("");

        try {
            const response = await fetch("/api/super-admin/settings/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.next,
                    confirmPassword: passwords.confirm,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    router.replace("/login");
                    return;
                }

                throw new Error(data.message || "Unable to change password.");
            }

            setPasswords({
                current: "",
                next: "",
                confirm: "",
            });

            showMessage(data.message || "Password updated successfully.");
        } catch (error) {
            showMessage(
                error instanceof Error ? error.message : "Unable to change password.",
                "error"
            );
        } finally {
            setChangingPassword(false);
        }
    }

    function handleLogoChange(file?: File) {
        if (!file) return;

        const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            showMessage("Choose a PNG, JPG or WebP image.", "error");
            if (logoInputRef.current) logoInputRef.current.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage("Logo image must be 5 MB or smaller.", "error");
            if (logoInputRef.current) logoInputRef.current.value = "";
            return;
        }

        setSelectedLogo(file);
        setLogoName(file.name);
        setNotice("");
    }

    async function handleUploadLogo() {
        if (!selectedLogo || uploadingLogo) return;

        setUploadingLogo(true);
        setNotice("");

        try {
            const formData = new FormData();
            formData.append("logo", selectedLogo);

            const response = await fetch("/api/super-admin/settings/logo", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    router.replace("/login");
                    return;
                }

                throw new Error(data.message || "Logo upload failed.");
            }

            setProfile((current) => ({
                ...current,
                logoUrl: data.logoUrl,
            }));

            setOriginalLogoUrl(data.logoUrl);
            setSelectedLogo(null);
            setLogoName("");

            if (logoInputRef.current) {
                logoInputRef.current.value = "";
            }

            showMessage(data.message || "Platform logo uploaded successfully.");
        } catch (error) {
            showMessage(
                error instanceof Error ? error.message : "Logo upload failed.",
                "error"
            );
        } finally {
            setUploadingLogo(false);
        }
    }

    async function handleLogout() {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            const response = await fetch("/api/super-admin/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Unable to log out. Please try again.");
            }

            router.replace("/login");
            router.refresh();
        } catch (error) {
            showMessage(
                error instanceof Error ? error.message : "Unable to log out.",
                "error"
            );
            setShowLogoutConfirm(false);
            setLoggingOut(false);
        }
    }

    const displayedLogo = logoPreview || profile.logoUrl || originalLogoUrl;

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            aria-label="Go back"
                            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                                <ShieldCheck size={14} /> Super Admin / Settings
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Settings
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                                Manage your account details, password and platform branding.
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
                        <span className={`h-2 w-2 rounded-full ${loadingProfile ? "bg-amber-400" : "bg-emerald-400"}`} />
                        {loadingProfile ? "Loading settings" : "Account settings"}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Account profile */}
                    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl shadow-black/10">
                        <div className="flex items-start gap-4 border-b border-zinc-800 p-5 sm:p-6">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200">
                                <UserRound size={20} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-white">Account profile</h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Your Super Admin name and email address.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                            <FormField
                                label="Full name"
                                value={profile.name}
                                onChange={(value) => updateProfile("name", value)}
                                placeholder="Enter your full name"
                                icon={<UserRound size={16} />}
                                disabled={loadingProfile || savingProfile}
                            />

                            <FormField
                                label="Username"
                                value={profile.username}
                                onChange={(value) => updateProfile("username", value)}
                                placeholder="Enter your username"
                                icon={<UserRound size={16} />}
                                disabled={loadingProfile || savingProfile}
                            />

                            <FormField
                                label="Email address"
                                type="email"
                                value={profile.email}
                                onChange={(value) => updateProfile("email", value)}
                                placeholder="admin@example.com"
                                icon={<Mail size={16} />}
                                disabled={loadingProfile || savingProfile}
                            />
                        </div>

                        <div className="flex flex-col gap-3 border-t border-zinc-800 bg-zinc-950/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs leading-5 text-zinc-500">
                                Profile details are saved to your account.
                            </p>

                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={loadingProfile || savingProfile}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Check size={16} />
                                {savingProfile ? "Saving..." : "Save profile"}
                            </button>
                        </div>
                    </section>

                    {/* Change password */}
                    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl shadow-black/10">
                        <div className="flex items-start gap-4 border-b border-zinc-800 p-5 sm:p-6">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200">
                                <KeyRound size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="font-semibold text-white">Change password</h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Choose a strong password that you do not use elsewhere.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowPasswords((value) => !value)}
                                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                                className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            >
                                {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                                <span className="hidden sm:inline">
                                    {showPasswords ? "Hide" : "Show"}
                                </span>
                            </button>
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                            <FormField
                                label="Current password"
                                type={showPasswords ? "text" : "password"}
                                value={passwords.current}
                                onChange={(value) => updatePassword("current", value)}
                                placeholder="Enter current password"
                                disabled={changingPassword}
                            />

                            <div className="hidden sm:block" />

                            <FormField
                                label="New password"
                                type={showPasswords ? "text" : "password"}
                                value={passwords.next}
                                onChange={(value) => updatePassword("next", value)}
                                placeholder="At least 8 characters"
                                disabled={changingPassword}
                            />

                            <FormField
                                label="Confirm new password"
                                type={showPasswords ? "text" : "password"}
                                value={passwords.confirm}
                                onChange={(value) => updatePassword("confirm", value)}
                                placeholder="Re-enter new password"
                                disabled={changingPassword}
                            />

                            <p className="text-xs leading-5 text-zinc-500 sm:col-span-2">
                                Use at least 8 characters. Your current password is required to make this change.
                            </p>
                        </div>

                        <div className="flex justify-end border-t border-zinc-800 bg-zinc-950/40 px-5 py-4 sm:px-6">
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <KeyRound size={16} />
                                {changingPassword ? "Updating..." : "Update password"}
                            </button>
                        </div>
                    </section>

                    {/* Platform logo */}
                    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl shadow-black/10">
                        <div className="flex items-start gap-4 border-b border-zinc-800 p-5 sm:p-6">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200">
                                <Camera size={20} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-white">Platform logo</h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Update Picnovate branding.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950">
                                {displayedLogo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={displayedLogo}
                                        alt="Picnovate platform logo"
                                        className="h-full w-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xl font-black tracking-tight text-zinc-950">
                                        P.
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white">Picnovate logo</p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    PNG, JPG or WebP. Maximum file size: 5 MB. The selected image will be uploaded to Cloudinary when you click Upload logo.
                                </p>

                                {logoName && (
                                    <p className="mt-2 truncate text-xs text-zinc-300">
                                        Selected: {logoName}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={(event) =>
                                            handleLogoChange(event.target.files?.[0])
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
                                    >
                                        <Camera size={16} /> Choose logo
                                    </button>

                                    {selectedLogo && (
                                        <button
                                            type="button"
                                            onClick={handleUploadLogo}
                                            disabled={uploadingLogo}
                                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
                                        >
                                            <Upload size={16} />
                                            {uploadingLogo ? "Uploading..." : "Upload logo"}
                                        </button>
                                    )}

                                    {selectedLogo && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLogo(null);
                                                setLogoName("");
                                                if (logoInputRef.current) {
                                                    logoInputRef.current.value = "";
                                                }
                                                setNotice("");
                                            }}
                                            disabled={uploadingLogo}
                                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                                        >
                                            <X size={16} /> Cancel selection
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Logout */}
                    <section className="flex flex-col gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
                                <LogOut size={19} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-white">Sign out</h2>
                                <p className="mt-1 max-w-lg text-sm leading-5 text-zinc-400">
                                    Sign out of your Super Admin session on this device.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowLogoutConfirm(true)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </section>

                    {notice && (
                        <div
                            role="status"
                            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${noticeType === "success"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                    : "border-red-500/30 bg-red-500/10 text-red-200"
                                }`}
                        >
                            <span
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${noticeType === "success" ? "bg-emerald-400" : "bg-red-400"
                                    }`}
                            />
                            <p className="flex-1 leading-5">{notice}</p>
                            <button
                                type="button"
                                onClick={() => setNotice("")}
                                aria-label="Dismiss message"
                                className="text-zinc-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout confirmation */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                            <LogOut size={21} />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-white">
                            Log out of Picnovate?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                            Are you sure you want to end your Super Admin session?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={handleLogout}
                                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
                            >
                                {loggingOut ? "Logging out..." : "Confirm logout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    icon,
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                        {icon}
                    </span>
                )}

                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    className={`w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${icon ? "pl-10 pr-4" : "px-4"
                        }`}
                />
            </div>
        </div>
    );
}