"use client";

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    Eye,
    EyeOff,
    Globe,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    User,
    Users,
    HardDrive,
    Image as ImageIcon,
    FileText,
    Lock,
    AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Plan = "Basic" | "Professional" | "Enterprise";

export default function CreateStudioPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [plan, setPlan] = useState<Plan>("Professional");
    const [status, setStatus] = useState<"Active" | "Inactive">("Active");

    const [formData, setFormData] = useState({
        studioName: "",
        studioEmail: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        website: "",
        description: "",

        adminName: "",
        adminEmail: "",
        adminPhone: "",
        password: "",
        confirmPassword: "",

        startDate: "",
        endDate: "",

        storageLimit: "100",
        maxEvents: "50",
        maxCustomers: "500",
        maxImages: "100000",

        notes: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }

        setSuccess(false);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.studioName.trim()) {
            newErrors.studioName = "Studio name is required";
        }

        if (!formData.studioEmail.trim()) {
            newErrors.studioEmail = "Studio email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.studioEmail)) {
            newErrors.studioEmail = "Enter a valid email address";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        }

        if (!formData.city.trim()) {
            newErrors.city = "City is required";
        }

        if (!formData.country.trim()) {
            newErrors.country = "Country is required";
        }

        if (!formData.adminName.trim()) {
            newErrors.adminName = "Admin name is required";
        }

        if (!formData.adminEmail.trim()) {
            newErrors.adminEmail = "Admin email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.adminEmail)) {
            newErrors.adminEmail = "Enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must contain at least 8 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm the password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.startDate) {
            newErrors.startDate = "Start date is required";
        }

        if (!formData.endDate) {
            newErrors.endDate = "End date is required";
        }

        if (
            formData.startDate &&
            formData.endDate &&
            formData.endDate < formData.startDate
        ) {
            newErrors.endDate = "End date cannot be before start date";
        }

        if (!formData.storageLimit || Number(formData.storageLimit) <= 0) {
            newErrors.storageLimit = "Enter a valid storage limit";
        }

        if (!formData.maxEvents || Number(formData.maxEvents) <= 0) {
            newErrors.maxEvents = "Enter a valid event limit";
        }

        if (!formData.maxCustomers || Number(formData.maxCustomers) <= 0) {
            newErrors.maxCustomers = "Enter a valid customer limit";
        }

        if (!formData.maxImages || Number(formData.maxImages) <= 0) {
            newErrors.maxImages = "Enter a valid image limit";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            return;
        }

        // UI only for now.
        // Database integration will be added later.

        setSuccess(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const inputClass = (field: string) =>
        `mt-2 w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 ${errors[field]
            ? "border-red-500/60 focus:border-red-500"
            : "border-zinc-800 focus:border-zinc-500"
        }`;

    const sectionClass =
        "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6";

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.push("/super-admin/studios")}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-semibold text-white">
                            Create Studio
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Add a new photography studio to the platform
                        </p>
                    </div>
                </div>
            </div>

            {/* Success */}
            {success && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check size={17} />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-emerald-300">
                            Studio created successfully
                        </p>
                        <p className="mt-1 text-xs text-emerald-400/70">
                            This is currently a UI-only action. Database integration will be
                            connected later.
                        </p>
                    </div>
                </div>
            )}

            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-400"
                    />

                    <div>
                        <p className="text-sm font-medium text-red-300">
                            Please fix the highlighted fields
                        </p>
                        <p className="mt-1 text-xs text-red-400/70">
                            Some required information is missing or invalid.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ====================================================== */}
                {/* STUDIO INFORMATION */}
                {/* ====================================================== */}

                <section className={sectionClass}>
                    <SectionHeader
                        icon={<Building2 size={19} />}
                        title="Studio Information"
                        description="Basic information about the photography studio"
                    />

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <InputField
                            label="Studio Name"
                            required
                            value={formData.studioName}
                            onChange={(value) => updateField("studioName", value)}
                            placeholder="e.g. Innovate Wedding Studio"
                            error={errors.studioName}
                            icon={<Building2 size={17} />}
                            className="md:col-span-2"
                            inputClass={inputClass("studioName")}
                        />

                        <InputField
                            label="Studio Email"
                            required
                            type="email"
                            value={formData.studioEmail}
                            onChange={(value) => updateField("studioEmail", value)}
                            placeholder="studio@example.com"
                            error={errors.studioEmail}
                            icon={<Mail size={17} />}
                            inputClass={inputClass("studioEmail")}
                        />

                        <InputField
                            label="Phone Number"
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(value) => updateField("phone", value)}
                            placeholder="+91 98765 43210"
                            error={errors.phone}
                            icon={<Phone size={17} />}
                            inputClass={inputClass("phone")}
                        />

                        <InputField
                            label="Address"
                            value={formData.address}
                            onChange={(value) => updateField("address", value)}
                            placeholder="Street / Area / Building"
                            icon={<MapPin size={17} />}
                            className="md:col-span-2"
                            inputClass={inputClass("address")}
                        />

                        <InputField
                            label="City"
                            required
                            value={formData.city}
                            onChange={(value) => updateField("city", value)}
                            placeholder="Chennai"
                            error={errors.city}
                            inputClass={inputClass("city")}
                        />

                        <InputField
                            label="State"
                            value={formData.state}
                            onChange={(value) => updateField("state", value)}
                            placeholder="Tamil Nadu"
                            inputClass={inputClass("state")}
                        />

                        <InputField
                            label="Country"
                            required
                            value={formData.country}
                            onChange={(value) => updateField("country", value)}
                            placeholder="India"
                            error={errors.country}
                            inputClass={inputClass("country")}
                        />

                        <InputField
                            label="Website"
                            type="url"
                            value={formData.website}
                            onChange={(value) => updateField("website", value)}
                            placeholder="https://example.com"
                            icon={<Globe size={17} />}
                            inputClass={inputClass("website")}
                        />

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Description
                            </label>

                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    updateField("description", e.target.value)
                                }
                                rows={4}
                                placeholder="Short description about the studio..."
                                className={inputClass("description") + " resize-none"}
                            />

                            <p className="mt-2 text-xs text-zinc-600">
                                Optional. This can be shown internally in the studio details.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ====================================================== */}
                {/* ADMIN ACCOUNT */}
                {/* ====================================================== */}

                <section className={sectionClass}>
                    <SectionHeader
                        icon={<ShieldCheck size={19} />}
                        title="Admin Account"
                        description="Login account for the studio administrator"
                    />

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <InputField
                            label="Admin Name"
                            required
                            value={formData.adminName}
                            onChange={(value) => updateField("adminName", value)}
                            placeholder="e.g. Mafaz Malik"
                            error={errors.adminName}
                            icon={<User size={17} />}
                            inputClass={inputClass("adminName")}
                        />

                        <InputField
                            label="Admin Email"
                            required
                            type="email"
                            value={formData.adminEmail}
                            onChange={(value) => updateField("adminEmail", value)}
                            placeholder="admin@example.com"
                            error={errors.adminEmail}
                            icon={<Mail size={17} />}
                            inputClass={inputClass("adminEmail")}
                        />

                        <InputField
                            label="Admin Phone"
                            type="tel"
                            value={formData.adminPhone}
                            onChange={(value) => updateField("adminPhone", value)}
                            placeholder="+91 98765 43210"
                            icon={<Phone size={17} />}
                            inputClass={inputClass("adminPhone")}
                        />

                        <div />

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium text-zinc-300">
                                Password <span className="text-red-400">*</span>
                            </label>

                            <div className="relative">
                                <Lock
                                    size={17}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) =>
                                        updateField("password", e.target.value)
                                    }
                                    placeholder="Minimum 8 characters"
                                    className={`${inputClass("password")} pl-11 pr-12`}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                                >
                                    {showPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-medium text-zinc-300">
                                Confirm Password <span className="text-red-400">*</span>
                            </label>

                            <div className="relative">
                                <Lock
                                    size={17}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                />

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) =>
                                        updateField("confirmPassword", e.target.value)
                                    }
                                    placeholder="Re-enter password"
                                    className={`${inputClass("confirmPassword")} pl-11 pr-12`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>

                            {errors.confirmPassword && (
                                <p className="mt-1.5 text-xs text-red-400">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <div className="flex gap-3">
                            <ShieldCheck
                                size={18}
                                className="mt-0.5 shrink-0 text-zinc-500"
                            />

                            <div>
                                <p className="text-xs font-medium text-zinc-300">
                                    Admin access
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    This account will be used by the studio to manage events,
                                    folders, customer galleries and photo selections.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ====================================================== */}
                {/* SUBSCRIPTION */}
                {/* ====================================================== */}

                <section className={sectionClass}>
                    <SectionHeader
                        icon={<CalendarDays size={19} />}
                        title="Subscription"
                        description="Configure the studio's subscription"
                    />

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                        {/* Plan */}
                        <div>
                            <label className="text-sm font-medium text-zinc-300">
                                Plan <span className="text-red-400">*</span>
                            </label>

                            <select
                                value={plan}
                                onChange={(e) =>
                                    setPlan(e.target.value as Plan)
                                }
                                className={inputClass("plan")}
                            >
                                <option value="Basic">Basic</option>
                                <option value="Professional">Professional</option>
                                <option value="Enterprise">Enterprise</option>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="text-sm font-medium text-zinc-300">
                                Start Date <span className="text-red-400">*</span>
                            </label>

                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) =>
                                    updateField("startDate", e.target.value)
                                }
                                className={inputClass("startDate")}
                            />

                            {errors.startDate && (
                                <p className="mt-1.5 text-xs text-red-400">
                                    {errors.startDate}
                                </p>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="text-sm font-medium text-zinc-300">
                                End Date <span className="text-red-400">*</span>
                            </label>

                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) =>
                                    updateField("endDate", e.target.value)
                                }
                                className={inputClass("endDate")}
                            />

                            {errors.endDate && (
                                <p className="mt-1.5 text-xs text-red-400">
                                    {errors.endDate}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Plan Preview */}
                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {(["Basic", "Professional", "Enterprise"] as Plan[]).map(
                            (item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setPlan(item)}
                                    className={`rounded-xl border p-4 text-left transition ${plan === item
                                            ? "border-white bg-white text-black"
                                            : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                                        }`}
                                >
                                    <p className="text-sm font-semibold">
                                        {item}
                                    </p>

                                    <p
                                        className={`mt-1 text-xs ${plan === item
                                                ? "text-zinc-600"
                                                : "text-zinc-600"
                                            }`}
                                    >
                                        {item === "Basic" &&
                                            "For small studios and basic usage"}

                                        {item === "Professional" &&
                                            "For growing photography studios"}

                                        {item === "Enterprise" &&
                                            "For large-scale studio operations"}
                                    </p>
                                </button>
                            )
                        )}
                    </div>
                </section>

                {/* ====================================================== */}
                {/* STORAGE & LIMITS */}
                {/* ====================================================== */}

                <section className={sectionClass}>
                    <SectionHeader
                        icon={<HardDrive size={19} />}
                        title="Storage & Limits"
                        description="Set usage limits for this studio"
                    />

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {/* Storage */}
                        <NumberField
                            label="Storage Limit"
                            required
                            value={formData.storageLimit}
                            onChange={(value) =>
                                updateField("storageLimit", value)
                            }
                            suffix="GB"
                            error={errors.storageLimit}
                            icon={<HardDrive size={17} />}
                            inputClass={inputClass("storageLimit")}
                        />

                        {/* Events */}
                        <NumberField
                            label="Maximum Events"
                            required
                            value={formData.maxEvents}
                            onChange={(value) =>
                                updateField("maxEvents", value)
                            }
                            suffix="events"
                            error={errors.maxEvents}
                            icon={<CalendarDays size={17} />}
                            inputClass={inputClass("maxEvents")}
                        />

                        {/* Customers */}
                        <NumberField
                            label="Maximum Customers"
                            required
                            value={formData.maxCustomers}
                            onChange={(value) =>
                                updateField("maxCustomers", value)
                            }
                            suffix="customers"
                            error={errors.maxCustomers}
                            icon={<Users size={17} />}
                            inputClass={inputClass("maxCustomers")}
                        />

                        {/* Images */}
                        <NumberField
                            label="Maximum Images"
                            required
                            value={formData.maxImages}
                            onChange={(value) =>
                                updateField("maxImages", value)
                            }
                            suffix="images"
                            error={errors.maxImages}
                            icon={<ImageIcon size={17} />}
                            inputClass={inputClass("maxImages")}
                        />
                    </div>

                    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <div className="flex gap-3">
                            <HardDrive
                                size={18}
                                className="mt-0.5 shrink-0 text-zinc-500"
                            />

                            <div>
                                <p className="text-xs font-medium text-zinc-300">
                                    Storage limit
                                </p>

                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Storage represents the total photo/file storage allocated
                                    to this studio. The actual storage provider will be
                                    connected later.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ====================================================== */}
                {/* ACCOUNT STATUS */}
                {/* ====================================================== */}

                <section className={sectionClass}>
                    <SectionHeader
                        icon={<ShieldCheck size={19} />}
                        title="Account"
                        description="Control the studio account status and internal notes"
                    />

                    <div className="mt-6">
                        <label className="text-sm font-medium text-zinc-300">
                            Account Status
                        </label>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => setStatus("Active")}
                                className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm transition ${status === "Active"
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                        : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700"
                                    }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${status === "Active"
                                            ? "bg-emerald-400"
                                            : "bg-zinc-600"
                                        }`}
                                />

                                Active
                            </button>

                            <button
                                type="button"
                                onClick={() => setStatus("Inactive")}
                                className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm transition ${status === "Inactive"
                                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                                        : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700"
                                    }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${status === "Inactive"
                                            ? "bg-red-400"
                                            : "bg-zinc-600"
                                        }`}
                                />

                                Inactive
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="text-sm font-medium text-zinc-300">
                            Internal Notes
                        </label>

                        <textarea
                            value={formData.notes}
                            onChange={(e) =>
                                updateField("notes", e.target.value)
                            }
                            rows={4}
                            placeholder="Add any internal notes about this studio..."
                            className={inputClass("notes") + " resize-none"}
                        />

                        <p className="mt-2 text-xs text-zinc-600">
                            These notes are for platform administration only.
                        </p>
                    </div>
                </section>

                {/* ====================================================== */}
                {/* BOTTOM ACTIONS */}
                {/* ====================================================== */}

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        onClick={() => router.push("/super-admin/studios")}
                        className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                    >
                        <Check size={17} />
                        Create Studio
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ============================================================ */
/* SECTION HEADER */
/* ============================================================ */

