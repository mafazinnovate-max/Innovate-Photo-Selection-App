"use client";

import { uploadImage } from "@/actions/upload-image";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: | "pending" | "uploading" | "processing" | "completed" | "error";
  uploadedUrl?: string;
}

interface UploadDropzoneProps {
  folderId: string;
}

export default function UploadDropzone({ folderId }: UploadDropzoneProps) {
  const router = useRouter();

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isRefreshing, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mappedFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "pending" as const,
    }));

    setFiles((prev) => [...prev, ...mappedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const compressImage = async (
    file: File,
    maxSizeMB = 2,
  ): Promise<File> => {
    if (file.size <= maxSizeMB * 1024 * 1024) {
      return file;
    }

    return new Promise((resolve) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1200;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
              }),
            );
          },
          "image/jpeg",
          0.55,
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const convertToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result as string);

      reader.onerror = reject;
    });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  const uploadSingleFile = async (
    fileItem: UploadFile,
    i: number,
  ) => {
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      setFiles((prev) =>
        prev.map((item, index) =>
          index === i
            ? {
              ...item,
              status: "uploading",
              progress: 8,
            }
            : item,
        ),
      );

      progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((item, index) => {
            if (index !== i) return item;

            if (item.progress >= 90) return item;

            return {
              ...item,
              progress: Math.min(
                item.progress +
                Math.floor(Math.random() * 8) +
                2,
                90,
              ),
            };
          }),
        );
      }, 300);

      const compressedFile = await compressImage(
        fileItem.file,
        1,
      );

      const base64Image =
        await convertToBase64(compressedFile);

      const uploadResponse = await fetch(
        "/api/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            fileName: fileItem.file.name,
          }),
        },
      );

      const response =
        await uploadResponse.json();

      if (!response.success || !response.url) {
        throw new Error(
          response.error || "Upload failed",
        );
      }

      await uploadImage({
        imageUrl: response.url,
        publicId: response.publicId,
        fileName: response.fileName,
        folderId,
      });

      setUploadedCount((prev) => prev + 1);

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setFiles((prev) =>
        prev.map((item, index) =>
          index === i
            ? {
              ...item,
              status: "completed",
              progress: 100,
              uploadedUrl: response.url,
            }
            : item,
        ),
      );
    } catch (error) {
      console.log(error);

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setFiles((prev) =>
        prev.map((item, index) =>
          index === i
            ? {
              ...item,
              status: "error",
            }
            : item,
        ),
      );
    }
  };

  const uploadAll = async () => {
    const CONCURRENT_UPLOADS = 5;

    if (isUploading) return;

    setIsUploading(true);
    setUploadedCount(0);
    setTotalCount(files.length);

    try {
      for (
        let i = 0;
        i < files.length;
        i += CONCURRENT_UPLOADS
      ) {
        const batch = files.slice(
          i,
          i + CONCURRENT_UPLOADS,
        );

        await Promise.all(
          batch.map((fileItem, batchIndex) =>
            uploadSingleFile(
              fileItem,
              i + batchIndex,
            ),
          ),
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1500),
      );

      setFiles([]);
      setUploadedCount(0);
      setTotalCount(0);

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setIsUploading(false);
    }
  };

  const overallProgress =
    totalCount > 0
      ? Math.round((uploadedCount / totalCount) * 100)
      : 0;

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`flex min-h-[250px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition ${isDragActive
          ? "border-white bg-zinc-800"
          : "border-zinc-700 bg-zinc-900"
          }`}
      >
        <input
          {...getInputProps()}
          disabled={isUploading}
        />

        <div className="text-center">
          <h2 className="text-xl font-semibold">Drag & Drop Images</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Upload wedding preview images
          </p>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="my-6 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-zinc-300">
              Upload Progress
            </span>

            <span className="text-sm font-semibold text-white">
              {uploadedCount} / {totalCount}
            </span>
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
            {uploadedCount === totalCount
              ? "Upload Completed ✓"
              : `${overallProgress}% Completed`}
          </p>
        </div>
      )}

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Upload Queue</h3>

            <button
              onClick={uploadAll}
              disabled={isUploading}
              className="rounded-xl bg-white px-5 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading
                ? "Uploading..."
                : "Upload All"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {files.map((item, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                {/* Preview */}
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.preview}
                    alt="Preview"
                    fill
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

                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                      <span>{item.progress}%</span>

                      <span
                        className={
                          item.status === "completed"
                            ? "text-green-400"
                            : item.status === "error"
                              ? "text-red-400"
                              : "text-zinc-400"
                        }
                      >
                        {
                          item.status === "pending"
                            ? "Pending"
                            : item.status === "uploading"
                              ? "Uploading..."
                              : item.status === "processing"
                                ? "Processing..."
                                : item.status === "completed"
                                  ? "Completed"
                                  : "Failed"
                        }
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isUploading}
                    onClick={() => removeFile(index)}
                    className="mt-3 w-full rounded-lg border border-red-500 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                  {item.uploadedUrl && (
                    <p className="mt-2 truncate text-xs text-green-400">
                      Uploaded Successfully
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
