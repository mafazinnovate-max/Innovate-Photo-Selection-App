import ClientFolderPage from "@/components/gallery/client-folder-page";
import GalleryAccessModal from "@/components/gallery/gallery-access-modal";
import { hasGalleryAccess } from "@/lib/gallery-access";
import { prisma } from "@/lib/prisma";

import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface SelectionCategory {
  folderId: string;
  folderName: string;
  selectedCount: number;
}

interface FolderPageProps {
  params: Promise<{
    shareId: string;
    folderId: string;
  }>;
}

export default async function FolderPage({
  params,
}: FolderPageProps) {
  const { shareId, folderId } = await params;

  // Fetch studio details for the access modal
  const event = await prisma.event.findUnique({
    where: { shareId },
    select: {
      studio: {
        select: {
          name: true,
          logoUrl: true,
          logoStorageKey: true,
          logoOptimizedKey: true,
        },
      },
    },
  });

  if (!event) {
    return <div>Folder not found</div>;
  }

  // Generate signed URL for the studio logo
  let studioLogoUrl = event.studio?.logoUrl ?? null;

  const studioLogoKey =
    event.studio?.logoOptimizedKey ||
    event.studio?.logoStorageKey;

  if (studioLogoKey) {
    try {
      studioLogoUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: studioLogoKey,
        }),
        { expiresIn: 3600 }
      );
    } catch (error) {
      console.error("Failed to generate studio logo URL:", error);
    }
  }

  const hasAccess = await hasGalleryAccess(shareId);

  if (!hasAccess) {
    return (
      <GalleryAccessModal
        shareId={shareId}
        studioName={event.studio?.name ?? "Studio"}
        studioLogoUrl={studioLogoUrl}
      />
    );
  }

  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      event: {
        shareId: shareId,
      },
    },
    select: {
      id: true,
      name: true,
      eventId: true,
      parentId: true,
      selectionStatus: true,

      event: {
        select: {
          galleryMode: true,
          maxSelections: true,

          studio: {
            select: {
              name: true,
              logoUrl: true,
              logoStorageKey: true,
              logoOptimizedKey: true,
              logoZoom: true,
              logoPositionX: true,
              logoPositionY: true,
              phone: true,
              address: true,
              city: true,
              state: true,
            },
          },
        },
      },

      images: {
        select: {
          id: true,
          imageUrl: true,
          fileName: true,
          isSelected: true,
          comment: true,

          storageKey: true,
          optimizedKey: true,
          thumbnailKey: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!folder) {
    return <div>Folder not found</div>;
  }

  // Generate private R2 signed URL for Studio Logo
  let studioBrandingData = folder.event.studio;

  if (studioBrandingData) {
    const studioLogoKey =
      studioBrandingData.logoOptimizedKey ||
      studioBrandingData.logoStorageKey;

    if (studioLogoKey) {
      try {
        const studioLogoUrl = await getSignedUrl(
          r2,
          new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: studioLogoKey,
          }),
          { expiresIn: 3600 }
        );

        studioBrandingData = {
          ...studioBrandingData,
          logoUrl: studioLogoUrl,
        };
      } catch (error) {
        console.error(
          "Failed to generate Studio logo URL:",
          error
        );
      }
    }
  }

  // Generate private R2 signed URLs for client gallery
  const imagesWithSignedUrls = await Promise.all(
    folder.images.map(async (image) => {
      const fullImageKey = image.optimizedKey || image.storageKey;

      const thumbnailKey =
        image.thumbnailKey ||
        image.optimizedKey ||
        image.storageKey;

      // Legacy images fallback
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
          `Failed to generate client image URLs for ${image.id}:`,
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

  let maxSelections: number | null = null;

  if (folder.event.galleryMode === "single") {
    maxSelections = folder.event.maxSelections;
  } else if (folder.parentId) {
    const parentFolder = await prisma.folder.findFirst({
      where: {
        id: folder.parentId,
        eventId: folder.eventId,
      },
      select: {
        maxSelections: true,
      },
    });

    maxSelections = parentFolder?.maxSelections ?? null;
  }

  /*
   * Selection Summary
   *
   * SINGLE MODE:
   * Only the currently opened folder is included.
   *
   * BRIDE & GROOM MODE:
   * Only the child folders belonging to the
   * currently opened folder's parent are included.
   */

  const categoryFolders =
    folder.event.galleryMode === "bride_groom" && folder.parentId
      ? await prisma.folder.findMany({
        where: {
          eventId: folder.eventId,
          parentId: folder.parentId,
        },
        select: {
          id: true,
          name: true,
          images: {
            where: {
              isSelected: true,
            },
            select: {
              id: true,
            },
          },
        },
      })
      : await prisma.folder.findMany({
        where: {
          eventId: folder.eventId,
          parentId: null,
        },
        select: {
          id: true,
          name: true,
          images: {
            where: {
              isSelected: true,
            },
            select: {
              id: true,
            },
          },
        },
      });

  const selectionSummary: SelectionCategory[] =
    categoryFolders.map((category) => ({
      folderId: category.id,
      folderName: category.name,
      selectedCount: category.images.length,
    }));

  return (
    <ClientFolderPage
      images={imagesWithSignedUrls}
      folderName={folder.name}
      folderId={folder.id}
      shareId={shareId}
      maxSelections={maxSelections}
      parentId={folder.parentId}
      selectionSummary={selectionSummary}
      selectionStatus={folder.selectionStatus}
      studio={studioBrandingData}
    />
  );
}