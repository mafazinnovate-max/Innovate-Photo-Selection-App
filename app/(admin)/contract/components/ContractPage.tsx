
"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    ReceiptText,
    History,
    Settings,
    Plus,
    Search,
    ChevronLeft,
    Trash2,
    Download,
    ArrowLeft,
    Pencil,
} from "lucide-react";

import DocumentRichTextEditor from "@/components/admin/DocumentRichTextEditor";
import DocumentPreview from "./DocumentPreview";

type DocumentType = "contract" | "quotation";

type Session = {
    id: number;
    title: string;
    team: string;
};

type DocumentForm = {
    clientName: string;
    clientAddress: string;
    clientMobile: string;
    clientEmail: string;
    brideName: string;
    groomName: string;
    eventName: string;
    eventDate: string;
    venue: string;
    eventTime: string;
    packageName: string;
    totalAmount: string;
    advanceAmount: string;
};

const initialForm: DocumentForm = {
    clientName: "",
    clientAddress: "",
    clientMobile: "",
    clientEmail: "",
    brideName: "",
    groomName: "",
    eventName: "",
    eventDate: "",
    venue: "",
    eventTime: "",
    packageName: "",
    totalAmount: "",
    advanceAmount: "",
};

type DocumentHistoryItem = {
    id: string;
    documentType: DocumentType;
    clientName: string;
    eventName: string;
    eventDate: string | null;
    createdAt: string;
};

type SettingsSection = "faq" | "terms" | "policies" | null;

const inputClass =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600";

const labelClass = "mb-2 block text-sm font-medium text-zinc-300";

const createEmptySession = (): Session => ({
    id: Date.now() + Math.random(),
    title: "",
    team: "",
});

