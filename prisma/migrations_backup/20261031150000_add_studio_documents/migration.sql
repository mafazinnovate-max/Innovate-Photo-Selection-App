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

-- CreateIndex
CREATE UNIQUE INDEX "StudioDocumentSettings_studioId_key" ON "StudioDocumentSettings"("studioId");

-- CreateIndex
CREATE INDEX "StudioDocument_studioId_createdAt_idx" ON "StudioDocument"("studioId", "createdAt");

-- CreateIndex
CREATE INDEX "StudioDocument_studioId_clientName_idx" ON "StudioDocument"("studioId", "clientName");

-- AddForeignKey
ALTER TABLE "StudioDocumentSettings" ADD CONSTRAINT "StudioDocumentSettings_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioDocument" ADD CONSTRAINT "StudioDocument_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
