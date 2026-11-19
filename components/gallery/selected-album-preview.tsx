
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface AlbumImage {
  id: string;
  imageUrl: string;
  fileName: string | null;
}

interface SelectedAlbumPreviewProps {
  images: AlbumImage[];
  onClose: () => void;
}

interface AlbumPage {
  id: string;
  images: AlbumImage[];
}

interface AlbumSpread {
  id: string;
  left: AlbumPage;
  right: AlbumPage;
}

function createPage(
  images: AlbumImage[],
  index: number,
): AlbumPage {
  return {
    id: `page-${index}`,
    images,
  };
}

function createSpreads(images: AlbumImage[]): AlbumSpread[] {
  const spreads: AlbumSpread[] = [];

  for (let i = 0; i < images.length; i += 4) {
    const group = images.slice(i, i + 4);

    spreads.push({
      id: `spread-${i}`,
      left: createPage(group.slice(0, 2), i),
      right: createPage(group.slice(2, 4), i + 1),
    });
  }

  return spreads;
}

function AlbumPhoto({
  image,
  className = "",
}: {
  image: AlbumImage;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-0 overflow-hidden bg-[#e8e0d4] ${className}`}
    >
      <Image
        src={image.imageUrl}
        alt={image.fileName || "Selected wedding photograph"}
        fill
        unoptimized
        sizes="(max-width: 768px) 90vw, 45vw"
        className="object-cover"
      />
    </div>
  );
}

function AlbumPageContent({
  page,
  pageNumber,
}: {
  page: AlbumPage;
  pageNumber: number;
}) {
  const photos = page.images;
  const layout = pageNumber % 3;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#f5f0e7] p-4 sm:p-6 lg:p-9">
      <div className="mb-3 flex items-center justify-between sm:mb-5">
        <span className="font-serif text-[9px] tracking-[0.28em] text-[#9a8974] sm:text-[10px]">
          YOUR WEDDING STORY
        </span>
        <span className="text-[9px] tracking-[0.2em] text-[#aa9b88]">
          {String(pageNumber).padStart(2, "0")}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {photos.length === 1 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <AlbumPhoto
              image={photos[0]}
              className="min-h-0 flex-1"
            />
            <p className="mt-4 text-center font-serif text-sm italic tracking-wide text-[#85735f] sm:mt-5 sm:text-base">
              A moment to remember
            </p>
          </div>
        )}

        {photos.length === 2 && (
          <div
            className={`grid min-h-0 flex-1 gap-3 sm:gap-4 ${
              layout === 1
                ? "grid-rows-[1.35fr_0.85fr]"
                : layout === 2
                  ? "grid-rows-[0.85fr_1.35fr]"
                  : "grid-rows-2"
            }`}
          >
            <AlbumPhoto image={photos[0]} />
            <AlbumPhoto image={photos[1]} />
          </div>
        )}

        {photos.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <span className="font-serif text-sm italic text-[#b0a18d]">
              The story continues...
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center sm:mt-5">
        <span className="h-px w-8 bg-[#c9bba8]" />
        <span className="mx-3 font-serif text-[9px] tracking-[0.3em] text-[#a08f79]">
          FOREVER
        </span>
        <span className="h-px w-8 bg-[#c9bba8]" />
      </div>
    </div>
  );
}

