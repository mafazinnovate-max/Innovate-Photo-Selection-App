/*
  Warnings:

  - A unique constraint covering the columns `[eventId,parentId,deviceId,accessVersion]` on the table `GalleryAccess` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "GalleryAccess_eventId_deviceId_key";

-- AlterTable
ALTER TABLE "GalleryAccess" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAccess_eventId_parentId_deviceId_accessVersion_key" ON "GalleryAccess"("eventId", "parentId", "deviceId", "accessVersion");
