"use client";

import { uploadImage } from "@/actions/upload-image";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  uploadedUrl?: string;
}

interface UploadDropzoneProps {
  folderId: string;
}

export default function UploadDropzone({ folderId }: UploadDropzoneProps) {
  const router = useRouter();

  const [files, setFiles] = useState<UploadFile[]>([]);

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

  const uploadAll = async () => {
    for (let i = 0; i < files.length; i++) {
      try {
        // Start Upload
        setFiles((prev) =>
          prev.map((item, index) =>
            index === i
              ? {
                  ...item,
                  status: "uploading",
                }
              : item,
          ),
        );

        // Fake Progress
        for (let progress = 0; progress <= 90; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          setFiles((prev) =>
            prev.map((item, index) =>
              index === i
                ? {
                    ...item,
                    progress,
                  }
                : item,
            ),
          );
        }

        const base64Image = await convertToBase64(files[i].file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            fileName: files[i].file.name,
          }),
        });

        const response = await uploadResponse.json();

        if (!response.success || !response.url) {
          throw new Error(response.error || "Upload failed");
        }

        // SAVE TO DATABASE
        await uploadImage({
          imageUrl: response.url,
          publicId: response.publicId,
          fileName: response.fileName,
          folderId,
        });

        // VALIDATE RESPONSE
        if (!response || !response.success || !response.url) {
          throw new Error("Upload failed");
        }

        // Complete
        setFiles((prev) =>
          prev.map((item, index) =>
            index === i
              ? {
                  ...item,
                  progress: 100,
                  status: "completed",
                  uploadedUrl: response.url,
                }
              : item,
          ),
        );
      } catch (error) {
        console.log(error);

        alert(error instanceof Error ? error.message : "Upload failed");

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
    }

    // AFTER ALL UPLOADS
    setFiles([]);

    router.refresh();
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`flex min-h-[250px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition ${
          isDragActive
            ? "border-white bg-zinc-800"
            : "border-zinc-700 bg-zinc-900"
        }`}
      >
        <input {...getInputProps()} />

        <div className="text-center">
          <h2 className="text-xl font-semibold">Drag & Drop Images</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Upload wedding preview images
          </p>
        </div>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Upload Queue</h3>

            <button
              onClick={uploadAll}
              className="rounded-xl bg-white px-5 py-2 text-sm font-medium text-black transition hover:opacity-90"
            >
              Upload All
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
                        className="h-full bg-white transition-all"
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
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="mt-3 w-full rounded-lg border border-red-500 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
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
    </div>
  );
}
