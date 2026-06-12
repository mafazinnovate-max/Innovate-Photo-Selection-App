"use client";

import { useState, useTransition } from "react";
import { verifyGalleryAccess } from "@/actions/verify-gallery-access";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface GalleryAccessModalProps {
    shareId: string;
    parentId?: string | null;
}

export default function GalleryAccessModal({
    shareId,
    parentId,
}: GalleryAccessModalProps) {
    const router = useRouter();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const [isPending, startTransition] =
        useTransition();

    const handleVerify = () => {
        setError("");

        startTransition(async () => {
            const res =
                await verifyGalleryAccess(
                    shareId,
                    code,
                    parentId,
                );

            if (!res.success) {
                setError(
                    res.message ||
                    "Verification failed",
                );
                return;
            }

            router.refresh();
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-4">
            <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-2xl bg-white/10 p-4">
                        <Lock size={28} />
                    </div>
                </div>

                <h2 className="text-center text-2xl font-bold text-white">
                    Access Required
                </h2>

                <p className="mt-2 text-center text-sm text-zinc-400">
                    Enter the gallery access code
                    provided by your photographer.
                </p>

                <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                        setCode(e.target.value)
                    }
                    placeholder="Access Code"
                    className="mt-6 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-center text-lg tracking-widest text-white outline-none"
                />

                {error && (
                    <p className="mt-3 text-center text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleVerify}
                    disabled={isPending}
                    className="mt-5 w-full rounded-xl bg-white py-3 font-medium text-black"
                >
                    {isPending
                        ? "Verifying..."
                        : "Unlock Gallery"}
                </button>
            </div>
        </div>
    );
}