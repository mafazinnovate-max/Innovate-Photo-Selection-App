"use client";

import { useState } from "react";

interface ExportSelectedImagesProps {
    selectedImages: string[];
    verifyFileName: string;
}

export default function ExportSelectedImages({
    selectedImages,
    verifyFileName,
}: ExportSelectedImagesProps) {

    const [isExporting, setIsExporting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [copiedCount, setCopiedCount] = useState(0);
    const [progress, setProgress] = useState(0);

    if (!("showDirectoryPicker" in window)) {
        alert(
            "Your browser doesn't support folder export. Please use Google Chrome."
        );
        return;
    }

    const handleExport = async () => {
        try {
            setIsExporting(true);

            const sourceFolder = await (
                window as any
            ).showDirectoryPicker();

            try {
                await sourceFolder.getFileHandle(
                    verifyFileName
                );
            } catch {
                alert(
                    "Wrong folder selected.\n\nPlease choose the original uploaded folder."
                );

                return;
            }

            const selectedFolder =
                await sourceFolder.getDirectoryHandle(
                    "Selected Images",
                    {
                        create: true,
                    }
                );

            let copiedCount = 0;

            const totalFiles = selectedImages.length;

            let processedFiles = 0;

            for await (const entry of sourceFolder.values()) {
                if (
                    entry.kind === "file" &&
                    selectedImages.includes(entry.name)
                ) {
                    const file = await entry.getFile();

                    const newFile =
                        await selectedFolder.getFileHandle(
                            entry.name,
                            {
                                create: true,
                            }
                        );

                    const writable = await newFile.createWritable();

                    await writable.write(file);

                    await writable.close();

                    copiedCount++;
                    processedFiles++;

                    setProgress(
                        Math.round(
                            (processedFiles / totalFiles) * 100
                        )
                    );
                }
            }

            setCopiedCount(copiedCount);
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
        } catch (error: any) {
            if (error?.name === "AbortError") {
                return;
            }

            console.log(error);
        } finally {
            setIsExporting(false);
        }
    };

    if (!verifyFileName) {
        alert("No selected images found");
        return;
    }

    return (
        <>
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
                {isExporting
                    ? `Exporting ${progress}%`
                    : "Export Selected Originals"}
            </button>

            {isExporting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-80 rounded-2xl bg-zinc-900 p-5">
                        <h3 className="mb-3 text-center font-semibold text-white">
                            Copying Original Images...
                        </h3>

                        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                            <div
                                className="h-full bg-white transition-all duration-300"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>

                        <p className="mt-3 text-center text-sm text-zinc-400">
                            {progress}%
                        </p>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-green-500/20 bg-zinc-900 px-6 py-4 text-white shadow-2xl">
                    <h3 className="font-semibold text-green-400">
                        Export Completed
                    </h3>

                    <p className="mt-1 text-sm text-zinc-400">
                        {copiedCount} images copied successfully
                    </p>
                </div>
            )}
        </>
    );
}