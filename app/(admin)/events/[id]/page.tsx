import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: {
      id,
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
    return <div className="p-10 text-white">Event not found</div>;
  }

  const totalFolders = event.folders.length;

  const totalImages = event.folders.reduce(
    (acc, folder) => acc + folder.images.length,
    0,
  );

  const selectedImages = event.folders.reduce(
    (acc, folder) =>
      acc + folder.images.filter((image) => image.isSelected).length,
    0,
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Event Details</h1>

        <p className="mt-2 text-zinc-400">Event ID: {event.id}</p>
      </div>

      {/* Event Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
              {event.eventType}
            </span>

            <h2 className="mt-4 text-2xl font-semibold">{event.name}</h2>

            <p className="mt-2 text-zinc-400">Client: {event.clientName}</p>

            {event.description && (
              <p className="mt-4 max-w-2xl text-sm text-zinc-500">
                {event.description}
              </p>
            )}
          </div>
          <div>
            <Link
              href={`/gallery/${event.shareId}`}
              target="_blank"
              className="rounded-xl bg-white px-5 py-3 text-black"
            >
              Open Client Gallery
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Total Folders</p>

            <h3 className="mt-2 text-2xl font-bold">{totalFolders}</h3>
          </div>

          <div className="rounded-xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Total Images</p>

            <h3 className="mt-2 text-2xl font-bold">{totalImages}</h3>
          </div>

          <div className="rounded-xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Selected Images</p>

            <h3 className="mt-2 text-2xl font-bold">{selectedImages}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
