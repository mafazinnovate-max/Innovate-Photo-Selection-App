import FoldersPage from "@/components/admin/folders-page";

import { prisma } from "@/lib/prisma";

interface EventFoldersPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventFoldersPage({
  params,
}: EventFoldersPageProps) {
  const { id } = await params;

  const folders = await prisma.folder.findMany({
    where: {
      eventId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <FoldersPage eventId={id} initialFolders={folders} />;
}
