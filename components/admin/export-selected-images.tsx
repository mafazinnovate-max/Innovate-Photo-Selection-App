
"use client";

import { useState } from "react";

interface ExportSelectedImagesProps {
    selectedImages: string[];
    verifyFileName: string;
}

type DirectoryHandle = any;

const DB_NAME = "picnovate-folder-permissions";
const STORE_NAME = "directories";
const STORAGE_KEY = "saved-source-folders";

function openDirectoryDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getSavedDirectories(): Promise<DirectoryHandle[]> {
    const db = await openDirectoryDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const request = transaction
            .objectStore(STORE_NAME)
            .get(STORAGE_KEY);

        request.onsuccess = () => {
            resolve(Array.isArray(request.result) ? request.result : []);
            db.close();
        };

        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

async function saveDirectory(handle: DirectoryHandle) {
    const db = await openDirectoryDB();

    try {
        const directories = await getSavedDirectoriesFromDB(db);

        let alreadySaved = false;

        for (const existing of directories) {
            try {
                if (await existing.isSameEntry(handle)) {
                    alreadySaved = true;
                    break;
                }
            } catch {
                // Ignore invalid or unavailable saved handles.
            }
        }

        if (!alreadySaved) {
            directories.push(handle);

            await new Promise<void>((resolve, reject) => {
                const transaction = db.transaction(
                    STORE_NAME,
                    "readwrite"
                );

                transaction.objectStore(STORE_NAME).put(
                    directories,
                    STORAGE_KEY
                );

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
                transaction.onabort = () => reject(transaction.error);
            });
        }
    } finally {
        db.close();
    }
}

function getSavedDirectoriesFromDB(
    db: IDBDatabase
): Promise<DirectoryHandle[]> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const request = transaction.objectStore(STORE_NAME).get(STORAGE_KEY);

        request.onsuccess = () => {
            resolve(Array.isArray(request.result) ? request.result : []);
        };

        request.onerror = () => reject(request.error);
    });
}

async function getPermission(handle: DirectoryHandle): Promise<boolean> {
    let permission = await handle.queryPermission({
        mode: "readwrite",
    });

    if (permission !== "granted") {
        permission = await handle.requestPermission({
            mode: "readwrite",
        });
    }

    return permission === "granted";
}

async function findSourceDirectory(
    fileName: string
): Promise<DirectoryHandle | null> {
    const directories = await getSavedDirectories();

    for (const directory of directories) {
        try {
            // Check whether this folder contains the required original.
            await directory.getFileHandle(fileName);

            // Reuse the saved folder if permission is still available.
            if (await getPermission(directory)) {
                return directory;
            }
        } catch (error: any) {
            if (
                error?.name === "NotAllowedError" ||
                error?.name === "SecurityError"
            ) {
                // Permission may have been revoked. Try another folder.
                continue;
            }

            // This folder does not contain the required image.
        }
    }

    return null;
}

export default function ExportSelectedImages({
    selectedImages,
    verifyFileName,
}: ExportSelectedImagesProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [copiedCount, setCopiedCount] = useState(0);
    const [progress, setProgress] = useState(0);

    const handleExport = async () => {
        try {
            if (
                typeof window === "undefined" ||
                !("showDirectoryPicker" in window)
            ) {
                alert(
                    "Your browser doesn't support folder export. Please use Google Chrome."
                );
                return;
            }

            if (!selectedImages.length || !verifyFileName) {
                alert("No selected images found.");
                return;
            }

            setIsExporting(true);
            setProgress(0);
            setShowSuccess(false);

            // First, try to reuse a previously approved source folder.
            let sourceFolder: DirectoryHandle | null = null;

            try {
                sourceFolder = await findSourceDirectory(verifyFileName);
            } catch (error) {
                console.error("Could not check saved folders:", error);
            }

            // Ask the user to select a folder only when no saved
            // folder contains this original image.
            if (!sourceFolder) {
                const picker = (window as any).showDirectoryPicker;

                sourceFolder = await picker({
                    mode: "readwrite",
                });

                try {
                    await sourceFolder.getFileHandle(verifyFileName);
                } catch {
                    alert(
                        "Wrong folder selected.\n\nPlease choose the original uploaded folder."
                    );
                    return;
                }

                if (!(await getPermission(sourceFolder))) {
                    alert("Folder permission denied.");
                    return;
                }

                // Remember this folder for future exports.
                try {
                    await saveDirectory(sourceFolder);
                } catch (error) {
                    console.error(
                        "Could not remember the source folder:",
                        error
                    );
                }
            }

            const selectedFolder =
                await sourceFolder.getDirectoryHandle("Selected Images", {
                    create: true,
                });

            let successfulCopies = 0;
            const totalFiles = selectedImages.length;

            for (let i = 0; i < totalFiles; i++) {
                const fileName = selectedImages[i];

                try {
                    const sourceFileHandle =
                        await sourceFolder.getFileHandle(fileName);

                    const file = await sourceFileHandle.getFile();

                    const targetFileHandle =
                        await selectedFolder.getFileHandle(fileName, {
                            create: true,
                        });

                    const writable =
                        await targetFileHandle.createWritable();

                    await writable.write(file);
                    await writable.close();

                    successfulCopies++;
                } catch (error) {
                    console.error(`Failed to copy ${fileName}`, error);
                } finally {
                    setProgress(
                        Math.round(((i + 1) / totalFiles) * 100)
                    );
                }
            }

            setCopiedCount(successfulCopies);
            setShowSuccess(true);

            if (successfulCopies !== totalFiles) {
                alert(
                    `Export finished, but only ${successfulCopies} of ${totalFiles} images were copied. Check the console for failed files.`
                );
            }

            setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
        } catch (error: any) {
            if (error?.name === "AbortError") {
                return;
            }

            console.error("Image export failed:", error);

            alert(
                "Export failed. Please check the selected folder and try again."
            );
        } finally {
            setIsExporting(false);
        }
    };

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
                                style={{ width: `${progress}%` }}
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