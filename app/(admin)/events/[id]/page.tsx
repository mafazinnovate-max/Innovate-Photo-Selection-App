import FoldersPage from "@/components/admin/folders-page";
import { prisma } from "@/lib/prisma";

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

  const folders = await prisma.folder.findMany({
    where: {
      eventId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: true,
    },
  });

  if (!event) {
    return <div className="p-10 text-white">Event not found</div>;
  }

  // const totalFolders = event.folders.length;

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
        {/* Folder Grid */}
        <FoldersPage
          eventId={id}
          initialFolders={folders}
          event={{
            ...event,
            shareId: event.shareId,
            eventDate: event.eventDate?.toISOString() ?? null,
            galleryMode: event.galleryMode as "single" | "bride_groom",
          }}
        />

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3 items-center">
          <div className="rounded-xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Total Images</p>

            <h3 className="mt-2 text-2xl font-bold">{totalImages}</h3>
          </div>

          <div className="rounded-xl bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Selected Images</p>

            <h3 className="mt-2 text-2xl font-bold">{selectedImages}</h3>
          </div>

          {/* <div>
            <Link
              href={`/gallery/${event.shareId}`}
              target="_blank"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-black transition-all"
            >
              Open Client Gallery

              <ArrowRight
                size={18}
                className="translate-x-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
