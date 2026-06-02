import FolderImagesTabs from "@/components/admin/folder-images-tabs";
import UploadDropzone from "@/components/admin/upload-dropzone";

import { prisma } from "@/lib/prisma";

interface FolderDetailPageProps {
  params: Promise<{
    id: string;
    folderId: string;
  }>;
}

export default async function FolderDetailPage({
  params,
}: FolderDetailPageProps) {
  const { id, folderId } = await params;

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    include: {
      images: true,
    },
  });

  const event = await prisma.event.findUnique({
    where: {
      id: id,
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

  if (!folder) {
    return <div className="p-10 text-white">Folder not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
          {event.eventType}
        </span>

        <h2 className="mt-4 text-2xl font-semibold">{event.name}</h2>

        <p className="mt-2 text-zinc-400">Client: {event.clientName}</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{folder.name}</h1>

          <p className="mt-2 text-zinc-400">Event ID: {id}</p>
        </div>

        <div className="rounded-xl bg-zinc-900 px-5 py-3 text-sm">
          {folder.images.length} Images
        </div>
      </div>

      {/* Upload */}
      <div className="mb-8">
        <UploadDropzone folderId={folderId} />
      </div>

      {/* Empty State */}
      {folder.images.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-16 text-center">
          <h2 className="text-xl font-semibold">No Images Uploaded</h2>

          <p className="mt-2 text-sm text-zinc-500">
            Upload wedding photos to start building the gallery.
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {folder.images.length > 0 && (
        <FolderImagesTabs
          images={folder.images}
        />
      )}
    </div>
  );
}
