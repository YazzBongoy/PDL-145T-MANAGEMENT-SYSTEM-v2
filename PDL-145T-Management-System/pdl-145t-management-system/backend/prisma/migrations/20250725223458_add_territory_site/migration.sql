-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('CENTRE_DE_SANTE', 'ECOLE_PRIMAIRE', 'BATIMENT_ADMINISTRATIF');

-- CreateTable
CREATE TABLE "Territory" (
    "TerritoryID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("TerritoryID")
);

-- CreateTable
CREATE TABLE "Site" (
    "SiteID" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Type" "SiteType" NOT NULL,
    "Province" TEXT NOT NULL,
    "TerritoryID" INTEGER NOT NULL,
    "Location" TEXT,
    "Elevation" DOUBLE PRECISION,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("SiteID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Territory_Name_key" ON "Territory"("Name");

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_SiteID_fkey" FOREIGN KEY ("SiteID") REFERENCES "Site"("SiteID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_SiteID_fkey" FOREIGN KEY ("SiteID") REFERENCES "Site"("SiteID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_TerritoryID_fkey" FOREIGN KEY ("TerritoryID") REFERENCES "Territory"("TerritoryID") ON DELETE RESTRICT ON UPDATE CASCADE;
