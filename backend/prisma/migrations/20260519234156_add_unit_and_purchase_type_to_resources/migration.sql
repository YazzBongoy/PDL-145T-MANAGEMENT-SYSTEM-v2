-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "PurchaseType" TEXT,
ADD COLUMN     "Unit" TEXT;

-- CreateTable
CREATE TABLE "SiteResource" (
    "SiteID" TEXT NOT NULL,
    "ResourceID" INTEGER NOT NULL,
    "AllocatedQuantity" INTEGER NOT NULL DEFAULT 1,
    "ActualQuantity" INTEGER,
    "UsageDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteResource_pkey" PRIMARY KEY ("SiteID","ResourceID")
);

-- AddForeignKey
ALTER TABLE "SiteResource" ADD CONSTRAINT "SiteResource_ResourceID_fkey" FOREIGN KEY ("ResourceID") REFERENCES "Resource"("ResourceID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteResource" ADD CONSTRAINT "SiteResource_SiteID_fkey" FOREIGN KEY ("SiteID") REFERENCES "Site"("SiteID") ON DELETE RESTRICT ON UPDATE CASCADE;
