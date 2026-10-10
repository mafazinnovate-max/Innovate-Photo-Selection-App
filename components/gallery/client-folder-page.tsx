"use client";

import { completeCategory } from "@/actions/complete-category";
import { reopenCategory } from "@/actions/reopen-category";
import { saveSelections } from "@/actions/save-selections";
import {
  ArrowLeft,
  Check,
  LocateFixedIcon,
  Lock,
  PhoneCall,
  Unlock,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface GalleryImage {
  id: string;
  imageUrl: string;
  fileName: string | null;
  isSelected: boolean;
  comment: string | null;
}

interface SelectionCategory {
  folderId: string;
  folderName: string;
  selectedCount: number;
}

interface ClientFolderPageProps {
  images: GalleryImage[];
  folderName: string;
  folderId: string;
  shareId: string;
  maxSelections: number | null;
  parentId?: string | null;
  selectionSummary: SelectionCategory[];
  selectionStatus: "SELECTING" | "COMPLETED";
}

const AUTO_SAVE_DELAY = 3000;

export default function ClientFolderPage({
  images,
  folderName,
  folderId,
  shareId,
  maxSelections,
  parentId,
  selectionSummary,
  selectionStatus,
}: ClientFolderPageProps) {
  const [selectedImages, setSelectedImages] = useState(
    images.filter((img) => img.isSelected).map((img) => img.id),
  );

  const adjustedSelectionSummary = selectionSummary.map((category) => ({
    ...category,
    selectedCount:
      category.selectedCount +
      (category.folderId === folderId
        ? selectedImages.length - category.selectedCount
        : 0),
  }));

  const totalSelected = adjustedSelectionSummary.reduce(
    (total, category) => total + category.selectedCount,
    0,
  );

  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(
      images.map((img) => [img.id, img.comment || ""]),
    ),
  );

  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  const [isBrowserBack, setIsBrowserBack] = useState(false);

  const [slideDirection, setSlideDirection] = useState<
    "left" | "right" | null
  >(null);

  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const [showCommentedOnly, setShowCommentedOnly] = useState(false);

  const [pendingNavigation, setPendingNavigation] =
    useState<string | null>(null);

  /*
   * Category completion status
   */
  const [currentSelectionStatus, setCurrentSelectionStatus] =
    useState(selectionStatus);

  const [isCompleting, setIsCompleting] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState(false);

  /*
   * Mobile compact action bar
   */
  const [showMobileActionBar, setShowMobileActionBar] =
    useState(false);

  const lastTapRef = useRef(0);
  const pinchDistanceRef = useRef(0);
  const commentDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const swipeStartTime = useRef(0);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const selectedImagesRef = useRef(selectedImages);
  const commentsRef = useRef(comments);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const inFlightSaveRef = useRef<Promise<boolean> | null>(null);

  const versionRef = useRef(0);
  const savedVersionRef = useRef(0);

  const guardActiveRef = useRef(false);
  const leavingRef = useRef(false);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const limitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const isCompleted =
    currentSelectionStatus === "COMPLETED";

  const isDirty = () =>
    versionRef.current !== savedVersionRef.current;

  /*
   * MOBILE ACTION BAR
   *
   * IMPORTANT:
   * The main category section is NOT sticky.
   * Only this small action bar becomes fixed
   * after the user scrolls down.
   */
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        setShowMobileActionBar(false);
        return;
      }

      setShowMobileActionBar(window.scrollY > 220);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const clearAutoSaveTimer = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  };

  const saveNow = async (): Promise<boolean> => {
    clearAutoSaveTimer();

    if (inFlightSaveRef.current) {
      const ok = await inFlightSaveRef.current;

      if (!ok) return false;

      if (!isDirty()) return true;

      return saveNow();
    }

    if (!isDirty()) {
      setHasUnsavedChanges(false);
      return true;
    }

    const snapshotVersion = versionRef.current;

    const savePromise = (async (): Promise<boolean> => {
      setIsSaving(true);

      try {
        const result: unknown = await saveSelections({
          folderId,
          selectedImages: selectedImagesRef.current,
          comments: commentsRef.current,
        });

        if (
          result &&
          typeof result === "object" &&
          "success" in result &&
          (result as { success?: unknown }).success === false
        ) {
          throw new Error("Save failed");
        }

        savedVersionRef.current = snapshotVersion;

        return true;
      } catch (error) {
        console.error(
          "Failed to save selections:",
          error,
        );

        return false;
      } finally {
        inFlightSaveRef.current = null;
        setIsSaving(false);
      }
    })();

    inFlightSaveRef.current = savePromise;

    const ok = await savePromise;

    if (!ok) return false;

    if (isDirty()) {
      return saveNow();
    }

    clearAutoSaveTimer();

    setHasUnsavedChanges(false);

    return true;
  };

  const scheduleAutoSave = () => {
    clearAutoSaveTimer();

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveTimeoutRef.current = null;
      void saveNow();
    }, AUTO_SAVE_DELAY);
  };

  const ensureHistoryGuard = () => {
    if (
      guardActiveRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    window.history.pushState(
      window.history.state,
      "",
      window.location.href,
    );

    guardActiveRef.current = true;
  };

  const markDirty = () => {
    versionRef.current += 1;

    setHasUnsavedChanges(true);

    ensureHistoryGuard();

    scheduleAutoSave();
  };

  /*
   * PHOTO SELECTION
   *
   * Completed category = completely locked.
   */
  const toggleSelect = (id: string) => {
    if (isCompleted) return;

    const current = selectedImagesRef.current;

    const alreadySelected = current.includes(id);

    if (alreadySelected) {
      const next = current.filter(
        (item) => item !== id,
      );

      selectedImagesRef.current = next;

      setSelectedImages(next);

      markDirty();

      return;
    }

    if (
      maxSelections !== null &&
      current.length >= maxSelections
    ) {
      setShowLimitWarning(true);

      if (limitTimeoutRef.current) {
        clearTimeout(limitTimeoutRef.current);
      }

      limitTimeoutRef.current = setTimeout(() => {
        setShowLimitWarning(false);
      }, 2500);

      return;
    }

    const next = [...current, id];

    selectedImagesRef.current = next;

    setSelectedImages(next);

    markDirty();
  };

  const updateComment = (
    id: string,
    value: string,
  ) => {
    if (isCompleted) return;

    const next = {
      ...commentsRef.current,
      [id]: value,
    };

    commentsRef.current = next;

    setComments(next);

    markDirty();
  };

  let filteredImages = images;

  if (showSelectedOnly) {
    filteredImages = filteredImages.filter(
      (image) =>
        selectedImages.includes(image.id),
    );
  }

  if (showCommentedOnly) {
    filteredImages = filteredImages.filter(
      (image) =>
        (comments[image.id] || "")
          .trim()
          .length > 0,
    );
  }

  const visibleImages =
    filteredImages.slice(0, visibleCount);

  const getSelectionNumber = (
    imageId: string,
  ) => {
    return (
      selectedImages.indexOf(imageId) + 1
    );
  };

  /*
   * Infinite loading
   */
  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (entries) => {
          const firstEntry = entries[0];

          if (
            firstEntry.isIntersecting &&
            visibleCount <
              filteredImages.length
          ) {
            setVisibleCount(
              (prev) => prev + 20,
            );
          }
        },
        {
          threshold: 0.5,
        },
      );

    const currentLoader =
      loaderRef.current;

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(
          currentLoader,
        );
      }
    };
  }, [
    visibleCount,
    filteredImages.length,
  ]);

  /*
   * Browser back protection
   */
  useEffect(() => {
    const handlePopState = () => {
      if (
        !guardActiveRef.current ||
        leavingRef.current
      ) {
        return;
      }

      if (isDirty()) {
        window.history.pushState(
          window.history.state,
          "",
          window.location.href,
        );

        setSaveError(false);

        setPendingNavigation(null);

        setIsBrowserBack(true);

        setShowLeaveModal(true);

        return;
      }

      guardActiveRef.current = false;

      window.history.back();
    };

    window.addEventListener(
      "popstate",
      handlePopState,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState,
      );
    };
  }, []);

  /*
   * Browser close / refresh protection
   */
  useEffect(() => {
    const handleBeforeUnload = (
      event: BeforeUnloadEvent,
    ) => {
      if (
        isDirty() ||
        inFlightSaveRef.current
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
    };
  }, []);

  /*
   * Cleanup
   */
  useEffect(() => {
    return () => {
      if (
        autoSaveTimeoutRef.current
      ) {
        clearTimeout(
          autoSaveTimeoutRef.current,
        );
      }

      if (
        toastTimeoutRef.current
      ) {
        clearTimeout(
          toastTimeoutRef.current,
        );
      }

      if (
        limitTimeoutRef.current
      ) {
        clearTimeout(
          limitTimeoutRef.current,
        );
      }

      if (
        commentDebounceRef.current
      ) {
        clearTimeout(
          commentDebounceRef.current,
        );
      }
    };
  }, []);

  const showSavedToast = () => {
    setShowSuccessToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(
        toastTimeoutRef.current,
      );
    }

    toastTimeoutRef.current =
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
  };

  /*
   * Manual save
   */
  const handleConfirmSave = async () => {
    if (isSaving) return;

    setSaveError(false);

    const ok = await saveNow();

    if (ok) {
      setShowConfirmModal(false);

      showSavedToast();
    } else {
      setSaveError(true);
    }
  };

  /*
   * COMPLETE CATEGORY
   */
  const handleCompleteCategory =
    async () => {
      if (
        isCompleting ||
        isCompleted
      ) {
        return;
      }

      setCategoryActionError(false);

      setIsCompleting(true);

      try {
        /*
         * First save current photo selections.
         */
        const saved = await saveNow();

        if (!saved) {
          setCategoryActionError(true);
          return;
        }

        /*
         * Then mark category completed.
         */
        const result =
          await completeCategory({
            folderId,
            shareId,
          });

        if (!result.success) {
          throw new Error(
            "Could not complete category",
          );
        }

        setCurrentSelectionStatus(
          "COMPLETED",
        );

        setHasUnsavedChanges(false);
      } catch (error) {
        console.error(
          "Failed to complete category:",
          error,
        );

        setCategoryActionError(true);
      } finally {
        setIsCompleting(false);
      }
    };

  /*
   * SELECT PHOTOS AGAIN
   */
  const handleReopenCategory =
    async () => {
      if (
        isReopening ||
        !isCompleted
      ) {
        return;
      }

      setCategoryActionError(false);

      setIsReopening(true);

      try {
        const result =
          await reopenCategory({
            folderId,
            shareId,
          });

        if (!result.success) {
          throw new Error(
            "Could not reopen category",
          );
        }

        setCurrentSelectionStatus(
          "SELECTING",
        );
      } catch (error) {
        console.error(
          "Failed to reopen category:",
          error,
        );

        setCategoryActionError(true);
      } finally {
        setIsReopening(false);
      }
    };

  const navigateTo = (
    url: string,
  ) => {
    leavingRef.current = true;

    if (guardActiveRef.current) {
      guardActiveRef.current = false;

      router.replace(url);
    } else {
      router.push(url);
    }
  };

  const backUrl = parentId
    ? `/gallery/${shareId}?parentId=${parentId}`
    : `/gallery/${shareId}`;

  const handleLogoClick = () => {
    if (
      hasUnsavedChanges ||
      isDirty()
    ) {
      setSaveError(false);

      setIsBrowserBack(false);

      setPendingNavigation(backUrl);

      setShowLeaveModal(true);

      return;
    }

    navigateTo(backUrl);
  };

  const handleStayHere = () => {
    setShowLeaveModal(false);

    setPendingNavigation(null);

    setIsBrowserBack(false);

    setSaveError(false);
  };

  const handleLeavePage =
    async () => {
      if (isSaving) return;

      setSaveError(false);

      const ok = await saveNow();

      if (!ok) {
        setSaveError(true);
        return;
      }

      setShowLeaveModal(false);

      if (pendingNavigation) {
        navigateTo(
          pendingNavigation,
        );

        return;
      }

      if (isBrowserBack) {
        leavingRef.current = true;

        if (
          guardActiveRef.current
        ) {
          guardActiveRef.current =
            false;

          window.history.go(-2);
        } else {
          window.history.back();
        }

        return;
      }

      navigateTo(backUrl);
    };

  /*
   * Lightbox
   */
  const handleDoubleTap = () => {
    if (zoom > 1) {
      setZoom(1);

      setIsZoomed(false);

      setPosition({
        x: 0,
        y: 0,
      });
    } else {
      setZoom(2);

      setIsZoomed(true);
    }
  };

  const handleTap = () => {
    const now = Date.now();

    const DOUBLE_PRESS_DELAY = 300;

    if (
      now - lastTapRef.current <
      DOUBLE_PRESS_DELAY
    ) {
      handleDoubleTap();
    }

    lastTapRef.current = now;
  };

  const getDistance = (
    touches: React.TouchList,
  ) => {
    const dx =
      touches[0].clientX -
      touches[1].clientX;

    const dy =
      touches[0].clientY -
      touches[1].clientY;

    return Math.sqrt(
      dx * dx + dy * dy,
    );
  };

  const currentImage =
    images.find(
      (img) =>
        img.id === activeImage,
    );

  useEffect(() => {
    if (activeImage !== null) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [activeImage]);

  const goNext = () => {
    setSlideDirection("left");

    setTimeout(() => {
      if (activeImage === null)
        return;

      const currentIndex =
        images.findIndex(
          (img) =>
            img.id === activeImage,
        );

      const nextImage =
        images[
          (currentIndex + 1) %
            images.length
        ];

      setActiveImage(
        nextImage.id,
      );

      setSlideDirection(null);
    }, 120);
  };

  const goPrevious = () => {
    setSlideDirection("right");

    setTimeout(() => {
      if (activeImage === null)
        return;

      const currentIndex =
        images.findIndex(
          (img) =>
            img.id === activeImage,
        );

      const previousIndex =
        (currentIndex -
          1 +
          images.length) %
        images.length;

      setActiveImage(
        images[previousIndex].id,
      );

      setSlideDirection(null);
    }, 120);
  };

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent,
    ) => {
      if (activeImage === null)
        return;

      if (
        e.key === "ArrowRight"
      ) {
        goNext();
      }

      if (
        e.key === "ArrowLeft"
      ) {
        goPrevious();
      }

      if (e.key === "Escape") {
        setActiveImage(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [activeImage]);

  useEffect(() => {
    if (!activeImage) return;

    const currentIndex =
      images.findIndex(
        (img) =>
          img.id === activeImage,
      );

    const nextImage =
      images[
        (currentIndex + 1) %
          images.length
      ];

    const prevImage =
      images[
        (currentIndex -
          1 +
          images.length) %
          images.length
      ];

    [nextImage, prevImage].forEach(
      (img) => {
        const preload =
          new window.Image();

        preload.src =
          img.imageUrl;
      },
    );
  }, [activeImage, images]);

  const handleTouchStart = (
    e: React.TouchEvent,
  ) => {
    swipeStartTime.current =
      Date.now();

    if (e.touches.length === 2) {
      pinchDistanceRef.current =
        getDistance(e.touches);
    } else {
      touchStartX.current =
        e.changedTouches[0].screenX;
    }
  };

  const handleTouchMove = (
    e: React.TouchEvent,
  ) => {
    if (
      e.touches.length === 2
    ) {
      const currentDistance =
        getDistance(e.touches);

      const scale =
        currentDistance /
        pinchDistanceRef.current;

      const nextZoom = Math.min(
        Math.max(scale, 1),
        4,
      );

      setZoom(nextZoom);

      setIsZoomed(
        nextZoom > 1,
      );
    }
  };

  const handleTouchEnd = (
    e: React.TouchEvent,
  ) => {
    if (isZoomed) return;

    touchEndX.current =
      e.changedTouches[0].screenX;

    const distance =
      touchStartX.current -
      touchEndX.current;

    const duration =
      Date.now() -
      swipeStartTime.current;

    const velocity =
      Math.abs(distance) /
      duration;

    if (
      Math.abs(distance) < 50 ||
      velocity < 0.3
    ) {
      return;
    }

    if (distance > 0) {
      goNext();
    } else {
      goPrevious();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mx-auto max-w-7xl border-b border-zinc-800 px-4 py-5 sm:px-5 sm:py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Logo */}
          <div
            className="flex cursor-pointer justify-start gap-3"
            onClick={handleLogoClick}
          >
            <ArrowLeft
              size={18}
            />

            <Image
              src="/innovate-logo.png"
              alt="logo"
              className="h-auto w-[180px] object-contain sm:w-[220px] md:w-[250px]"
              width={250}
              height={150}
              priority
            />
          </div>

          {/* Contact */}
          <div className="w-full max-w-lg space-y-4 text-sm text-zinc-300">
            <div className="flex items-start gap-3">
              <PhoneCall
                size={18}
                className="mt-0.5 shrink-0 text-zinc-400"
              />

              <a href="tel:+919876543210">
                +91 98765 43210
              </a>
            </div>

            <div className="flex items-start gap-3">
              <LocateFixedIcon
                size={18}
                className="mt-0.5 shrink-0 text-zinc-400"
              />

              <p>
                Innovate Wedding Company,
                Pattakasalianvilai Rd,
                Vattakarai,
                Maravankudieruppu,
                Nagercoil,
                Tamil Nadu 629002
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CATEGORY SECTION

          IMPORTANT:
          NO sticky here.

          This restores the original desktop/laptop behavior.
          The whole section scrolls away naturally.
          ===================================================== */}

      <div className="border-b border-zinc-800 bg-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {folderName}
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              {isCompleted
                ? "Your photo selection has been completed."
                : "Select your favorite photos"}
            </p>

            {/* Category Status */}
            <div
              className={`mt-4 rounded-xl border p-4 ${
                isCompleted
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-amber-500/30 bg-amber-500/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isCompleted
                      ? "bg-green-500/15 text-green-400"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {isCompleted ? (
                    <Lock size={18} />
                  ) : (
                    <Unlock size={18} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    className={`text-sm font-semibold sm:text-base ${
                      isCompleted
                        ? "text-green-300"
                        : "text-amber-300"
                    }`}
                  >
                    {isCompleted
                      ? "Client Selected Photos"
                      : "Client Selecting Photos"}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-zinc-400 sm:text-sm">
                    {isCompleted
                      ? "This category is locked. Your selections cannot be changed unless you choose to select photos again."
                      : "You can select, remove, and comment on photos. Complete the category when you are finished."}
                  </p>
                </div>
              </div>

              {categoryActionError && (
                <p className="mt-3 text-sm text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}

              {isCompleted ? (
                <button
                  onClick={
                    handleReopenCategory
                  }
                  disabled={
                    isReopening
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Unlock
                    size={16}
                  />

                  {isReopening
                    ? "Opening Photos..."
                    : "Select Photos Again"}
                </button>
              ) : (
                <button
                  onClick={
                    handleCompleteCategory
                  }
                  disabled={
                    isCompleting ||
                    isSaving
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check
                    size={17}
                  />

                  {isCompleting
                    ? "Completing Category..."
                    : "Complete Category"}
                </button>
              )}
            </div>

            {/* Selection Summary */}
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">
                  Total Selected
                </span>

                <span className="text-lg font-bold text-amber-300">
                  {totalSelected}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {adjustedSelectionSummary.map(
                  (category) => (
                    <div
                      key={
                        category.folderId
                      }
                      className="rounded-full border border-zinc-700 bg-black px-3 py-1.5 text-xs text-zinc-300"
                    >
                      {
                        category.folderName
                      }
                      :{" "}
                      <span className="font-semibold text-white">
                        {
                          category.selectedCount
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <button
              onClick={() =>
                setShowSelectedOnly(
                  (prev) => !prev,
                )
              }
              className={`flex-1 rounded-full border px-4 py-2 text-center text-sm transition md:flex-none ${
                showSelectedOnly
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {showSelectedOnly
                ? "Show All"
                : "Show Selected"}
            </button>

            {maxSelections ===
              null && (
              <div className="rounded-full bg-zinc-800 px-4 py-2 text-sm">
                {
                  selectedImages.length
                }{" "}
                Selected
              </div>
            )}

            {maxSelections !==
              null && (
              <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
                {
                  selectedImages.length
                }{" "}
                /{" "}
                {maxSelections}{" "}
                Selected
              </div>
            )}

            {hasUnsavedChanges && (
              <button
                onClick={() => {
                  setSaveError(false);
                  setShowConfirmModal(
                    true,
                  );
                }}
                className="hidden flex-1 rounded-full bg-white px-4 py-2 text-center text-sm font-medium text-black md:block md:flex-none"
              >
                {isSaving
                  ? "Saving..."
                  : "Submit Selection"}
              </button>
            )}

            <button
              onClick={() =>
                setShowCommentedOnly(
                  (prev) => !prev,
                )
              }
              className={`flex-1 rounded-full border px-4 py-2 text-center text-sm transition md:flex-none ${
                showCommentedOnly
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {showCommentedOnly
                ? "Show All"
                : "Commented"}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE COMPACT ACTION BAR

          ONLY THIS SMALL BAR IS FIXED.
          ===================================================== */}

      {showMobileActionBar && (
        <div className="fixed inset-x-0 top-0 z-[80] border-b border-zinc-800 bg-black px-3 py-3 shadow-2xl md:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-zinc-500">
                {folderName}
              </p>

              <p
                className={`truncate text-sm font-semibold ${
                  isCompleted
                    ? "text-green-300"
                    : "text-amber-300"
                }`}
              >
                {isCompleted
                  ? "Client Selected Photos"
                  : "Client Selecting Photos"}
              </p>
            </div>

            {isCompleted ? (
              <button
                onClick={
                  handleReopenCategory
                }
                disabled={
                  isReopening
                }
                className="flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-lg disabled:opacity-50"
              >
                <Unlock
                  size={15}
                />

                {isReopening
                  ? "Opening..."
                  : "Select Photos Again"}
              </button>
            ) : (
              <button
                onClick={
                  handleCompleteCategory
                }
                disabled={
                  isCompleting ||
                  isSaving
                }
                className="flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-lg disabled:opacity-50"
              >
                <Check
                  size={15}
                />

                {isCompleting
                  ? "Completing..."
                  : "Complete Category"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          GALLERY
          ===================================================== */}

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-2 py-4 sm:grid-cols-3 md:gap-3 xl:grid-cols-5">
        {visibleImages.map(
          (image) => {
            const isSelected =
              selectedImages.includes(
                image.id,
              );

            return (
              <div
                key={image.id}
                onClick={() =>
                  setActiveImage(
                    image.id,
                  )
                }
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition ${
                  isSelected
                    ? "border-white"
                    : "border-zinc-800"
                }`}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={
                      image.imageUrl
                    }
                    alt="Wedding"
                    fill
                    unoptimized
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Select */}
                <button
                  disabled={
                    isCompleted
                  }
                  onClick={(e) => {
                    e.stopPropagation();

                    toggleSelect(
                      image.id,
                    );
                  }}
                  className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    isCompleted
                      ? "cursor-not-allowed bg-black/70 text-zinc-500"
                      : isSelected
                        ? "bg-white text-black"
                        : "bg-black/60 text-white backdrop-blur"
                  }`}
                >
                  {isCompleted ? (
                    <Lock
                      size={13}
                    />
                  ) : isSelected ? (
                    getSelectionNumber(
                      image.id,
                    )
                  ) : (
                    "+"
                  )}
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="truncate text-sm text-zinc-200">
                    {image.fileName ||
                      "Untitled"}
                  </p>

                  <textarea
                    disabled={
                      isCompleted
                    }
                    placeholder={
                      isCompleted
                        ? "Comments locked"
                        : "Add comment..."
                    }
                    value={
                      comments[
                        image.id
                      ] || ""
                    }
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    onChange={(e) => {
                      updateComment(
                        image.id,
                        e.target.value,
                      );
                    }}
                    className={`mt-2 w-full rounded-lg border px-3 py-2 text-xs text-white outline-none backdrop-blur placeholder:text-zinc-500 ${
                      isCompleted
                        ? "cursor-not-allowed border-zinc-800 bg-black/60 text-zinc-500"
                        : "border-zinc-700 bg-black/40"
                    }`}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>

      <div
        ref={loaderRef}
        className="flex justify-center py-10"
      >
        {visibleCount <
          filteredImages.length && (
          <p className="text-sm text-zinc-500">
            Loading more photos...
          </p>
        )}
      </div>

      {/* =====================================================
          MOBILE SAVE BAR
          ===================================================== */}

      {hasUnsavedChanges && (
        <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-zinc-800 bg-black/90 p-4 backdrop-blur md:hidden">
          <button
            onClick={() => {
              setSaveError(false);

              setShowConfirmModal(
                true,
              );
            }}
            className="flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black shadow-2xl"
          >
            {isSaving
              ? "Saving..."
              : `Save ${selectedImages.length} Selected Photos`}
          </button>
        </div>
      )}

      {/* =====================================================
          SAVE CONFIRMATION MODAL
          ===================================================== */}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold text-white">
              Save Selections?
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              You selected{" "}
              <span className="font-semibold text-white">
                {
                  selectedImages.length
                }
              </span>{" "}
              photos.
              <br />
              Your selections will be saved permanently.
            </p>

            {saveError && (
              <p className="mt-3 text-sm text-red-400">
                Could not save your selections. Please try again.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                disabled={
                  isSaving
                }
                onClick={() => {
                  setSaveError(
                    false,
                  );

                  setShowConfirmModal(
                    false,
                  );
                }}
                className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleConfirmSave
                }
                disabled={
                  isSaving
                }
                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : "Confirm Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LIMIT WARNING
          ===================================================== */}

      {showLimitWarning && (
        <div className="fixed inset-x-0 top-4 z-[200] flex justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xl">
                ⚠️
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-red-300 sm:text-base">
                  Selection Limit Reached
                </h3>

                <p className="mt-1 text-xs leading-5 text-zinc-200 sm:text-sm">
                  You have reached the maximum selection limit.
                  <br />
                  You can select only{" "}
                  <span className="font-bold text-white">
                    {maxSelections}
                  </span>{" "}
                  photos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS TOAST
          ===================================================== */}

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
                  {
                    selectedImages.length
                  }{" "}
                  photos saved successfully.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowSuccessToast(
                    false,
                  )
                }
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LEAVE MODAL
          ===================================================== */}

      {showLeaveModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold text-white">
              Unsaved Changes
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              You have unsaved photo selections.
              <br />
              Are you sure you want to leave this page?
            </p>

            {saveError && (
              <p className="mt-3 text-sm text-red-400">
                Could not save your selections. Please try again or stay on this page.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                disabled={
                  isSaving
                }
                onClick={
                  handleStayHere
                }
                className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Stay Here
              </button>

              <button
                disabled={
                  isSaving
                }
                onClick={
                  handleLeavePage
                }
                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : "Leave Page"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LIGHTBOX
          ===================================================== */}

      {activeImage !==
        null &&
        currentImage && (
          <div
            className="fixed inset-0 z-[100] overflow-hidden bg-black"
            onTouchStart={
              handleTouchStart
            }
            onTouchMove={
              handleTouchMove
            }
            onTouchEnd={
              handleTouchEnd
            }
            onClick={handleTap}
          >
            {/* Top Overlay */}
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 py-4">
              <div>
                <p className="max-w-[220px] truncate text-sm font-medium text-white">
                  {currentImage.fileName ||
                    "Untitled"}
                </p>

                <p className="text-xs text-zinc-400">
                  {selectedImages.includes(
                    currentImage.id,
                  )
                    ? "Selected"
                    : "Not Selected"}
                </p>
              </div>

              <button
                onClick={() =>
                  setActiveImage(
                    null,
                  )
                }
                className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-black"
              >
                Close
              </button>
            </div>

            {/* Image */}
            <div className="relative flex h-full items-center justify-center">
              <div
                className="relative h-[78vh] w-full transition-all duration-300 ease-out"
                style={{
                  transform: `
                    translateX(
                      ${
                        slideDirection ===
                        "left"
                          ? "-40px"
                          : slideDirection ===
                              "right"
                            ? "40px"
                            : "0px"
                      }
                    )
                    scale(${zoom})
                  `,
                  opacity:
                    slideDirection
                      ? 0.4
                      : 1,
                }}
              >
                <Image
                  src={
                    currentImage.imageUrl
                  }
                  alt="Preview"
                  fill
                  priority
                  unoptimized
                  className="select-none object-contain"
                  draggable={false}
                />
              </div>
            </div>

            {/* Left */}
            <button
              onClick={
                goPrevious
              }
              className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-white backdrop-blur md:block"
            >
              ←
            </button>

            {/* Right */}
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-white backdrop-blur md:block"
            >
              →
            </button>

            {/* Bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/90 to-transparent px-4 pb-5 pt-10">
              <div className="flex items-center gap-3">
                <textarea
                  disabled={
                    isCompleted
                  }
                  placeholder={
                    isCompleted
                      ? "Comments locked"
                      : "Add comment..."
                  }
                  value={
                    comments[
                      currentImage.id
                    ] || ""
                  }
                  onChange={(e) => {
                    if (
                      isCompleted
                    ) {
                      return;
                    }

                    const value =
                      e.target.value;

                    updateComment(
                      currentImage.id,
                      value,
                    );

                    if (
                      commentDebounceRef.current
                    ) {
                      clearTimeout(
                        commentDebounceRef.current,
                      );
                    }

                    commentDebounceRef.current =
                      setTimeout(() => {
                        console.log(
                          "Autosaving...",
                        );
                      }, 800);
                  }}
                  className={`max-h-28 min-h-[52px] flex-1 resize-none rounded-2xl border px-4 py-3 text-sm text-white outline-none backdrop-blur placeholder:text-zinc-500 ${
                    isCompleted
                      ? "cursor-not-allowed border-zinc-800 bg-zinc-900/80 text-zinc-500"
                      : "border-zinc-700 bg-zinc-900/80"
                  }`}
                />

                <button
                  disabled={
                    isCompleted
                  }
                  onClick={() =>
                    toggleSelect(
                      currentImage.id,
                    )
                  }
                  className={`flex h-[52px] min-w-[52px] items-center justify-center rounded-2xl text-sm font-bold transition ${
                    isCompleted
                      ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                      : selectedImages.includes(
                            currentImage.id,
                          )
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-white"
                  }`}
                >
                  {isCompleted ? (
                    <Lock
                      size={17}
                    />
                  ) : selectedImages.includes(
                      currentImage.id,
                    ) ? (
                    getSelectionNumber(
                      currentImage.id,
                    )
                  ) : (
                    "+"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          LEFT BOTTOM STATS
          ===================================================== */}

      <div
        className={`fixed left-4 z-[200] ${
          activeImage !==
            null &&
          currentImage
            ? "bottom-24"
            : hasUnsavedChanges
              ? "bottom-20 md:bottom-4"
              : "bottom-4"
        }`}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-black/80 px-2 py-1 text-xs text-white backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-1">
            <span className="text-zinc-400">
              Selected:
            </span>

            <span className="font-semibold text-white">
              {
                selectedImages.length
              }

              {maxSelections !==
              null
                ? ` / ${maxSelections}`
                : ` / ${images.length}`}
            </span>
          </div>

          <span className="text-zinc-600">
            /
          </span>

          <div className="flex items-center gap-1">
            <span className="text-zinc-400">
              Total:
            </span>

            <span className="font-semibold text-white">
              {images.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}