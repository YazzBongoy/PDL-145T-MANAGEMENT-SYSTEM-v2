/*
  Warnings:

  - Added the required column `UpdatedAt` to the `Territory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_TaskID_fkey";

-- DropForeignKey
ALTER TABLE "Measurement" DROP CONSTRAINT "Measurement_TaskID_fkey";

-- DropForeignKey
ALTER TABLE "ProjectResource" DROP CONSTRAINT "ProjectResource_ProjectID_fkey";

-- DropForeignKey
ALTER TABLE "ProjectResource" DROP CONSTRAINT "ProjectResource_ResourceID_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_ValidationID_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_ProjectID_fkey";

-- DropForeignKey
ALTER TABLE "TaskResource" DROP CONSTRAINT "TaskResource_ResourceID_fkey";

-- DropForeignKey
ALTER TABLE "TaskResource" DROP CONSTRAINT "TaskResource_TaskID_fkey";

-- DropForeignKey
ALTER TABLE "Validation" DROP CONSTRAINT "Validation_TaskID_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "MontantUSD" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Territory" ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "UpdatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Document_Category_idx" ON "Document"("Category");

-- CreateIndex
CREATE INDEX "Document_ProjectID_idx" ON "Document"("ProjectID");

-- CreateIndex
CREATE INDEX "Document_TerritoryID_idx" ON "Document"("TerritoryID");

-- CreateIndex
CREATE INDEX "Document_SiteID_idx" ON "Document"("SiteID");

-- CreateIndex
CREATE INDEX "Document_DocumentDate_idx" ON "Document"("DocumentDate");

-- CreateIndex
CREATE INDEX "Expense_TaskID_idx" ON "Expense"("TaskID");

-- CreateIndex
CREATE INDEX "Expense_Date_idx" ON "Expense"("Date");

-- CreateIndex
CREATE INDEX "Measurement_TaskID_idx" ON "Measurement"("TaskID");

-- CreateIndex
CREATE INDEX "Measurement_SiteID_idx" ON "Measurement"("SiteID");

-- CreateIndex
CREATE INDEX "Measurement_MeasurementType_idx" ON "Measurement"("MeasurementType");

-- CreateIndex
CREATE INDEX "Measurement_Date_idx" ON "Measurement"("Date");

-- CreateIndex
CREATE INDEX "Project_Name_idx" ON "Project"("Name");

-- CreateIndex
CREATE INDEX "Project_StartDate_idx" ON "Project"("StartDate");

-- CreateIndex
CREATE INDEX "ProjectResource_ResourceID_idx" ON "ProjectResource"("ResourceID");

-- CreateIndex
CREATE INDEX "Report_ValidationID_idx" ON "Report"("ValidationID");

-- CreateIndex
CREATE INDEX "Report_ProjectID_idx" ON "Report"("ProjectID");

-- CreateIndex
CREATE INDEX "Report_Timestamp_idx" ON "Report"("Timestamp");

-- CreateIndex
CREATE INDEX "Resource_Type_idx" ON "Resource"("Type");

-- CreateIndex
CREATE INDEX "Site_TerritoryID_idx" ON "Site"("TerritoryID");

-- CreateIndex
CREATE INDEX "Site_Type_idx" ON "Site"("Type");

-- CreateIndex
CREATE INDEX "Site_Province_idx" ON "Site"("Province");

-- CreateIndex
CREATE INDEX "Task_ProjectID_idx" ON "Task"("ProjectID");

-- CreateIndex
CREATE INDEX "Task_CompletionStatus_idx" ON "Task"("CompletionStatus");

-- CreateIndex
CREATE INDEX "Task_AssignedTo_idx" ON "Task"("AssignedTo");

-- CreateIndex
CREATE INDEX "TaskResource_ResourceID_idx" ON "TaskResource"("ResourceID");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Validation_TaskID_idx" ON "Validation"("TaskID");

-- CreateIndex
CREATE INDEX "Validation_SiteID_idx" ON "Validation"("SiteID");

-- CreateIndex
CREATE INDEX "Validation_Status_idx" ON "Validation"("Status");

-- CreateIndex
CREATE INDEX "Validation_Timestamp_idx" ON "Validation"("Timestamp");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResource" ADD CONSTRAINT "ProjectResource_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResource" ADD CONSTRAINT "ProjectResource_ResourceID_fkey" FOREIGN KEY ("ResourceID") REFERENCES "Resource"("ResourceID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskResource" ADD CONSTRAINT "TaskResource_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskResource" ADD CONSTRAINT "TaskResource_ResourceID_fkey" FOREIGN KEY ("ResourceID") REFERENCES "Resource"("ResourceID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_ValidationID_fkey" FOREIGN KEY ("ValidationID") REFERENCES "Validation"("ValidationID") ON DELETE CASCADE ON UPDATE CASCADE;
