import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

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

    return NextResponse.json({
      success: true,
      profile,
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
          description: body.description || null,
          shortTagline: body.shortTagline || null,
          coverPhotoUrl: body.coverPhotoUrl || null,
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
          description: body.description || null,
          shortTagline: body.shortTagline || null,
          coverPhotoUrl: body.coverPhotoUrl || null,
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
                  description?: string;
                },
                index: number
              ) => ({
                profileId: savedProfile.id,
                name:
                  typeof pkg.name === "string"
                    ? pkg.name.trim()
                    : "",
                description:
                  typeof pkg.description === "string"
                    ? pkg.description.trim()
                    : "",
                sortOrder: index,
              })
            )
            .filter(
              (pkg: { name: string; description: string }) =>
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

    for (const removedPhoto of removedPortfolioPhotos) {
      if (removedPhoto.publicId) {
        try {
          await cloudinary.uploader.destroy(
            removedPhoto.publicId,
            {
              resource_type: "image",
            }
          );
        } catch (cloudinaryError) {
          console.error(
            "Cloudinary portfolio deletion error:",
            cloudinaryError
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