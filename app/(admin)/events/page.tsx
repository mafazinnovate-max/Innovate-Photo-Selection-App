import EventCard from "@/components/admin/EventCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>

          <p className="mt-2 text-zinc-400">Manage all client galleries.</p>
        </div>

        <Link
          href="/events/create"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90"
        >
          Create Event
        </Link>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {serializedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
          />
        ))}
      </div>
    </div>
  );
}
