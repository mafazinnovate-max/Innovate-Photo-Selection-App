
"use client";

import { deleteImage } from "@/actions/delete-image";
import { deleteImages } from "@/actions/delete-images";
import { toggleImageStatus } from "@/actions/toggle-image-status";
import {
  Loader2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  initialImageId?: string;
  otherFolderImages: {
    id: string;
    fileName: string | null;
    folderName: string;
  }[];
}

type TabType = "all" | "selected" | "commented" | "filenames";

export default function FolderImagesTabs({
  images,
  initialImageId,
  otherFolderImages,
}: Props) {

  const imageGridRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!initialImageId) return;

  const frame = requestAnimationFrame(() => {
    const grid = imageGridRef.current;
    if (!grid) return;

    const target = Array.from(
      grid.querySelectorAll<HTMLElement>("[data-image-id]")
    ).find((element) => element.dataset.imageId === initialImageId);

    target?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });

  return () => cancelAnimationFrame(frame);
}, [initialImageId, images]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [localImages, setLocalImages] = useState(images);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [filenameSearch, setFilenameSearch] = useState("");

  // Lightbox state
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const filteredImages = useMemo(() => {
  let result = localImages;

  switch (activeTab) {
    case "selected":
      result = result.filter((img) => img.isSelected);
      break;

    case "commented":
      result = result.filter(
        (img) => img.comment && img.comment.trim().length > 0
      );
      break;
  }

  const search = filenameSearch.trim().toLowerCase();

  if (search) {
    result = result.filter((img) =>
      img.fileName?.toLowerCase().includes(search)
    );
  }

  return result;
}, [activeTab, localImages, filenameSearch]);

  const lightboxIndex = filteredImages.findIndex(
    (img) => img.id === lightboxImageId
  );

  const lightboxImage =
    lightboxIndex >= 0 ? filteredImages[lightboxIndex] : null;

  const closeLightbox = () => {
    setLightboxImageId(null);
  };

  const showPreviousImage = () => {
    if (filteredImages.length <= 1 || lightboxIndex < 0) return;

    const previousIndex =
      (lightboxIndex - 1 + filteredImages.length) %
      filteredImages.length;

    setLightboxImageId(filteredImages[previousIndex].id);
  };

  const showNextImage = () => {
    if (filteredImages.length <= 1 || lightboxIndex < 0) return;

    const nextIndex = (lightboxIndex + 1) % filteredImages.length;

    setLightboxImageId(filteredImages[nextIndex].id);
  };

  // Keyboard controls and background scroll lock
  useEffect(() => {
    if (!lightboxImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImage, lightboxIndex, filteredImages]);

  const handleSelectAll = () => {
    if (
      filteredImages.length > 0 &&
      filteredImages.every((img) => selectedImages.includes(img.id))
    ) {
      setSelectedImages((prev) =>
        prev.filter((id) => !filteredImages.some((img) => img.id === id))
      );
    } else {
      setSelectedImages((prev) => [
        ...new Set([...prev, ...filteredImages.map((img) => img.id)]),
      ]);
    }
  };

  const handleStatusToggle = async (
    imageId: string,
    currentStatus: boolean
  ) => {
    setLocalImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, status: !currentStatus }
          : img
      )
    );

    try {
      const result = await toggleImageStatus(imageId, currentStatus);

      if (!result.success) {
        setLocalImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, status: currentStatus }
              : img
          )
        );
      }
    } catch (error) {
      console.error(error);

      setLocalImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: currentStatus }
            : img
        )
      );
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (isBulkDelete) {
        const response = await deleteImages(selectedImages);

        if (response.success) {
          setLocalImages((prev) =>
            prev.filter((img) => !selectedImages.includes(img.id))
          );

          setSelectedImages([]);
          closeLightbox();
        } else {
          alert("Failed to delete images.");
        }
      } else {
        if (!selectedImageId) return;

        const response = await deleteImage(selectedImageId);

        if (response.success) {
          setLocalImages((prev) =>
            prev.filter((img) => img.id !== selectedImageId)
          );

          setSelectedImages((prev) =>
            prev.filter((id) => id !== selectedImageId)
          );

          if (lightboxImageId === selectedImageId) {
            closeLightbox();
          }
        } else {
          alert("Failed to delete image.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedImageId(null);
      setIsBulkDelete(false);
    }
  };

  const allFilteredSelected =
    filteredImages.length > 0 &&
    filteredImages.every((img) => selectedImages.includes(img.id));

  return (
    <div>

{/* CATEGORY PHOTO SEARCH */}
<div className="mb-6">
  <input
    type="search"
    value={filenameSearch}
    onChange={(e) => setFilenameSearch(e.target.value)}
    placeholder="Search photos in this category..."
    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-300 sm:max-w-xl"
  />

  {filenameSearch.trim() !== "" && filteredImages.length === 0 && (
    <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
      {otherFolderImages.some((image) =>
        image.fileName
          ?.toLowerCase()
          .includes(filenameSearch.trim().toLowerCase())
      ) ? (
        <>
          <p className="text-sm font-medium text-zinc-200">
            This image belongs to another category.
          </p>

          <div className="mt-2 space-y-2">
            {Array.from(
              new Map(
                otherFolderImages
                  .filter((image) =>
                    image.fileName
                      ?.toLowerCase()
                      .includes(filenameSearch.trim().toLowerCase())
                  )
                  .map((image) => [image.folderName, image])
              ).keys()
            ).map((folderName) => (
              <p
                key={folderName}
                className="text-sm text-zinc-400"
              >
                Category: <span className="font-medium text-white">{folderName}</span>
              </p>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-zinc-400">
          No matching photos found in this category or other categories.
        </p>
      )}
    </div>
  )}
</div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-4 py-2 text-sm ${
            activeTab === "all"
              ? "bg-white text-black"
              : "bg-zinc-900 text-white"
          }`}
        >
          All ({localImages.length})
        </button>

        <button
          onClick={() => setActiveTab("selected")}
          className={`rounded-xl px-4 py-2 text-sm ${
            activeTab === "selected"
              ? "bg-white text-black"
              : "bg-zinc-900 text-white"
          }`}
        >
          Selected ({localImages.filter((i) => i.isSelected).length})
        </button>

        <button
          onClick={() => setActiveTab("commented")}
          className={`rounded-xl px-4 py-2 text-sm ${
            activeTab === "commented"
              ? "bg-white text-black"
              : "bg-zinc-900 text-white"
          }`}
        >
          Commented (
          {
            localImages.filter(
              (i) => i.comment && i.comment.trim().length > 0
            ).length
          }
          )
        </button>

        <button
          onClick={() => setActiveTab("filenames")}
          className={`rounded-xl px-4 py-2 text-sm ${
            activeTab === "filenames"
              ? "bg-white text-black"
              : "bg-zinc-900 text-white"
          }`}
        >
          Selected File Names
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {activeTab !== "filenames" && (
          <button
            onClick={handleSelectAll}
            disabled={filteredImages.length === 0}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm disabled:opacity-40"
          >
            {allFilteredSelected ? "Unselect All" : "Select All"}
          </button>
        )}

        {selectedImages.length > 0 && (
          <button
            onClick={() => {
              setIsBulkDelete(true);
              setShowDeleteModal(true);
            }}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Delete Selected ({selectedImages.length})
          </button>
        )}
      </div>

      {/* File Names Tab */}
      {activeTab === "filenames" ? (
        <div className="space-y-3">
          {localImages
  .filter(
    (img) =>
      img.isSelected &&
      img.fileName
        ?.toLowerCase()
        .includes(filenameSearch.trim().toLowerCase())
  )
            .sort(
              (a, b) =>
                (a.selectionOrder || 0) - (b.selectionOrder || 0)
            )
            .map((img) => (
              <div
                key={img.id}
                onClick={() =>
                  handleStatusToggle(img.id, img.status)
                }
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-all duration-200 ${
                  img.status
                    ? "border-green-500 bg-green-500/15"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="min-w-0">
                  <p className="break-words font-medium">
                    {img.selectionOrder}. {img.fileName || "Untitled"}
                  </p>

                  {img.comment && (
                    <p className="mt-2 break-words text-sm text-zinc-400">
                      {img.comment}
                    </p>
                  )}
                </div>

                <div
                  className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium ${
                    img.status
                      ? "bg-green-500 text-black"
                      : "bg-zinc-700 text-white"
                  }`}
                >
                  {img.status ? "Completed" : "Pending"}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <>
          {/* Photo Grid */}
         <div
  ref={imageGridRef}
  className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
>
            {filteredImages.map((image) => (
  <div
    key={image.id}
    data-image-id={image.id}
    className={`group min-w-0 overflow-hidden rounded-2xl border bg-zinc-900 transition-all duration-500 ${
      image.id === initialImageId
        ? "border-zinc-300 ring-4 ring-zinc-300/100"
        : "border-zinc-800"
    }`}
  >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {/* Open photo in Lightbox */}
                  <button
                    type="button"
                    onClick={() => setLightboxImageId(image.id)}
                    aria-label={`View ${image.fileName || "photo"} full size`}
                    className="absolute inset-0 z-10 h-full w-full cursor-zoom-in"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.fileName || "Wedding photo"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </button>

                  {/* Selection checkbox */}
                  {activeTab === "all" && !image.isSelected && (
                    <button
                      type="button"
                      aria-label={
                        selectedImages.includes(image.id)
                          ? "Unselect photo"
                          : "Select photo"
                      }
                      onClick={() => toggleImageSelection(image.id)}
                      className={`absolute left-3 top-3 z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 ${
                        selectedImages.includes(image.id)
                          ? "border-white bg-white text-black"
                          : "border-white/30 bg-black/40 text-transparent hover:border-white"
                      }`}
                    >
                      ✓
                    </button>
                  )}

                  {/* Selected order */}
                  {image.isSelected &&
                    (activeTab === "all" || activeTab === "selected") && (
                      <div className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                        {image.selectionOrder}
                      </div>
                    )}

                  {/* Delete button */}
                  {activeTab === "all" && !image.isSelected && (
                    <button
                      type="button"
                      aria-label="Delete photo"
                      onClick={() => {
                        setIsBulkDelete(false);
                        setSelectedImageId(image.id);
                        setShowDeleteModal(true);
                      }}
                      className="absolute bottom-3 right-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 p-2 text-red-500 transition hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {/* Zoom indicator */}
                  <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100">
                    <ZoomIn size={16} />
                  </div>
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
                    <p className="break-words text-xs text-zinc-400">
                      <span className="font-bold">Comment:</span>{" "}
                      {image.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
              No images found.
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-3 backdrop-blur-sm sm:p-6"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close photo viewer"
            className="absolute right-3 top-3 z-20 rounded-full bg-zinc-800/80 p-2 text-white transition hover:bg-zinc-700 sm:right-6 sm:top-6"
          >
            <X size={24} />
          </button>

          {/* Previous */}
          {filteredImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPreviousImage();
              }}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-zinc-800/80 p-2 text-white transition hover:bg-zinc-700 sm:left-6 sm:p-3"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Main image */}
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.fileName || "Full-size photo"}
              className="max-h-[80dvh] max-w-[85vw] select-none object-contain"
            />

            <div className="max-w-full text-center">
  {/* Selected status */}
  <div className="mb-2">
    {lightboxImage.isSelected ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
        ✓ Selected
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
        Not Selected
      </span>
    )}
  </div>

  {/* File name */}
  <p className="break-words text-sm text-zinc-200">
    {lightboxImage.fileName || "Untitled"}
  </p>

  {/* Position */}
  <p className="mt-1 text-xs text-zinc-500">
    {lightboxIndex + 1} / {filteredImages.length}
  </p>
</div>
          </div>

          {/* Next */}
          {filteredImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNextImage();
              }}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-zinc-800/80 p-2 text-white transition hover:bg-zinc-700 sm:right-6 sm:p-3"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-auto w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6"
          >
            <h2 className="text-2xl font-bold text-white">
              {isBulkDelete
                ? `Delete ${selectedImages.length} Images?`
                : "Delete Image?"}
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              {isBulkDelete
                ? `${selectedImages.length} selected images will be permanently removed from:`
                : "This image will be permanently removed from:"}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>• Database</li>
              <li>• Cloudinary</li>
              <li>• Client selections</li>
            </ul>

            <p className="mt-4 text-sm font-medium text-red-400">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete {isBulkDelete ? "Images" : "Image"}
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