"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function FolderLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <Link
                href={href}
                onClick={() => setLoading(true)}
                prefetch={true}
                className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600"
            >
                {children}
            </Link>

            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
            )}
        </>
    );
}