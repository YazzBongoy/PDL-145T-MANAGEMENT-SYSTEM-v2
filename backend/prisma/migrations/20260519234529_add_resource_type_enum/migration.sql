/*
  Warnings:

  - Changed the type of `Type` on the `Resource` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PERSONNE', 'EQUIPEMENT', 'MATÉRIEL');

-- AlterTable
-- Add temporary column with enum type
ALTER TABLE "Resource" ADD COLUMN "Type_temp" "ResourceType";

-- Copy data from old column to new column, converting strings to enum values
UPDATE "Resource" SET "Type_temp" = "Type"::text::"ResourceType";

-- Drop old column
ALTER TABLE "Resource" DROP COLUMN "Type";

-- Rename temporary column to original name
ALTER TABLE "Resource" RENAME COLUMN "Type_temp" TO "Type";
