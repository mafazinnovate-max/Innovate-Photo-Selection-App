-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "email" TEXT,
ADD COLUMN     "galleryMode" TEXT NOT NULL DEFAULT 'single',
ADD COLUMN     "phoneNumber" TEXT;
