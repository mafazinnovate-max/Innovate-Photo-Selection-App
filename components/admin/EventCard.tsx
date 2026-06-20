"use client";

import Link from "next/link";
import { ArrowRight, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/actions/delete-event";

export default function EventCard({ event }: any) {
    const [openMenu, setOpenMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenu(false);
        };

        window.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            const response = await deleteEvent(event.id);

            if (response.success) {
                setOpenMenu(false);
                router.refresh();
            } else {
                alert("Failed to delete event");
            }
        } catch (error) {
            console.log(error);

            alert("Something went wrong");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };
    return (
        <div
            className={`group relative min-h-[240px] overflow-hidden rounded-2xl border border-zinc-800 transition-all duration-300 ${!showDeleteModal
                ? "hover:-translate-y-1 hover:border-zinc-600 hover:shadow-2xl"
                : ""
                }`}
        >
            <Link
                href={`/events/${event.id}`}
                onClick={() => setIsNavigating(true)}
            >
                {event.coverImageUrl ? (
                    <img
                        src={event.coverImageUrl}
                        alt={event.name}
                        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${!showDeleteModal ? "group-hover:scale-105" : ""
                            }`}
                        style={{
                            objectPosition: `center ${50 + event.coverPosition}%`,
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-zinc-900" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 transition-opacity duration-500 group-hover:opacity-80" />

                <div className="relative flex h-full min-h-[220px] flex-col justify-between p-5">
                    <div className="flex items-start justify-between">
                        <span className="rounded-full bg-black/40 px-3 py-1 text-xs backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20">
                            {event.eventType}
                        </span>

                        <ArrowRight
                            size={18}
                            className={`translate-x-0 opacity-0 transition-all duration-300 ${!showDeleteModal
                                ? "group-hover:translate-x-2 group-hover:opacity-100"
                                : ""
                                }`} />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">{event.name}</h2>

                        <p className="mt-2 text-sm text-zinc-300">
                            Client: {event.clientName}
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">
                            Date: {event.eventDate
                                ? new Date(event.eventDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })
                                : "No Date"}
                        </p>
                    </div>
                </div>
            </Link>

            {/* 3 Dots */}
            <div className="absolute bottom-4 right-4 z-20">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        setShowDeleteModal(false);
                        setOpenMenu((prev) => !prev);
                    }}
                    className="rounded-full bg-black/50 p-2 backdrop-blur"
                >
                    <MoreVertical size={18} />
                </button>

                {openMenu && (
                    <div className="absolute bottom-12 right-0 flex gap-2 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                router.push(`/events/${event.id}/edit`);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 transition hover:bg-zinc-700"
                        >
                            <Pencil size={16} />
                        </button>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                setOpenMenu(false);
                                setShowDeleteModal(true);
                            }}
                            disabled={isDeleting}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-zinc-800"
                        >
                            {isDeleting ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Trash2 size={18} />
                            )}
                        </button>
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
                    onClick={() => !isDeleting && setShowDeleteModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
                    >
                        <h2 className="text-2xl font-bold text-white">
                            Delete Event?
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                            You are about to permanently delete
                            <span className="font-semibold text-white">
                                {" "}
                                {event.name}
                            </span>
                            .
                            <br />
                            This will also remove:
                        </p>

                        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                            <li>• Event details</li>
                            <li>• All folders</li>
                            <li>• All uploaded images</li>
                            <li>• All client selections</li>
                            <li>• Cloudinary files</li>
                        </ul>

                        <p className="mt-4 text-sm font-medium text-red-400">
                            This action cannot be undone.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Event
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isNavigating && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
            )}
        </div>
    );
}