"use client";

import { createFolder } from "@/actions/create-folder";
import { deleteFolder } from "@/actions/delete-folder";
import { regenerateAccessCode } from "@/actions/regenerate-access-code";
import { updateFolder } from "@/actions/update-folder";
import { ArrowRight, Check, Copy, Link2, Loader2, MoreVertical, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Folder {
  id: string;
  name: string;
  type?: string;
  parentId?: string | null;
  images?: {
    isSelected: boolean;
  }[];
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
    phoneNumber?: string | null;
    email?: string | null;
    galleryMode: "single" | "bride_groom";
    shareId: string;
    accessCode: string;
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
  const isNested = event.galleryMode === "bride_groom";
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState(event.accessCode);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const handleCopyLink = async () => {
    const link =
      isNested && selectedParent
        ? `${window.location.origin}/gallery/${event.shareId}?parentId=${selectedParent}`
        : `${window.location.origin}/gallery/${event.shareId}`;

    await handleCopy(link, "link");
  };

  const handleCreateFolder = async () => {
    if (!folderName) return;

    try {
      setIsCreating(true);

      const response = await createFolder({
        name: folderName,
        eventId,
        type: "general",
        parentId: isNested ? selectedParent ?? undefined : undefined,
      });

      if (response.success && response.folder) {
        setFolders((prev) => [...prev, response.folder]);
        setFolderName("");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreating(false);
    }
  };

  // =========================
  // SPLIT LOGIC
  // =========================
  const parentFolders = isNested
    ? folders.filter((f) => !f.parentId)
    : folders;

  const subFolders = selectedParent
    ? folders.filter((f) => f.parentId === selectedParent)
    : [];

  const getSubFolderCount = (parentId: string) => {
    return folders.filter((f) => f.parentId === parentId).length;
  };

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);

    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const handleRegenerateCode = async () => {
    setIsRegenerating(true);

    try {
      const res = await regenerateAccessCode(eventId); // your API call

      if (res?.accessCode) {
        setAccessCode(res.accessCode);
      }

      // 🚨 IMPORTANT: reset copied state
      setCopiedType(null);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOpenEdit = (folder: Folder) => {
    setSelectedFolder(folder);
    setEditName(folder.name);
    setShowEditModal(true);
    setOpenMenu(null);
  };

  const handleOpenDelete = (folder: Folder) => {
    setSelectedFolder(folder);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedFolder || !editName.trim()) return;

    try {
      setIsSaving(true);

      const res = await updateFolder(
        selectedFolder.id,
        editName,
      );

      if (res.success && res.folder) {
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === selectedFolder.id
              ? {
                ...folder,
                name: res.folder.name,
              }
              : folder,
          ),
        );

        setShowEditModal(false);
        setSelectedFolder(null);
        setEditName("");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;

    try {
      setIsDeleting(true);

      const res = await deleteFolder(
        selectedFolder.id,
      );

      if (res.success) {
        setFolders((prev) =>
          prev.filter(
            (folder) =>
              folder.id !== selectedFolder.id &&
              folder.parentId !== selectedFolder.id,
          ),
        );

        if (
          selectedParent === selectedFolder.id
        ) {
          setSelectedParent(null);
        }

        setShowDeleteModal(false);
        setSelectedFolder(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative mx-auto mt-10 overflow-hidden rounded-3xl border border-zinc-800">

      {/* BACKGROUND */}
      {event.coverImageUrl && (
        <>
          <img
            src={event.coverImageUrl}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: `center ${event.coverPosition ?? 50}%`,
            }}
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
        </>
      )}

      <div className="relative p-8">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Folders</h1>
            <p className="mt-2 text-zinc-400">
              Create folders for this event.
            </p>
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

        {/* EVENT INFO */}
        <div className="mt-10">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
            {event.eventType}
          </span>

          <h2 className="mt-4 text-2xl font-semibold">{event.name}</h2>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <p className="text-zinc-400">Client: {event.clientName}</p>

            <p className="text-sm text-zinc-400">
              Date: {event.eventDate
                ? new Date(event.eventDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
                : "No Date"}
            </p>

            {event.phoneNumber && (
              <p className="max-w-2xl text-zinc-400">
                Phone: {event.phoneNumber}
              </p>
            )}

            {event.email && (
              <p className="max-w-2xl text-zinc-400">
                Email: {event.email}
              </p>
            )}

            {event.description && (
              <p className="max-w-2xl text-zinc-400">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {((isNested && selectedParent) || (!isNested)) && (
          <div className="mt-8 flex flex-col gap-4 md:flex-row">
            {/* COPY LINK */}
            <button
              onClick={handleCopyLink}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 md:min-w-[350px] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2">
                  <Link2 size={18} />
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-white">
                    Gallery Link
                  </p>

                  <p className="text-xs text-zinc-400">
                    Copy client gallery URL
                  </p>
                </div>
              </div>

              {copiedType === "link" ? (
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check size={18} />
                  <span className="text-xs">Copied</span>
                </div>
              ) : (
                <Copy
                  size={18}
                  className="text-zinc-400 transition-transform group-hover:scale-110"
                />
              )}
            </button>

            {/* COPY CODE */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopy(accessCode, "code")}
                className="group flex flex-1 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 md:min-w-[350px] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold tracking-widest">
                    {accessCode}
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      Access Code
                    </p>

                    <p className="text-xs text-zinc-400">
                      Copy gallery access code
                    </p>
                  </div>
                </div>

                {copiedType === "code" ? (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Check size={18} />
                    <span className="text-xs font-medium">
                      Copied
                    </span>
                  </div>
                ) : (
                  <Copy
                    size={18}
                    className="text-zinc-400 transition-all duration-300 group-hover:scale-110"
                  />
                )}
              </button>

              {/* Regenerate */}
              <button
                onClick={handleRegenerateCode}
                disabled={isRegenerating}
                className="group flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 transition-all hover:border-amber-500/40 hover:bg-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCcw
                  size={20}
                  className={`text-amber-400 ${isRegenerating
                    ? "animate-spin"
                    : "transition-transform group-hover:rotate-180"
                    }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* =========================
            SINGLE MODE
        ========================= */}
        {!isNested && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {parentFolders.map((folder) => (
              <div
                key={folder.id}
                className="relative group rounded-2xl border border-zinc-800 bg-zinc-900 p-5 h-32"
              >
                <Link
                  key={folder.id}
                  href={`/events/${eventId}/folders/${folder.id}`}
                  onClick={() => setIsNavigating(true)}
                // className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-5 h-32"
                >
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{folder.name}</h2>
                      <p className="text-sm text-zinc-400">Open Gallery</p>
                    </div>

                    <ArrowRight
                      size={18}
                      className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all"
                    />
                  </div>

                  <p className="mt-2 text-xs text-zinc-400">
                    {folder.images?.filter((i) => i.isSelected).length ?? 0} /{" "}
                    {folder.images?.length ?? 0} Images
                  </p>
                </Link>
                <div
                  ref={openMenu === folder.id ? menuRef : null}
                  className="absolute bottom-3 right-3"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(
                        openMenu === folder.id
                          ? null
                          : folder.id,
                      );
                    }}
                    className="rounded-lg p-2 hover:bg-zinc-800"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenu === folder.id && (
                    <div className="absolute bottom-8 right-0 flex p-1 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
                      <button
                        onClick={() =>
                          handleOpenEdit(folder)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-700"
                      >
                        <Pencil size={12} />
                      </button>

                      <button
                        onClick={() =>
                          handleOpenDelete(folder)
                        }
                        className="rounded-lg p-2 text-red-500 transition hover:bg-zinc-800"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================
            BRIDE_GROOM MODE - PARENT
        ========================= */}
        {isNested && !selectedParent && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {parentFolders.map((folder) => {
              const subCount = getSubFolderCount(folder.id);

              return (
                <div className="relative group">
                  <div
                    key={folder.id}
                    onClick={() => setSelectedParent(folder.id)}
                    className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-5 h-32"
                  >
                    <div className="flex justify-between">
                      <h2 className="text-xl font-semibold">{folder.name}</h2>

                      <ArrowRight
                        size={18}
                        className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all"
                      />
                    </div>

                    <p className="text-sm text-zinc-400 mt-2">
                      Open Album
                    </p>

                    {/* ✅ NEW: SUB FOLDER COUNT */}
                    <p className="mt-3 text-xs text-zinc-400">
                      {subCount} Albums
                    </p>

                  </div>
                  <div
                    ref={openMenu === folder.id ? menuRef : null}
                    className="absolute bottom-3 right-3"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(
                          openMenu === folder.id
                            ? null
                            : folder.id,
                        );
                      }}
                      className="rounded-lg p-2 hover:bg-zinc-800"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === folder.id && (
                      <div className="absolute bottom-8 right-0 flex p-1 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
                        <button
                          onClick={() =>
                            handleOpenEdit(folder)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-700"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          onClick={() =>
                            handleOpenDelete(folder)
                          }
                          className="rounded-lg p-2 text-red-500 transition hover:bg-zinc-800"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================
            BRIDE_GROOM MODE - CHILD
        ========================= */}
        {isNested && selectedParent && (
          <>
            <button
              onClick={() => setSelectedParent(null)}
              className="my-3 rounded-xl bg-zinc-800 px-4 py-2 text-white cursor-pointer"
            >
              ← Back
            </button>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {subFolders.map((folder) => (
                <div className="relative group rounded-2xl border border-zinc-800 bg-zinc-900 p-5 h-32">
                  <Link
                    key={folder.id}
                    href={`/events/${eventId}/folders/${folder.id}`}
                    onClick={() => setIsNavigating(true)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {folder.name}
                        </h2>

                        <p className="text-sm text-zinc-400">
                          Open Gallery
                        </p>
                      </div>

                      <ArrowRight
                        size={18}
                        className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all"
                      />
                    </div>

                    <p className="mt-2 text-xs text-zinc-400">
                      {folder.images?.filter((i) => i.isSelected).length ?? 0} /{" "}
                      {folder.images?.length ?? 0} Images
                    </p>
                  </Link>
                  <div
                    ref={openMenu === folder.id ? menuRef : null}
                    className="absolute bottom-3 right-3"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(
                          openMenu === folder.id
                            ? null
                            : folder.id,
                        );
                      }}
                      className="rounded-lg p-2 hover:bg-zinc-800"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === folder.id && (
                      <div className="absolute bottom-8 right-0 flex p-1 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
                        <button
                          onClick={() =>
                            handleOpenEdit(folder)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-700"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          onClick={() =>
                            handleOpenDelete(folder)
                          }
                          className="rounded-lg p-2 text-red-500 transition hover:bg-zinc-800"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {showEditModal && selectedFolder && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5"
          onClick={() =>
            setShowEditModal(false)
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h2 className="text-2xl font-bold">
              Edit Folder
            </h2>

            <input
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              className="mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-3"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 rounded-xl bg-white px-4 py-3 text-black disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedFolder && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5"
          onClick={() =>
            setShowDeleteModal(false)
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h2 className="text-2xl font-bold text-red-500">
              Delete Folder
            </h2>

            <p className="mt-4 text-zinc-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {selectedFolder.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  setShowDeleteModal(false)
                }
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-3"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteFolder}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-white disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isNavigating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}