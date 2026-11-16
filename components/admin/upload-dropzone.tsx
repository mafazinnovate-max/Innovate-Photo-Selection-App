
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
}

interface FinalizeResponse {
  success?: boolean;
  duplicate?: boolean;
  message?: string;
  error?: string;
}

export default function UploadDropzone({
  folderId,
  hasProcessingImages,
}: UploadDropzoneProps) {
  const router = useRouter();

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isRefreshing, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const filesRef = useRef<UploadFile[]>([]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Revoke remaining preview URLs when the component unmounts.
  useEffect(() => {
    return () => {
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
    const mappedFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...mappedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const item = prev[index];

      if (item) {
        URL.revokeObjectURL(item.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
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

  // Direct browser-to-R2 upload with actual progress.
  const uploadToR2 = (
    uploadUrl: string,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

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
        reject(new Error("Network error during R2 upload."));
      };

      xhr.ontimeout = () => {
        reject(new Error("R2 upload timed out. Please retry."));
      };

      xhr.onabort = () => {
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

      if (!presignResponse.ok || !presignData.success) {
        throw new Error(
          presignData.message ||
          presignData.error ||
          "Unable to prepare image upload."
        );
      }

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
          updateFile(index, {
            progress,
          });
        }
      );

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

  const uploadAll = async () => {
    const CONCURRENT_UPLOADS = 10;

    if (isUploading || files.length === 0) return;

    setIsUploading(true);
    setUploadedCount(0);
    setFailedCount(0);
    setTotalCount(files.length);

    try {
      const queue = files.map((file, index) => ({
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

      // Give the user a moment to see the final statuses.
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      // Remove successful uploads from the queue.
      setFiles((prev) => {
        const remaining = prev.filter(
          (_, index) => !successfulIndexes.has(index)
        );

        prev.forEach((item, index) => {
          if (successfulIndexes.has(index)) {
            URL.revokeObjectURL(item.preview);
          }
        });

        return remaining;
      });

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setIsUploading(false);
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
        className={`flex min-h-[250px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition ${isDragActive
          ? "border-white bg-zinc-800"
          : "border-zinc-700 bg-zinc-900"
          } ${isUploading
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
            Upload wedding preview images
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="my-6 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-zinc-300">
              Upload Progress
            </span>

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