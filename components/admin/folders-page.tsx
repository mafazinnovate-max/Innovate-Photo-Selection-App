"use client";

import { createFolder } from "@/actions/create-folder";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Folder {
  id: string;
  name: string;
}

interface FoldersPageProps {
  eventId: string;
  initialFolders: Folder[];
  event: {
    name: string;
    eventType: string;
    clientName: string;
    description?: string | null;
    coverImageUrl?: string | null;
    coverPosition?: number;
    eventDate?: string | null;
  };
}

export default function FoldersPage({
  eventId,
  initialFolders,
  event,
}: FoldersPageProps) {
  const [folderName, setFolderName] = useState("");

  const [folders, setFolders] = useState(initialFolders);

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName) return;

    try {
      setIsCreating(true);

      const response = await createFolder({
        name: folderName,
        eventId,
      });

      if (response.success && response.folder) {
        setFolders((prev) => [response.folder, ...prev]);

        setFolderName("");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative mx-auto mt-10 overflow-hidden rounded-3xl border border-zinc-800">
      {event.coverImageUrl && (
        <>
          <img
            src={event.coverImageUrl}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
        </>
      )}

      <div className="relative p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Folders</h1>

            <p className="mt-2 text-zinc-400">Create folders for this event.</p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
            />

            <button
              onClick={handleCreateFolder}
              disabled={isCreating}
              className="rounded-xl bg-white px-5 py-3 font-medium text-black"
            >
              {isCreating ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </div>

        <div className="mt-10">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
            {event.eventType}
          </span>

          <h2 className="mt-4 text-2xl font-semibold">{event.name}</h2>

          <p className="mt-2 text-zinc-400">Client: {event.clientName}</p>

          <p className="mt-2 text-sm text-zinc-400">
            Date: {event.eventDate
              ? new Date(event.eventDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
              : "No Date"}
          </p>

          {event.description && (
            <p className="mt-4 max-w-2xl text-zinc-400">
              {event.description}
            </p>
          )}
        </div>

        {/* Folder Grid */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {folders.map((folder) => (
            <Link
              href={`/events/${eventId}/folders/${folder.id}`}
              key={folder.id}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-5 h-32"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{folder.name}</h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    Ready for image uploads
                  </p>

                  {/* <a
                href={`/events/${eventId}/folders/${folder.id}`}
                className="mt-5 inline-flex rounded-xl bg-zinc-800 px-4 py-2 text-sm transition hover:bg-zinc-700"
              >
                Open Folder
              </a> */}
                </div>
                <div>
                  <ArrowRight
                    size={18}
                    className={`translate-x-0 opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
