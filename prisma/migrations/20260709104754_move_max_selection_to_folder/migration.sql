/*
  Warnings:

  - You are about to drop the column `maxSelections` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "maxSelections";

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "maxSelections" INTEGER;