function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400">
                {icon}
            </div>

            <div>
                <h2 className="text-base font-semibold text-white">
                    {title}
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* ============================================================ */
/* INPUT FIELD */
/* ============================================================ */

function InputField({
    label,
    required,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    icon,
    className = "",
    inputClass,
}: {
    label: string;
    required?: boolean;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    icon?: React.ReactNode;
    className?: string;
    inputClass: string;
}) {
    return (
        <div className={className}>
            <label className="text-sm font-medium text-zinc-300">
                {label}{" "}
                {required && <span className="text-red-400">*</span>}
            </label>

            <div className="relative">
                {icon && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                        {icon}
                    </span>
                )}

                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`${inputClass} ${icon ? "pl-11" : ""}`}
                />
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

/* ============================================================ */
/* NUMBER FIELD */
/* ============================================================ */

function NumberField({
    label,
    required,
    value,
    onChange,
    suffix,
    error,
    icon,
    inputClass,
}: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    suffix: string;
    error?: string;
    icon?: React.ReactNode;
    inputClass: string;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-zinc-300">
                {label}{" "}
                {required && <span className="text-red-400">*</span>}
            </label>

            <div className="relative">
                {icon && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                        {icon}
                    </span>
                )}

                <input
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${inputClass} ${icon ? "pl-11" : ""} pr-16`}
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                    {suffix}
                </span>
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}