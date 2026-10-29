"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EventCard from "./EventCard";

interface Event {
    id: string;
    name: string;
    clientName: string;
    eventType: string;
    description: string | null;
    phoneNumber: string | null;
    email: string | null;
    [key: string]: any;
}

const MAIN_EVENT_TYPES = [
    "Wedding",
    "Reception",
    "Birthday",
    "Engagement",
    "Puberty",
];

export default function EventsList({
    events,
}: {
    events: Event[];
}) {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    const filteredEvents = useMemo(() => {
        let result = [...events];

        
      // Tab Filter
if (activeTab !== "All") {
    if (activeTab === "Completed") {
        result = result.filter(
            (event) => event.selectionStatus === "COMPLETED"
        );
    } else if (activeTab === "Selecting") {
        result = result.filter(
            (event) => event.selectionStatus === "SELECTING"
        );
    } else if (activeTab === "Others") {
        result = result.filter(
            (event) =>
                !MAIN_EVENT_TYPES.includes(event.eventType)
        );
    } else {
        result = result.filter(
            (event) => event.eventType === activeTab
        );
    }
}

        // Search Filter
        const searchText = search.toLowerCase().trim();

        if (searchText) {
            result = result.filter((event) =>
                [
                    event.name,
                    event.clientName,
                    event.eventType,
                    event.description,
                    event.phoneNumber,
                    event.email,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value)
                            .toLowerCase()
                            .includes(searchText)
                    )
            );
        }

        return result;
    }, [events, search, activeTab]);

    const tabs = [
    "All",
    ...MAIN_EVENT_TYPES,
    "Others",
    "Completed",
    "Selecting",
];

    return (
        <>
{/* Sticky Search */}
<div className="sticky top-16 z-30 -mx-4 mb-6 bg-zinc-950/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8">
    <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-white md:max-w-md"
    />
</div>

{/* Create Event */}
<div className="mb-6 flex justify-end">
    <Link
        href="/events/create"
        className="rounded-xl bg-white px-5 py-3 font-medium text-black transition transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:opacity-95 hover:shadow-lg active:scale-[0.98]"
    >
        Create Event
    </Link>
</div>

            {/* Tabs */}
            <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition ${activeTab === tab
                                ? "bg-white text-black"
                                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Count */}
            <div className="mb-4 text-sm text-zinc-400">
                {filteredEvents.length} Events Found
            </div>

            {/* Events */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    {filteredEvents.map((event, index) => (
        <div
            key={event.id}
            className="animate-[eventCardEnter_0.5s_ease-out_both]"
            style={{
                animationDelay: `${index * 80}ms`,
            }}
        >
            <EventCard event={event} />
        </div>
    ))}
</div>
            {filteredEvents.length === 0 && (
                <div className="py-16 text-center text-zinc-500">
                    No events found.
                </div>
            )}
        </>
    );
}