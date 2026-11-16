"use client";

import { createEvent } from "@/actions/create-event";
import { checkEventLimit } from "@/actions/check-event-limit";
import { updateEvent } from "@/actions/update-event";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface EventFormProps {
    mode: "create" | "edit";
    initialData?: {
        id: string;
        name: string;
        clientName: string;
        eventType: string;
        description: string;
        eventDate: string;
        galleryMode: string;
        phoneNumber: string;
        email: string;
        coverImageUrl: string;
        coverPosition: number;
    };
}

const MAX_COVER_SIZE = 40 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

export default function EventForm({
    mode,
    initialData,
}: EventFormProps) {
    const router = useRouter();

    const [eventLimitReached, setEventLimitReached] = useState(false);
    const [checkingEventLimit, setCheckingEventLimit] = useState(
        mode === "create",
    );

    const clientNameRef = useRef<HTMLInputElement>(null);
    const eventNameRef = useRef<HTMLInputElement>(null);
    const eventTypeRef = useRef<HTMLSelectElement>(null);
    const customEventTypeRef = useRef<HTMLInputElement>(null);
    const eventDateRef = useRef<HTMLInputElement>(null);
    const coverImageRef = useRef<HTMLInputElement>(null);

    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (mode !== "create") {
            return;
        }

        const checkLimit = async () => {
            const response = await checkEventLimit();

            if (!response.success) {
                alert(response.message ?? "Unable to check event limit.");
                setEventLimitReached(true);
                setCheckingEventLimit(false);
                return;
            }

            if (!response.allowed) {
                setEventLimitReached(true);
            }

            setCheckingEventLimit(false);
        };

        checkLimit();
    }, [mode]);

    const [clientName, setClientName] = useState(
        initialData?.clientName ?? "",
    );

    const [eventName, setEventName] = useState(
        initialData?.name ?? "",
    );

    const [description, setDescription] = useState(
        initialData?.description ?? "",
    );

    const [eventDate, setEventDate] = useState(
        initialData?.eventDate ?? "",
    );

    const [coverImage, setCoverImage] = useState<File | null>(null);

    const [coverPreview, setCoverPreview] = useState(
        initialData?.coverImageUrl ?? "",
    );

    const [coverPosition, setCoverPosition] = useState(
        initialData?.coverPosition ?? 0,
    );

    const [galleryMode, setGalleryMode] = useState(
        initialData?.galleryMode ?? "single"
    );

    const [phoneNumber, setPhoneNumber] = useState(
        initialData?.phoneNumber ?? ""
    );

    const [email, setEmail] = useState(
        initialData?.email ?? ""
    );

    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultEventTypes = [
        "Wedding",
        "Reception",
        "Birthday",
        "Engagement",
        "Puberty",
    ];

    const isDefaultType =
        initialData?.eventType
            ? defaultEventTypes.includes(initialData.eventType)
            : true;

    const [eventType, setEventType] = useState(
        isDefaultType ? initialData?.eventType ?? "Wedding" : "Other"
    );

    const [customEventType, setCustomEventType] = useState(
        isDefaultType ? "" : initialData?.eventType ?? ""
    );

    // Revoke temporary preview URLs when the component unmounts.
    const previewUrlRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    const finalEventType =
        eventType === "Other" ? customEventType : eventType;

    const scrollToMissingField = (
        ref: React.RefObject<
            HTMLInputElement | HTMLSelectElement | null
        >,
    ) => {
        const element = ref.current;

        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        window.setTimeout(() => {
            element.focus();
        }, 400);
    };

    // Direct upload to R2, then finalize and compress on the server.
    const uploadCoverImage = async (file: File): Promise<string> => {
        // 1. Request a temporary R2 upload URL
        const presignResponse = await fetch(
            "/api/event-cover/presign",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                }),
            }
        );

        const presignResult = await presignResponse.json();

        if (!presignResponse.ok || !presignResult.success) {
            throw new Error(
                presignResult.message || "Unable to prepare cover upload"
            );
        }

        // 2. Upload original file directly to R2
        const uploadResponse = await fetch(
            presignResult.uploadUrl,
            {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            }
        );

        if (!uploadResponse.ok) {
            throw new Error("Cover image upload to storage failed");
        }

        // 3. Finalize upload and create optimized WebP
        const finalizeResponse = await fetch(
            "/api/event-cover/finalize",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storageKey: presignResult.storageKey,
                    fileSize: file.size,
                    contentType: file.type,
                }),
            }
        );

        const finalizeResult = await finalizeResponse.json();

        if (!finalizeResponse.ok || !finalizeResult.success) {
            throw new Error(
                finalizeResult.message || "Cover image processing failed"
            );
        }

        if (!finalizeResult.coverImageKey) {
            throw new Error("Processed cover image key is missing");
        }

        return finalizeResult.coverImageKey;
    };

    const handleSubmit = async () => {
        setValidationError(null);

        if (!clientName.trim()) {
            setValidationError("Please enter the client name.");
            scrollToMissingField(clientNameRef);
            return;
        }

        if (!eventName.trim()) {
            setValidationError("Please enter the event name.");
            scrollToMissingField(eventNameRef);
            return;
        }

        if (!eventType) {
            setValidationError("Please select an event category.");
            scrollToMissingField(eventTypeRef);
            return;
        }

        if (
            eventType === "Other" &&
            !customEventType.trim()
        ) {
            setValidationError("Please enter the custom event type.");
            scrollToMissingField(customEventTypeRef);
            return;
        }

        if (!eventDate) {
            setValidationError("Please select the event date.");
            scrollToMissingField(eventDateRef);
            return;
        }

        if (mode === "create" && !coverImage) {
            setValidationError("Please select a cover image.");
            scrollToMissingField(coverImageRef);
            return;
        }

        try {
            setIsSubmitting(true);

            let coverImageKey: string | undefined;

            // Upload only when a new cover image is selected.
            if (coverImage) {
                coverImageKey = await uploadCoverImage(coverImage);
            }

            if (mode === "create") {
                const response = await createEvent({
                    name: eventName,
                    clientName,
                    eventType: finalEventType,
                    description,
                    eventDate,
                    phoneNumber,
                    email,
                    galleryMode,
                    coverImageKey,
                    coverPosition,
                });

                if (response.success && response.event) {
                    router.replace(
                        `/events/${response.event.id}`,
                    );
                    return;
                }

                alert(response.message || "Unable to create event.");
                setIsSubmitting(false);
            } else {
                const response = await updateEvent({
                    id: initialData!.id,
                    name: eventName,
                    clientName,
                    eventType: finalEventType,
                    description,
                    eventDate,
                    phoneNumber,
                    email,
                    galleryMode,
                    coverImageUrl: initialData?.coverImageUrl,
                    coverImageKey,
                    coverPosition,
                });

                if (response.success) {
                    router.replace(
                        `/events/${initialData!.id}`,
                    );
                    return;
                }

                alert(response.message || "Unable to update event.");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Event form submission error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );

            setIsSubmitting(false);
        }
    };

    const handleFormKeyDown = (
        e: React.KeyboardEvent<HTMLDivElement>,
    ) => {
        if (e.key !== "Enter") {
            return;
        }

        if (
            e.target instanceof HTMLTextAreaElement ||
            e.target instanceof HTMLButtonElement
        ) {
            return;
        }

        e.preventDefault();

        if (!isSubmitting) {
            handleSubmit();
        }
    };

    if (checkingEventLimit) {
        return (
            <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
                <div className="text-center">
                    <Loader2
                        size={28}
                        className="mx-auto animate-spin text-zinc-400"
                    />
                    <p className="mt-3 text-zinc-400">
                        Checking event limit...
                    </p>
                </div>
            </div>
        );
    }

    if (eventLimitReached) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-400">
                        Event Limit Reached
                    </h1>

                    <p className="mt-3 text-zinc-400">
                        You have reached your maximum number of events.
                        Please contact the administrator to increase your limit.
                    </p>

                    <button
                        onClick={() => router.push("/events")}
                        className="mt-6 rounded-xl bg-white px-6 py-3 font-medium text-black hover:opacity-90"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="mx-auto max-w-3xl"
            onKeyDown={handleFormKeyDown}
        >
            <h1 className="text-3xl font-bold">
                {mode === "create"
                    ? "Create Event"
                    : "Edit Event"}
            </h1>

            <p className="mt-2 text-zinc-400">
                {mode === "create"
                    ? "Create a new client event gallery."
                    : "Update client event gallery details."}
            </p>

            <div className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Client Name
                    </label>

                    <input
                        ref={clientNameRef}
                        type="text"
                        placeholder="Enter client name"
                        value={clientName}
                        onChange={(e) => {
                            setClientName(e.target.value);

                            if (e.target.value.trim()) {
                                setValidationError(null);
                            }
                        }}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    />

                    {validationError === "Please enter the client name." && (
                        <p className="mt-2 text-xs font-medium text-red-400">
                            {validationError}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Event Name
                    </label>

                    <input
                        ref={eventNameRef}
                        type="text"
                        placeholder="Wedding of Arjun & Meera"
                        value={eventName}
                        onChange={(e) => {
                            setEventName(e.target.value);

                            if (e.target.value.trim()) {
                                setValidationError(null);
                            }
                        }}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    />

                    {validationError === "Please enter the event name." && (
                        <p className="mt-2 text-xs font-medium text-red-400">
                            {validationError}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Event Category
                    </label>

                    <select
                        ref={eventTypeRef}
                        value={eventType}
                        onChange={(e) => {
                            setEventType(e.target.value);

                            if (e.target.value) {
                                setValidationError(null);
                            }
                        }}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    >
                        <option value="Wedding">Wedding</option>
                        <option value="Reception">Reception</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Puberty">Puberty</option>
                        <option value="Other">Other</option>
                    </select>

                    {validationError === "Please select an event category." && (
                        <p className="mt-2 text-xs font-medium text-red-400">
                            {validationError}
                        </p>
                    )}

                    {eventType === "Other" && (
                        <input
                            ref={customEventTypeRef}
                            type="text"
                            placeholder="Enter custom event type"
                            value={customEventType}
                            onChange={(e) => {
                                setCustomEventType(e.target.value);

                                if (e.target.value.trim()) {
                                    setValidationError(null);
                                }
                            }}
                            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                        />
                    )}

                    {validationError === "Please enter the custom event type." && (
                        <p className="mt-2 text-xs font-medium text-red-400">
                            {validationError}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Event Date
                    </label>

                    <input
                        ref={eventDateRef}
                        type="date"
                        value={eventDate}
                        onChange={(e) => {
                            setEventDate(e.target.value);

                            if (e.target.value) {
                                setValidationError(null);
                            }
                        }}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-white"
                        style={{
                            colorScheme: "dark",
                        }}
                    />

                    {validationError === "Please select the event date." && (
                        <p className="mt-2 text-xs font-medium text-red-400">
                            {validationError}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Gallery Mode
                    </label>

                    <select
                        value={galleryMode}
                        onChange={(e) => setGalleryMode(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    >
                        <option value="single">Single Folder</option>
                        <option value="bride_groom">Bride & Groom Separate</option>
                    </select>

                    <p className="mt-2 text-xs text-zinc-500">
                        Choose how images should be organized
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Phone Number (Optional)
                    </label>

                    <input
                        type="tel"
                        value={phoneNumber}
                        placeholder="9876543210"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Email (Optional)
                    </label>

                    <input
                        type="email"
                        value={email}
                        placeholder="innovate@gmail.com"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Cover Image
                    </label>

                    <input
                        ref={coverImageRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(e) => {
                            const file = e.target.files?.[0];

                            if (!file) return;

                            if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
                                setValidationError(
                                    "Please select a valid JPG, PNG, WebP or AVIF image."
                                );
                                e.target.value = "";
                                return;
                            }

                            if (file.size > MAX_COVER_SIZE) {
                                setValidationError(
                                    "Cover image must be 40MB or smaller."
                                );
                                e.target.value = "";
                                return;
                            }

                            setValidationError(null);
                            setCoverImage(file);

                            if (previewUrlRef.current) {
                                URL.revokeObjectURL(previewUrlRef.current);
                            }

                            const previewUrl = URL.createObjectURL(file);
                            previewUrlRef.current = previewUrl;
                            setCoverPreview(previewUrl);
                        }}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    />

                    <p className="mt-2 text-xs text-zinc-500">
                        JPG, PNG, WebP or AVIF. Maximum file size: 40MB.
                    </p>

                    {validationError === "Please select a cover image." && (
                        <p className="mt-2 text-xs font-medium text-red-400">
                            {validationError}
                        </p>
                    )}

                    {validationError?.includes("Cover image") ||
                        validationError?.includes("valid JPG") ? (
                        <p className="mt-2 text-xs font-medium text-red-400">
                            {validationError}
                        </p>
                    ) : null}

                    {coverPreview && (
                        <div className="mt-4">
                            <div
                                className="relative h-[220px] w-full cursor-move overflow-hidden rounded-xl border border-zinc-700"
                                onMouseDown={(e) => {
                                    setIsDragging(true);
                                    setStartY(e.clientY);
                                }}
                                onMouseUp={() => setIsDragging(false)}
                                onMouseLeave={() => setIsDragging(false)}
                                onMouseMove={(e) => {
                                    if (!isDragging) return;

                                    const diff = e.clientY - startY;

                                    setCoverPosition((prev) => {
                                        const next = prev - diff * 0.3;

                                        return Math.max(-50, Math.min(50, next));
                                    });

                                    setStartY(e.clientY);
                                }}
                            >
                                <img
                                    src={coverPreview}
                                    alt="Cover Preview"
                                    draggable={false}
                                    className="absolute h-full w-full select-none object-cover"
                                    style={{
                                        objectPosition: `center ${50 + coverPosition}%`,
                                    }}
                                />
                            </div>

                            <p className="mt-2 text-xs text-zinc-500">
                                Drag image to adjust cover position
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Description
                    </label>

                    <textarea
                        rows={4}
                        placeholder="Optional event notes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`rounded-xl px-6 py-3 font-medium transition ${isSubmitting
                        ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
                        : "bg-white text-black hover:opacity-90"
                        }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                            {mode === "create"
                                ? "Creating Event..."
                                : "Updating Event..."}
                        </span>
                    ) : (
                        mode === "create"
                            ? "Create Event"
                            : "Update Event"
                    )}
                </button>
            </div>
        </div>
    );
}