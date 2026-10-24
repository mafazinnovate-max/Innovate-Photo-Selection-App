"use client";

import Image from "next/image";
import { LocateFixedIcon, PhoneCall } from "lucide-react";

interface StudioBrandingProps {
  studio: {
    name: string;
    logoUrl: string | null;
    logoZoom: number;
    logoPositionX: number;
    logoPositionY: number;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
  } | null;
}

export default function StudioBranding({
  studio,
}: StudioBrandingProps) {
  if (!studio) {
    return null;
  }

  const address = [
    studio.address,
    studio.city,
    studio.state,
  ]
    .filter(Boolean)
    .join(", ");

  const logoScale = 150 / 176;

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-black">
      {/* Soft animated background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-72 -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-5 py-8 sm:px-6 sm:py-10 md:py-12">
        {/* Studio Logo */}
        <div className="relative flex h-[150px] w-[150px] items-center justify-center sm:h-[170px] sm:w-[170px] md:h-[190px] md:w-[190px]">
          {studio.logoUrl ? (
            <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.03] shadow-2xl">
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
                style={{
                  transform: `
                    translate(
                      ${studio.logoPositionX * logoScale}px,
                      ${studio.logoPositionY * logoScale}px
                    )
                    scale(${studio.logoZoom * logoScale})
                  `,
                }}
              >
                <Image
                  src={studio.logoUrl}
                  alt={studio.name}
                  width={176}
                  height={176}
                  priority
                  className="h-[176px] w-[176px] max-w-none object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <span className="px-5 text-center text-sm font-medium text-zinc-500">
                {studio.name}
              </span>
            </div>
          )}
        </div>
{/* Studio Name */}
<div className="relative mt-4 max-w-[90%] overflow-hidden">
  <h2 className="animate-[fadeInUp_0.8s_ease-out] break-words bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text px-4 text-center text-2xl font-semibold tracking-[0.08em] text-transparent sm:text-3xl md:text-4xl">
    {studio.name}
  </h2>

  {/* Elegant animated divider */}
  <div className="mx-auto mt-4 flex items-center justify-center gap-2">
    <span className="h-px w-8 bg-gradient-to-r from-transparent to-zinc-600 sm:w-12" />
    <span className="h-1 w-1 animate-pulse rounded-full bg-zinc-400" />
    <span className="h-px w-8 bg-gradient-to-l from-transparent to-zinc-600 sm:w-12" />
  </div>
</div>

        {/* Contact Information */}
        <div className="mt-6 flex w-full max-w-2xl flex-col items-center gap-4 text-sm text-zinc-300">
          {/* Phone */}
          {studio.phone && (
            <a
              href={`tel:${studio.phone}`}
              className="flex w-full items-start justify-center gap-3 text-center transition-colors duration-300 hover:text-white"
            >
              <PhoneCall
                size={18}
                className="mt-0.5 shrink-0 text-zinc-400"
              />

              <span className="break-words">
                {studio.phone}
              </span>
            </a>
          )}

          {/* Address */}
          {address && (
            <div className="flex w-full items-start justify-center gap-3 text-center">
              <LocateFixedIcon
                size={18}
                className="mt-0.5 shrink-0 text-zinc-400"
              />

              <span className="max-w-xl break-words leading-6">
                {address}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}