-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('JURIDIQUE', 'FINANCE', 'SUIVI', 'TECHNIQUE', 'ADMIN');

-- CreateTable
CREATE TABLE "Document" (
    "DocumentID" SERIAL NOT NULL,
    "FileName" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Category" "DocumentCategory" NOT NULL,
    "OntologyClass" TEXT NOT NULL,
    "DocumentDate" TIMESTAMP(3),
    "FilePath" TEXT NOT NULL,
    "Lot" TEXT,
    "Phase" TEXT,
    "ProjectID" INTEGER,
    "TerritoryID" INTEGER,
    "SiteID" TEXT,
    "MontantUSD" DECIMAL(18,2),
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("DocumentID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_FileName_key" ON "Document"("FileName");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_TerritoryID_fkey" FOREIGN KEY ("TerritoryID") REFERENCES "Territory"("TerritoryID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_SiteID_fkey" FOREIGN KEY ("SiteID") REFERENCES "Site"("SiteID") ON DELETE SET NULL ON UPDATE CASCADE;
