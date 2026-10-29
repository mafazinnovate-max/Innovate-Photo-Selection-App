import StudioBranding from "@/components/gallery/studio-branding";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  Heart,
} from "lucide-react";
import { hasGalleryAccess } from "@/lib/gallery-access";
import GalleryAccessModal from "@/components/gallery/gallery-access-modal";
import FolderLink from "@/components/gallery/folder-link";

interface GalleryPageProps {
  params: Promise<{ shareId: string }>;
  searchParams: Promise<{ parentId?: string }>;
}

export default async function GalleryPage({
  params,
  searchParams,
}: GalleryPageProps) {
  const { shareId } = await params;
  const { parentId } = (await searchParams) || {};

  const event = await prisma.event.findUnique({
    where: { shareId },
    include: {
      studio: true,
    },
  });

  const superAdmin = await prisma.superAdmin.findFirst({
    select: {
      logoUrl: true,
    },
  });

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Gallery not found
      </div>
    );
  }

  const hasAccess = await hasGalleryAccess(
    shareId,
    parentId ?? null,
  );

  if (!hasAccess) {
    return (
      <GalleryAccessModal
        shareId={shareId}
        parentId={parentId ?? null}
      />
    );
  }

  const folders = await prisma.folder.findMany({
    where: {
      eventId: event.id,
      parentId: parentId ?? null,
    },
    select: {
      id: true,
      name: true,
      selectionStatus: true,
      _count: {
        select: {
          images: true,
        },
      },
      images: {
        take: 1,
        select: {
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const selectedImages = await prisma.image.findMany({
    where: {
      folder: {
        eventId: event.id,
        ...(parentId ? { parentId } : {}),
      },
      isSelected: true,
    },
    select: {
      folderId: true,
    },
  });

  const selectedCounts = new Map<string, number>();

  for (const image of selectedImages) {
    selectedCounts.set(
      image.folderId,
      (selectedCounts.get(image.folderId) ?? 0) + 1,
    );
  }

  const totalSelected = selectedImages.length;

  let maxSelections = event.maxSelections;

  if (parentId) {
    const parentFolder = await prisma.folder.findUnique({
      where: {
        id: parentId,
      },
      select: {
        maxSelections: true,
      },
    });

    maxSelections = parentFolder?.maxSelections ?? null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Studio branding */}
      <StudioBranding studio={event.studio} />

     {/* Event Header */}
<div className="relative mx-5 mt-8 max-w-7xl overflow-hidden rounded-3xl border border-amber-400/10 bg-zinc-950 shadow-2xl shadow-black/40 xl:mx-auto">
  {/* Cover Image */}
  {event.coverImageUrl && (
    <>
      <img
        src={event.coverImageUrl}
        alt={event.name}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: `center ${50 + event.coverPosition}%`,
        }}
      />

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />


      {/* Subtle gold atmosphere */}
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
    </>
  )}

  <div className="relative flex min-h-[420px] flex-col justify-end px-6 py-8 sm:min-h-[460px] sm:px-8 sm:py-10 lg:min-h-[420px] lg:px-12 lg:py-12">
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      {/* Event Information */}
      <div className="min-w-0 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber-200">
            Private Photo Gallery
          </span>
        </div>

        <h1 className="mt-5 break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {event.name}
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 tracking-wide text-zinc-300 sm:text-base sm:leading-7">
          Choose the moments that matter most.
        </p>

     <div className="mt-6">
  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
    Client
  </p>

  <p className="mt-1.5 break-words text-sm font-medium text-zinc-200 sm:text-base">
    {event.clientName}
  </p>
</div>
      </div>

      {/* Selection Limit */}
      {maxSelections && (
        <div className="w-full shrink-0 lg:max-w-[300px]">
          <div className="rounded-2xl border border-amber-400/20 bg-black/45 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
                <Heart
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
                  Selection Limit
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Choose up to{" "}
                  <span className="font-semibold text-white">
                    {maxSelections}
                  </span>{" "}
                  photos for your selection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

      {/* Selection Summary */}
      <div className="mx-auto mt-10 max-w-7xl px-5">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl shadow-black/20">
          {/* Summary Header */}
          <div className="flex flex-col gap-6 p-6 sm:p-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
                <Heart size={19} strokeWidth={1.8} />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-wide text-white">
                  Your Selection
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  A quick look at your photo choices
                </p>
              </div>
            </div>

            {/* Total Selected */}
            <div className="flex min-w-[150px] flex-col items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] px-6 py-4 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Photos Selected
              </p>

              <p className="mt-2 text-3xl font-semibold leading-none tracking-tight text-amber-300">
                {totalSelected}
              </p>
            </div>
          </div>

          {/* Folder Summary */}
          <div className="border-t border-white/5">
            {folders.map((folder, index) => (
              <div
                key={folder.id}
                className={`flex items-center justify-between gap-4 px-6 py-4 sm:px-7 ${
                  index !== 0 ? "border-t border-white/5" : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
  <div className="min-w-0 max-w-full">
    <p className="break-words text-sm font-medium text-zinc-200 sm:truncate">
      {folder.name}
    </p>
  </div>

  {folder.selectionStatus === "COMPLETED" ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-green-300">
      <CheckCircle2 size={12} strokeWidth={1.8} />
      Selection Complete
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/15 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-amber-300">
      <Clock3 size={12} strokeWidth={1.8} />
      Selection in Progress
    </span>
  )}
</div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-white">
                    {selectedCounts.get(folder.id) ?? 0}
                    <span className="mx-1 text-zinc-600">/</span>
                    <span className="text-zinc-400">{maxSelections}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-600">
                    Selected
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Folder Grid */}
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 md:grid-cols-2 xl:grid-cols-4">
        {folders.map((folder) => (
          <FolderLink
            key={folder.id}
            href={`/gallery/${shareId}/folder/${folder.id}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={
                  folder.images[0]?.imageUrl ||
                  "https://placehold.co/600x400/111/FFF?text=No+Image"
                }
                alt={folder.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-5">
              <h2 className="text-xl font-semibold">
                {folder.name}
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                <span className="font-medium text-white">
                  {selectedCounts.get(folder.id) ?? 0}
                </span>
                <span className="mx-1 text-zinc-600">/</span>
                <span>{maxSelections}</span>
                <span className="ml-2 text-zinc-500">Selected</span>
              </p>

              <div className="mt-4">
                {folder.selectionStatus === "COMPLETED" ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-300">
                    <CheckCircle2 size={14} />
                    Selection Complete
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                    <Clock3 size={14} />
                    Selection in Progress
                  </div>
                )}
              </div>
            </div>
          </FolderLink>
        ))}
      </div>

      {/* Picknovate Branding */}
      <div className="border-t border-white/10 bg-black px-5 py-10 sm:py-12">
        <div className="flex flex-col items-center justify-center">
          <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-zinc-600">
            Powered by
          </p>

          {superAdmin?.logoUrl && (
            <Image
              src={superAdmin.logoUrl}
              alt="Picknovate"
               width={140}
               height={140}
               className="h-28 w-28 object-contain opacity-90 sm:h-32 sm:w-32"
            />
          )}
        </div>
      </div>
    </div>
  );
}