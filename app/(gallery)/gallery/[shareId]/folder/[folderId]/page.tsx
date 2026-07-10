import ClientFolderPage from "@/components/gallery/client-folder-page";
import GalleryAccessModal from "@/components/gallery/gallery-access-modal";
import { hasGalleryAccess } from "@/lib/gallery-access";

import { prisma } from "@/lib/prisma";

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
    return (
      <GalleryAccessModal
        shareId={shareId}
      />
    );
  }

  // const folder = await prisma.folder.findUnique({
  //   where: {
  //     id: folderId,
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     images: {
  //       select: {
  //         id: true,
  //         imageUrl: true,
  //         fileName: true,
  //         isSelected: true,
  //         comment: true,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //     },
  //   },
  // });

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    select: {
      id: true,
      name: true,
      parentId: true,
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

  let maxSelections: number | null = null;

  if (folder?.event.galleryMode === "single") {
    maxSelections = folder.event.maxSelections;
  } else if (folder?.parentId) {
    const parentFolder = await prisma.folder.findUnique({
      where: {
        id: folder.parentId,
      },
      select: {
        maxSelections: true,
      },
    });

    maxSelections = parentFolder?.maxSelections ?? null;
  }

  if (!folder) {
    return <div>Folder not found</div>;
  }

  return (
    <ClientFolderPage
      images={folder.images}
      folderName={folder.name}
      folderId={folder.id}
      shareId={shareId}
      maxSelections={maxSelections}
      parentId={folder.parentId}
    />
  );
}
