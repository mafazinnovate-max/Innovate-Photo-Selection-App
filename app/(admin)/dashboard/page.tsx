import Link from "next/link";
import {
  CalendarDays,
  Images,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import RecentEvents from "@/components/admin/recent-events";
import PastEvents from "@/components/admin/past-events";
import SubscriptionCard from "@/components/admin/subscription-card";
import AnimatedStatValue from "@/components/admin/animated-stat-value";

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

  const [
    totalEvents,
    totalPhotos,
    selectedPhotos,
    subscription,
    recentEventsData,
    pastEventsData,
  ] = await Promise.all([
    // Active events only
    prisma.event.count({
      where: {
        studioId,
        deletedAt: null,
      },
    }),

    // Photos belonging to active events only
    prisma.image.count({
      where: {
        folder: {
          event: {
            studioId,
            deletedAt: null,
          },
        },
      },
    }),

    // Selected photos belonging to active events only
    prisma.image.count({
      where: {
        isSelected: true,
        folder: {
          event: {
            studioId,
            deletedAt: null,
          },
        },
      },
    }),

    // Latest subscription for this admin's studio
    prisma.subscription.findFirst({
      where: {
        studioId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        plan: true,
        status: true,
        startDate: true,
        endDate: true,
        storageLimitGb: true,
        maxEvents: true,
        maxCustomers: true,
        maxImages: true,
        price: true,
      },
    }),

    // Recent active events only
    prisma.event.findMany({
      where: {
        studioId,
        deletedAt: null,
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
        galleryMode: true,
        folders: {
          select: {
            id: true,
            name: true,
            parentId: true,
            selectionStatus: true,
            images: {
              select: {
                isSelected: true,
              },
            },
          },
        },
      },
    }),

    // Past / archived events
    prisma.event.findMany({
      where: {
        studioId,
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        clientName: true,
        eventType: true,
        description: true,
        phoneNumber: true,
        email: true,
        eventDate: true,
        createdAt: true,
        deletedAt: true,
        galleryMode: true,
        folders: {
          select: {
            id: true,
            name: true,
            parentId: true,
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

  const subscriptionInfo = subscription
    ? {
        id: subscription.id,
        plan: subscription.plan,
        price: subscription.price,
        status: subscription.status,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate?.toISOString() ?? null,
        storageLimitGb: subscription.storageLimitGb,
        maxEvents: subscription.maxEvents,
        maxCustomers: subscription.maxCustomers,
        maxImages: subscription.maxImages,
      }
    : null;

  const recentEvents = recentEventsData.map((event) => {
    const isNested = event.galleryMode === "bride_groom";

    let categories;

    if (isNested) {
      /*
       * Bride & Groom mode:
       * Show only parent folders as the main categories.
       * Their child folders stay inside the respective parent.
       */
      const parentFolders = event.folders.filter(
        (folder) => !folder.parentId
      );

      categories = parentFolders.map((parent) => {
        const childFolders = event.folders.filter(
          (folder) => folder.parentId === parent.id
        );

        const children = childFolders.map((child) => ({
          id: child.id,
          name: child.name,
          totalPhotos: child.images.length,
          selectedPhotos: child.images.filter(
            (image) => image.isSelected
          ).length,
        }));

        return {
          id: parent.id,
          name: parent.name,
          totalPhotos: children.reduce(
            (total, child) => total + child.totalPhotos,
            0
          ),
          selectedPhotos: children.reduce(
            (total, child) => total + child.selectedPhotos,
            0
          ),
          children,
        };
      });
    } else {
      /*
       * Single mode:
       * Keep the existing behaviour exactly as it is.
       */
      categories = event.folders
        .filter((folder) => !folder.parentId)
        .map((folder) => ({
          id: folder.id,
          name: folder.name,
          totalPhotos: folder.images.length,
          selectedPhotos: folder.images.filter(
            (image) => image.isSelected
          ).length,
          children: [],
        }));
    }

    const eventTotalPhotos = event.folders.reduce(
      (total, folder) => total + folder.images.length,
      0
    );

    const eventSelectedPhotos = event.folders.reduce(
      (total, folder) =>
        total +
        folder.images.filter(
          (image) => image.isSelected
        ).length,
      0
    );

    const selectableFolders = isNested
      ? event.folders.filter((folder) => folder.parentId)
      : event.folders.filter((folder) => !folder.parentId);

    const allCategoriesCompleted =
      selectableFolders.length > 0 &&
      selectableFolders.every(
        (folder) => folder.selectionStatus === "COMPLETED"
      );

    return {
      id: event.id,
      name: event.name,
      clientName: event.clientName,
      eventType: event.eventType,
      eventDate: event.eventDate?.toISOString() ?? null,
      galleryMode: event.galleryMode,
      categories,
      totalPhotos: eventTotalPhotos,
      selectedPhotos: eventSelectedPhotos,
      selectionStatus: allCategoriesCompleted
        ? "COMPLETED"
        : "SELECTING",
    };
  });

  const pastEvents = pastEventsData.map((event) => {
    const totalPhotos = event.folders.reduce(
      (total, folder) => total + folder.images.length,
      0
    );

    const selectedPhotos = event.folders.reduce(
      (total, folder) =>
        total +
        folder.images.filter(
          (image) => image.isSelected
        ).length,
      0
    );

    return {
      id: event.id,
      name: event.name,
      clientName: event.clientName,
      eventType: event.eventType,
      description: event.description,
      phoneNumber: event.phoneNumber,
      email: event.email,
      eventDate: event.eventDate?.toISOString() ?? null,
      createdAt: event.createdAt.toISOString(),
      deletedAt: event.deletedAt?.toISOString() ?? null,
      galleryMode: event.galleryMode,
      totalPhotos,
      selectedPhotos,
    };
  });

  const stats = [
    {
      title: "Total Events",
      value: totalEvents,
      icon: CalendarDays,
      description: "All active events",
    },
    {
      title: "Total Photos",
      value: totalPhotos,
      icon: Images,
      description: "Photos across active events",
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
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-zinc-600 hover:bg-zinc-[950] hover:shadow-2xl hover:shadow-black/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-white">
                   <AnimatedStatValue value={stat.value} />
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

      {/* Subscription */}
      <div>
        <SubscriptionCard subscription={subscriptionInfo} />
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
            className="group flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
          >
            View all
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 px-4 py-1 shadow-inner shadow-white/[0.02] sm:px-5">
          <RecentEvents events={recentEvents} />
        </div>
      </div>

      {/* Section Transition */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        <div className="relative rounded-full border border-zinc-800 bg-zinc-950 px-4 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Archived
          </span>
        </div>
      </div>

      {/* Past Events */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Past Events
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Completed events archived from your active events.
          </p>
        </div>

        <PastEvents events={pastEvents} />
      </div>
    </div>
  );
}