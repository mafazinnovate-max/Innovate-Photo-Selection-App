"use client";

import { useState } from "react";
import {
    AlertTriangle,
    Bell,
    Check,
    Cloud,
    Database,
    Globe,
    ImageIcon,
    Lock,
    Mail,
    Save,
    Settings,
    Shield,
    Smartphone,
    ToggleLeft,
    Users,
    Wrench,
    X,
} from "lucide-react";

type Tab =
    | "platform"
    | "subscription"
    | "storage"
    | "gallery"
    | "security"
    | "notifications";

export default function SuperAdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("platform");
    const [saved, setSaved] = useState(false);

    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowNewStudios, setAllowNewStudios] = useState(true);

    const [settings, setSettings] = useState({
        platformName: "Innovate Photo Selection",
        platformEmail: "admin@innovatewedding.com",
        supportEmail: "support@innovatewedding.com",
        supportPhone: "+91 98765 43210",
        website: "https://innovatewedding.com",
        description:
            "Professional photo selection and customer gallery platform for photography studios.",

        basicStorage: "25",
        professionalStorage: "100",
        enterpriseStorage: "300",

        basicEvents: "15",
        professionalEvents: "50",
        enterpriseEvents: "150",

        basicCustomers: "100",
        professionalCustomers: "500",
        enterpriseCustomers: "1500",

        basicImages: "25000",
        professionalImages: "100000",
        enterpriseImages: "300000",

        storageProvider: "Cloudinary",
        maxUploadSize: "25",
        allowedFormats: "JPG, JPEG, PNG, WEBP",
        warningThreshold: "75",
        criticalThreshold: "90",

        defaultGalleryMode: "single",
        commentsEnabled: true,
        downloadsEnabled: false,
        autoSaveSelections: true,
        lightboxEnabled: true,

        sessionTimeout: "120",
        accessCodeLength: "4",
        loginProtection: true,
        twoFactorAuth: false,

        newStudioNotification: true,
        subscriptionExpiryNotification: true,
        storageWarningNotification: true,
        systemEmailNotifications: true,
    });

    const updateSetting = (
        key: keyof typeof settings,
        value: string | boolean
    ) => {
        setSettings((previous) => ({
            ...previous,
            [key]: value,
        }));

        setSaved(false);
    };

    const saveSettings = () => {
        console.log("Super Admin Settings:", {
            ...settings,
            maintenanceMode,
            allowNewStudios,
        });

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2500);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
                        <Settings size={22} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Super Admin Settings
                        </h1>

                        <p className="mt-1 text-sm text-zinc-400">
                            Manage platform configuration, subscriptions, storage,
                            security and notifications.
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Layout */}
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                {/* Sidebar */}
                <SettingsNavigation
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />

                {/* Content */}
                <div className="min-w-0 space-y-6">
                    {activeTab === "platform" && (
                        <PlatformSettings
                            settings={settings}
                            updateSetting={updateSetting}
                        />
                    )}

                    {activeTab === "subscription" && (
                        <SubscriptionSettings
                            settings={settings}
                            updateSetting={updateSetting}
                        />
                    )}

                    {activeTab === "storage" && (
                        <StorageSettings
                            settings={settings}
                            updateSetting={updateSetting}
                        />
                    )}

                    {activeTab === "gallery" && (
                        <GallerySettings
                            settings={settings}
                            updateSetting={updateSetting}
                        />
                    )}

                    {activeTab === "security" && (
                        <SecuritySettings
                            settings={settings}
                            updateSetting={updateSetting}
                        />
                    )}

                    {activeTab === "notifications" && (
                        <NotificationSettings
                            settings={settings}
                            updateSetting={updateSetting}
                        />
                    )}

                    {/* Save Button */}
                    <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            {saved ? (
                                <div className="flex items-center gap-2 text-sm text-emerald-400">
                                    <Check size={16} />
                                    Settings saved successfully.
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    Changes are currently saved only in the interface.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={saveSettings}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <DangerZone
                        maintenanceMode={maintenanceMode}
                        setMaintenanceMode={(value) => {
                            setMaintenanceMode(value);
                            setSaved(false);
                        }}
                        allowNewStudios={allowNewStudios}
                        setAllowNewStudios={(value) => {
                            setAllowNewStudios(value);
                            setSaved(false);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

function SettingsNavigation({
    activeTab,
    onChange,
}: {
    activeTab: Tab;
    onChange: (tab: Tab) => void;
}) {
    const items: {
        id: Tab;
        label: string;
        description: string;
        icon: React.ElementType;
    }[] = [
            {
                id: "platform",
                label: "Platform",
                description: "General platform information",
                icon: Globe,
            },
            {
                id: "subscription",
                label: "Subscriptions",
                description: "Plans and usage limits",
                icon: Users,
            },
            {
                id: "storage",
                label: "Storage",
                description: "File storage configuration",
                icon: Cloud,
            },
            {
                id: "gallery",
                label: "Gallery",
                description: "Customer gallery defaults",
                icon: ImageIcon,
            },
            {
                id: "security",
                label: "Security",
                description: "Authentication and access",
                icon: Shield,
            },
            {
                id: "notifications",
                label: "Notifications",
                description: "Email and system alerts",
                icon: Bell,
            },
        ];

    return (
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950 p-2">
            <div className="space-y-1">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${isActive
                                    ? "bg-white text-black"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                }`}
                        >
                            <Icon
                                size={18}
                                className={`mt-0.5 shrink-0 ${isActive ? "text-black" : "text-zinc-500"
                                    }`}
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-medium">{item.label}</p>

                                <p
                                    className={`mt-0.5 text-[11px] ${isActive ? "text-zinc-600" : "text-zinc-600"
                                        }`}
                                >
                                    {item.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}

/* -------------------------------------------------------------------------- */
/* Platform Settings                                                          */
/* -------------------------------------------------------------------------- */

function PlatformSettings({
    settings,
    updateSetting,
}: {
    settings: SettingsState;
    updateSetting: (
        key: keyof SettingsState,
        value: string | boolean
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <Section
                icon={Globe}
                title="Platform Information"
                description="Basic information about your SaaS platform."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <Input
                        label="Platform Name"
                        value={settings.platformName}
                        onChange={(value) =>
                            updateSetting("platformName", value)
                        }
                        placeholder="Platform name"
                    />

                    <Input
                        label="Platform Email"
                        type="email"
                        value={settings.platformEmail}
                        onChange={(value) =>
                            updateSetting("platformEmail", value)
                        }
                        placeholder="admin@example.com"
                    />

                    <Input
                        label="Support Email"
                        type="email"
                        value={settings.supportEmail}
                        onChange={(value) =>
                            updateSetting("supportEmail", value)
                        }
                        placeholder="support@example.com"
                    />

                    <Input
                        label="Support Phone"
                        value={settings.supportPhone}
                        onChange={(value) =>
                            updateSetting("supportPhone", value)
                        }
                        placeholder="+91..."
                    />

                    <div className="md:col-span-2">
                        <Input
                            label="Website"
                            value={settings.website}
                            onChange={(value) =>
                                updateSetting("website", value)
                            }
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Textarea
                            label="Platform Description"
                            value={settings.description}
                            onChange={(value) =>
                                updateSetting("description", value)
                            }
                            placeholder="Describe your platform..."
                        />
                    </div>
                </div>
            </Section>

            <Section
                icon={Smartphone}
                title="Platform Status"
                description="Control the overall availability of the platform."
            >
                <ToggleRow
                    icon={Wrench}
                    title="Maintenance Mode"
                    description="Temporarily restrict platform access while maintenance is in progress."
                    checked={false}
                    disabled
                />

                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                        <div>
                            <p className="text-sm font-medium text-white">
                                Platform is currently operational
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                All platform services are available.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Subscription Settings                                                      */
/* -------------------------------------------------------------------------- */

function SubscriptionSettings({
    settings,
    updateSetting,
}: {
    settings: SettingsState;
    updateSetting: (
        key: keyof SettingsState,
        value: string | boolean
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <Section
                icon={Users}
                title="Plan Defaults"
                description="Default resource limits assigned to new studios."
            >
                <PlanLimitCard
                    title="Basic"
                    description="For small photography studios."
                    storage={settings.basicStorage}
                    events={settings.basicEvents}
                    customers={settings.basicCustomers}
                    images={settings.basicImages}
                    onChange={updateSetting}
                    storageKey="basicStorage"
                    eventsKey="basicEvents"
                    customersKey="basicCustomers"
                    imagesKey="basicImages"
                />

                <PlanLimitCard
                    title="Professional"
                    description="For growing photography businesses."
                    storage={settings.professionalStorage}
                    events={settings.professionalEvents}
                    customers={settings.professionalCustomers}
                    images={settings.professionalImages}
                    onChange={updateSetting}
                    storageKey="professionalStorage"
                    eventsKey="professionalEvents"
                    customersKey="professionalCustomers"
                    imagesKey="professionalImages"
                />

                <PlanLimitCard
                    title="Enterprise"
                    description="For high-volume studios and larger teams."
                    storage={settings.enterpriseStorage}
                    events={settings.enterpriseEvents}
                    customers={settings.enterpriseCustomers}
                    images={settings.enterpriseImages}
                    onChange={updateSetting}
                    storageKey="enterpriseStorage"
                    eventsKey="enterpriseEvents"
                    customersKey="enterpriseCustomers"
                    imagesKey="enterpriseImages"
                />
            </Section>

            <Section
                icon={Database}
                title="Subscription Behaviour"
                description="Default behaviour for studio subscriptions."
            >
                <div className="space-y-4">
                    <InfoRow
                        title="New subscription status"
                        description="Newly created studio subscriptions start as active."
                        value="Active"
                    />

                    <InfoRow
                        title="Expired subscriptions"
                        description="Access should be restricted when the subscription expires."
                        value="Restricted"
                    />

                    <InfoRow
                        title="Grace period"
                        description="Additional access period after subscription expiry."
                        value="0 days"
                    />
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Storage Settings                                                           */
/* -------------------------------------------------------------------------- */

function StorageSettings({
    settings,
    updateSetting,
}: {
    settings: SettingsState;
    updateSetting: (
        key: keyof SettingsState,
        value: string | boolean
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <Section
                icon={Cloud}
                title="Storage Provider"
                description="Configure where uploaded gallery media is stored."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <SelectInput
                        label="Storage Provider"
                        value={settings.storageProvider}
                        onChange={(value) =>
                            updateSetting("storageProvider", value)
                        }
                        options={[
                            "Cloudinary",
                            "Cloudflare R2",
                            "Amazon S3",
                        ]}
                    />

                    <NumberInput
                        label="Maximum Upload Size"
                        value={settings.maxUploadSize}
                        suffix="MB"
                        onChange={(value) =>
                            updateSetting("maxUploadSize", value)
                        }
                    />
                </div>

                <div className="mt-5">
                    <Input
                        label="Allowed Image Formats"
                        value={settings.allowedFormats}
                        onChange={(value) =>
                            updateSetting("allowedFormats", value)
                        }
                        placeholder="JPG, JPEG, PNG, WEBP"
                    />
                </div>
            </Section>

            <Section
                icon={AlertTriangle}
                title="Storage Alerts"
                description="Set the thresholds used for usage warnings."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <NumberInput
                        label="Warning Threshold"
                        value={settings.warningThreshold}
                        suffix="%"
                        onChange={(value) =>
                            updateSetting("warningThreshold", value)
                        }
                    />

                    <NumberInput
                        label="Critical Threshold"
                        value={settings.criticalThreshold}
                        suffix="%"
                        onChange={(value) =>
                            updateSetting("criticalThreshold", value)
                        }
                    />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <ThresholdCard
                        title="Warning"
                        value={`${settings.warningThreshold}%`}
                        description="Studio should receive a storage warning."
                        type="warning"
                    />

                    <ThresholdCard
                        title="Critical"
                        value={`${settings.criticalThreshold}%`}
                        description="Studio is close to its storage limit."
                        type="critical"
                    />
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Gallery Settings                                                           */
/* -------------------------------------------------------------------------- */

function GallerySettings({
    settings,
    updateSetting,
}: {
    settings: SettingsState;
    updateSetting: (
        key: keyof SettingsState,
        value: string | boolean
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <Section
                icon={ImageIcon}
                title="Gallery Defaults"
                description="Default settings applied when studios create new galleries."
            >
                <SelectInput
                    label="Default Gallery Mode"
                    value={settings.defaultGalleryMode}
                    onChange={(value) =>
                        updateSetting("defaultGalleryMode", value)
                    }
                    options={[
                        "single",
                        "bride_groom",
                    ]}
                    displayOptions={{
                        single: "Single Folder",
                        bride_groom: "Nested / Bride & Groom",
                    }}
                />

                <div className="mt-5 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
                    <ToggleRow
                        icon={ImageIcon}
                        title="Comments"
                        description="Allow customers to add comments to photos."
                        checked={settings.commentsEnabled}
                        onChange={(value) =>
                            updateSetting("commentsEnabled", value)
                        }
                    />

                    <ToggleRow
                        icon={Cloud}
                        title="Downloads"
                        description="Allow customers to download original or preview files."
                        checked={settings.downloadsEnabled}
                        onChange={(value) =>
                            updateSetting("downloadsEnabled", value)
                        }
                    />

                    <ToggleRow
                        icon={Save}
                        title="Auto-save Selections"
                        description="Automatically save customer photo selections."
                        checked={settings.autoSaveSelections}
                        onChange={(value) =>
                            updateSetting("autoSaveSelections", value)
                        }
                    />

                    <ToggleRow
                        icon={ImageIcon}
                        title="Lightbox"
                        description="Enable full-screen photo preview and selection."
                        checked={settings.lightboxEnabled}
                        onChange={(value) =>
                            updateSetting("lightboxEnabled", value)
                        }
                    />
                </div>
            </Section>

            <Section
                icon={Lock}
                title="Customer Access"
                description="Default access behaviour for customer galleries."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow
                        title="Access method"
                        description="Customer gallery access."
                        value="Share Link + Access Code"
                    />

                    <InfoRow
                        title="Selection saving"
                        description="Customer selections are persisted automatically."
                        value={
                            settings.autoSaveSelections
                                ? "Automatic"
                                : "Manual"
                        }
                    />
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Security Settings                                                          */
/* -------------------------------------------------------------------------- */

function SecuritySettings({
    settings,
    updateSetting,
}: {
    settings: SettingsState;
    updateSetting: (
        key: keyof SettingsState,
        value: string | boolean
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <Section
                icon={Shield}
                title="Authentication"
                description="Configure admin and platform authentication behaviour."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <NumberInput
                        label="Session Timeout"
                        value={settings.sessionTimeout}
                        suffix="minutes"
                        onChange={(value) =>
                            updateSetting("sessionTimeout", value)
                        }
                    />

                    <NumberInput
                        label="Gallery Access Code Length"
                        value={settings.accessCodeLength}
                        suffix="digits"
                        onChange={(value) =>
                            updateSetting("accessCodeLength", value)
                        }
                    />
                </div>

                <div className="mt-5 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
                    <ToggleRow
                        icon={Shield}
                        title="Login Protection"
                        description="Protect admin login from repeated failed attempts."
                        checked={settings.loginProtection}
                        onChange={(value) =>
                            updateSetting("loginProtection", value)
                        }
                    />

                    <ToggleRow
                        icon={Smartphone}
                        title="Two-Factor Authentication"
                        description="Require an additional authentication step for Super Admin."
                        checked={settings.twoFactorAuth}
                        onChange={(value) =>
                            updateSetting("twoFactorAuth", value)
                        }
                    />
                </div>
            </Section>

            <Section
                icon={Lock}
                title="Security Information"
                description="Current platform security configuration."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <SecurityStatus
                        title="Admin Login"
                        status="Protected"
                        icon={Lock}
                    />

                    <SecurityStatus
                        title="Gallery Access"
                        status="Access Code Protected"
                        icon={Shield}
                    />

                    <SecurityStatus
                        title="Session Management"
                        status={`${settings.sessionTimeout} minute timeout`}
                        icon={Smartphone}
                    />

                    <SecurityStatus
                        title="Two-Factor Authentication"
                        status={
                            settings.twoFactorAuth ? "Enabled" : "Disabled"
                        }
                        icon={Shield}
                    />
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Notification Settings                                                      */
/* -------------------------------------------------------------------------- */

function NotificationSettings({
    settings,
    updateSetting,
}: {
    settings: SettingsState;
    updateSetting: (
        key: keyof SettingsState,
        value: string | boolean
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <Section
                icon={Bell}
                title="Notification Preferences"
                description="Control which platform events generate notifications."
            >
                <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
                    <ToggleRow
                        icon={Users}
                        title="New Studio Registration"
                        description="Notify Super Admin when a new studio is created."
                        checked={settings.newStudioNotification}
                        onChange={(value) =>
                            updateSetting("newStudioNotification", value)
                        }
                    />

                    <ToggleRow
                        icon={Bell}
                        title="Subscription Expiry"
                        description="Notify when a studio subscription is approaching expiry."
                        checked={settings.subscriptionExpiryNotification}
                        onChange={(value) =>
                            updateSetting(
                                "subscriptionExpiryNotification",
                                value
                            )
                        }
                    />

                    <ToggleRow
                        icon={AlertTriangle}
                        title="Storage Warning"
                        description="Notify when a studio reaches the configured storage threshold."
                        checked={settings.storageWarningNotification}
                        onChange={(value) =>
                            updateSetting(
                                "storageWarningNotification",
                                value
                            )
                        }
                    />

                    <ToggleRow
                        icon={Mail}
                        title="System Emails"
                        description="Enable automated platform emails."
                        checked={settings.systemEmailNotifications}
                        onChange={(value) =>
                            updateSetting(
                                "systemEmailNotifications",
                                value
                            )
                        }
                    />
                </div>
            </Section>

            <Section
                icon={Mail}
                title="Email Configuration"
                description="Email sender information used by the platform."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <InfoRow
                        title="Sender"
                        description="Default sender address."
                        value={settings.platformEmail}
                    />

                    <InfoRow
                        title="Support"
                        description="Support contact address."
                        value={settings.supportEmail}
                    />
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Danger Zone                                                                */
/* -------------------------------------------------------------------------- */

function DangerZone({
    maintenanceMode,
    setMaintenanceMode,
    allowNewStudios,
    setAllowNewStudios,
}: {
    maintenanceMode: boolean;
    setMaintenanceMode: (value: boolean) => void;
    allowNewStudios: boolean;
    setAllowNewStudios: (value: boolean) => void;
}) {
    return (
        <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.03]">
            <div className="border-b border-red-500/10 p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                        <AlertTriangle size={19} />
                    </div>

                    <div>
                        <h2 className="font-semibold text-white">
                            Danger Zone
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Platform-level controls that can affect all studios.
                        </p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-red-500/10">
                <ToggleRow
                    icon={Wrench}
                    title="Maintenance Mode"
                    description="Temporarily prevent normal platform access."
                    checked={maintenanceMode}
                    onChange={setMaintenanceMode}
                    danger
                />

                <ToggleRow
                    icon={Users}
                    title="Allow New Studio Registrations"
                    description="Allow Super Admin to create and onboard new studios."
                    checked={allowNewStudios}
                    onChange={setAllowNewStudios}
                    danger={!allowNewStudios}
                />

                <div className="p-5">
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                        <p className="text-sm font-medium text-red-400">
                            Destructive actions are disabled for now
                        </p>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Permanent platform deletion, database reset and bulk studio
                            deletion will be connected later with additional confirmation
                            and authentication.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Shared Components                                                          */
/* -------------------------------------------------------------------------- */

function Section({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="border-b border-zinc-800 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400">
                        <Icon size={19} />
                    </div>

                    <div>
                        <h2 className="font-semibold text-white">{title}</h2>

                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">{children}</div>
        </section>
    );
}

function Input({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
                {label}
            </span>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            />
        </label>
    );
}

function Textarea({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
                {label}
            </span>

            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            />
        </label>
    );
}

function NumberInput({
    label,
    value,
    suffix,
    onChange,
}: {
    label: string;
    value: string;
    suffix?: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
                {label}
            </span>

            <div className="relative">
                <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 pr-20 text-sm text-white outline-none transition focus:border-zinc-600"
                />

                {suffix && (
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                        {suffix}
                    </span>
                )}
            </div>
        </label>
    );
}

function SelectInput({
    label,
    value,
    onChange,
    options,
    displayOptions,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    displayOptions?: Record<string, string>;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
                {label}
            </span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-white outline-none transition focus:border-zinc-600"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {displayOptions?.[option] ?? option}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ToggleRow({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
    disabled = false,
    danger = false,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    checked: boolean;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
    danger?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 p-4 ${disabled ? "opacity-60" : ""
                }`}
        >
            <div className="flex min-w-0 items-start gap-3">
                <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${danger
                            ? "bg-red-500/10 text-red-400"
                            : "bg-zinc-900 text-zinc-500"
                        }`}
                >
                    <Icon size={17} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{title}</p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {description}
                    </p>
                </div>
            </div>

            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange?.(!checked)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked
                        ? danger
                            ? "bg-red-500"
                            : "bg-white"
                        : "bg-zinc-800"
                    } ${disabled ? "cursor-not-allowed" : ""}`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full transition ${checked
                            ? "left-6 bg-black"
                            : "left-1 bg-zinc-500"
                        }`}
                />
            </button>
        </div>
    );
}

function InfoRow({
    title,
    description,
    value,
}: {
    title: string;
    description: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="min-w-0">
                <p className="text-sm font-medium text-white">{title}</p>

                <p className="mt-1 text-xs text-zinc-500">{description}</p>
            </div>

            <span className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300">
                {value}
            </span>
        </div>
    );
}

function SecurityStatus({
    title,
    status,
    icon: Icon,
}: {
    title: string;
    status: string;
    icon: React.ElementType;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400">
                    <Icon size={17} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{title}</p>

                    <p className="mt-1 text-xs text-emerald-400">{status}</p>
                </div>
            </div>
        </div>
    );
}

function ThresholdCard({
    title,
    value,
    description,
    type,
}: {
    title: string;
    value: string;
    description: string;
    type: "warning" | "critical";
}) {
    return (
        <div
            className={`rounded-xl border p-4 ${type === "critical"
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-yellow-500/20 bg-yellow-500/5"
                }`}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{title}</p>

                <span
                    className={`text-lg font-bold ${type === "critical"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                >
                    {value}
                </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
                {description}
            </p>
        </div>
    );
}

function PlanLimitCard({
    title,
    description,
    storage,
    events,
    customers,
    images,
    onChange,
    storageKey,
    eventsKey,
    customersKey,
    imagesKey,
}: {
    title: string;
    description: string;
    storage: string;
    events: string;
    customers: string;
    images: string;
    onChange: (
        key: keyof SettingsState,
        value: string | boolean
    ) => void;
    storageKey: keyof SettingsState;
    eventsKey: keyof SettingsState;
    customersKey: keyof SettingsState;
    imagesKey: keyof SettingsState;
}) {
    return (
        <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 last:mb-0">
            <div className="mb-5">
                <h3 className="font-semibold text-white">{title}</h3>

                <p className="mt-1 text-xs text-zinc-500">{description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <NumberInput
                    label="Storage"
                    value={storage}
                    suffix="GB"
                    onChange={(value) => onChange(storageKey, value)}
                />

                <NumberInput
                    label="Events"
                    value={events}
                    onChange={(value) => onChange(eventsKey, value)}
                />

                <NumberInput
                    label="Customers"
                    value={customers}
                    onChange={(value) => onChange(customersKey, value)}
                />

                <NumberInput
                    label="Images"
                    value={images}
                    onChange={(value) => onChange(imagesKey, value)}
                />
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SettingsState = {
    platformName: string;
    platformEmail: string;
    supportEmail: string;
    supportPhone: string;
    website: string;
    description: string;

    basicStorage: string;
    professionalStorage: string;
    enterpriseStorage: string;

    basicEvents: string;
    professionalEvents: string;
    enterpriseEvents: string;

    basicCustomers: string;
    professionalCustomers: string;
    enterpriseCustomers: string;

    basicImages: string;
    professionalImages: string;
    enterpriseImages: string;

    storageProvider: string;
    maxUploadSize: string;
    allowedFormats: string;
    warningThreshold: string;
    criticalThreshold: string;

    defaultGalleryMode: string;
    commentsEnabled: boolean;
    downloadsEnabled: boolean;
    autoSaveSelections: boolean;
    lightboxEnabled: boolean;

    sessionTimeout: string;
    accessCodeLength: string;
    loginProtection: boolean;
    twoFactorAuth: boolean;

    newStudioNotification: boolean;
    subscriptionExpiryNotification: boolean;
    storageWarningNotification: boolean;
    systemEmailNotifications: boolean;
};