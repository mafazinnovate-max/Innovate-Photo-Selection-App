import ClientFolderPage from "@/components/gallery/client-folder-page";
import GalleryAccessModal from "@/components/gallery/gallery-access-modal";
import { hasGalleryAccess } from "@/lib/gallery-access";

import { prisma } from "@/lib/prisma";

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

export default async function FolderPage({ params }: FolderPageProps) {
  const { shareId, folderId } = await params;

  const hasAccess = await hasGalleryAccess(shareId);

  if (!hasAccess) {
    return <GalleryAccessModal shareId={shareId} />;
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
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          fileName: true,
          isSelected: true,
          comment: true,
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

  const categoryFolders = await prisma.folder.findMany({
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

  const selectionSummary: SelectionCategory[] = categoryFolders.map(
    (category) => ({
      folderId: category.id,
      folderName: category.name,
      selectedCount: category.images.length,
    }),
  );

  return (
    <ClientFolderPage
      images={folder.images}
      folderName={folder.name}
      folderId={folder.id}
      shareId={shareId}
      maxSelections={maxSelections}
      parentId={folder.parentId}
      selectionSummary={selectionSummary}
      selectionStatus={folder.selectionStatus}
    />
  );
}