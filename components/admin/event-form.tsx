"use client";

import { createEvent } from "@/actions/create-event";
import { updateEvent } from "@/actions/update-event";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function EventForm({
    mode,
    initialData,
}: EventFormProps) {
    const router = useRouter();

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

    const convertToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onload = () => resolve(reader.result as string);

            reader.onerror = reject;
        });

    const finalEventType =
        eventType === "Other" ? customEventType : eventType;

    const handleSubmit = async () => {
        if (!clientName || !eventName || !eventType || !eventDate) {
            alert("Please fill all required fields");
            return;
        }

        try {
            setIsSubmitting(true);

            let coverImageUrl =
                initialData?.coverImageUrl ?? "";
            let coverImagePublicId = "";

            if (coverImage) {
                const base64Image = await convertToBase64(
                    coverImage,
                );
                const uploadResponse = await fetch(
                    "/api/upload",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            image: base64Image,
                            fileName: coverImage.name,
                        }),
                    },
                );

                const uploadResult =
                    await uploadResponse.json();

                if (!uploadResult.success) {
                    throw new Error(
                        "Cover image upload failed",
                    );
                }

                coverImageUrl = uploadResult.url;
                coverImagePublicId = uploadResult.publicId;
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
                    coverImageUrl,
                    coverImagePublicId,
                    coverPosition,
                });

                if (response.success && response.event) {
                    router.push(
                        `/events/${response.event.id}`,
                    );
                }
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
                    coverImageUrl,
                    coverPosition,
                });

                if (response.success) {
                    router.push(
                        `/events/${initialData!.id}`,
                    );
                }
            }
        } catch (error) {
            console.log(error);

            alert("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl">
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
                        type="text"
                        placeholder="Enter client name"
                        value={clientName}
                        onChange={(e) =>
                            setClientName(e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Event Name
                    </label>

                    <input
                        type="text"
                        placeholder="Wedding of Arjun & Meera"
                        value={eventName}
                        onChange={(e) =>
                            setEventName(e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Event Category
                    </label>

                    <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                    >
                        <option value="Wedding">Wedding</option>
                        <option value="Reception">Reception</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Puberty">Puberty</option>
                        <option value="Other">Other</option>
                    </select>

                    {eventType === "Other" && (
                        <input
                            type="text"
                            placeholder="Enter custom event type"
                            value={customEventType}
                            onChange={(e) => setCustomEventType(e.target.value)}
                            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                        />
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Event Date
                    </label>

                    <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-white"
                        style={{
                            colorScheme: "dark",
                        }}
                    />
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
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file =
                                e.target.files?.[0];

                            if (file) {
                                setCoverImage(file);
                                setCoverPreview(
                                    URL.createObjectURL(file),
                                );
                            }
                        }}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-black"
                    />

                    {coverPreview && (
                        <div className="mt-4">
                            <div
                                className="relative h-[220px] w-full cursor-move overflow-hidden rounded-xl border border-zinc-700"
                                onMouseDown={(e) => {
                                    setIsDragging(true);
                                    setStartY(e.clientY);
                                }}
                                onMouseUp={() =>
                                    setIsDragging(false)
                                }
                                onMouseLeave={() =>
                                    setIsDragging(false)
                                }
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
                                        objectPosition: `center ${50 + coverPosition
                                            }%`,
                                    }}
                                />
                            </div>

                            <p className="mt-2 text-xs text-zinc-500">
                                Drag image to adjust cover
                                position
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
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
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
                    {isSubmitting
                        ? mode === "create"
                            ? "Creating Event..."
                            : "Updating Event..."
                        : mode === "create"
                            ? "Create Event"
                            : "Update Event"}
                </button>
            </div>
        </div>
    );
}