"use client";

import { useState, useTransition } from "react";
import { verifyGalleryAccess } from "@/actions/verify-gallery-access";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-zinc-900/95 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-8 flex flex-col items-center">
                    <Image
                        src="/innovate-logo.png"
                        alt="logo"
                        width={180}
                        height={60}
                        priority
                        className="h-auto object-contain"
                    />

                    <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4">
                        <Lock size={26} />
                    </div>
                </div>

                <p className="mb-3 text-center text-xs uppercase tracking-[0.25em] text-zinc-500">
                    Private Gallery
                </p>

                <h2 className="text-center text-2xl font-bold text-white">
                    Access Required
                </h2>

                <p className="mt-2 text-center text-sm text-zinc-400">
                    Enter the gallery access code provided.
                </p>

                <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                        setCode(e.target.value)
                    }
                    placeholder="Access Code"
                    className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-center text-lg tracking-[0.3em] text-white outline-none transition focus:border-white/30 focus:bg-black/30"
                />

                {error && (
                    <p className="mt-3 text-center text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleVerify}
                    disabled={isPending}
                    className="mt-5 w-full rounded-2xl bg-white py-4 font-semibold text-black transition hover:scale-[1.02] hover:shadow-lg disabled:opacity-70"
                >
                    {isPending
                        ? "Verifying..."
                        : "Unlock Gallery"}
                </button>
            </div>
        </div>
    );
}