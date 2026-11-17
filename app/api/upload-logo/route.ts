
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { verifyAuthToken } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const SIGNED_URL_EXPIRY = 3600;

async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  const payload = await verifyAuthToken(token);

  if (
    !payload ||
    payload.role !== "admin" ||
    !payload.adminId ||
    !payload.studioId
  ) {
    return null;
  }

  const admin = await prisma.admin.findFirst({
    where: {
      id: payload.adminId,
      studioId: payload.studioId,
      studio: {
        isActive: true,
      },
    },
    select: {
      id: true,
      studioId: true,
    },
  });

  if (!admin) return null;

  return {
    adminId: admin.id,
    studioId: admin.studioId,
  };
}

function isValidLogoKey(key: unknown, studioId: string): key is string {
  if (typeof key !== "string" || !key.trim()) return false;

  const prefix = `studios/${studioId}/studio-logos/`;

  return (
    key.startsWith(prefix) &&
    !key.includes("..") &&
    !key.includes("\\") &&
    !key.includes("//")
  );
}

async function deleteR2Keys(keys: (string | null)[]) {
  const uniqueKeys = [...new Set(keys.filter(
    (key): key is string => Boolean(key)
  ))];

  await Promise.all(
    uniqueKeys.map(async (key) => {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
          })
        );
      } catch (error) {
        console.error("Studio logo R2 delete failed:", key, error);
      }
    })
  );
}

function getCloudinaryPublicId(url: string | null) {
  if (!url) return null;

  try {
    const pathname = new URL(url).pathname;
    const uploadIndex = pathname.indexOf("/upload/");

    if (uploadIndex === -1) return null;

    let publicId = pathname.slice(uploadIndex + 8);

    // Remove Cloudinary version prefix
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
}

async function deleteLegacyCloudinaryLogo(url: string | null) {
  const publicId = getCloudinaryPublicId(url);

  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Legacy Cloudinary logo cleanup failed:", error);
  }
}

// GET: Return signed logo URL
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const studio = await prisma.studio.findUnique({
      where: {
        id: session.studioId,
      },
      select: {
        name: true,
        logoUrl: true,
        logoStorageKey: true,
        logoOptimizedKey: true,
        logoZoom: true,
        logoPositionX: true,
        logoPositionY: true,
      },
    });

    if (!studio) {
      return NextResponse.json(
        { success: false, message: "Studio not found" },
        { status: 404 }
      );
    }

    let logoUrl = studio.logoUrl;

    const activeLogoKey =
      studio.logoOptimizedKey || studio.logoStorageKey;

    if (activeLogoKey) {
      logoUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: activeLogoKey,
        }),
        {
          expiresIn: SIGNED_URL_EXPIRY,
        }
      );
    }

    return NextResponse.json({
      success: true,
      studioName: studio.name,
      logoUrl,
      logoZoom: studio.logoZoom,
      logoPositionX: studio.logoPositionX,
      logoPositionY: studio.logoPositionY,
    });
  } catch (error) {
    console.error("Get studio logo error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load studio logo" },
      { status: 500 }
    );
  }
}

// PUT: Apply new logo
export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      storageKey,
      optimizedKey,
      thumbnailKey,
      zoom,
      positionX,
      positionY,
    } = body;

    // Validate R2 keys
    if (
      !isValidLogoKey(storageKey, session.studioId) ||
      !isValidLogoKey(optimizedKey, session.studioId) ||
      !isValidLogoKey(thumbnailKey, session.studioId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid logo storage keys" },
        { status: 400 }
      );
    }

    // Validate crop settings
    if (
      typeof zoom !== "number" ||
      !Number.isFinite(zoom) ||
      typeof positionX !== "number" ||
      !Number.isFinite(positionX) ||
      typeof positionY !== "number" ||
      !Number.isFinite(positionY)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid logo positioning values" },
        { status: 400 }
      );
    }

    // Ensure all processed files belong to this studio and exist
    for (const key of [storageKey, optimizedKey, thumbnailKey]) {
      await r2.send(
        new HeadObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        })
      );
    }

    const currentStudio = await prisma.studio.findUnique({
      where: {
        id: session.studioId,
      },
      select: {
        logoUrl: true,
        logoStorageKey: true,
        logoOptimizedKey: true,
        logoThumbnailKey: true,
      },
    });

    if (!currentStudio) {
      return NextResponse.json(
        { success: false, message: "Studio not found" },
        { status: 404 }
      );
    }

    // Save new logo first. Old logo remains untouched until DB succeeds.
    const updatedStudio = await prisma.studio.update({
      where: {
        id: session.studioId,
      },
      data: {
        logoUrl: null,
        logoStorageKey: storageKey,
        logoOptimizedKey: optimizedKey,
        logoThumbnailKey: thumbnailKey,
        logoProcessingStatus: "COMPLETED",
        logoZoom: zoom,
        logoPositionX: positionX,
        logoPositionY: positionY,
      },
      select: {
        name: true,
        logoZoom: true,
        logoPositionX: true,
        logoPositionY: true,
      },
    });

    // DB update succeeded. Now remove previous R2 logo files.
    const newKeys = new Set([
      storageKey,
      optimizedKey,
      thumbnailKey,
    ]);

    const oldR2Keys = [
      currentStudio.logoStorageKey,
      currentStudio.logoOptimizedKey,
      currentStudio.logoThumbnailKey,
    ].filter((key) => key && !newKeys.has(key));

    await deleteR2Keys(oldR2Keys);

    // Clean up previous Cloudinary logo after successful DB update.
    await deleteLegacyCloudinaryLogo(currentStudio.logoUrl);

    const logoUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: optimizedKey,
      }),
      {
        expiresIn: SIGNED_URL_EXPIRY,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Studio logo updated successfully",
      studioName: updatedStudio.name,
      logoUrl,
      logoZoom: updatedStudio.logoZoom,
      logoPositionX: updatedStudio.logoPositionX,
      logoPositionY: updatedStudio.logoPositionY,
    });
  } catch (error) {
    console.error("Apply studio logo error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to apply studio logo" },
      { status: 500 }
    );
  }
}

// DELETE: Remove active logo
export async function DELETE() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentStudio = await prisma.studio.findUnique({
      where: {
        id: session.studioId,
      },
      select: {
        logoUrl: true,
        logoStorageKey: true,
        logoOptimizedKey: true,
        logoThumbnailKey: true,
      },
    });

    if (!currentStudio) {
      return NextResponse.json(
        { success: false, message: "Studio not found" },
        { status: 404 }
      );
    }

    // Clear DB reference first
    await prisma.studio.update({
      where: {
        id: session.studioId,
      },
      data: {
        logoUrl: null,
        logoStorageKey: null,
        logoOptimizedKey: null,
        logoThumbnailKey: null,
        logoProcessingStatus: "COMPLETED",
        logoZoom: 1,
        logoPositionX: 0,
        logoPositionY: 0,
      },
    });

    // DB clear succeeded. Now delete old R2 files.
    await deleteR2Keys([
      currentStudio.logoStorageKey,
      currentStudio.logoOptimizedKey,
      currentStudio.logoThumbnailKey,
    ]);

    // Remove old Cloudinary asset if this was a legacy logo.
    await deleteLegacyCloudinaryLogo(currentStudio.logoUrl);

    return NextResponse.json({
      success: true,
      message: "Studio logo removed successfully",
    });
  } catch (error) {
    console.error("Remove studio logo error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to remove studio logo" },
      { status: 500 }
    );
  }
}