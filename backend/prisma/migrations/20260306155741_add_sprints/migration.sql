-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "SprintID" INTEGER;

-- CreateTable
CREATE TABLE "Sprint" (
    "SprintID" SERIAL NOT NULL,
    "ProjectID" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "Status" "SprintStatus" NOT NULL DEFAULT 'PLANNED',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("SprintID")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_SprintID_fkey" FOREIGN KEY ("SprintID") REFERENCES "Sprint"("SprintID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE RESTRICT ON UPDATE CASCADE;
