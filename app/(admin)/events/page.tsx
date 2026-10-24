import EventsList from "@/components/admin/EventsList";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
        },
      },
    },
  });

  const serializedEvents = events.map(({ folders, ...event }) => {
    /*
     * SINGLE MODE
     * --------------------------------
     * Keep the existing behavior exactly as it was.
     *
     * Top-level folders are selectable categories.
     */
    if (event.galleryMode !== "bride_groom") {
      const selectableFolders = folders.filter(
        (folder) => !folder.parentId,
      );

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
        createdAt: event.createdAt.toISOString(),
        eventDate: event.eventDate?.toISOString() ?? null,
        selectionStatus,
        parentStatuses: [],
      };
    }

    /*
     * BRIDE & GROOM MODE
     * --------------------------------
     * Parent folders are containers.
     * Their child folders are the selectable categories.
     *
     * We calculate each parent independently.
     *
     * Example:
     *
     * Bride
     *   ├── Wedding       COMPLETED
     *   └── Reception     COMPLETED
     *
     * Groom
     *   ├── Wedding       COMPLETED
     *   └── Reception     SELECTING
     *
     * Bride  -> COMPLETED
     * Groom  -> SELECTING
     * Event  -> SELECTING
     */

    const parentFolders = folders.filter(
      (folder) => !folder.parentId,
    );

    const parentStatuses = parentFolders.map((parent) => {
      const childFolders = folders.filter(
        (folder) => folder.parentId === parent.id,
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

    /*
     * The overall event is completed ONLY when
     * every parent has at least one child folder
     * and every child's selection is completed.
     */
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
      createdAt: event.createdAt.toISOString(),
      eventDate: event.eventDate?.toISOString() ?? null,
      selectionStatus,
      parentStatuses,
    };
  });

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