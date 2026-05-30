import Link from "next/link";

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { LocateFixedIcon, PhoneCall } from "lucide-react";

interface GalleryPageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { shareId } = await params;

  const event = await prisma.event.findUnique({
    where: {
      shareId,
    },
    include: {
      folders: {
        include: {
          images: true,
        },
      },
    },
  });

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Gallery not found
      </div>
    );
  }

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

                <p>+91 98765 43210</p>
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

      <div className="mx-auto max-w-7xl px-4 sm:px-5">
        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:mt-10 sm:p-8">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            {event.name}
          </h1>

          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            Select your favorite memories ✨
          </p>

          <p className="mt-4 text-sm text-zinc-500">
            Client: {event.clientName}
          </p>
        </div>
      </div>

      {/* Folder Grid */}
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 md:grid-cols-2 xl:grid-cols-4">
        {event.folders.map((folder) => (
          <Link
            key={folder.id}
            href={`/gallery/${shareId}/folder/${folder.id}`}
            className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600"
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
                {folder.images.length} Photos
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