export default function SelectedAlbumPreview({
  images,
  onClose,
}: SelectedAlbumPreviewProps) {
  const spreads = useMemo(() => createSpreads(images), [images]);

  const pages = useMemo(
    () => spreads.flatMap((spread) => [spread.left, spread.right]),
    [spreads],
  );

  const [currentSpread, setCurrentSpread] = useState(0);
  const [currentMobilePage, setCurrentMobilePage] = useState(0);
  const [isTurning, setIsTurning] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();

      if (event.key === "ArrowRight") {
        setCurrentSpread((current) =>
          Math.min(current + 1, spreads.length - 1),
        );
        setCurrentMobilePage((current) =>
          Math.min(current + 1, pages.length - 1),
        );
      }

      if (event.key === "ArrowLeft") {
        setCurrentSpread((current) => Math.max(current - 1, 0));
        setCurrentMobilePage((current) => Math.max(current - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, spreads.length, pages.length]);

  const goToNext = () => {
    setIsTurning(true);

    setTimeout(() => {
      setCurrentSpread((current) =>
        Math.min(current + 1, spreads.length - 1),
      );
      setCurrentMobilePage((current) =>
        Math.min(current + 1, pages.length - 1),
      );
      setIsTurning(false);
    }, 220);
  };

  const goToPrevious = () => {
    setIsTurning(true);

    setTimeout(() => {
      setCurrentSpread((current) => Math.max(current - 1, 0));
      setCurrentMobilePage((current) => Math.max(current - 1, 0));
      setIsTurning(false);
    }, 220);
  };

  if (images.length === 0 || spreads.length === 0) return null;

  const activeSpread = spreads[currentSpread];
  const activePage = pages[currentMobilePage];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#171613] text-white">
      <style jsx global>{`
        @keyframes albumPageTurn {
          0% {
            opacity: 0.55;
            transform: perspective(1200px) rotateY(-7deg);
          }
          100% {
            opacity: 1;
            transform: perspective(1200px) rotateY(0deg);
          }
        }

        .album-page-turn {
          animation: albumPageTurn 420ms ease-out both;
          transform-origin: left center;
        }

        @media (prefers-reduced-motion: reduce) {
          .album-page-turn {
            animation: none;
          }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 flex h-[64px] shrink-0 items-center justify-between border-b border-white/10 px-4 sm:h-[72px] sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c8b89e]/40 text-[#d6c6aa]">
            <BookOpen size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-serif text-sm tracking-wide text-[#f1e8d9] sm:text-base">
              Your Wedding Album
            </p>
            <p className="text-[9px] tracking-[0.2em] text-white/40 sm:text-[10px]">
              A COLLECTION OF YOUR SELECTED MOMENTS
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          aria-label="Close album preview"
        >
          <X size={19} />
        </button>
      </header>

      {/* Album area */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-5 sm:px-8 sm:py-7">
        {/* Desktop and tablet: two-page spread */}
        <div className="hidden h-full max-h-[680px] w-full max-w-[1100px] items-center justify-center md:flex">
          <div
            key={activeSpread.id}
            className={`relative flex aspect-[1.5/1] max-h-full w-full overflow-hidden rounded-[3px] bg-[#f5f0e7] shadow-[0_25px_90px_rgba(0,0,0,0.55)] ${
              isTurning ? "" : "album-page-turn"
            }`}
          >
            <div className="relative min-w-0 flex-1 overflow-hidden">
              <AlbumPageContent
                page={activeSpread.left}
                pageNumber={currentSpread * 2 + 1}
              />
            </div>

            <div className="relative z-10 w-[2px] shrink-0 bg-[#d1c4b2] shadow-[0_0_12px_rgba(0,0,0,0.16)]" />

            <div className="relative min-w-0 flex-1 overflow-hidden">
              <AlbumPageContent
                page={activeSpread.right}
                pageNumber={currentSpread * 2 + 2}
              />
            </div>
          </div>
        </div>

        {/* Mobile: individual pages */}
        <div
          key={activePage.id}
          className="album-page-turn flex h-full max-h-[680px] w-full max-w-[440px] flex-col overflow-hidden rounded-[3px] bg-[#f5f0e7] shadow-[0_25px_90px_rgba(0,0,0,0.55)] md:hidden"
        >
          <AlbumPageContent
            page={activePage}
            pageNumber={currentMobilePage + 1}
          />
        </div>

        {/* Desktop navigation */}
        <button
          type="button"
          onClick={goToPrevious}
          disabled={currentSpread === 0 || isTurning}
          className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20 md:flex lg:left-6"
          aria-label="Previous spread"
        >
          <ChevronLeft size={23} />
        </button>

        <button
          type="button"
          onClick={goToNext}
          disabled={currentSpread >= spreads.length - 1 || isTurning}
          className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20 md:flex lg:right-6"
          aria-label="Next spread"
        >
          <ChevronRight size={23} />
        </button>
      </main>

      {/* Footer navigation */}
      <footer className="flex h-[76px] shrink-0 items-center justify-between border-t border-white/10 px-4 sm:h-[84px] sm:px-8">
        <div className="min-w-[75px]">
          <p className="text-[10px] tracking-[0.18em] text-white/40">
            PHOTOS
          </p>
          <p className="mt-1 text-sm tabular-nums text-[#e6d7c2]">
            {images.length}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={
              currentSpread === 0 ||
              currentMobilePage === 0 ||
              isTurning
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 disabled:opacity-25 md:hidden"
            aria-label="Previous page"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="min-w-[95px] text-center">
            <p className="text-[10px] tracking-[0.15em] text-white/45">
              <span className="md:hidden">
                PAGE {currentMobilePage + 1} / {pages.length}
              </span>
              <span className="hidden md:inline">
                SPREAD {currentSpread + 1} / {spreads.length}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={
              currentSpread >= spreads.length - 1 ||
              currentMobilePage >= pages.length - 1 ||
              isTurning
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 disabled:opacity-25 md:hidden"
            aria-label="Next page"
          >
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="min-w-[75px] text-right">
          <p className="text-[10px] tracking-[0.18em] text-white/40">
            PREVIEW
          </p>
          <p className="mt-1 text-xs text-[#e6d7c2]">
            Digital album
          </p>
        </div>
      </footer>
    </div>
  );
}
