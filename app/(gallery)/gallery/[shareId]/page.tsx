import Link from "next/link";

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { LocateFixedIcon, PhoneCall } from "lucide-react";
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
      ...(parentId ? { parentId } : {}),
    },
    select: {
      id: true,
      name: true,
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

  // const event = await prisma.event.findUnique({
  //   where: {
  //     shareId,
  //   },
  //   include: {
  //     folders: {
  //       where: parentId
  //         ? { parentId: parentId }
  //         : undefined, // 👈 KEY FIX
  //       include: {
  //         images: true,
  //       },
  //     },
  //   },
  // });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <Image
                src="/innovate-logo.png"
                alt="logo"
                className="h-auto w-[180px] object-contain sm:w-[220px] md:w-[250px]"
                width={250}
                height={150}
                priority
              />
            </div>

            {/* Contact Info */}
            <div className="w-full max-w-lg space-y-4 text-sm text-zinc-300">
              <div className="flex items-start gap-3">
                <PhoneCall
                  size={18}
                  className="mt-0.5 shrink-0 text-zinc-400"
                />

                <a
                  href="tel:+919876543210"
                  className="transition"
                >
                  +91 98765 43210
                </a>
              </div>

              <div className="flex items-start gap-3">
                <LocateFixedIcon
                  size={18}
                  className="mt-0.5 shrink-0 text-zinc-400"
                />

                <p>
                  Innovate Wedding Company, Pattakasalianvilai Rd, Vattakarai,
                  Maravankudieruppu, Nagercoil, Tamil Nadu 629002
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-5 xl:mx-auto mt-8 max-w-7xl overflow-hidden rounded-3xl border border-zinc-800">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            {event.coverImageUrl && (
              <>
                <img
                  src={event.coverImageUrl}
                  alt={event.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  // style={{
                  //   objectPosition: `center ${event.coverPosition ?? 50}%`,
                  // }}
                  style={{
                    objectPosition: `center ${50 + event.coverPosition}%`,
                  }}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/70" />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </>
            )}

            <div className="relative min-h-[280px] px-6 py-10 sm:px-8 sm:py-14 md:min-h-[320px] flex flex-col justify-end">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
                  Photo Selection Gallery
                </span>

                <h1 className="mt-4 text-3xl font-bold sm:text-4xl md:text-5xl">
                  {event.name}
                </h1>

                <p className="mt-3 text-zinc-300">
                  Select your favorite memories ✨
                </p>

                <p className="mt-5 text-sm text-zinc-400">
                  Client:{" "}
                  <span className="font-medium text-zinc-200">
                    {event.clientName}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end lg:pr-8 mb-5 lg:mb-0 mx-3 md:mx-0">
            {maxSelections && (
              <div className="w-full max-w-sm rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-xl shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xl">
                    📸
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-300">
                      Photo Selection Limit
                    </p>

                    <p className="mt-1 text-sm leading-6 text-zinc-200">
                      You can select up to{" "}
                      <span className="font-bold text-white">
                        {maxSelections}
                      </span>{" "}
                      photos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Folder Grid */}
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 md:grid-cols-2 xl:grid-cols-4">
        {folders.map((folder) => (
          <FolderLink
            key={folder.id}
            href={`/gallery/${shareId}/folder/${folder.id}`}
          // prefetch={true}
          // className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600"
          >
            {/* Thumbnail */}
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

            {/* Content */}
            <div className="p-5">
              <h2 className="text-xl font-semibold">{folder.name}</h2>

              <p className="mt-2 text-sm text-zinc-400">
                {folder._count.images} Photos
              </p>
            </div>
          </FolderLink>
        ))}
      </div>
    </div>
  );
}
