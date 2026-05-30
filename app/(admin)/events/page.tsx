import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

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
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                {event.eventType}
              </span>
            </div>

            <h2 className="mt-5 text-xl font-semibold">{event.name}</h2>

            <p className="mt-2 text-sm text-zinc-400">
              Client: {event.clientName}
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/events/${event.id}`}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm transition hover:bg-zinc-700"
              >
                Open
              </Link>

              <Link
                href={`/events/${event.id}/folders`}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
              >
                Folders
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
