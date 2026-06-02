-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "coverImagePublicId" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "coverPosition" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "eventDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "fileName" TEXT;

-- CreateTable
CREATE TABLE "Selection" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Selection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Selection" ADD CONSTRAINT "Selection_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
