import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { notFound } from "next/navigation";
import Template1 from "../templates/template-1";
import Template2 from "../templates/template-2";
import Template3 from "../templates/template-3";

async function getR2SignedUrl(storageKey: string | null) {
  if (!storageKey) return null;

  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
    }),
    { expiresIn: 3600 }
  );
}

export default async function StudioProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const profile = await prisma.studioProfile.findFirst({
    where: {
      publicSlug: slug,
      isPublished: true,
    },
    include: {
      packages: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      portfolioPhotos: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const [logoUrl, coverPhotoUrl, portfolioPhotos] =
    await Promise.all([
      profile.logoStorageKey
        ? getR2SignedUrl(profile.logoStorageKey)
        : Promise.resolve(profile.logoUrl),
      profile.coverStorageKey
        ? getR2SignedUrl(profile.coverStorageKey)
        : Promise.resolve(profile.coverPhotoUrl),
      Promise.all(
        profile.portfolioPhotos.map(async (photo) => ({
          ...photo,
          imageUrl: photo.storageKey
            ? (await getR2SignedUrl(photo.storageKey)) ??
            photo.imageUrl
            : photo.imageUrl,
        }))
      ),
    ]);

  const displayProfile = {
    ...profile,
    logoUrl: logoUrl ?? profile.logoUrl,
    coverPhotoUrl: coverPhotoUrl ?? profile.coverPhotoUrl,
    portfolioPhotos,
  };

  switch (profile.templateKey) {
    case "template-1":
      return <Template1 profile={displayProfile} />;

    case "template-2":
      return <Template2 profile={displayProfile} />;

    case "template-3":
      return <Template3 profile={displayProfile} />;

    default:
      return <Template1 profile={displayProfile} />;
  }
}