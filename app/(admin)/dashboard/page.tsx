import Link from "next/link";
import {
  CalendarDays,
  Images,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  ImagePlus,
  Settings,
  FolderOpen,
  Camera,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import RecentEvents from "@/components/admin/recent-events";

export const dynamic = "force-dynamic";



export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const session = await verifyAuthToken(token);

  if (
    !session ||
    session.role !== "admin" ||
    !session.studioId
  ) {
    return null;
  }

  const studioId = session.studioId;

 const [totalEvents, totalPhotos, selectedPhotos, recentEventsData] =
  await Promise.all([
    prisma.event.count({
      where: {
        studioId,
      },
    }),

    prisma.image.count({
      where: {
        folder: {
          event: {
            studioId,
          },
        },
      },
    }),

    prisma.image.count({
      where: {
        isSelected: true,
        folder: {
          event: {
            studioId,
          },
        },
      },
    }),

    prisma.event.findMany({
      where: {
        studioId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        clientName: true,
        eventType: true,
        eventDate: true,
        folders: {
          select: {
            id: true,
            name: true,
            images: {
              select: {
                isSelected: true,
              },
            },
          },
        },
      },
    }),
  ]);

const recentEvents = recentEventsData.map((event) => {
  const categories = event.folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    totalPhotos: folder.images.length,
    selectedPhotos: folder.images.filter(
      (image) => image.isSelected
    ).length,
  }));

  const eventTotalPhotos = categories.reduce(
    (total, category) => total + category.totalPhotos,
    0
  );

  const eventSelectedPhotos = categories.reduce(
    (total, category) => total + category.selectedPhotos,
    0
  );

  return {
    id: event.id,
    name: event.name,
    clientName: event.clientName,
    eventType: event.eventType,
    eventDate: event.eventDate?.toISOString() ?? null,
    categories,
    totalPhotos: eventTotalPhotos,
    selectedPhotos: eventSelectedPhotos,
  };
});

  const stats = [
    {
      title: "Total Events",
      value: totalEvents,
      icon: CalendarDays,
      description: "All your events",
    },
    {
      title: "Total Photos",
      value: totalPhotos,
      icon: Images,
      description: "Photos across your events",
    },
    {
      title: "Selected Photos",
      value: selectedPhotos,
      icon: CheckCircle2,
      description: "Photos selected by clients",
    },
    {
      title: "Pending Selection",
      value: Math.max(totalPhotos - selectedPhotos, 0),
      icon: Clock,
      description: "Photos not selected yet",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-400">
          Overview of your studio and client galleries.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-white">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {stat.description}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-800 p-3">
                  <Icon className="h-5 w-5 text-zinc-300" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    

      {/* Recent Events */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Recent Events
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Your latest client galleries.
            </p>
          </div>

          <Link
            href="/events"
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <RecentEvents events={recentEvents} />
      </div>
    </div>
  );
}