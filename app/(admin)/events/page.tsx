import EventsList from "@/components/admin/EventsList";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

export const dynamic = "force-dynamic";

async function getEventCoverUrl(
  coverImageKey: string | null,
  legacyCoverImageUrl: string | null,
) {
  if (!coverImageKey) return legacyCoverImageUrl;

  try {
    return await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: coverImageKey,
      }),
      { expiresIn: 3600 },
    );
  } catch (error) {
    console.error("Event cover signed URL error:", error);
    return legacyCoverImageUrl;
  }
}

export default async function EventsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const session = await verifyAuthToken(token);

  if (!session || session.role !== "admin" || !session.studioId) {
    return null;
  }

  const events = await prisma.event.findMany({
    where: {
      studioId: session.studioId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      folders: {
        select: {
          id: true,
          name: true,
          parentId: true,
          selectionStatus: true,
          deletedAt: true,
        },
      },
    },
  });

  const serializedEvents = await Promise.all(
    events.map(async ({ folders, ...event }) => {
      const activeFolders = folders.filter((folder) => !folder.deletedAt);
      const coverImageUrl = await getEventCoverUrl(
        event.coverImageKey,
        event.coverImageUrl,
      );

      /*
       * SINGLE MODE
       */
      if (event.galleryMode !== "bride_groom") {
        const selectableFolders = activeFolders.filter((folder) => !folder.parentId);

        const completedSelectableFolders = selectableFolders.filter(
          (folder) => folder.selectionStatus === "COMPLETED",
        );

        const allCategoriesCompleted =
          selectableFolders.length > 0 &&
          completedSelectableFolders.length ===
          selectableFolders.length;

        const selectionStatus =
          selectableFolders.length === 0
            ? null
            : allCategoriesCompleted
              ? "COMPLETED"
              : "SELECTING";

        return {
          ...event,
          coverImageUrl,
          createdAt: event.createdAt.toISOString(),
          eventDate: event.eventDate?.toISOString() ?? null,
          selectionStatus,
          parentStatuses: [],
        };
      }

      /*
       * BRIDE & GROOM MODE
       */
     const parentFolders = activeFolders.filter((folder) => !folder.parentId);

      const parentStatuses = parentFolders.map((parent) => {
        const childFolders = activeFolders.filter(
  (item) => item.parentId === parent.id,
);
        const completedChildFolders = childFolders.filter(
          (folder) => folder.selectionStatus === "COMPLETED",
        );

        const allChildFoldersCompleted =
          childFolders.length > 0 &&
          completedChildFolders.length === childFolders.length;

        return {
          id: parent.id,
          name: parent.name,
          status:
            childFolders.length === 0
              ? "SELECTING"
              : allChildFoldersCompleted
                ? "COMPLETED"
                : "SELECTING",
          completedCount: completedChildFolders.length,
          totalCount: childFolders.length,
        };
      });

      const allParentsCompleted =
        parentStatuses.length > 0 &&
        parentStatuses.every(
          (parent) => parent.status === "COMPLETED",
        );

      const selectionStatus =
        parentFolders.length === 0
          ? null
          : allParentsCompleted
            ? "COMPLETED"
            : "SELECTING";

      return {
        ...event,
        coverImageUrl,
        createdAt: event.createdAt.toISOString(),
        eventDate: event.eventDate?.toISOString() ?? null,
        selectionStatus,
        parentStatuses,
      };
    }),
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>

          <p className="mt-2 text-zinc-400">
            Manage all client galleries.
          </p>
        </div>
      </div>

      <EventsList events={serializedEvents} />
    </div>
  );
}