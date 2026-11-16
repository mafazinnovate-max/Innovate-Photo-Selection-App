"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function PicknovateLoader() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/api/public-logo", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success && data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      } catch (error) {
        console.error("Failed to load Picknovate logo:", error);
      }
    };

    loadLogo();
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {logoUrl && (
        <div className="animate-pulse">
          <Image
            src={logoUrl}
            alt="Picknovate"
            width={140}
            height={140}
            priority
            className="h-28 w-28 object-contain sm:h-32 sm:w-32"
          />
        </div>
      )}
    </div>
  );
}