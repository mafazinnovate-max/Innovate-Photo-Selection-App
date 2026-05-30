"use client";

import { createFolder } from "@/actions/create-folder";
import { useState } from "react";

interface Folder {
  id: string;
  name: string;
}

interface FoldersPageProps {
  eventId: string;
  initialFolders: Folder[];
}

export default function FoldersPage({
  eventId,
  initialFolders,
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
    <div className="mx-auto max-w-5xl">
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

      {/* Folder Grid */}
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <h2 className="text-xl font-semibold">{folder.name}</h2>

            <p className="mt-2 text-sm text-zinc-400">
              Ready for image uploads
            </p>

            <a
              href={`/events/${eventId}/folders/${folder.id}`}
              className="mt-5 inline-flex rounded-xl bg-zinc-800 px-4 py-2 text-sm transition hover:bg-zinc-700"
            >
              Open Folder
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
