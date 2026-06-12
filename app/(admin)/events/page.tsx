import EventCard from "@/components/admin/EventCard";
import EventsList from "@/components/admin/EventsList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedEvents = events.map((event) => ({
    ...event,
    createdAt: event.createdAt.toISOString(),
    eventDate: event.eventDate?.toISOString() ?? null,
  }));

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