export default function ContractPage() {
    const [activeTab, setActiveTab] = useState<
        "create" | "history" | "settings"
    >("create");

    const [documentType, setDocumentType] =
        useState<DocumentType | null>(null);

    const [editingDocumentId, setEditingDocumentId] =
        useState<string | null>(null);

    const [editLoading, setEditLoading] = useState(false);

    const [form, setForm] = useState<DocumentForm>(initialForm);

    const [sessions, setSessions] = useState<Session[]>([
        {
            id: 1,
            title: "",
            team: "",
        },
    ]);

    const [activeSettingsEditor, setActiveSettingsEditor] =
        useState<SettingsSection>(null);

    const [documentSettings, setDocumentSettings] = useState({
        faq: "",
        terms: "",
        policies: "",
    });

    const [settingsLoading, setSettingsLoading] = useState(true);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsMessage, setSettingsMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [documentSaving, setDocumentSaving] = useState(false);
    const [documentMessage, setDocumentMessage] = useState("");

    const [historyMessage, setHistoryMessage] = useState("");

    const [documentFilter, setDocumentFilter] = useState<
        "all" | "contract" | "quotation"
    >("all");

    const [historyDocuments, setHistoryDocuments] = useState<
        DocumentHistoryItem[]
    >([]);

    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    const [viewDocumentId, setViewDocumentId] = useState<string | null>(null);

    // Load document settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch(
                    "/api/admin/document-settings"
                );

                if (!response.ok) {
                    throw new Error("Failed to load document settings");
                }

                const data = await response.json();

                setDocumentSettings({
                    faq: data.faq || "",
                    terms: data.terms || "",
                    policies: data.policies || "",
                });
            } catch (error) {
                console.error(error);
                setSettingsMessage("Unable to load document settings.");
            } finally {
                setSettingsLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Load document history
    useEffect(() => {
        if (activeTab !== "history") return;

        const loadDocuments = async () => {
            setHistoryLoading(true);
            setHistoryError("");

            try {
                const params = new URLSearchParams();

                if (searchTerm.trim()) {
                    params.set("search", searchTerm.trim());
                }

                params.set("type", documentFilter);

                const response = await fetch(
                    `/api/admin/documents?${params.toString()}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load documents."
                    );
                }

                setHistoryDocuments(data.documents || []);
            } catch (error) {
                console.error("Document history error:", error);

                setHistoryError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load document history."
                );
            } finally {
                setHistoryLoading(false);
            }
        };

        loadDocuments();
    }, [activeTab, searchTerm, documentFilter]);

    // Save document settings
    const saveDocumentSetting = async (
        section: "faq" | "terms" | "policies",
        content: string
    ) => {
        const updatedSettings = {
            ...documentSettings,
            [section]: content,
        };

        setSettingsSaving(true);
        setSettingsMessage("");

        try {
            const response = await fetch(
                "/api/admin/document-settings",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedSettings),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save settings"
                );
            }

            setDocumentSettings(updatedSettings);
            setActiveSettingsEditor(null);
            setSettingsMessage("Settings saved successfully.");
        } catch (error) {
            console.error(error);

            setSettingsMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to save settings."
            );
        } finally {
            setSettingsSaving(false);
        }
    };

    const updateField = (
        field: keyof DocumentForm,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updateSession = (
        id: number,
        field: "title" | "team",
        value: string
    ) => {
        setSessions((prev) =>
            prev.map((session) =>
                session.id === id
                    ? { ...session, [field]: value }
                    : session
            )
        );
    };

    const addSession = () => {
        setSessions((prev) => [
            ...prev,
            createEmptySession(),
        ]);
    };

    const removeSession = (id: number) => {
        if (sessions.length <= 1) return;

        setSessions((prev) =>
            prev.filter((session) => session.id !== id)
        );
    };

    // Start a new document
    const openDocumentForm = (type: DocumentType) => {
        setEditingDocumentId(null);
        setDocumentType(type);
        setForm(initialForm);
        setSessions([createEmptySession()]);
        setDocumentMessage("");
        setHistoryMessage("");
    };

    const backToDocumentSelection = () => {
        setDocumentType(null);
        setEditingDocumentId(null);
        setDocumentMessage("");
    };

    // Edit an existing document
    const handleEditDocument = async (id: string) => {
        setEditLoading(true);
        setHistoryError("");
        setHistoryMessage("");

        try {
            const response = await fetch(
                `/api/admin/documents/${id}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load document."
                );
            }

            const document = result.document;

            if (
                !document ||
                !["contract", "quotation"].includes(
                    document.documentType
                )
            ) {
                throw new Error("Invalid document information.");
            }

            const savedData =
                document.documentData as Record<string, unknown>;

            const stringValue = (value: unknown): string => {
                if (value === null || value === undefined) {
                    return "";
                }

                return String(value);
            };

            setForm({
                clientName: stringValue(savedData.clientName),
                clientAddress: stringValue(savedData.clientAddress),
                clientMobile: stringValue(savedData.clientMobile),
                clientEmail: stringValue(savedData.clientEmail),
                brideName: stringValue(savedData.brideName),
                groomName: stringValue(savedData.groomName),
                eventName: stringValue(savedData.eventName),
                eventDate: stringValue(savedData.eventDate).slice(0, 10),
                venue: stringValue(savedData.venue),
                eventTime: stringValue(savedData.eventTime),
                packageName: stringValue(savedData.packageName),
                totalAmount: stringValue(savedData.totalAmount),
                advanceAmount: stringValue(savedData.advanceAmount),
            });

            const savedSessions = Array.isArray(savedData.sessions)
                ? savedData.sessions
                : [];

            const restoredSessions: Session[] = savedSessions.map(
                (item, index) => {
                    const session = item as Record<string, unknown>;

                    return {
                        id: Date.now() + index,
                        title: stringValue(session.title),
                        team: stringValue(session.team),
                    };
                }
            );

            setSessions(
                restoredSessions.length > 0
                    ? restoredSessions
                    : [createEmptySession()]
            );

            setDocumentType(document.documentType);
            setEditingDocumentId(document.id);
            setDocumentMessage("");
            setActiveTab("create");
        } catch (error) {
            console.error("Document edit error:", error);

            setHistoryError(
                error instanceof Error
                    ? error.message
                    : "Unable to load document for editing."
            );
        } finally {
            setEditLoading(false);
        }
    };

    // Create or update document
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!documentType) return;

        setDocumentSaving(true);
        setDocumentMessage("");

        try {
            const documentData = {
                ...form,
                eventDate: form.eventDate || null,
                totalAmount: form.totalAmount,
                advanceAmount: form.advanceAmount,
                sessions: sessions.map(({ title, team }) => ({
                    title,
                    team,
                })),
            };

            const isEditing = Boolean(editingDocumentId);

            const url = isEditing
                ? `/api/admin/documents/${editingDocumentId}`
                : "/api/admin/documents";

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentType,
                    documentData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    (isEditing
                        ? "Failed to update document."
                        : "Failed to save document.")
                );
            }

            const successMessage = isEditing
                ? `${documentType === "contract" ? "Contract" : "Quotation"} updated successfully.`
                : `${documentType === "contract" ? "Contract" : "Quotation"} saved successfully.`;

            // Reset form and move to history
            setForm(initialForm);
            setSessions([createEmptySession()]);
            setDocumentType(null);
            setEditingDocumentId(null);
            setDocumentMessage("");
            setHistoryMessage(successMessage);

            setActiveTab("history");

        } catch (error) {
            console.error("Document save error:", error);

            setDocumentMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to save document."
            );
        } finally {
            setDocumentSaving(false);
        }
    };

    const tabs = [
        {
            id: "create" as const,
            label: "Create Document",
            icon: FileText,
        },
        {
            id: "history" as const,
            label: "Document History",
            icon: History,
        },
        {
            id: "settings" as const,
            label: "Document Settings",
            icon: Settings,
        },
    ];

    return (
        <div className="min-h-screen space-y-6 p-4 text-white sm:p-6">

            {/* PAGE HEADER */}
            <div>
                <h1 className="text-2xl font-semibold">
                    Contracts & Quotations
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                    Create and manage your studio documents.
                </p>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id);
                                setDocumentType(null);
                                setEditingDocumentId(null);
                                setDocumentMessage("");
                            }}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition ${isActive
                                    ? "bg-white text-black"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* CREATE DOCUMENT TAB */}
            {activeTab === "create" && !documentType && (
                <div className="space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Create New Document
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Select the type of document you want to create.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                        {/* CONTRACT CARD */}
                        <button
                            type="button"
                            onClick={() => openDocumentForm("contract")}
                            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-left transition hover:border-zinc-600 hover:bg-zinc-900"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-white">
                                    <FileText size={23} />
                                </div>
                                <ChevronLeft
                                    size={18}
                                    className="rotate-180 text-zinc-500 transition group-hover:translate-x-1"
                                />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold">
                                Contract
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Create a formal agreement between your
                                studio and the client.
                            </p>

                            <p className="mt-5 text-sm font-medium text-white">
                                Create Contract →
                            </p>
                        </button>

                        {/* QUOTATION CARD */}
                        <button
                            type="button"
                            onClick={() => openDocumentForm("quotation")}
                            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-left transition hover:border-zinc-600 hover:bg-zinc-900"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-white">
                                    <ReceiptText size={23} />
                                </div>
                                <ChevronLeft
                                    size={18}
                                    className="rotate-180 text-zinc-500 transition group-hover:translate-x-1"
                                />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold">
                                Quotation
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Prepare a professional quotation with
                                event and package details.
                            </p>

                            <p className="mt-5 text-sm font-medium text-white">
                                Create Quotation →
                            </p>
                        </button>
                    </div>
                </div>
            )}

            {/* DOCUMENT FORM */}
            {activeTab === "create" && documentType && (
                <div className="space-y-6">

                    {/* FORM HEADER */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <button
                                type="button"
                                onClick={backToDocumentSelection}
                                className="mb-3 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                            >
                                <ArrowLeft size={16} />
                                Back to Documents
                            </button>

                            <h2 className="text-xl font-semibold">
                                {editingDocumentId
                                    ? `Edit ${documentType === "contract" ? "Contract" : "Quotation"}`
                                    : `Create ${documentType === "contract" ? "Contract" : "Quotation"}`}
                            </h2>

                            <p className="mt-1 text-sm text-zinc-400">
                                Enter the details required for this document.
                            </p>
                        </div>

                        {/* DOCUMENT TYPE SWITCH */}
                        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
                            <button
                                type="button"
                                onClick={() => setDocumentType("contract")}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${documentType === "contract"
                                        ? "bg-white text-black"
                                        : "text-zinc-400 hover:text-white"
                                    }`}
                            >
                                <FileText size={14} />
                                Contract
                            </button>

                            <button
                                type="button"
                                onClick={() => setDocumentType("quotation")}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${documentType === "quotation"
                                        ? "bg-white text-black"
                                        : "text-zinc-400 hover:text-white"
                                    }`}
                            >
                                <ReceiptText size={14} />
                                Quotation
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* CLIENT DETAILS */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
                            <div className="mb-5">
                                <h3 className="font-semibold">
                                    Client Details
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Basic contact information of the client.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Client Name *
                                    </label>
                                    <input
                                        required
                                        value={form.clientName}
                                        onChange={(e) =>
                                            updateField("clientName", e.target.value)
                                        }
                                        placeholder="Enter client name"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Address
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.clientAddress}
                                        onChange={(e) =>
                                            updateField("clientAddress", e.target.value)
                                        }
                                        placeholder="Enter client address"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.clientMobile}
                                        onChange={(e) =>
                                            updateField("clientMobile", e.target.value)
                                        }
                                        placeholder="Enter mobile number"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={form.clientEmail}
                                        onChange={(e) =>
                                            updateField("clientEmail", e.target.value)
                                        }
                                        placeholder="Enter email address"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* EVENT DETAILS */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
                            <div className="mb-5">
                                <h3 className="font-semibold">
                                    Event Details
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Enter the wedding or event information.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Bride Name
                                    </label>
                                    <input
                                        value={form.brideName}
                                        onChange={(e) =>
                                            updateField("brideName", e.target.value)
                                        }
                                        placeholder="Enter bride name"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Groom Name
                                    </label>
                                    <input
                                        value={form.groomName}
                                        onChange={(e) =>
                                            updateField("groomName", e.target.value)
                                        }
                                        placeholder="Enter groom name"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Event Name *
                                    </label>
                                    <input
                                        required
                                        value={form.eventName}
                                        onChange={(e) =>
                                            updateField("eventName", e.target.value)
                                        }
                                        placeholder="e.g. Wedding"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Event Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.eventDate}
                                        onChange={(e) =>
                                            updateField("eventDate", e.target.value)
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Venue
                                    </label>
                                    <input
                                        value={form.venue}
                                        onChange={(e) =>
                                            updateField("venue", e.target.value)
                                        }
                                        placeholder="Enter event venue"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Event Time
                                    </label>
                                    <input
                                        value={form.eventTime}
                                        onChange={(e) =>
                                            updateField("eventTime", e.target.value)
                                        }
                                        placeholder="e.g. 6:00 PM - 11:00 PM"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* PACKAGE DETAILS */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
                            <div className="mb-5">
                                <h3 className="font-semibold">
                                    Package Details
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Add the selected package and payment details.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Package Name
                                    </label>
                                    <input
                                        value={form.packageName}
                                        onChange={(e) =>
                                            updateField("packageName", e.target.value)
                                        }
                                        placeholder="Enter package name"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Total Amount
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.totalAmount}
                                        onChange={(e) =>
                                            updateField("totalAmount", e.target.value)
                                        }
                                        placeholder="Enter total amount"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Advance Amount
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.advanceAmount}
                                        onChange={(e) =>
                                            updateField("advanceAmount", e.target.value)
                                        }
                                        placeholder="Enter advance amount"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* EVENT SESSIONS */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold">
                                        Event Sessions
                                    </h3>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Add each event session and its assigned team.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSession}
                                    className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-white transition hover:bg-zinc-800"
                                >
                                    <Plus size={16} />
                                    Add Session
                                </button>
                            </div>

                            <div className="space-y-4">
                                {sessions.map((session, index) => (
                                    <div
                                        key={session.id}
                                        className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-zinc-300">
                                                Session {index + 1}
                                            </h4>

                                            {sessions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSession(session.id)
                                                    }
                                                    className="flex items-center gap-1.5 text-xs text-red-400 transition hover:text-red-300"
                                                >
                                                    <Trash2 size={14} />
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={labelClass}>
                                                    Session Title
                                                </label>
                                                <input
                                                    value={session.title}
                                                    onChange={(e) =>
                                                        updateSession(
                                                            session.id,
                                                            "title",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. Reception"
                                                    className={inputClass}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>
                                                    Team Details
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={session.team}
                                                    onChange={(e) =>
                                                        updateSession(
                                                            session.id,
                                                            "team",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={"Photographer - 1\nCandid Photographer - 1\nVideographer - 1"}
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* FORM FOOTER */}
                        <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p
                                className={`text-sm ${documentMessage.toLowerCase().includes("successfully")
                                        ? "text-green-400"
                                        : "text-zinc-400"
                                    }`}
                            >
                                {documentMessage ||
                                    "Your document details will be saved securely."}
                            </p>

                            <button
                                type="submit"
                                disabled={documentSaving}
                                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {documentSaving
                                    ? editingDocumentId
                                        ? "Updating..."
                                        : "Saving..."
                                    : editingDocumentId
                                        ? "Update Document"
                                        : "Save Document"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* DOCUMENT HISTORY TAB */}
            {activeTab === "history" && (
                <div className="space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Document History
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            View previously created contracts and quotations.
                        </p>
                    </div>

                    {historyMessage && (
                        <div className="rounded-lg border border-green-900/50 bg-green-950/20 px-4 py-3 text-sm text-green-400">
                            {historyMessage}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                placeholder="Search by client or event name..."
                                className={`${inputClass} pl-10`}
                            />
                        </div>

                        <select
                            value={documentFilter}
                            onChange={(e) =>
                                setDocumentFilter(
                                    e.target.value as
                                    | "all"
                                    | "contract"
                                    | "quotation"
                                )
                            }
                            className={`${inputClass} sm:w-48`}
                        >
                            <option value="all">All Documents</option>
                            <option value="contract">Contracts</option>
                            <option value="quotation">Quotations</option>
                        </select>
                    </div>

                    {historyLoading ? (
                        <div className="flex min-h-64 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30">
                            <p className="text-sm text-zinc-400">
                                Loading documents...
                            </p>
                        </div>
                    ) : historyError ? (
                        <div className="flex min-h-64 items-center justify-center rounded-xl border border-red-900/50 bg-red-950/10 p-6 text-center">
                            <p className="text-sm text-red-400">
                                {historyError}
                            </p>
                        </div>
                    ) : historyDocuments.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900">
                                <History
                                    size={24}
                                    className="text-zinc-500"
                                />
                            </div>

                            <h3 className="mt-4 font-medium">
                                No Documents Found
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-zinc-500">
                                No contracts or quotations match your search.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {historyDocuments.map((document) => (
                                <div
                                    key={document.id}
                                    className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                            {document.documentType === "contract" ? (
                                                <FileText size={20} />
                                            ) : (
                                                <ReceiptText size={20} />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-medium text-white">
                                                    {document.clientName}
                                                </h3>

                                                <span className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-400">
                                                    {document.documentType}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-sm text-zinc-400">
                                                {document.eventName}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                                                <span>
                                                    Created:{" "}
                                                    {new Date(
                                                        document.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </span>

                                                {document.eventDate && (
                                                    <span>
                                                        Event:{" "}
                                                        {new Date(
                                                            document.eventDate
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* HISTORY ACTIONS */}
                                    <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setViewDocumentId(document.id)
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 sm:flex-none"
                                        >
                                            <Download size={15} />
                                            View / Download
                                        </button>

                                        <button
                                            type="button"
                                            disabled={editLoading}
                                            onClick={() =>
                                                handleEditDocument(document.id)
                                            }
                                            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Pencil size={15} />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* DOCUMENT SETTINGS TAB */}
            {activeTab === "settings" && (
                <div className="space-y-5">
                    {activeSettingsEditor ? (
                        <DocumentRichTextEditor
                            title={
                                activeSettingsEditor === "faq"
                                    ? "FAQ"
                                    : activeSettingsEditor === "terms"
                                        ? "Terms & Conditions"
                                        : "Policies"
                            }
                            description={
                                activeSettingsEditor === "faq"
                                    ? "Manage frequently asked questions and answers."
                                    : activeSettingsEditor === "terms"
                                        ? "Manage your studio terms and conditions."
                                        : "Manage your studio policies."
                            }
                            initialContent={
                                documentSettings[activeSettingsEditor]
                            }
                            onSave={(content) => {
                                if (!activeSettingsEditor) return;

                                saveDocumentSetting(
                                    activeSettingsEditor,
                                    content
                                );
                            }}
                            onCancel={() =>
                                setActiveSettingsEditor(null)
                            }
                        />
                    ) : (
                        <>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Document Settings
                                </h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Manage reusable content for your documents.
                                </p>
                            </div>

                            <div className="space-y-3">

                                {/* FAQ */}
                                <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                            <FileText size={19} />
                                        </div>

                                        <div>
                                            <h3 className="font-medium">
                                                FAQ
                                            </h3>
                                            <p className="mt-1 text-sm text-zinc-500">
                                                Frequently asked questions and answers.
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-600">
                                                {documentSettings.faq
                                                    ? "Content saved"
                                                    : "No content added"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={
                                            settingsLoading ||
                                            settingsSaving
                                        }
                                        onClick={() =>
                                            setActiveSettingsEditor("faq")
                                        }
                                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
                                    >
                                        Edit FAQ
                                    </button>
                                </div>

                                {/* TERMS */}
                                <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                            <FileText size={19} />
                                        </div>

                                        <div>
                                            <h3 className="font-medium">
                                                Terms & Conditions
                                            </h3>
                                            <p className="mt-1 text-sm text-zinc-500">
                                                Set your studio's terms and conditions.
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-600">
                                                {documentSettings.terms
                                                    ? "Content saved"
                                                    : "No content added"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={
                                            settingsLoading ||
                                            settingsSaving
                                        }
                                        onClick={() =>
                                            setActiveSettingsEditor("terms")
                                        }
                                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
                                    >
                                        Edit Terms
                                    </button>
                                </div>

                                {/* POLICIES */}
                                <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                            <Settings size={19} />
                                        </div>

                                        <div>
                                            <h3 className="font-medium">
                                                Policies
                                            </h3>
                                            <p className="mt-1 text-sm text-zinc-500">
                                                Manage your studio policies.
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-600">
                                                {documentSettings.policies
                                                    ? "Content saved"
                                                    : "No content added"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={
                                            settingsLoading ||
                                            settingsSaving
                                        }
                                        onClick={() =>
                                            setActiveSettingsEditor("policies")
                                        }
                                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
                                    >
                                        Edit Policies
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {settingsLoading && (
                        <p className="text-sm text-zinc-400">
                            Loading document settings...
                        </p>
                    )}

                    {settingsMessage && (
                        <p className="text-sm text-zinc-400">
                            {settingsMessage}
                        </p>
                    )}
                </div>
            )}

            {/* DOCUMENT PREVIEW */}
            {viewDocumentId && (
                <DocumentPreview
                    documentId={viewDocumentId}
                    onClose={() => setViewDocumentId(null)}
                />
            )}
        </div>
    );
}