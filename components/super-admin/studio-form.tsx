"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    Eye,
    EyeOff,
    Globe,
    HardDrive,
    ImageIcon,
    Lock,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    User,
    Users,
} from "lucide-react";

export type StudioPlan = "Basic" | "Professional" | "Enterprise";
export type StudioStatus = "Active" | "Inactive";

export interface StudioFormData {
    studioName: string;
    studioEmail: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    website: string;
    description: string;

    adminName: string;
    adminEmail: string;
    adminPhone: string;
    password: string;
    confirmPassword: string;

    startDate: string;
    endDate: string;

    storageLimit: string;
    maxEvents: string;
    maxCustomers: string;
    maxImages: string;

    notes: string;
}

interface StudioFormProps {
    mode: "create" | "edit";
    studioId?: string;
    initialData?: Partial<StudioFormData>;
    initialPlan?: StudioPlan;
    initialStatus?: StudioStatus;
}

const defaultFormData: StudioFormData = {
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
};

export default function StudioForm({
    mode,
    studioId,
    initialData,
    initialPlan = "Professional",
    initialStatus = "Active",
}: StudioFormProps) {
    const router = useRouter();

    const [formData, setFormData] = useState<StudioFormData>({
        ...defaultFormData,
        ...initialData,
    });

    const [plan, setPlan] = useState<StudioPlan>(initialPlan);
    const [status, setStatus] = useState<StudioStatus>(initialStatus);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const isEdit = mode === "edit";

    const updateField = (
        field: keyof StudioFormData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.studioName.trim()) {
            newErrors.studioName = "Studio name is required";
        }

        if (!formData.studioEmail.trim()) {
            newErrors.studioEmail = "Studio email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.studioEmail)) {
            newErrors.studioEmail = "Enter a valid email address";
        }

        if (!formData.adminName.trim()) {
            newErrors.adminName = "Admin name is required";
        }

        if (!formData.adminEmail.trim()) {
            newErrors.adminEmail = "Admin email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
            newErrors.adminEmail = "Enter a valid email address";
        }

        // Password is required only while creating.
        if (!isEdit) {
            if (!formData.password) {
                newErrors.password = "Password is required";
            } else if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Please confirm the password";
            } else if (
                formData.password !== formData.confirmPassword
            ) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        // If editing and user entered a new password,
        // validate it.
        if (isEdit && formData.password) {
            if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
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

        if (
            !formData.maxCustomers ||
            Number(formData.maxCustomers) <= 0
        ) {
            newErrors.maxCustomers = "Enter a valid customer limit";
        }

        if (!formData.maxImages || Number(formData.maxImages) <= 0) {
            newErrors.maxImages = "Enter a valid image limit";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setIsSaving(true);

        /*
         * UI ONLY FOR NOW
         *
         * Later:
         * - Create mode -> POST /api/super-admin/studios
         * - Edit mode   -> PUT /api/super-admin/studios/:id
         */

        await new Promise((resolve) => setTimeout(resolve, 800));

        console.log(
            isEdit ? "Updating studio:" : "Creating studio:",
            {
                studioId,
                ...formData,
                plan,
                status,
            }
        );

        setIsSaving(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check className="text-emerald-400" size={30} />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold text-white">
                        {isEdit
                            ? "Studio Updated Successfully"
                            : "Studio Created Successfully"}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {isEdit
                            ? "The studio details have been updated successfully."
                            : "The new studio has been created successfully."}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={() => router.push("/super-admin/studios")}
                            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                        >
                            Back to Studios
                        </button>

                        {isEdit && studioId && (
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        `/super-admin/studios/${studioId}`
                                    )
                                }
                                className="rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                            >
                                View Studio
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {isEdit ? "Edit Studio" : "Add Studio"}
                        </h1>

                        <p className="mt-1 text-sm text-zinc-400">
                            {isEdit
                                ? "Update studio information, admin access and subscription settings."
                                : "Create a new photography studio and configure its account."}
                        </p>
                    </div>
                </div>

                {isEdit && (
                    <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${status === "Active"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : "border-red-500/20 bg-red-500/10 text-red-400"
                            }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${status === "Active"
                                    ? "bg-emerald-400"
                                    : "bg-red-400"
                                }`}
                        />
                        {status}
                    </div>
                )}
            </div>

            {/* Main Form */}
            <div className="space-y-6">
                {/* Studio Information */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
                    <SectionHeader
                        icon={<Building2 size={19} />}
                        title="Studio Information"
                        description="Basic information about the photography studio."
                    />

                    <div className="grid gap-5 p-6 md:grid-cols-2">
                        <InputField
                            label="Studio Name"
                            required
                            value={formData.studioName}
                            onChange={(value) =>
                                updateField("studioName", value)
                            }
                            placeholder="e.g. Innovate Wedding Studio"
                            icon={<Building2 size={17} />}
                            error={errors.studioName}
                        />

                        <InputField
                            label="Studio Email"
                            required
                            type="email"
                            value={formData.studioEmail}
                            onChange={(value) =>
                                updateField("studioEmail", value)
                            }
                            placeholder="studio@example.com"
                            icon={<Mail size={17} />}
                            error={errors.studioEmail}
                        />

                        <InputField
                            label="Phone"
                            value={formData.phone}
                            onChange={(value) => updateField("phone", value)}
                            placeholder="+91 98765 43210"
                            icon={<Phone size={17} />}
                        />

                        <InputField
                            label="Website"
                            type="url"
                            value={formData.website}
                            onChange={(value) =>
                                updateField("website", value)
                            }
                            placeholder="https://example.com"
                            icon={<Globe size={17} />}
                        />

                        <InputField
                            label="Address"
                            value={formData.address}
                            onChange={(value) =>
                                updateField("address", value)
                            }
                            placeholder="Street / Main Road"
                            icon={<MapPin size={17} />}
                        />

                        <InputField
                            label="City"
                            value={formData.city}
                            onChange={(value) => updateField("city", value)}
                            placeholder="Nagercoil"
                        />

                        <InputField
                            label="State"
                            value={formData.state}
                            onChange={(value) => updateField("state", value)}
                            placeholder="Tamil Nadu"
                        />

                        <InputField
                            label="Country"
                            value={formData.country}
                            onChange={(value) =>
                                updateField("country", value)
                            }
                            placeholder="India"
                        />

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-zinc-300">
                                Description
                            </label>

                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    updateField("description", e.target.value)
                                }
                                rows={4}
                                placeholder="Short description about the studio..."
                                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Admin Account */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
                    <SectionHeader
                        icon={<ShieldCheck size={19} />}
                        title="Admin Account"
                        description={
                            isEdit
                                ? "Manage the studio administrator account."
                                : "Create the administrator account for this studio."
                        }
                    />

                    <div className="grid gap-5 p-6 md:grid-cols-2">
                        <InputField
                            label="Admin Name"
                            required
                            value={formData.adminName}
                            onChange={(value) =>
                                updateField("adminName", value)
                            }
                            placeholder="Admin full name"
                            icon={<User size={17} />}
                            error={errors.adminName}
                        />

                        <InputField
                            label="Admin Email"
                            required
                            type="email"
                            value={formData.adminEmail}
                            onChange={(value) =>
                                updateField("adminEmail", value)
                            }
                            placeholder="admin@example.com"
                            icon={<Mail size={17} />}
                            error={errors.adminEmail}
                        />

                        <InputField
                            label="Admin Phone"
                            value={formData.adminPhone}
                            onChange={(value) =>
                                updateField("adminPhone", value)
                            }
                            placeholder="+91 98765 43210"
                            icon={<Phone size={17} />}
                        />

                        <PasswordField
                            label={
                                isEdit
                                    ? "New Password"
                                    : "Password"
                            }
                            required={!isEdit}
                            value={formData.password}
                            onChange={(value) =>
                                updateField("password", value)
                            }
                            visible={showPassword}
                            onToggle={() =>
                                setShowPassword((prev) => !prev)
                            }
                            placeholder={
                                isEdit
                                    ? "Leave empty to keep current password"
                                    : "Minimum 8 characters"
                            }
                            error={errors.password}
                        />

                        <PasswordField
                            label="Confirm Password"
                            required={!isEdit && !!formData.password}
                            value={formData.confirmPassword}
                            onChange={(value) =>
                                updateField("confirmPassword", value)
                            }
                            visible={showConfirmPassword}
                            onToggle={() =>
                                setShowConfirmPassword((prev) => !prev)
                            }
                            placeholder="Confirm password"
                            error={errors.confirmPassword}
                        />
                    </div>

                    {isEdit && (
                        <div className="mx-6 mb-6 flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                            <Lock
                                size={17}
                                className="mt-0.5 shrink-0 text-blue-400"
                            />

                            <p className="text-xs leading-5 text-blue-300">
                                Leave the password fields empty if you do not
                                want to change the current admin password.
                            </p>
                        </div>
                    )}
                </section>

                {/* Subscription */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
                    <SectionHeader
                        icon={<CalendarDays size={19} />}
                        title="Subscription"
                        description="Configure the studio subscription plan and period."
                    />

                    <div className="p-6">
                        <label className="mb-3 block text-sm font-medium text-zinc-300">
                            Plan
                        </label>

                        <div className="grid gap-3 md:grid-cols-3">
                            {(["Basic", "Professional", "Enterprise"] as StudioPlan[]).map(
                                (item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setPlan(item)}
                                        className={`rounded-xl border p-4 text-left transition ${plan === item
                                                ? "border-white bg-white text-black"
                                                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">
                                                {item}
                                            </span>

                                            {plan === item && (
                                                <Check size={17} />
                                            )}
                                        </div>

                                        <p
                                            className={`mt-1 text-xs ${plan === item
                                                    ? "text-zinc-600"
                                                    : "text-zinc-500"
                                                }`}
                                        >
                                            {item === "Basic" &&
                                                "For small photography studios."}

                                            {item === "Professional" &&
                                                "For growing studios and teams."}

                                            {item === "Enterprise" &&
                                                "For high-volume studios."}
                                        </p>
                                    </button>
                                )
                            )}
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            <InputField
                                label="Subscription Start"
                                required
                                type="date"
                                value={formData.startDate}
                                onChange={(value) =>
                                    updateField("startDate", value)
                                }
                                icon={<CalendarDays size={17} />}
                                error={errors.startDate}
                            />

                            <InputField
                                label="Subscription End"
                                required
                                type="date"
                                value={formData.endDate}
                                onChange={(value) =>
                                    updateField("endDate", value)
                                }
                                icon={<CalendarDays size={17} />}
                                error={errors.endDate}
                            />
                        </div>

                        {isEdit && (
                            <div className="mt-6">
                                <label className="mb-3 block text-sm font-medium text-zinc-300">
                                    Account Status
                                </label>

                                <div className="flex flex-wrap gap-3">
                                    {(["Active", "Inactive"] as StudioStatus[]).map(
                                        (item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => setStatus(item)}
                                                className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${status === item
                                                        ? item === "Active"
                                                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                                            : "border-red-500/40 bg-red-500/10 text-red-400"
                                                        : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-white"
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Storage & Limits */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
                    <SectionHeader
                        icon={<HardDrive size={19} />}
                        title="Storage & Limits"
                        description="Set usage limits for this studio."
                    />

                    <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">
                        <NumberField
                            label="Storage Limit"
                            suffix="GB"
                            value={formData.storageLimit}
                            onChange={(value) =>
                                updateField("storageLimit", value)
                            }
                            icon={<HardDrive size={17} />}
                            error={errors.storageLimit}
                        />

                        <NumberField
                            label="Maximum Events"
                            suffix="events"
                            value={formData.maxEvents}
                            onChange={(value) =>
                                updateField("maxEvents", value)
                            }
                            icon={<CalendarDays size={17} />}
                            error={errors.maxEvents}
                        />

                        <NumberField
                            label="Maximum Customers"
                            suffix="customers"
                            value={formData.maxCustomers}
                            onChange={(value) =>
                                updateField("maxCustomers", value)
                            }
                            icon={<Users size={17} />}
                            error={errors.maxCustomers}
                        />

                        <NumberField
                            label="Maximum Images"
                            suffix="images"
                            value={formData.maxImages}
                            onChange={(value) =>
                                updateField("maxImages", value)
                            }
                            icon={<ImageIcon size={17} />}
                            error={errors.maxImages}
                        />
                    </div>
                </section>

                {/* Notes */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
                    <SectionHeader
                        icon={<AlertCircle size={19} />}
                        title="Internal Notes"
                        description="Notes visible only to the Super Admin."
                    />

                    <div className="p-6">
                        <textarea
                            value={formData.notes}
                            onChange={(e) =>
                                updateField("notes", e.target.value)
                            }
                            rows={4}
                            placeholder="Add internal notes about this studio..."
                            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                        />
                    </div>
                </section>

                {/* Bottom Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving
                            ? isEdit
                                ? "Saving Changes..."
                                : "Creating Studio..."
                            : isEdit
                                ? "Save Changes"
                                : "Create Studio"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Reusable Components                                                        */
/* -------------------------------------------------------------------------- */

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
        <div className="flex items-start gap-4 border-b border-zinc-800 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
                {icon}
            </div>

            <div>
                <h2 className="font-semibold text-white">{title}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function InputField({
    label,
    required,
    type = "text",
    value,
    onChange,
    placeholder,
    icon,
    error,
}: {
    label: string;
    required?: boolean;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
                {label}

                {required && (
                    <span className="ml-1 text-red-400">*</span>
                )}
            </label>

            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                        {icon}
                    </div>
                )}

                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 ${icon ? "pl-10" : ""
                        } ${error
                            ? "border-red-500/60"
                            : "border-zinc-700"
                        }`}
                />
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}

function NumberField({
    label,
    suffix,
    value,
    onChange,
    icon,
    error,
}: {
    label: string;
    suffix: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                        {icon}
                    </div>
                )}

                <input
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full rounded-xl border bg-zinc-950 py-3 pr-14 text-sm text-white outline-none transition focus:border-zinc-500 ${icon ? "pl-10" : "pl-4"
                        } ${error
                            ? "border-red-500/60"
                            : "border-zinc-700"
                        }`}
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                    {suffix}
                </span>
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}

function PasswordField({
    label,
    required,
    value,
    onChange,
    visible,
    onToggle,
    placeholder,
    error,
}: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onToggle: () => void;
    placeholder?: string;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
                {label}

                {required && (
                    <span className="ml-1 text-red-400">*</span>
                )}
            </label>

            <div className="relative">
                <Lock
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border bg-zinc-950 py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 ${error
                            ? "border-red-500/60"
                            : "border-zinc-700"
                        }`}
                />

                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                >
                    {visible ? (
                        <EyeOff size={17} />
                    ) : (
                        <Eye size={17} />
                    )}
                </button>
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}