"use client";

import { createEvent } from "@/actions/create-event";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateEventPage() {
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    if (!clientName || !eventName || !eventType) {
      alert("Please fill all fields");

      return;
    }

    try {
      setIsCreating(true);

      const response = await createEvent({
        name: eventName,
        clientName,
        eventType,
        description,
      });

      if (response.success && response.event) {
        router.push(`/events/${response.event.id}`);
      }
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Create Event</h1>

      <p className="mt-2 text-zinc-400">Create a new client event gallery.</p>

      <div className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        {/* Client Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">Client Name</label>

          <input
            type="text"
            placeholder="Enter client name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
          />
        </div>

        {/* Event Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">Event Name</label>

          <input
            type="text"
            placeholder="Wedding of Arjun & Meera"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="mb-2 block text-sm font-medium">Event Type</label>

          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
          >
            <option>Wedding</option>
            <option>Reception</option>
            <option>Birthday</option>
            <option>Engagement</option>
            <option>Puberty</option>
            <option>Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>

          <textarea
            rows={4}
            placeholder="Optional event notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className={`rounded-xl px-6 py-3 font-medium transition ${
            isCreating
              ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
              : "bg-white text-black hover:opacity-90"
          }`}
        >
          {isCreating ? "Creating Event..." : "Create Event"}
        </button>
      </div>
    </div>
  );
}
