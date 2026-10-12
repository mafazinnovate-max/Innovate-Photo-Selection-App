
"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Camera,
  CheckCircle2,
  Images,
} from "lucide-react";

interface RecentEvent {
  id: string;
  name: string;
  clientName: string;
  eventType: string;
  eventDate: string | null;
  categories: {
    id: string;
    name: string;
    totalPhotos: number;
    selectedPhotos: number;
  }[];
  totalPhotos: number;
  selectedPhotos: number;
}

export default function RecentEvents({
  events,
}: {
  events: RecentEvent[];
}) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(
    null
  );

  return (
    <div className="divide-y divide-zinc-800">
      {events.map((event) => {
        const isExpanded = expandedEvent === event.id;

        return (
          <div key={event.id} className="py-4">
            {/* Event row */}
            <button
              type="button"
              onClick={() =>
                setExpandedEvent(isExpanded ? null : event.id)
              }
              aria-expanded={isExpanded}
              className="flex w-full flex-col gap-3 text-left transition hover:bg-zinc-800/30 sm:flex-row sm:items-center sm:justify-between sm:rounded-xl sm:px-3 sm:py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="shrink-0 rounded-xl bg-zinc-800 p-3">
                  <CalendarDays
                    size={20}
                    className="text-zinc-300"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-medium text-white">
                    {event.name}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {event.clientName} · {event.eventType}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="text-sm text-zinc-400">
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Date not set"}
                </p>

                <ChevronDown
                  size={20}
                  className={`shrink-0 text-zinc-400 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Expanded details */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-white">
                      Categories
                    </h4>
                    <span className="text-xs text-zinc-500">
                      {event.categories.length} categories
                    </span>
                  </div>

                  {event.categories.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-800 py-8 text-center">
                      <Camera
                        size={24}
                        className="mx-auto text-zinc-600"
                      />
                      <p className="mt-2 text-sm text-zinc-500">
                        No categories available.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {event.categories.map((category) => (
                        <div
                          key={category.id}
                          className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                        >
                          <h5 className="truncate font-medium text-white">
                            {category.name}
                          </h5>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Images size={14} />
                                Total
                              </div>
                              <p className="mt-1 text-xl font-semibold text-white">
                                {category.totalPhotos.toLocaleString("en-IN")}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <CheckCircle2 size={14} />
                                Selected
                              </div>
                              <p className="mt-1 text-xl font-semibold text-emerald-400">
                                {category.selectedPhotos.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Event totals */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                      <p className="text-xs text-zinc-400">
                        Total Images
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {event.totalPhotos.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
                      <p className="text-xs text-zinc-400">
                        Total Selected Images
                      </p>
                      <p className="mt-2 text-2xl font-bold text-emerald-400">
                        {event.selectedPhotos.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}