-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FolderSelectionStatus" AS ENUM ('SELECTING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "coverImagePublicId" TEXT,
    "coverImageUrl" TEXT,
    "coverPosition" INTEGER NOT NULL DEFAULT 0,
    "eventDate" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "email" TEXT,
    "galleryMode" TEXT NOT NULL DEFAULT 'single',
    "maxSelections" INTEGER,
    "accessCodeVersion" INTEGER NOT NULL DEFAULT 1,
    "studioId" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'general',
    "parentId" TEXT,
    "maxSelections" INTEGER,
    "selectionStatus" "FolderSelectionStatus" NOT NULL DEFAULT 'SELECTING',
    "hardDiskName" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "folderId" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "selectionOrder" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileName" TEXT,
    "fileHash" TEXT,
    "storageKey" TEXT,
    "eventId" TEXT,
    "optimizedKey" TEXT,
    "thumbnailKey" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'COMPLETED',
    "processingAttempts" INTEGER NOT NULL DEFAULT 0,
    "processingError" TEXT,
    "processedAt" TIMESTAMP(3),
    "originalSize" BIGINT,
    "optimizedSize" BIGINT,
    "thumbnailSize" BIGINT,
    "processingStartedAt" TIMESTAMP(3),

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Selection" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Selection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryAccess" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "parentId" TEXT,
    "deviceId" TEXT NOT NULL,
    "accessVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Studio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "website" TEXT,
    "description" TEXT,
    "internalNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoPositionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "logoPositionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "logoZoom" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "logoStorageKey" TEXT,
    "logoOptimizedKey" TEXT,
    "logoThumbnailKey" TEXT,
    "logoProcessingStatus" TEXT NOT NULL DEFAULT 'COMPLETED',

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studioId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "logoUrl" TEXT,
    "name" TEXT,
    "passwordResetExpiry" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordUpdatedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSecret" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT,
    "superAdminId" TEXT,

    CONSTRAINT "AuthSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'Basic',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "storageLimitGb" INTEGER NOT NULL DEFAULT 100,
    "maxEvents" INTEGER NOT NULL DEFAULT 50,
    "maxCustomers" INTEGER NOT NULL DEFAULT 500,
    "maxImages" INTEGER NOT NULL DEFAULT 100000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studioId" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playing_with_neon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL,

    CONSTRAINT "playing_with_neon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioDocumentSettings" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "faqContent" JSONB,
    "termsContent" JSONB,
    "policiesContent" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioDocumentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioDocument" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "eventName" TEXT,
    "eventDate" TIMESTAMP(3),
    "documentData" JSONB NOT NULL,
    "studioSnapshot" JSONB NOT NULL,
    "sectionsSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalEvent" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "eventDate" TIMESTAMP(3),
    "description" TEXT,
    "hardDiskName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioProfile" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "studioName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "shortTagline" TEXT,
    "coverPhotoUrl" TEXT,
    "ownerName" TEXT,
    "ownerPhone" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "address" TEXT,
    "location" TEXT,
    "instagramUrl" TEXT,
    "websiteUrl" TEXT,
    "facebookUrl" TEXT,
    "youtubeUrl" TEXT,
    "otherLinks" TEXT,
    "additionalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateKey" TEXT NOT NULL DEFAULT 'template-1',
    "publicSlug" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "logoStorageKey" TEXT,
    "logoOptimizedKey" TEXT,
    "logoThumbnailKey" TEXT,
    "logoProcessingStatus" TEXT NOT NULL DEFAULT 'COMPLETED',
    "coverStorageKey" TEXT,
    "coverOptimizedKey" TEXT,
    "coverThumbnailKey" TEXT,
    "coverProcessingStatus" TEXT NOT NULL DEFAULT 'COMPLETED',

    CONSTRAINT "StudioProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioProfilePackage" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "price" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "StudioProfilePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioProfilePortfolio" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storageKey" TEXT,
    "optimizedKey" TEXT,
    "thumbnailKey" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'COMPLETED',
    "processingAttempts" INTEGER NOT NULL DEFAULT 0,
    "processingError" TEXT,
    "processedAt" TIMESTAMP(3),
    "originalSize" BIGINT,
    "optimizedSize" BIGINT,
    "thumbnailSize" BIGINT,

    CONSTRAINT "StudioProfilePortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "designation" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_shareId_key" ON "Event"("shareId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_storageKey_key" ON "Image"("storageKey");

-- CreateIndex
CREATE INDEX "Image_fileHash_idx" ON "Image"("fileHash");

-- CreateIndex
CREATE INDEX "Image_eventId_processingStatus_idx" ON "Image"("eventId", "processingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Image_eventId_fileHash_key" ON "Image"("eventId", "fileHash");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAccess_eventId_parentId_deviceId_accessVersion_key" ON "GalleryAccess"("eventId", "parentId", "deviceId", "accessVersion");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_username_key" ON "SuperAdmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "SuperAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_passwordResetToken_key" ON "SuperAdmin"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSecret_secret_key" ON "AuthSecret"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSecret_adminId_key" ON "AuthSecret"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSecret_superAdminId_key" ON "AuthSecret"("superAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioDocumentSettings_studioId_key" ON "StudioDocumentSettings"("studioId");

-- CreateIndex
CREATE INDEX "StudioDocument_studioId_createdAt_idx" ON "StudioDocument"("studioId", "createdAt");

-- CreateIndex
CREATE INDEX "StudioDocument_studioId_clientName_idx" ON "StudioDocument"("studioId", "clientName");

-- CreateIndex
CREATE INDEX "ExternalEvent_studioId_createdAt_idx" ON "ExternalEvent"("studioId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudioProfile_studioId_key" ON "StudioProfile"("studioId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioProfile_publicSlug_key" ON "StudioProfile"("publicSlug");

-- CreateIndex
CREATE INDEX "StudioProfilePackage_profileId_sortOrder_idx" ON "StudioProfilePackage"("profileId", "sortOrder");

-- CreateIndex
CREATE INDEX "StudioProfilePortfolio_profileId_sortOrder_idx" ON "StudioProfilePortfolio"("profileId", "sortOrder");

-- CreateIndex
CREATE INDEX "StudioProfilePortfolio_profileId_processingStatus_idx" ON "StudioProfilePortfolio"("profileId", "processingStatus");

-- CreateIndex
CREATE INDEX "Staff_studioId_isActive_idx" ON "Staff"("studioId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_studioId_employeeId_key" ON "Staff"("studioId", "employeeId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Selection" ADD CONSTRAINT "Selection_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAccess" ADD CONSTRAINT "GalleryAccess_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSecret" ADD CONSTRAINT "AuthSecret_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSecret" ADD CONSTRAINT "AuthSecret_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "SuperAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioDocumentSettings" ADD CONSTRAINT "StudioDocumentSettings_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioDocument" ADD CONSTRAINT "StudioDocument_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalEvent" ADD CONSTRAINT "ExternalEvent_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioProfile" ADD CONSTRAINT "StudioProfile_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioProfilePackage" ADD CONSTRAINT "StudioProfilePackage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudioProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioProfilePortfolio" ADD CONSTRAINT "StudioProfilePortfolio_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudioProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

