import ExportSelectedImages from "@/components/admin/export-selected-images";
import FolderImagesTabs from "@/components/admin/folder-images-tabs";
import UploadDropzone from "@/components/admin/upload-dropzone";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";

interface FolderDetailPageProps {
  params: Promise<{
    id: string;
    folderId: string;
  }>;
  searchParams: Promise<{
    imageId?: string;
  }>;
}

export default async function FolderDetailPage({
  params,
  searchParams,
}: FolderDetailPageProps) {
  const { id, folderId } = await params;
  const { imageId } = await searchParams;

  // 1. Verify admin authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifyAuthToken(token);

  if (
    !session ||
    session.role !== "admin" ||
    !session.adminId ||
    !session.studioId
  ) {
    redirect("/login");
  }

  // 2. Verify admin belongs to the studio in the session
  const admin = await prisma.admin.findUnique({
    where: {
      id: session.adminId,
    },
    select: {
      id: true,
      studioId: true,
      studio: {
        select: {
          isActive: true,
        },
      },
    },
  });

  if (
    !admin ||
    admin.studioId !== session.studioId ||
    !admin.studio.isActive
  ) {
    redirect("/login");
  }

  // 3. Fetch event and folder with studio ownership validation
  const event = await prisma.event.findFirst({
    where: {
      id,
      studioId: admin.studioId,
      deletedAt: null,
    },
    include: {
      folders: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          images: {
            select: {
              id: true,
              fileName: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      eventId: event.id,
      deletedAt: null,
    },
    include: {
      images: true,
    },
  });

  if (!folder) {
    notFound();
  }

  // 4. Generate private R2 signed URLs
  const imagesWithSignedUrls = await Promise.all(
    folder.images.map(async (image) => {
      const fullImageKey = image.optimizedKey || image.storageKey;

      const thumbnailKey =
        image.thumbnailKey ||
        image.optimizedKey ||
        image.storageKey;

      // Fallback for existing non-R2 image records
      if (!fullImageKey) {
        return {
          ...image,
          imageUrl: image.imageUrl,
          thumbnailUrl: image.imageUrl,
        };
      }

      try {
        const [fullImageUrl, thumbnailUrl] = await Promise.all([
          getSignedUrl(
            r2,
            new GetObjectCommand({
              Bucket: R2_BUCKET_NAME,
              Key: fullImageKey,
            }),
            { expiresIn: 3600 }
          ),

          thumbnailKey
            ? getSignedUrl(
              r2,
              new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: thumbnailKey,
              }),
              { expiresIn: 3600 }
            )
            : Promise.resolve(image.imageUrl),
        ]);

        return {
          ...image,
          imageUrl: fullImageUrl,
          thumbnailUrl,
        };
      } catch (error) {
        console.error(
          `Failed to generate image URLs for ${image.id}:`,
          error
        );

        return {
          ...image,
          imageUrl: "",
          thumbnailUrl: "",
        };
      }
    })
  );

  // 5. Selected image filenames for export
  const selectedImages = folder.images
    .filter((img) => img.isSelected)
    .map((img) => img.fileName)
    .filter(Boolean) as string[];

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
          {event.eventType}
        </span>

        <h2 className="mt-4 text-2xl font-semibold">
          {event.name}
        </h2>

        <p className="mt-2 text-zinc-400">
          Client: {event.clientName}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {folder.name}
          </h1>

          <p className="mt-2 text-zinc-400">
            Event ID: {id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedImages.length !== 0 && (
            <ExportSelectedImages
              selectedImages={selectedImages}
              verifyFileName={selectedImages[0] ?? ""}
            />
          )}

          <div className="rounded-xl bg-zinc-900 px-5 py-3 text-sm">
            {folder.images.length} Images
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="mb-8">
        <UploadDropzone
          folderId={folderId}
          hasProcessingImages={folder.images.some(
            (image) =>
              image.processingStatus === "PENDING" ||
              image.processingStatus === "PROCESSING"
          )}
        />
      </div>

      {/* Empty State */}
      {folder.images.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-16 text-center">
          <h2 className="text-xl font-semibold">
            No Images Uploaded
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Upload wedding photos to start building the gallery.
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {folder.images.length > 0 && (
        <FolderImagesTabs
          images={imagesWithSignedUrls}
          initialImageId={imageId}
          otherFolderImages={event.folders
            .filter((otherFolder) => otherFolder.id !== folderId)
            .flatMap((otherFolder) =>
              otherFolder.images.map((image) => ({
                id: image.id,
                fileName: image.fileName,
                folderName: otherFolder.name,
              }))
            )}
        />
      )}
    </div>
  );
}