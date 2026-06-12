/*
  Warnings:

  - You are about to drop the `GallerySession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GallerySession" DROP CONSTRAINT "GallerySession_eventId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "accessCodeVersion" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "GallerySession";

-- CreateTable
CREATE TABLE "GalleryAccess" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAccess_eventId_deviceId_key" ON "GalleryAccess"("eventId", "deviceId");

-- AddForeignKey
ALTER TABLE "GalleryAccess" ADD CONSTRAINT "GalleryAccess_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
