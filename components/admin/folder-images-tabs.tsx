"use client";

import { deleteImage } from "@/actions/delete-image";
import { toggleImageStatus } from "@/actions/toggle-image-status";
import { Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

interface FolderImage {
    id: string;
    imageUrl: string;
    publicId: string | null;
    fileName: string | null;
    isSelected: boolean;
    comment: string | null;
    selectionOrder: number | null;
    status: boolean;
}

interface Props {
    images: FolderImage[];
}

type TabType =
    | "all"
    | "selected"
    | "commented"
    | "filenames";

export default function FolderImagesTabs({
    images,
}: Props) {
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [localImages, setLocalImages] = useState(images);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleStatusToggle = async (
        imageId: string,
        currentStatus: boolean,
    ) => {
        setLocalImages((prev) =>
            prev.map((img) =>
                img.id === imageId
                    ? {
                        ...img,
                        status: !currentStatus,
                    }
                    : img,
            ),
        );

        const result = await toggleImageStatus(
            imageId,
            currentStatus,
        );

        if (!result.success) {
            setLocalImages((prev) =>
                prev.map((img) =>
                    img.id === imageId
                        ? {
                            ...img,
                            status: currentStatus,
                        }
                        : img,
                ),
            );
        }
    };

    const filteredImages = useMemo(() => {
        switch (activeTab) {
            case "selected":
                return localImages.filter((img) => img.isSelected);

            case "commented":
                return localImages.filter(
                    (img) =>
                        img.comment &&
                        img.comment.trim().length > 0,
                );

            default:
                return localImages;
        }
    }, [activeTab, localImages]);

    const handleDelete = async () => {
        if (!selectedImageId) return;

        try {
            setIsDeleting(true);

            const response = await deleteImage(
                selectedImageId,
            );

            if (response.success) {
                setLocalImages((prev) =>
                    prev.filter(
                        (img) =>
                            img.id !== selectedImageId,
                    ),
                );
            } else {
                alert("Failed to delete image");
            }
        } catch (error) {
            console.log(error);

            alert("Something went wrong");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSelectedImageId(null);
        }
    };

    return (
        <div>
            {/* Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`rounded-xl px-4 py-2 text-sm ${activeTab === "all"
                        ? "bg-white text-black"
                        : "bg-zinc-900 text-white"
                        }`}
                >
                    All ({localImages.length})
                </button>

                <button
                    onClick={() => setActiveTab("selected")}
                    className={`rounded-xl px-4 py-2 text-sm ${activeTab === "selected"
                        ? "bg-white text-black"
                        : "bg-zinc-900 text-white"
                        }`}
                >
                    Selected (
                    {localImages.filter((i) => i.isSelected).length})
                </button>

                <button
                    onClick={() => setActiveTab("commented")}
                    className={`rounded-xl px-4 py-2 text-sm ${activeTab === "commented"
                        ? "bg-white text-black"
                        : "bg-zinc-900 text-white"
                        }`}
                >
                    Commented (
                    {
                        localImages.filter(
                            (i) =>
                                i.comment &&
                                i.comment.trim().length > 0,
                        ).length
                    }
                    )
                </button>

                <button
                    onClick={() => setActiveTab("filenames")}
                    className={`rounded-xl px-4 py-2 text-sm ${activeTab === "filenames"
                        ? "bg-white text-black"
                        : "bg-zinc-900 text-white"
                        }`}
                >
                    Selected File Names
                </button>
            </div>

            {/* File Names Tab */}
            {activeTab === "filenames" ? (
                <div className="space-y-3">
                    {localImages
                        .filter((img) => img.isSelected)
                        .sort(
                            (a, b) =>
                                (a.selectionOrder || 0) -
                                (b.selectionOrder || 0),
                        )
                        .map((img) => (
                            <div
                                key={img.id}
                                onClick={() =>
                                    handleStatusToggle(
                                        img.id,
                                        img.status,
                                    )
                                }
                                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 ${img.status
                                    ? "border-green-500 bg-green-500/15"
                                    : "border-zinc-800 bg-zinc-900"
                                    }`}
                            >
                                <div>
                                    <p className="font-medium">
                                        {img.selectionOrder}.{" "}
                                        {img.fileName || "Untitled"}
                                    </p>

                                    {img.comment && (
                                        <p className="mt-2 text-sm text-zinc-400">
                                            {img.comment}
                                        </p>
                                    )}
                                </div>

                                <div
                                    className={`rounded-lg px-3 py-1 text-xs font-medium ${img.status
                                        ? "bg-green-500 text-black"
                                        : "bg-zinc-700 text-white"
                                        }`}
                                >
                                    {img.status
                                        ? "Completed"
                                        : "Pending"}
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                    {filteredImages.map((image) => (
                        <div
                            key={image.id}
                            className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <img
                                    src={image.imageUrl}
                                    alt="Wedding"
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                {(image.isSelected && activeTab === "selected") && (
                                    <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition bg-white text-black z-20">
                                        {image.selectionOrder}
                                    </div>
                                )}
                                {activeTab === "all" && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            setSelectedImageId(image.id);
                                            setShowDeleteModal(true);
                                        }}
                                        className="absolute top-3 right-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg p-2 text-red-500 transition hover:text-red-400 cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 p-3">
                                <p className="truncate text-sm text-zinc-300">
                                    {image.fileName || "Untitled"}
                                </p>

                                {image.isSelected && (
                                    <div className="inline-block rounded-lg bg-green-500/20 px-2 py-1 text-xs text-green-400">
                                        Selected
                                    </div>
                                )}

                                {image.comment && (
                                    <p className="text-xs text-zinc-400">
                                        <span className="font-bold">Comment:</span> {image.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
                    onClick={() =>
                        !isDeleting &&
                        setShowDeleteModal(false)
                    }
                >
                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
                    >
                        <h2 className="text-2xl font-bold text-white">
                            Delete Image?
                        </h2>

                        <p className="mt-3 text-sm text-zinc-400">
                            This image will be permanently
                            removed from:
                        </p>

                        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                            <li>• Database</li>
                            <li>• Cloudinary</li>
                            <li>• Client selections</li>
                        </ul>

                        <p className="mt-4 text-sm font-medium text-red-400">
                            This action cannot be undone.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() =>
                                    setShowDeleteModal(false)
                                }
                                disabled={isDeleting}
                                className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500"
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
                                        Delete Image
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}