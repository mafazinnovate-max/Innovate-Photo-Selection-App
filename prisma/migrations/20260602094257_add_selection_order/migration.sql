-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "selectionOrder" INTEGER,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false;
