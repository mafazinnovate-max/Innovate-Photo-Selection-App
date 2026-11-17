import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const session = await verifyAuthToken(token);

  if (!session || session.role !== "admin" || !session.studioId) {
    return null;
  }

  return {
    ...session,
    studioId: session.studioId,
  };
}

async function getProfileImageUrl(storageKey: string | null, fallbackUrl: string | null) {
  if (!storageKey) {
    return fallbackUrl ?? "";
  }

  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
    }),
    { expiresIn: 3600 }
  );
}

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await prisma.studioProfile.findUnique({
      where: {
        studioId: session.studioId,
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
      return NextResponse.json({
        success: true,
        profile: null,
      });
    }

    const profileWithFreshUrls = {
      ...profile,

      logoUrl: await getProfileImageUrl(
        profile.logoStorageKey,
        profile.logoUrl
      ),

      coverPhotoUrl: await getProfileImageUrl(
        profile.coverStorageKey,
        profile.coverPhotoUrl
      ),

      portfolioPhotos: await Promise.all(
        profile.portfolioPhotos.map(async (photo) => ({
          ...photo,
          imageUrl: await getProfileImageUrl(
            photo.storageKey,
            photo.imageUrl
          ),
        }))
      ),
    };

    return NextResponse.json({
      success: true,
      profile: profileWithFreshUrls,
    });
  } catch (error) {
    console.error("Profile load error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load profile",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const studioName =
      typeof body.studioName === "string"
        ? body.studioName.trim()
        : "";

    if (!studioName) {
      return NextResponse.json(
        {
          success: false,
          error: "Studio name is required",
        },
        {
          status: 400,
        }
      );
    }

    const packages = Array.isArray(body.packages)
      ? body.packages
      : [];

    const portfolioPhotos = Array.isArray(body.portfolioPhotos)
      ? body.portfolioPhotos
      : [];

    const existingProfile = await prisma.studioProfile.findUnique({
      where: {
        studioId: session.studioId,
      },
      include: {
        portfolioPhotos: true,
      },
    });

    const submittedPortfolioIds = portfolioPhotos
      .map((photo: { id?: string }) => photo.id)
      .filter(
        (id: unknown): id is string =>
          typeof id === "string" && id.length > 0
      );

    const removedPortfolioPhotos =
      existingProfile?.portfolioPhotos.filter(
        (photo) => !submittedPortfolioIds.includes(photo.id)
      ) ?? [];

    const profile = await prisma.$transaction(async (tx) => {
      const savedProfile = await tx.studioProfile.upsert({
        where: {
          studioId: session.studioId,
        },
        create: {
          studioId: session.studioId,
          templateKey: "template-1",
          publicSlug: null,
          isPublished: false,
          studioName,
          logoUrl: body.logoUrl || null,
          logoStorageKey:
  typeof body.logoStorageKey === "string" &&
  body.logoStorageKey.startsWith(
    `studios/${session.studioId}/profile/logo/`
  )
    ? body.logoStorageKey
    : null,
          description: body.description || null,
          shortTagline: body.shortTagline || null,
          coverPhotoUrl: body.coverPhotoUrl || null,
          coverStorageKey:
  typeof body.coverStorageKey === "string" &&
  body.coverStorageKey.startsWith(
    `studios/${session.studioId}/profile/cover/`
  )
    ? body.coverStorageKey
    : null,
          ownerName: body.ownerName || null,
          ownerPhone: body.ownerPhone || null,
          phoneNumber: body.phoneNumber || null,
          email: body.email || null,
          address: body.address || null,
          location: body.location || null,
          instagramUrl: body.instagramUrl || null,
          websiteUrl: body.websiteUrl || null,
          facebookUrl: body.facebookUrl || null,
          youtubeUrl: body.youtubeUrl || null,
          otherLinks: body.otherLinks || null,
          additionalInfo: body.additionalInfo || null,
        },
        update: {
          studioName,
          logoUrl: body.logoUrl || null,
          logoStorageKey:
  typeof body.logoStorageKey === "string" &&
  body.logoStorageKey.startsWith(
    `studios/${session.studioId}/profile/logo/`
  )
    ? body.logoStorageKey
    : null,
          description: body.description || null,
          shortTagline: body.shortTagline || null,
          coverPhotoUrl: body.coverPhotoUrl || null,
          coverStorageKey:
  typeof body.coverStorageKey === "string" &&
  body.coverStorageKey.startsWith(
    `studios/${session.studioId}/profile/cover/`
  )
    ? body.coverStorageKey
    : null,
          ownerName: body.ownerName || null,
          ownerPhone: body.ownerPhone || null,
          phoneNumber: body.phoneNumber || null,
          email: body.email || null,
          address: body.address || null,
          location: body.location || null,
          instagramUrl: body.instagramUrl || null,
          websiteUrl: body.websiteUrl || null,
          facebookUrl: body.facebookUrl || null,
          youtubeUrl: body.youtubeUrl || null,
          otherLinks: body.otherLinks || null,
          additionalInfo: body.additionalInfo || null,
        },
      });

      await tx.studioProfilePackage.deleteMany({
        where: {
          profileId: savedProfile.id,
        },
      });
if (packages.length > 0) {
  await tx.studioProfilePackage.createMany({
    data: packages
      .map(
        (
          pkg: {
            name?: string;
            price?: string;
            description?: string;
          },
          index: number
        ) => ({
          profileId: savedProfile.id,
          name:
            typeof pkg.name === "string"
              ? pkg.name.trim()
              : "",
          price:
            typeof pkg.price === "string"
              ? pkg.price.trim()
              : "",
          description:
            typeof pkg.description === "string"
              ? pkg.description.trim()
              : "",
          sortOrder: index,
        })
      )
      .filter(
        (pkg: { name: string }) =>
          pkg.name.length > 0
      ),
  });
}

      for (const removedPhoto of removedPortfolioPhotos) {
        await tx.studioProfilePortfolio.delete({
          where: {
            id: removedPhoto.id,
          },
        });
      }

      for (let index = 0; index < portfolioPhotos.length; index++) {
        const photo = portfolioPhotos[index];

        if (
          typeof photo.id === "string" &&
          photo.id.length > 0
        ) {
          await tx.studioProfilePortfolio.updateMany({
            where: {
              id: photo.id,
              profileId: savedProfile.id,
            },
            data: {
              sortOrder: index,
            },
          });
        } else if (
          typeof photo.imageUrl === "string" &&
          photo.imageUrl.trim()
        ) {
          await tx.studioProfilePortfolio.create({
           data: {
  profileId: savedProfile.id,
  imageUrl: photo.imageUrl.trim(),
  publicId:
    typeof photo.publicId === "string"
      ? photo.publicId
      : null,
  storageKey:
    typeof photo.publicId === "string" &&
    photo.publicId.startsWith(
      `studios/${session.studioId}/profile/portfolio/`
    )
      ? photo.publicId
      : null,
  sortOrder: index,
},
          });
        }
      }

      return tx.studioProfile.findUnique({
        where: {
          id: savedProfile.id,
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
    });

    // Delete replaced logo from R2
const oldLogoKey = existingProfile?.logoStorageKey;
const newLogoKey = profile?.logoStorageKey;

if (
  typeof oldLogoKey === "string" &&
  oldLogoKey !== newLogoKey &&
  oldLogoKey.startsWith(
    `studios/${session.studioId}/profile/logo/`
  )
) {
  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: oldLogoKey,
      })
    );
  } catch (r2Error) {
    console.error("R2 logo deletion error:", r2Error);
  }
}

// Delete replaced cover from R2
const oldCoverKey = existingProfile?.coverStorageKey;
const newCoverKey = profile?.coverStorageKey;

if (
  typeof oldCoverKey === "string" &&
  oldCoverKey !== newCoverKey &&
  oldCoverKey.startsWith(
    `studios/${session.studioId}/profile/cover/`
  )
) {
  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: oldCoverKey,
      })
    );
  } catch (r2Error) {
    console.error("R2 cover deletion error:", r2Error);
  }
}

   for (const removedPhoto of removedPortfolioPhotos) {
  const storageKey = removedPhoto.storageKey;

  if (
    typeof storageKey === "string" &&
    storageKey.startsWith(
      `studios/${session.studioId}/profile/portfolio/`
    )
  ) {
    try {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: storageKey,
        })
      );
    } catch (r2Error) {
      console.error(
        "R2 portfolio deletion error:",
        r2Error
      );
    }
  }
}

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile save error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save profile",
      },
      {
        status: 500,
      }
    );
  }
}