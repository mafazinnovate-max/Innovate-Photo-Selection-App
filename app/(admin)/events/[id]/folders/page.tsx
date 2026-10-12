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
    include: {
      images: {
        select: {
          id: true,
          fileName: true,
          imageUrl: true,
          isSelected: true,
        },
      },
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
    return <div>Event not found</div>;
  }

  return (
    <FoldersPage
      eventId={id}
      initialFolders={folders}
      event={{
        ...event,
        eventDate: event.eventDate?.toISOString() ?? null,
        galleryMode:
          event.galleryMode === "bride_groom"
            ? "bride_groom"
            : "single",
      }}
    />
  );
}