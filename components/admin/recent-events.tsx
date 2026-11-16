"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Camera,
  CheckCircle2,
  Images,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  totalPhotos: number;
  selectedPhotos: number;
  children?: {
    id: string;
    name: string;
    totalPhotos: number;
    selectedPhotos: number;
  }[];
}

interface RecentEvent {
  id: string;
  name: string;
  clientName: string;
  eventType: string;
  eventDate: string | null;
  galleryMode: string;
  categories: Category[];
  totalPhotos: number;
  selectedPhotos: number;
  selectionStatus: string;
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
        const isCompleted = event.selectionStatus === "COMPLETED";
        const isNested = event.galleryMode === "bride_groom";

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

              <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                <span
                  className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
                    isCompleted
                      ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-400"
                      : "border-amber-900/60 bg-amber-950/30 text-amber-400"
                  }`}
                >
                  {isCompleted
                    ? "Client Completed Selecting Photos"
                    : "Client Selecting Photos"}
                </span>

                <div className="flex items-center gap-3">
                  <p className="whitespace-nowrap text-sm text-zinc-400">
                    {event.eventDate
                      ? new Date(
                          event.eventDate
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date not set"}
                  </p>

                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-zinc-400 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
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
                      {event.categories.length}{" "}
                      {isNested ? "parent folders" : "categories"}
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

                          {/* Child folders only for Bride & Groom mode */}
                          {isNested &&
                          category.children &&
                          category.children.length > 0 ? (
                            <div className="mt-4 space-y-2">
                              {category.children.map((child) => (
                                <div
                                  key={child.id}
                                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="truncate text-sm font-medium text-zinc-200">
                                      {child.name}
                                    </span>

                                    <span className="shrink-0 text-xs text-zinc-500">
                                      {child.selectedPhotos}/
                                      {child.totalPhotos}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Images size={14} />
                                Total
                              </div>

                              <p className="mt-1 text-xl font-semibold text-white">
                                {category.totalPhotos.toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <CheckCircle2 size={14} />
                                Selected
                              </div>

                              <p className="mt-1 text-xl font-semibold text-emerald-400">
                                {category.selectedPhotos.toLocaleString(
                                  "en-IN"
                                )}
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