"use client";

import { createFolder } from "@/actions/create-folder";
import { deleteFolder } from "@/actions/delete-folder";
import { regenerateAccessCode } from "@/actions/regenerate-access-code";
import { updateFolder } from "@/actions/update-folder";
import { updateMaxSelections } from "@/actions/update-max-selections";
import {
  ArrowRight,
  Check,
  Copy,
  Link2,
  Loader2,
  MoreVertical,
  Pencil,
  RefreshCcw,
  Trash2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SelectionStatus = "SELECTING" | "COMPLETED";

interface Folder {
  id: string;
  name: string;
  type?: string;
  parentId?: string | null;
  maxSelections?: number | null;
  selectionStatus?: SelectionStatus;
  images?: {
    id: string;
    fileName: string | null;
    imageUrl: string;
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
    maxSelections?: number | null;
  };
}

export default function FoldersPage({
  eventId,
  initialFolders,
  event,
}: FoldersPageProps) {
  const [folderName, setFolderName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const [maxSelections, setMaxSelections] = useState(
    event.maxSelections?.toString() ?? "",
  );

  const [isLoading, setIsLoading] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (event.galleryMode === "single") {
      setMaxSelections(event.maxSelections?.toString() ?? "");
      return;
    }

    const currentParent = folders.find(
      (folder) => folder.id === selectedParent,
    );

    setMaxSelections(currentParent?.maxSelections?.toString() ?? "");
  }, [selectedParent, folders, event.galleryMode, event.maxSelections]);

  useEffect(() => {
    const handleClickOutside = (mouseEvent: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(mouseEvent.target as Node)
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
        parentId: isNested
          ? selectedParent ?? undefined
          : undefined,
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

  // =========================
  // CLIENT SELECTION STATUS
  // =========================

  /*
   * In single mode:
   *   Every top-level folder is an actual selectable category.
   *
   * In bride_groom mode:
   *   Parent folders are containers.
   *   Child folders are the actual selectable categories.
   */

  const selectableFolders = isNested
    ? folders.filter((folder) => folder.parentId)
    : folders.filter((folder) => !folder.parentId);

  const completedSelectableFolders = selectableFolders.filter(
    (folder) => folder.selectionStatus === "COMPLETED",
  );

  const allCategoriesCompleted =
    selectableFolders.length > 0 &&
    completedSelectableFolders.length === selectableFolders.length;

  const getSelectionStatus = (
    folder: Folder,
  ): SelectionStatus => {
    return folder.selectionStatus === "COMPLETED"
      ? "COMPLETED"
      : "SELECTING";
  };

  const getStatusLabel = (folder: Folder) => {
    return getSelectionStatus(folder) === "COMPLETED"
      ? "Client Selected Photos"
      : "Client Selecting Photos";
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
      const res = await regenerateAccessCode(eventId);

      if (res?.accessCode) {
        setAccessCode(res.accessCode);
      }

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

  const handleSaveMaxSelections = async () => {
    setIsLoading(true);

    const value =
      maxSelections === ""
        ? null
        : Number(maxSelections);

    await updateMaxSelections(
      eventId,
      event.galleryMode === "bride_groom"
        ? selectedParent
        : null,
      value,
    );

    if (
      event.galleryMode === "bride_groom" &&
      selectedParent
    ) {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === selectedParent
            ? {
                ...folder,
                maxSelections: value,
              }
            : folder,
        ),
      );
    }

    setIsLoading(false);
  };

  const matchingImages = folders.flatMap((folder) =>
    (folder.images ?? [])
      .filter((image) =>
        image.fileName
          ?.toLowerCase()
          .includes(searchTerm.trim().toLowerCase()),
      )
      .map((image) => ({
        ...image,
        folderName: folder.name,
        folderId: folder.id,
      })),
  );

  return (
    <div className="relative mx-auto mt-4 w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-800 sm:mt-6 sm:rounded-3xl lg:mt-10">
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

      <div className="relative min-w-0 p-3 sm:p-5 md:p-6 lg:p-8">

        {/* HEADER */}
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold sm:text-3xl">
              Event Folders
            </h1>

            <p className="mt-2 text-zinc-400">
              Create folders for this event.
            </p>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row md:w-auto">
            <input
              type="text"
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-zinc-400"
            />

            <button
              onClick={handleCreateFolder}
              disabled={isCreating}
              className="shrink-0 whitespace-nowrap rounded-xl bg-white px-5 py-3 font-medium text-black"
            >
              {isCreating
                ? "Creating..."
                : "Create Folder"}
            </button>
          </div>
        </div>

        {/* EVENT INFO */}
        <div className="mt-10 min-w-0">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
            {event.eventType}
          </span>

          <h2 className="mt-4 break-words text-xl font-semibold sm:text-2xl">
            {event.name}
          </h2>

          <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
            <p className="min-w-0 break-words text-zinc-400">
              Client: {event.clientName}
            </p>

            <p className="min-w-0 break-words text-sm text-zinc-400">
              Date:{" "}
              {event.eventDate
                ? new Date(
                    event.eventDate,
                  ).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  )
                : "No Date"}
            </p>

            {event.phoneNumber && (
              <p className="min-w-0 max-w-2xl break-words text-zinc-400">
                Phone: {event.phoneNumber}
              </p>
            )}

            {event.email && (
              <p className="min-w-0 max-w-2xl break-words text-zinc-400">
                Email: {event.email}
              </p>
            )}

            {event.description && (
              <p className="min-w-0 max-w-2xl break-words text-zinc-400">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* =========================
            OVERALL COMPLETION STATUS
        ========================= */}

        {selectableFolders.length > 0 && (
          <div
            className={`mt-6 rounded-2xl border p-4 sm:mt-8 sm:p-5 ${
              allCategoriesCompleted
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-amber-500/20 bg-amber-500/10"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className={`text-sm font-semibold ${
                    allCategoriesCompleted
                      ? "text-emerald-400"
                      : "text-amber-300"
                  }`}
                >
                  {allCategoriesCompleted
                    ? "All Categories Completed — Ready for Edit"
                    : "Client Photo Selection Progress"}
                </p>

                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  {completedSelectableFolders.length} of{" "}
                  {selectableFolders.length} categories completed
                </p>
              </div>

              <div
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                  allCategoriesCompleted
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/10 text-amber-300"
                }`}
              >
                {completedSelectableFolders.length}/
                {selectableFolders.length} Completed
              </div>
            </div>
          </div>
        )}

        {/* PHOTO FILENAME SEARCH */}
        <div className="mt-6 min-w-0 sm:mt-8">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by photo filename..."
              className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-white sm:max-w-xl"
            />
          </div>

          {searchTerm.trim() !== "" && (
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {matchingImages.length > 0 ? (
                matchingImages.map((image) => (
                  <Link
                    key={image.id}
                    href={`/events/${eventId}/folders/${image.folderId}?imageId=${image.id}`}
                    className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-2 transition hover:bg-zinc-800 sm:gap-3 sm:p-3"
                  >
                    <img
                      src={image.imageUrl}
                      alt={
                        image.fileName ?? "Photo"
                      }
                      className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {image.fileName ??
                          "Untitled"}
                      </p>

                      <p className="truncate text-xs text-zinc-400">
                        {image.folderName}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] sm:text-xs ${
                        image.isSelected
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {image.isSelected
                        ? "Selected"
                        : "Not Selected"}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
                  No matching photos found.
                </p>
              )}
            </div>
          )}
        </div>

        {isNested && selectedParent && (
          <button
            onClick={() =>
              setSelectedParent(null)
            }
            className="mt-3 cursor-pointer rounded-xl bg-zinc-800 px-4 py-2 text-white"
          >
            ← Back
          </button>
        )}

        {((isNested && selectedParent) ||
          !isNested) && (
          <>
            {/* LINK + ACCESS CODE ROW */}
            <div className="mt-8 flex min-w-0 flex-wrap gap-4">

              {/* COPY LINK */}
              <button
                onClick={handleCopyLink}
                className="group flex min-w-0 flex-1 basis-[260px] cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 rounded-xl bg-white/10 p-2">
                    <Link2 size={18} />
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-white">
                      Gallery Link
                    </p>

                    <p className="text-xs text-zinc-400">
                      Copy client gallery URL
                    </p>
                  </div>
                </div>

                {copiedType === "link" ? (
                  <div className="flex shrink-0 items-center gap-1 text-emerald-400">
                    <Check size={18} />
                    <span className="text-xs">
                      Copied
                    </span>
                  </div>
                ) : (
                  <Copy
                    size={18}
                    className="shrink-0 text-zinc-400 transition-transform group-hover:scale-110"
                  />
                )}
              </button>

              {/* ACCESS CODE GROUP */}
              <div className="flex flex-1 basis-[320px] items-stretch gap-2 sm:gap-3">

                {/* ACCESS CODE CARD */}
                <button
                  onClick={() =>
                    handleCopy(
                      accessCode,
                      "code",
                    )
                  }
                  className="group flex flex-1 cursor-pointer items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-3 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 sm:gap-3 sm:px-5 sm:py-4"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 rounded-xl bg-white/10 px-2 py-2 text-[11px] font-bold tracking-widest sm:px-3 sm:text-sm">
                      {accessCode}
                    </div>

                    <p className="shrink-0 whitespace-nowrap text-xs font-medium text-white sm:text-sm">
                      Access Code
                    </p>
                  </div>

                  {copiedType === "code" ? (
                    <div className="flex shrink-0 items-center gap-1 text-emerald-400">
                      <Check size={18} />

                      <span className="hidden text-xs font-medium sm:inline">
                        Copied
                      </span>
                    </div>
                  ) : (
                    <Copy
                      size={18}
                      className="shrink-0 text-zinc-400 transition-transform group-hover:scale-110"
                    />
                  )}
                </button>

                {/* REGENERATE */}
                <button
                  onClick={handleRegenerateCode}
                  disabled={isRegenerating}
                  className="group flex w-12 shrink-0 cursor-pointer items-center justify-center self-stretch rounded-xl border border-amber-500/20 bg-amber-500/10 transition-all hover:border-amber-500/40 hover:bg-amber-500/20 disabled:opacity-50 sm:w-[72px] sm:rounded-2xl"
                >
                  <RefreshCcw
                    size={20}
                    className={`shrink-0 text-amber-400 ${
                      isRegenerating
                        ? "animate-spin"
                        : "transition-transform group-hover:rotate-180"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* MAX SELECTION */}
            <div className="mt-6 w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-white/5 p-3 sm:mt-10 sm:w-80 sm:p-5">
              <label className="mb-2 block text-sm font-medium text-white">
                Maximum Photo Selection
              </label>

              <div className="flex min-w-0 items-center gap-2">
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="Unlimited"
                  value={maxSelections}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        "",
                      );

                    setMaxSelections(value);
                  }}
                  className="w-full min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 outline-none focus:border-zinc-400 sm:px-4"
                />

                <button
                  onClick={handleSaveMaxSelections}
                  className="shrink-0 cursor-pointer whitespace-nowrap rounded-xl bg-white px-3 py-3 text-sm text-black transition hover:bg-zinc-200 disabled:opacity-50 sm:px-4 sm:py-2"
                >
                  {isLoading
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>

              <p className="mt-2 text-xs text-zinc-400">
                Leave empty for unlimited selections.
              </p>
            </div>
          </>
        )}

        {/* =========================
            SINGLE MODE
        ========================= */}

        {!isNested && (
          <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {parentFolders.map((folder) => {
              const status =
                getSelectionStatus(folder);

              return (
                <div
                  key={folder.id}
                  className="group relative min-h-32 min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5"
                >
                  <Link
                    href={`/events/${eventId}/folders/${folder.id}`}
                    onClick={() =>
                      setIsNavigating(true)
                    }
                    className="block min-w-0"
                  >
                    <div className="flex min-w-0 justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="break-words text-xl font-semibold">
                          {folder.name}
                        </h2>

                        <p className="text-sm text-zinc-400">
                          Open Gallery
                        </p>
                      </div>

                      <ArrowRight
                        size={18}
                        className="shrink-0 opacity-0 transition-all group-hover:translate-x-2 group-hover:opacity-100"
                      />
                    </div>

                    <p className="mt-2 text-xs text-zinc-400">
                      {folder.images?.filter(
                        (i) => i.isSelected,
                      ).length ?? 0}{" "}
                      /{" "}
                      {folder.images?.length ?? 0}{" "}
                      Images
                    </p>

                    {/* CLIENT STATUS */}
                    <div className="mt-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                          status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {getStatusLabel(folder)}
                      </span>
                    </div>
                  </Link>

                  <div
                    ref={
                      openMenu === folder.id
                        ? menuRef
                        : null
                    }
                    className="absolute bottom-3 right-3"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setOpenMenu(
                          openMenu ===
                            folder.id
                            ? null
                            : folder.id,
                        );
                      }}
                      className="rounded-lg p-2 hover:bg-zinc-800"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === folder.id && (
                      <div className="absolute bottom-8 right-0 flex rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
                        <button
                          onClick={() =>
                            handleOpenEdit(
                              folder,
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-700"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          onClick={() =>
                            handleOpenDelete(
                              folder,
                            )
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
            BRIDE_GROOM MODE - PARENT
        ========================= */}

        {isNested && !selectedParent && (
          <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {parentFolders.map((folder) => {
              const subCount =
                getSubFolderCount(folder.id);

              const completedCount =
                folders.filter(
                  (child) =>
                    child.parentId ===
                      folder.id &&
                    child.selectionStatus ===
                      "COMPLETED",
                ).length;

              return (
                <div
                  key={folder.id}
                  className="group relative min-w-0"
                >
                  <div
                    onClick={() =>
                      setSelectedParent(
                        folder.id,
                      )
                    }
                    className="min-h-32 min-w-0 cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5"
                  >
                    <div className="flex min-w-0 justify-between gap-2">
                      <h2 className="min-w-0 break-words text-xl font-semibold">
                        {folder.name}
                      </h2>

                      <ArrowRight
                        size={18}
                        className="shrink-0 opacity-0 transition-all group-hover:translate-x-2 group-hover:opacity-100"
                      />
                    </div>

                    <p className="mt-2 text-sm text-zinc-400">
                      Open Album
                    </p>

                    <p className="mt-3 text-xs text-zinc-400">
                      {subCount} Albums
                    </p>

                    {/* PARENT PROGRESS */}
                    {subCount > 0 && (
                      <div className="mt-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            completedCount ===
                            subCount
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {completedCount ===
                          subCount
                            ? "All Categories Completed"
                            : `${completedCount}/${subCount} Categories Completed`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    ref={
                      openMenu === folder.id
                        ? menuRef
                        : null
                    }
                    className="absolute bottom-3 right-3"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setOpenMenu(
                          openMenu ===
                            folder.id
                            ? null
                            : folder.id,
                        );
                      }}
                      className="rounded-lg p-2 hover:bg-zinc-800"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === folder.id && (
                      <div className="absolute bottom-8 right-0 flex rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
                        <button
                          onClick={() =>
                            handleOpenEdit(
                              folder,
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-700"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          onClick={() =>
                            handleOpenDelete(
                              folder,
                            )
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
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {subFolders.map((folder) => {
              const status =
                getSelectionStatus(folder);

              return (
                <div
                  key={folder.id}
                  className="group relative min-h-32 min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5"
                >
                  <Link
                    href={`/events/${eventId}/folders/${folder.id}`}
                    onClick={() =>
                      setIsNavigating(true)
                    }
                    className="block min-w-0"
                  >
                    <div className="flex min-w-0 justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="break-words text-xl font-semibold">
                          {folder.name}
                        </h2>

                        <p className="text-sm text-zinc-400">
                          Open Gallery
                        </p>
                      </div>

                      <ArrowRight
                        size={18}
                        className="shrink-0 opacity-0 transition-all group-hover:translate-x-2 group-hover:opacity-100"
                      />
                    </div>

                    <p className="mt-2 text-xs text-zinc-400">
                      {folder.images?.filter(
                        (i) => i.isSelected,
                      ).length ?? 0}{" "}
                      /{" "}
                      {folder.images?.length ?? 0}{" "}
                      Images
                    </p>

                    {/* CLIENT STATUS */}
                    <div className="mt-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                          status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {getStatusLabel(folder)}
                      </span>
                    </div>
                  </Link>

                  <div
                    ref={
                      openMenu === folder.id
                        ? menuRef
                        : null
                    }
                    className="absolute bottom-3 right-3"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setOpenMenu(
                          openMenu ===
                            folder.id
                            ? null
                            : folder.id,
                        );
                      }}
                      className="rounded-lg p-2 hover:bg-zinc-800"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === folder.id && (
                      <div className="absolute bottom-8 right-0 flex rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
                        <button
                          onClick={() =>
                            handleOpenEdit(
                              folder,
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-700"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          onClick={() =>
                            handleOpenDelete(
                              folder,
                            )
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
      </div>

      {/* EDIT MODAL */}
      {showEditModal && selectedFolder && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5"
          onClick={() =>
            setShowEditModal(false)
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="my-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:rounded-3xl sm:p-6"
          >
            <h2 className="break-words text-xl font-bold sm:text-2xl">
              Edit Folder
            </h2>

            <input
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              className="mt-5 w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="w-full flex-1 rounded-xl border border-zinc-700 px-4 py-3"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="w-full flex-1 rounded-xl bg-white px-4 py-3 text-black disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedFolder && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5"
          onClick={() => {
            if (!isDeleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="my-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:rounded-3xl sm:p-6"
          >
            <h2 className="break-words text-xl font-bold text-red-500 sm:text-2xl">
              Delete Folder
            </h2>

            <p className="mt-4 break-words text-zinc-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {selectedFolder.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  setShowDeleteModal(false)
                }
                disabled={isDeleting}
                className="w-full flex-1 rounded-xl border border-zinc-700 px-4 py-3 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteFolder}
                disabled={isDeleting}
                className="w-full flex-1 rounded-xl bg-red-500 px-4 py-3 text-white disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION LOADER */}
      {isNavigating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}