"use client";

import { saveSelections } from "@/actions/save-selections";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface GalleryImage {
  id: string;
  imageUrl: string;
  fileName: string | null;
  isSelected: boolean;
  comment: string | null;
}

interface ClientFolderPageProps {
  images: GalleryImage[];
  folderName: string;
  folderId: string;
}

export default function ClientFolderPage({
  images,
  folderName,
  folderId,
}: ClientFolderPageProps) {
  const [selectedImages, setSelectedImages] = useState(
    images.filter((img) => img.isSelected).map((img) => img.id),
  );
  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(images.map((img) => [img.id, img.comment || ""])),
  );
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  const lastTapRef = useRef(0);
  const pinchDistanceRef = useRef(0);
  const commentDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const swipeStartTime = useRef(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const toggleSelect = (id: string) => {
    setHasUnsavedChanges(true);

    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredImages = showSelectedOnly
    ? images.filter((image) => selectedImages.includes(image.id))
    : images;

  const visibleImages = filteredImages.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting && visibleCount < filteredImages.length) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      {
        threshold: 0.5,
      },
    );

    const currentLoader = loaderRef.current;

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [visibleCount, filteredImages.length]);

  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChanges) {
        setShowLeaveModal(true);

        window.history.pushState(null, "", window.location.href);
      }
    };

    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();

        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleSubmitSelection = async () => {
    try {
      setIsSaving(true);

      await saveSelections({
        folderId,
        selectedImages,
        comments,
      });

      setHasUnsavedChanges(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch (error) {
      console.log(error);

      alert("Failed to submit selections");
    } finally {
      setIsSaving(false);
      setShowConfirmModal(false);
    }
  };

  const handleDoubleTap = () => {
    if (zoom > 1) {
      setZoom(1);
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2);
      setIsZoomed(true);
    }
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      handleDoubleTap();
    }

    lastTapRef.current = now;
  };

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const currentImage = images.find((img) => img.id === activeImage);

  const goNext = () => {
    if (activeImage === null) return;

    const currentIndex = images.findIndex((img) => img.id === activeImage);

    const nextImage = images[(currentIndex + 1) % images.length];

    setActiveImage(nextImage.id);
  };

  const goPrevious = () => {
    if (activeImage === null) return;

    const currentIndex = images.findIndex((img) => img.id === activeImage);

    const previousIndex = (currentIndex - 1 + images.length) % images.length;

    setActiveImage(images[previousIndex].id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImage === null) return;

      if (e.key === "ArrowRight") {
        goNext();
      }

      if (e.key === "ArrowLeft") {
        goPrevious();
      }

      if (e.key === "Escape") {
        setActiveImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage]);

  useEffect(() => {
    if (!activeImage) return;

    const currentIndex = images.findIndex((img) => img.id === activeImage);

    const nextImage = images[(currentIndex + 1) % images.length];
    const prevImage =
      images[(currentIndex - 1 + images.length) % images.length];

    [nextImage, prevImage].forEach((img) => {
      const preload = new window.Image();

      preload.src = img.imageUrl;
    });
  }, [activeImage, images]);

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartTime.current = Date.now();

    if (e.touches.length === 2) {
      pinchDistanceRef.current = getDistance(e.touches);
    } else {
      touchStartX.current = e.changedTouches[0].screenX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const currentDistance = getDistance(e.touches);

      const scale = currentDistance / pinchDistanceRef.current;

      const nextZoom = Math.min(Math.max(scale, 1), 4);

      setZoom(nextZoom);
      setIsZoomed(nextZoom > 1);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isZoomed) return;

    touchEndX.current = e.changedTouches[0].screenX;

    const distance = touchStartX.current - touchEndX.current;

    const duration = Date.now() - swipeStartTime.current;

    const velocity = Math.abs(distance) / duration;

    if (Math.abs(distance) < 50 || velocity < 0.3) return;

    if (distance > 0) {
      goNext();
    } else {
      goPrevious();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{folderName}</h1>

            <p className="mt-1 text-sm text-zinc-400">
              Select your favorite photos
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <button
              onClick={() => setShowSelectedOnly((prev) => !prev)}
              className={`flex-1 rounded-full border px-4 py-2 text-center text-sm transition md:flex-none ${
                showSelectedOnly
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {showSelectedOnly ? "Show All" : "Show Selected"}
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 rounded-full bg-white px-4 py-2 text-center text-sm font-medium text-black md:flex-none"
            >
              Submit Selection
            </button>

            <div className="flex-1 rounded-full bg-zinc-800 px-4 py-2 text-center text-sm md:flex-none">
              {selectedImages.length} Selected
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-2 py-4 sm:grid-cols-3 md:gap-3 xl:grid-cols-5">
        {visibleImages.map((image) => {
          const isSelected = selectedImages.includes(image.id);

          return (
            <div
              key={image.id}
              onClick={() => setActiveImage(image.id)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition ${
                isSelected ? "border-white" : "border-zinc-800"
              }`}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={image.imageUrl}
                  alt="Wedding"
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <button
                onClick={(e) => {
                  e.stopPropagation();

                  toggleSelect(image.id);
                }}
                className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium transition ${
                  isSelected
                    ? "bg-white text-black"
                    : "bg-black/60 text-white backdrop-blur"
                }`}
              >
                {isSelected ? "Selected" : "Select"}
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="truncate text-sm text-zinc-200">
                  {image.fileName || "Untitled"}
                </p>

                <textarea
                  placeholder="Add comment..."
                  value={comments[image.id] || ""}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);

                    setComments((prev) => ({
                      ...prev,
                      [image.id]: e.target.value,
                    }));
                  }}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-xs text-white outline-none backdrop-blur placeholder:text-zinc-500"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div ref={loaderRef} className="flex justify-center py-10">
        {visibleCount < filteredImages.length && (
          <p className="text-sm text-zinc-500">Loading more photos...</p>
        )}
      </div>

      {hasUnsavedChanges && (
        <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-zinc-800 bg-black/90 p-4 backdrop-blur md:hidden">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black shadow-2xl"
          >
            {isSaving
              ? "Saving..."
              : `Save ${selectedImages.length} Selected Photos`}
          </button>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold text-white">Save Selections?</h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              You selected{" "}
              <span className="font-semibold text-white">
                {selectedImages.length}
              </span>{" "}
              photos.
              <br />
              Your selections will be saved permanently.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitSelection}
                disabled={isSaving}
                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Confirm Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed bottom-24 left-1/2 z-[150] w-[90%] max-w-sm -translate-x-1/2 md:bottom-5 md:left-auto md:right-5 md:translate-x-0">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 shadow-2xl backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                ✓
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">
                  Selections Saved
                </h3>

                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  {selectedImages.length} photos saved successfully.
                </p>
              </div>

              <button
                onClick={() => setShowSuccessToast(false)}
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold text-white">Unsaved Changes</h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              You have unsaved photo selections.
              <br />
              Are you sure you want to leave this page?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Stay Here
              </button>

              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  setHasUnsavedChanges(false);

                  window.history.back();
                }}
                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {activeImage !== null && currentImage && (
        <div
          className="fixed inset-0 z-[100] overflow-hidden bg-black"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleTap}
        >
          {/* Top Overlay */}
          <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 py-4">
            <div>
              <p className="max-w-[220px] truncate text-sm font-medium text-white">
                {currentImage.fileName || "Untitled"}
              </p>

              <p className="text-xs text-zinc-400">
                {selectedImages.includes(currentImage.id)
                  ? "Selected"
                  : "Not Selected"}
              </p>
            </div>

            <button
              onClick={() => setActiveImage(null)}
              className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-black"
            >
              Close
            </button>
          </div>

          {/* Image */}
          <div className="relative flex h-full items-center justify-center">
            <div
              className="relative h-[78vh] w-full transition-transform duration-300"
              style={{
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
              }}
            >
              <Image
                src={currentImage.imageUrl}
                alt="Preview"
                fill
                priority
                className="object-contain select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Left Navigation */}
          <button
            onClick={goPrevious}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-white backdrop-blur md:block"
          >
            ←
          </button>

          {/* Right Navigation */}
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-white backdrop-blur md:block"
          >
            →
          </button>

          {/* Bottom Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/90 to-transparent px-4 pb-5 pt-10">
            <div className="flex items-center gap-3">
              {/* Comment */}
              <textarea
                placeholder="Add comment..."
                value={comments[currentImage.id] || ""}
                onChange={(e) => {
                  const value = e.target.value;

                  setHasUnsavedChanges(true);

                  setComments((prev) => ({
                    ...prev,
                    [currentImage.id]: value,
                  }));

                  if (commentDebounceRef.current) {
                    clearTimeout(commentDebounceRef.current);
                  }

                  commentDebounceRef.current = setTimeout(() => {
                    console.log("Autosaving...");
                  }, 800);
                }}
                className="max-h-28 min-h-[52px] flex-1 resize-none rounded-2xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none backdrop-blur placeholder:text-zinc-500"
              />

              {/* Select Button */}
              <button
                onClick={() => toggleSelect(currentImage.id)}
                className={`flex h-[52px] min-w-[52px] items-center justify-center rounded-2xl text-sm font-bold transition ${
                  selectedImages.includes(currentImage.id)
                    ? "bg-white text-black"
                    : "bg-zinc-800 text-white"
                }`}
              >
                {selectedImages.includes(currentImage.id) ? "✓" : "+"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
