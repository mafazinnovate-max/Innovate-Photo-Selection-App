
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useDropzone } from "react-dropzone";
import { useUploadNavigationGuard } from "@/components/admin/upload-navigation-guard";

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status:
    | "pending"
    | "uploading"
    | "processing"
    | "completed"
    | "duplicate"
    | "error";
  uploadedUrl?: string;
  errorMessage?: string;
}

interface UploadDropzoneProps {
  folderId: string;
  hasProcessingImages: boolean;
}

interface PresignResponse {
  success?: boolean;
  duplicate?: boolean;
  uploadUrl?: string;
  storageKey?: string;
  message?: string;
  error?: string;
  code?: string;
}

interface FinalizeResponse {
  success?: boolean;
  duplicate?: boolean;
  message?: string;
  error?: string;
  code?: string;
}

// Thrown when the studio's image limit is reached.
class UploadLimitError extends Error {}

// Detects the studio limit response from the API.
const isStudioLimitError = (
  res: Response,
  data: { message?: string; error?: string; code?: string }
) =>
  data.code === "STUDIO_LIMIT_REACHED" ||
  (!res.ok && /limit/i.test(data.message || data.error || ""));

const MAX_FILES_PER_UPLOAD = 450;

export default function UploadDropzone({
  folderId,
  hasProcessingImages,
}: UploadDropzoneProps) {
  const router = useRouter();

  const { setUploadActive, registerCancelHandler } =
    useUploadNavigationGuard();

  // Navigation guard and cancellation refs.
  const uploadDoneRef = useRef<Promise<void> | null>(null);
  const resolveUploadDoneRef = useRef<(() => void) | null>(null);
  const cancelUploadRef = useRef<() => void>(() => {});

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isRefreshing, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelRequestedRef = useRef(false);
  const activeXhrsRef = useRef<Set<XMLHttpRequest>>(new Set());

  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [studioLimitMessage, setStudioLimitMessage] = useState<string | null>(
    null
  );

  const filesRef = useRef<UploadFile[]>([]);
  const limitReachedRef = useRef(false);

  const BATCH_SIZE = 5;

  const pendingFilesRef = useRef<File[]>([]);

  const pendingProgressRef = useRef<Map<number, number>>(new Map());
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current = [];
    };
  }, []);

  // Revoke remaining preview URLs when the component unmounts.
  useEffect(() => {
    return () => {
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
      }

      pendingProgressRef.current.clear();

      filesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  useEffect(() => {
    if (!hasProcessingImages) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(interval);
  }, [hasProcessingImages, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const currentFiles = filesRef.current;

    // Files already in the queue = visible batch + waiting files.
    const queuedTotal =
      currentFiles.length + pendingFilesRef.current.length;

    const remainingSlots = Math.max(
      0,
      MAX_FILES_PER_UPLOAD - queuedTotal
    );

    const allowedFiles = acceptedFiles.slice(0, remainingSlots);
    const skipped = acceptedFiles.length - allowedFiles.length;

    if (skipped > 0) {
      setLimitMessage(
        `You can upload a maximum of ${MAX_FILES_PER_UPLOAD} images at a time. ${allowedFiles.length} image${allowedFiles.length === 1 ? " was" : "s were"} added and ${skipped} ${skipped === 1 ? "was" : "were"} skipped.`
      );
    } else {
      setLimitMessage(null);
    }

    if (allowedFiles.length === 0) return;

    const newFiles = [
      ...pendingFilesRef.current,
      ...allowedFiles,
    ];

    const activeSlots = Math.max(
      0,
      BATCH_SIZE - currentFiles.length
    );

    const activeFiles = newFiles.slice(0, activeSlots);
    const waitingFiles = newFiles.slice(activeSlots);

    pendingFilesRef.current = waitingFiles;
    setPendingCount(waitingFiles.length);

    if (activeFiles.length > 0) {
      const mappedFiles: UploadFile[] = activeFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "pending",
      }));

      const updatedFiles = [...currentFiles, ...mappedFiles];

      filesRef.current = updatedFiles;
      setFiles(updatedFiles);
    }
  }, []);

  const removeFile = (index: number) => {
    const currentFiles = filesRef.current;
    const item = currentFiles[index];

    if (!item) return;

    setLimitMessage(null);

    URL.revokeObjectURL(item.preview);

    const remaining = currentFiles.filter((_, i) => i !== index);
    const nextFile = pendingFilesRef.current.shift();

    setPendingCount(pendingFilesRef.current.length);

    if (nextFile) {
      remaining.push({
        file: nextFile,
        preview: URL.createObjectURL(nextFile),
        progress: 0,
        status: "pending",
      });
    }

    filesRef.current = remaining;
    setFiles(remaining);
  };

  const getFileHash = async (file: File): Promise<string> => {
    const fileBuffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      fileBuffer
    );

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const updateFile = (
    index: number,
    updates: Partial<UploadFile>
  ) => {
    setFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
    );
  };

  const flushProgressUpdates = () => {
    if (pendingProgressRef.current.size === 0) return;

    const updates = new Map(pendingProgressRef.current);
    pendingProgressRef.current.clear();

    setFiles((prev) =>
      prev.map((item, index) => {
        const progress = updates.get(index);

        return progress === undefined
          ? item
          : { ...item, progress };
      })
    );
  };

  const queueProgressUpdate = (index: number, progress: number) => {
    pendingProgressRef.current.set(index, progress);

    if (progressTimerRef.current !== null) return;

    progressTimerRef.current = setInterval(() => {
      flushProgressUpdates();
    }, 150);
  };

  const stopProgressUpdates = () => {
    if (progressTimerRef.current !== null) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    flushProgressUpdates();
  };

  // Direct browser-to-R2 upload with actual progress and cancellation support.
  const uploadToR2 = (
    uploadUrl: string,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      activeXhrsRef.current.add(xhr);

      const cleanup = () => {
        activeXhrsRef.current.delete(xhr);
      };

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round(
            (event.loaded / event.total) * 95
          );

          onProgress(Math.min(progress, 95));
        }
      };

      xhr.onload = () => {
        cleanup();

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new Error(
              `R2 upload failed. HTTP status: ${xhr.status}`
            )
          );
        }
      };

      xhr.onerror = () => {
        cleanup();
        reject(new Error("Network error during R2 upload."));
      };

      xhr.ontimeout = () => {
        cleanup();
        reject(new Error("R2 upload timed out. Please retry."));
      };

      xhr.onabort = () => {
        cleanup();
        reject(new Error("R2 upload was cancelled."));
      };

      xhr.timeout = 10 * 60 * 1000;
      xhr.send(file);
    });
  };

  const uploadSingleFile = async (
    fileItem: UploadFile,
    index: number
  ): Promise<boolean> => {
    try {
      if (cancelRequestedRef.current) return false;

      const file = fileItem.file;

      updateFile(index, {
        status: "uploading",
        progress: 0,
        errorMessage: undefined,
      });

      // Validate image format.
      if (
        !file.type.startsWith("image/") ||
        file.type === "image/svg+xml"
      ) {
        throw new Error("Only supported image files can be uploaded.");
      }

      // 1. Calculate SHA-256 hash.
      const fileHash = await getFileHash(file);

      if (cancelRequestedRef.current) return false;

      // 2. Request a presigned R2 upload URL.
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId,
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          fileHash,
        }),
      });

      const presignData =
        (await presignResponse.json()) as PresignResponse;

      if (isStudioLimitError(presignResponse, presignData)) {
        throw new UploadLimitError(
          presignData.message ||
            presignData.error ||
            "Upload limit reached."
        );
      }

      if (!presignResponse.ok || !presignData.success) {
        throw new Error(
          presignData.message ||
            presignData.error ||
            "Unable to prepare image upload."
        );
      }

      if (cancelRequestedRef.current) return false;

      // 3. Duplicate already exists in this event.
      if (presignData.duplicate) {
        updateFile(index, {
          status: "duplicate",
          progress: 100,
          uploadedUrl: "duplicate",
        });

        setUploadedCount((prev) => prev + 1);

        return true;
      }

      if (!presignData.uploadUrl || !presignData.storageKey) {
        throw new Error("Invalid R2 upload response.");
      }

      // 4. Upload original file directly to R2.
      await uploadToR2(
        presignData.uploadUrl,
        file,
        (progress) => {
          queueProgressUpdate(index, progress);
        }
      );

      flushProgressUpdates();

      if (cancelRequestedRef.current) return false;

      updateFile(index, {
        status: "processing",
        progress: 98,
      });

      // 5. Finalize upload and create database record.
      const finalizeResponse = await fetch(
        "/api/upload/finalize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            folderId,
            fileName: file.name,
            storageKey: presignData.storageKey,
            fileHash,
            fileSize: file.size,
            contentType: file.type,
          }),
        }
      );

      const finalizeData =
        (await finalizeResponse.json()) as FinalizeResponse;

      if (isStudioLimitError(finalizeResponse, finalizeData)) {
        throw new UploadLimitError(
          finalizeData.message ||
            finalizeData.error ||
            "Upload limit reached."
        );
      }

      if (!finalizeResponse.ok || !finalizeData.success) {
        throw new Error(
          finalizeData.message ||
            finalizeData.error ||
            "Unable to finalize image upload."
        );
      }

      // Duplicate detected during finalization.
      if (finalizeData.duplicate) {
        updateFile(index, {
          status: "duplicate",
          progress: 100,
          uploadedUrl: "duplicate",
        });

        setUploadedCount((prev) => prev + 1);

        return true;
      }

      // Original uploaded and database record created.
      // Background compression will be handled separately.
      updateFile(index, {
        status: "processing",
        progress: 100,
        uploadedUrl: presignData.storageKey,
      });

      setUploadedCount((prev) => prev + 1);

      return true;
    } catch (error) {
      flushProgressUpdates();

      // Cancellation is not an upload failure.
      if (cancelRequestedRef.current) {
        return false;
      }

      // Studio limit reached: show the full server message.
      if (error instanceof UploadLimitError) {
        limitReachedRef.current = true;

        setStudioLimitMessage(error.message);

        updateFile(index, {
          status: "error",
          errorMessage: error.message,
        });

        setFailedCount((prev) => prev + 1);

        return false;
      }

      // All other errors behave as before.
      console.error(
        `Upload failed for ${fileItem.file.name}:`,
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.";

      updateFile(index, {
        status: "error",
        errorMessage: message,
      });

      setFailedCount((prev) => prev + 1);

      return false;
    }
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      disabled: isUploading,
      accept: {
        "image/*": [],
      },
    });

  // Cancel the active upload.
  const cancelUpload = () => {
    if (!isUploading || cancelRequestedRef.current) return;

    cancelRequestedRef.current = true;
    setIsCancelling(true);

    // Abort all active browser-to-R2 uploads.
    activeXhrsRef.current.forEach((xhr) => {
      xhr.abort();
    });

    // Stop upload progress updates.
    stopProgressUpdates();
  };

  cancelUploadRef.current = cancelUpload;

  // Register cancellation with the upload navigation guard.
  useEffect(() => {
    registerCancelHandler(async () => {
      const uploadDone = uploadDoneRef.current;

      if (!uploadDone) return;

      cancelUploadRef.current();

      await uploadDone;
    });

    return () => {
      registerCancelHandler(null);
    };
  }, [registerCancelHandler]);

  const uploadAll = async () => {
    const CONCURRENT_UPLOADS = BATCH_SIZE;

    const initialBatch = filesRef.current;

    if (isUploading || initialBatch.length === 0) return;

    cancelRequestedRef.current = false;
    setIsCancelling(false);

    limitReachedRef.current = false;
    setStudioLimitMessage(null);

    uploadDoneRef.current = new Promise<void>((resolve) => {
      resolveUploadDoneRef.current = resolve;
    });

    setUploadActive(true);
    setIsUploading(true);

    setUploadedCount(0);
    setFailedCount(0);

    setTotalCount(
      initialBatch.length + pendingFilesRef.current.length
    );

    try {
      let currentBatch = initialBatch;

      while (currentBatch.length > 0) {
        const queue = currentBatch.map((file, index) => ({
          file,
          index,
        }));

        const successfulIndexes = new Set<number>();

        const workers = Array.from(
          {
            length: Math.min(CONCURRENT_UPLOADS, queue.length),
          },
          async () => {
            while (queue.length > 0) {
              // Stop workers from picking up another file after
              // cancellation or when the studio limit is reached.
              if (
                cancelRequestedRef.current ||
                limitReachedRef.current
              ) {
                break;
              }

              const item = queue.shift();

              if (!item) break;

              const success = await uploadSingleFile(
                item.file,
                item.index
              );

              if (success) {
                successfulIndexes.add(item.index);
              }
            }
          }
        );

        await Promise.all(workers);

        stopProgressUpdates();

        // Cancellation: preserve completed uploads and clear
        // remaining selections.
        if (cancelRequestedRef.current) {
          currentBatch.forEach((item) => {
            URL.revokeObjectURL(item.preview);
          });

          pendingFilesRef.current = [];
          setPendingCount(0);

          filesRef.current = [];
          setFiles([]);

          break;
        }

        const failedFiles = currentBatch.filter(
          (_, index) => !successfulIndexes.has(index)
        );

        currentBatch.forEach((item, index) => {
          if (successfulIndexes.has(index)) {
            URL.revokeObjectURL(item.preview);
          }
        });

        // Keep failed and unprocessed images visible for retry.
        if (failedFiles.length > 0) {
          setFiles((prev) => {
            const kept = prev.filter(
              (_, index) => !successfulIndexes.has(index)
            );

            filesRef.current = kept;

            return kept;
          });

          break;
        }

        // Load the next batch only after this batch succeeds.
        const nextBatch = pendingFilesRef.current
          .splice(0, BATCH_SIZE)
          .map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "pending" as const,
          }));

        setPendingCount(pendingFilesRef.current.length);

        filesRef.current = nextBatch;
        setFiles(nextBatch);

        currentBatch = nextBatch;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      cancelRequestedRef.current = false;

      setIsCancelling(false);
      setIsUploading(false);
      setUploadActive(false);

      resolveUploadDoneRef.current?.();

      resolveUploadDoneRef.current = null;
      uploadDoneRef.current = null;
    }
  };

  const completedCount = uploadedCount + failedCount;

  const overallProgress =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`flex min-h-[250px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition ${
          isDragActive
            ? "border-white bg-zinc-800"
            : "border-zinc-700 bg-zinc-900"
        } ${
          isUploading
            ? "cursor-not-allowed opacity-50"
            : ""
        }`}
      >
        <input
          {...getInputProps()}
          disabled={isUploading}
        />

        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Drag & Drop Images
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Your Moments, All in One Place
          </p>

          <span className="mt-4 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs text-zinc-300">
            Maximum {MAX_FILES_PER_UPLOAD} photos per batch.
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        {files.length + pendingCount} / {MAX_FILES_PER_UPLOAD} images selected
      </p>

      {/* Upload Progress */}
      {isUploading && (
        <div className="my-6 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-zinc-300">
              Upload Progress
            </span>

            <button
              type="button"
              onClick={cancelUpload}
              disabled={isCancelling}
              className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? "Cancelling..." : "Cancel Upload"}
            </button>

            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                {uploadedCount} / {totalCount}
              </p>

              {failedCount > 0 && (
                <p className="text-xs text-red-400">
                  Failed: {failedCount}
                </p>
              )}
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{
                width: `${overallProgress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            {completedCount === totalCount
              ? "Upload Finished ✓"
              : `${overallProgress}% Completed`}
          </p>
        </div>
      )}

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Upload Queue
              <span className="ml-2 text-sm font-normal text-zinc-400">
                ({files.length + pendingCount} images)
              </span>
            </h3>

            <button
              onClick={uploadAll}
              disabled={isUploading}
              className="rounded-xl bg-white px-5 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload All"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {files.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                {/* Preview */}
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.preview}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Footer */}
                <div className="p-3">
                  <p className="truncate text-sm text-zinc-400">
                    {item.file.name}
                  </p>

                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-white transition-all duration-300 ease-out"
                        style={{
                          width: `${item.progress}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-400">
                      <span>{item.progress}%</span>

                      <span
                        className={
                          item.status === "completed"
                            ? "text-green-400"
                            : item.status === "duplicate"
                              ? "text-amber-400"
                              : item.status === "error"
                                ? "text-red-400"
                                : "text-zinc-400"
                        }
                      >
                        {item.status === "pending"
                          ? "Pending"
                          : item.status === "uploading"
                            ? "Uploading..."
                            : item.status === "processing"
                              ? "Processing..."
                              : item.status === "completed"
                                ? "Completed"
                                : item.status === "duplicate"
                                  ? "Already Exists"
                                  : "Failed"}
                      </span>
                    </div>

                    {item.errorMessage && (
                      <p className="mt-2 break-words text-xs text-red-400">
                        {item.errorMessage}
                      </p>
                    )}
                  </div>

                  <button
                    disabled={isUploading}
                    onClick={() => removeFile(index)}
                    className="mt-3 w-full rounded-lg border border-red-500 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>

                  {item.uploadedUrl && (
                    <p className="mt-2 truncate text-xs text-green-400">
                      {item.status === "duplicate"
                        ? "Duplicate skipped"
                        : "Uploaded Successfully"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limit Popup */}
      {limitMessage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setLimitMessage(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="limit-title"
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-2xl text-amber-400">
              ⚠
            </div>

            <h3 id="limit-title" className="text-lg font-semibold text-white">
              Upload limit reached
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              {limitMessage}
            </p>

            <button
              onClick={() => setLimitMessage(null)}
              className="mt-6 w-full rounded-xl bg-white px-5 py-2 text-sm font-medium text-black transition hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Studio Limit Popup */}
      {studioLimitMessage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setStudioLimitMessage(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="studio-limit-title"
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">
              ⚠
            </div>

            <h3
              id="studio-limit-title"
              className="text-lg font-semibold text-white"
            >
              Image upload limit reached
            </h3>

            <p className="mt-2 text-sm text-zinc-300">
              {studioLimitMessage}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Remove the remaining images from the queue, or upgrade your plan to
              upload more.
            </p>

            <button
              onClick={() => setStudioLimitMessage(null)}
              className="mt-6 w-full rounded-xl bg-white px-5 py-2 text-sm font-medium text-black transition hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Refresh Overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />

            <p className="text-sm text-zinc-400">
              Refreshing gallery...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
