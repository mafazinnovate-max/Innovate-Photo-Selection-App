import ClientFolderPage from "@/components/gallery/client-folder-page";

import { prisma } from "@/lib/prisma";

interface FolderPageProps {
  params: Promise<{
    shareId: string;
    folderId: string;
  }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { shareId, folderId } = await params;
  console.log(shareId, 'checking shareId in folder page')

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    include: {
      images: {
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
