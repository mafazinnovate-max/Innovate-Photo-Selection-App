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
import { Images } from "lucide-react";
import FolderStorageUsage from "@/components/admin/folder-storage-usage";

interface FolderDetailPageProps {
  params: Promise<{
    id: string;
    folderId: string;
  }>;
  searchParams: Promise<{
    imageId?: string;
  }>;
}

const USAGE_SEGMENTS = 24;

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

  // Studio image usage for the header card
  const subscription = await prisma.subscription.findFirst({
    where: { studioId: admin.studioId },
    orderBy: { createdAt: "desc" },
    select: { startDate: true, endDate: true, maxImages: true },
  });


  const usedImages = subscription?.endDate
    ? await prisma.image.count({
      where: {
        createdAt: {
          gte: subscription.startDate,
          lte: subscription.endDate,
        },
        folder: {
          deletedAt: null,
          event: {
            studioId: admin.studioId,
          },
        },
      },
    })
    : 0;


  const maxImages = subscription?.maxImages ?? 0;
  const usagePct =
    maxImages > 0
      ? Math.min(100, Math.round((usedImages / maxImages) * 100))
      : 0;
  const usageWarn = usagePct >= 80;
  const limitReached = maxImages > 0 && usedImages >= maxImages;
  const filledSegments =
    usedImages > 0
      ? Math.max(1, Math.round((usagePct / 100) * USAGE_SEGMENTS))
      : 0;


      
const sortedFolderImages = [...folder.images].sort((a, b) => {
  if (!a.fileName) return b.fileName ? 1 : 0;
  if (!b.fileName) return -1;

  return a.fileName.localeCompare(b.fileName, undefined, {
    numeric: true,
    sensitivity: "base",
  });
});


  // 4. Generate private R2 signed URLs
  const imagesWithSignedUrls = await Promise.all(
    sortedFolderImages.map(async (image) => {
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
      {/* Header: one row, details on the left, actions + usage card on the right */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
            {event.eventType}
          </span>

          <h2 className="mt-4 text-2xl font-semibold">
            {event.name}
          </h2>

          <p className="mt-2 text-zinc-400">
            Client: {event.clientName}
          </p>

          <h1 className="mt-10 text-3xl font-bold">
            {folder.name}
          </h1>

          <p className="mt-2 text-zinc-400">
            Event ID: {id}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 md:justify-end">
          {selectedImages.length !== 0 && (
            <ExportSelectedImages
              selectedImages={selectedImages}
              verifyFileName={selectedImages[0] ?? ""}
            />
          )}

          {maxImages > 0 ? (
            <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:w-[300px]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Images usage</span>

                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] ${limitReached
                    ? "border-red-500/60 bg-red-500/10 text-red-400"
                    : usageWarn
                      ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                      : "border-zinc-700 text-zinc-400"
                    }`}
                >
                  {limitReached
                    ? "Limit reached"
                    : usageWarn
                      ? "Almost full"
                      : `${usagePct}% used`}
                </span>
              </div>

              <div className="mt-2.5 flex items-end justify-between gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {usedImages.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-500">
                    / {maxImages.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200">
                  <Images className="h-3.5 w-3.5 text-zinc-400" />
                  {folder.images.length}{" "}
                  {folder.images.length === 1 ? "image" : "images"} here
                </div>
              </div>

              <div
                role="progressbar"
                aria-valuenow={usedImages}
                aria-valuemin={0}
                aria-valuemax={maxImages}
                className="mt-3 flex gap-[3px]"
              >
                {Array.from({ length: USAGE_SEGMENTS }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3.5 flex-1 rounded-[2px] transition-colors duration-300 ${i < filledSegments ? "bg-white" : "bg-zinc-800"
                      }`}
                  />
                ))}
              </div>

              <div className="mt-2 flex justify-between text-xs">
                <span
                  className={
                    limitReached
                      ? "text-red-400"
                      : usageWarn
                        ? "text-amber-400"
                        : "text-zinc-400"
                  }
                >
                  {usagePct}% used
                </span>
                <span className="text-zinc-400">
                  {Math.max(0, maxImages - usedImages).toLocaleString()} left
                </span>
              </div>
              <FolderStorageUsage />
            </div>
          ) : (
            <div className="rounded-xl bg-zinc-900 px-5 py-3 text-sm">
              {folder.images.length} Images
            </div>
          )}
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