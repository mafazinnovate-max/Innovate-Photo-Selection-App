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

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    select: {
      id: true,
      name: true,
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

  return (
    <ClientFolderPage
      images={folder.images}
      folderName={folder.name}
      folderId={folder.id}
      shareId={shareId}
    />
  );
}
