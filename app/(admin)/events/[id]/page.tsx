import FoldersPage from "@/components/admin/folders-page";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

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
        where: {
          deletedAt: null,
        },
        include: {
          images: true,
        },
      },
    },
  });

  if (!event) {
    return <div className="p-10 text-white">Event not found</div>;
  }

  const folders = await prisma.folder.findMany({
    where: {
      eventId: id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      images: true,
    },
  });

  let coverImageUrl = event.coverImageUrl;

  if (event.coverImageKey) {
    try {
      coverImageUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: event.coverImageKey,
        }),
        { expiresIn: 3600 },
      );
    } catch (error) {
      console.error("Event cover signed URL error:", error);
    }
  }

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
        <FoldersPage
          eventId={id}
          initialFolders={folders}
          event={{
            ...event,
            coverImageUrl,
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
        </div>
      </div>
    </div>
  );
}