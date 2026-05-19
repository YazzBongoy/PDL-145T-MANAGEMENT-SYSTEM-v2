/*
  Warnings:

  - A unique constraint covering the columns `[SerialNumber]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ProgramID` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnterpriseType" AS ENUM ('SPRL', 'SARL', 'SA', 'SNC', 'SCS', 'ONG', 'AUTRES');

-- CreateEnum
CREATE TYPE "EnterpriseRole" AS ENUM ('CHEF_FILE', 'MEMBRE_GROUPEMENT', 'CFEF_CONTRACTANT', 'SOUS_TRAITANT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PLAN', 'CONTRAT', 'PV_RECEPTION', 'RAPPORT_AVANCEMENT', 'FACTURE', 'DECOMPTE', 'GARANTIE', 'AUTRE');

-- CreateEnum
CREATE TYPE "OuvrageType" AS ENUM ('ECOLE', 'CENTRE_SANTE', 'BATIMENT_ADMINISTRATIF');

-- CreateEnum
CREATE TYPE "ConstructionStepType" AS ENUM ('INSTALLATION_CHANTIER', 'FOUILLES', 'MACONNERIE_FONDATION', 'SOCLES_COLONNES', 'REMBLAIS', 'SOUS_PAVEMENT', 'STRUCTURE_CHARPENTE', 'TOITURE', 'INSTALLATION_ELECTRIQUE', 'INSTALLATION_SANITAIRE', 'MENUISERIES', 'FINITIONS_INTERIEURES', 'FINITIONS_EXTERIEURES', 'AMENAGEMENT_ACCES', 'CLOTURES', 'RECEPTION');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'APPROVAL_REQUIRED', 'APPROVAL_GRANTED', 'APPROVAL_REJECTED', 'REPORT_GENERATED', 'SYSTEM');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "Description" TEXT,
ADD COLUMN     "ProgramID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "Cost" DECIMAL(65,30),
ADD COLUMN     "Description" TEXT,
ADD COLUMN     "LastMaintenance" TIMESTAMP(3),
ADD COLUMN     "Location" TEXT,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "NextMaintenance" TIMESTAMP(3),
ADD COLUMN     "PurchaseDate" TIMESTAMP(3),
ADD COLUMN     "SerialNumber" TEXT,
ADD COLUMN     "Status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "Quantity" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "Level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "ParentTaskID" INTEGER,
ADD COLUMN     "ouvrageType" "OuvrageType",
ALTER COLUMN "actualCost" SET DEFAULT 0,
ALTER COLUMN "estimatedCost" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "TaskResource" ADD COLUMN     "ActualQuantity" INTEGER,
ADD COLUMN     "AllocatedQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "UsageDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "Program" (
    "ProgramID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "StartDate" TIMESTAMP(3),
    "EndDate" TIMESTAMP(3),
    "Budget" DECIMAL(65,30),
    "Status" "ProgramStatus" NOT NULL DEFAULT 'ACTIVE',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("ProgramID")
);

-- CreateTable
CREATE TABLE "ProjectSite" (
    "ProjectID" INTEGER NOT NULL,
    "SiteID" TEXT NOT NULL,

    CONSTRAINT "ProjectSite_pkey" PRIMARY KEY ("ProjectID","SiteID")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "language" TEXT NOT NULL DEFAULT 'en',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "notifications" JSONB NOT NULL DEFAULT '{}',
    "emailNotifications" JSONB NOT NULL DEFAULT '{}',
    "pushNotifications" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionStep" (
    "StepID" SERIAL NOT NULL,
    "TaskID" INTEGER NOT NULL,
    "StepType" "ConstructionStepType" NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Order" INTEGER NOT NULL DEFAULT 0,
    "ProgressPercent" INTEGER NOT NULL DEFAULT 0,
    "Status" "StepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "StartDate" TIMESTAMP(3),
    "EndDate" TIMESTAMP(3),
    "ActualCost" DECIMAL(65,30) DEFAULT 0,
    "EstimatedCost" DECIMAL(65,30) DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionStep_pkey" PRIMARY KEY ("StepID")
);

-- CreateTable
CREATE TABLE "ConstructionPhoto" (
    "PhotoID" SERIAL NOT NULL,
    "StepID" INTEGER NOT NULL,
    "URL" TEXT NOT NULL,
    "Caption" TEXT,
    "TakenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TakenBy" TEXT,
    "Latitude" DOUBLE PRECISION,
    "Longitude" DOUBLE PRECISION,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConstructionPhoto_pkey" PRIMARY KEY ("PhotoID")
);

-- CreateTable
CREATE TABLE "Enterprise" (
    "EnterpriseID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Type" "EnterpriseType" NOT NULL,
    "Role" "EnterpriseRole" NOT NULL,
    "ContactEmail" TEXT,
    "ContactPhone" TEXT,
    "Address" TEXT,
    "TaxID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enterprise_pkey" PRIMARY KEY ("EnterpriseID")
);

-- CreateTable
CREATE TABLE "ProjectEnterprise" (
    "ProjectID" INTEGER NOT NULL,
    "EnterpriseID" INTEGER NOT NULL,
    "Role" "EnterpriseRole" NOT NULL,
    "JoinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectEnterprise_pkey" PRIMARY KEY ("ProjectID","EnterpriseID")
);

-- CreateTable
CREATE TABLE "Contract" (
    "ContractID" SERIAL NOT NULL,
    "ContractNumber" TEXT NOT NULL,
    "ProjectID" INTEGER NOT NULL,
    "EnterpriseID" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "TotalAmount" DECIMAL(65,30) NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3),
    "Status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "AdvancePayment" DECIMAL(65,30) DEFAULT 0,
    "RetentionRate" DECIMAL(65,30) DEFAULT 5,
    "PenaltyRate" DECIMAL(65,30) DEFAULT 0.1,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("ContractID")
);

-- CreateTable
CREATE TABLE "PaymentSchedule" (
    "ScheduleID" SERIAL NOT NULL,
    "ContractID" INTEGER NOT NULL,
    "Description" TEXT,
    "Amount" DECIMAL(65,30) NOT NULL,
    "DueDate" TIMESTAMP(3) NOT NULL,
    "PaidAmount" DECIMAL(65,30) DEFAULT 0,
    "PaidDate" TIMESTAMP(3),
    "Status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("ScheduleID")
);

-- CreateTable
CREATE TABLE "Document" (
    "DocumentID" SERIAL NOT NULL,
    "ContractID" INTEGER,
    "ProjectID" INTEGER,
    "Name" TEXT NOT NULL,
    "Type" "DocumentType" NOT NULL,
    "URL" TEXT NOT NULL,
    "Version" INTEGER NOT NULL DEFAULT 1,
    "Size" INTEGER,
    "MimeType" TEXT,
    "UploadedBy" INTEGER NOT NULL,
    "UploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("DocumentID")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "userId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "grantedBy" INTEGER,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userId","permissionId")
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "ConstructionStep_TaskID_idx" ON "ConstructionStep"("TaskID");

-- CreateIndex
CREATE INDEX "ConstructionStep_StepType_idx" ON "ConstructionStep"("StepType");

-- CreateIndex
CREATE INDEX "ConstructionStep_Status_idx" ON "ConstructionStep"("Status");

-- CreateIndex
CREATE INDEX "ConstructionPhoto_StepID_idx" ON "ConstructionPhoto"("StepID");

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_TaxID_key" ON "Enterprise"("TaxID");

-- CreateIndex
CREATE INDEX "ProjectEnterprise_ProjectID_idx" ON "ProjectEnterprise"("ProjectID");

-- CreateIndex
CREATE INDEX "ProjectEnterprise_EnterpriseID_idx" ON "ProjectEnterprise"("EnterpriseID");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_ContractNumber_key" ON "Contract"("ContractNumber");

-- CreateIndex
CREATE INDEX "Contract_ProjectID_idx" ON "Contract"("ProjectID");

-- CreateIndex
CREATE INDEX "Contract_EnterpriseID_idx" ON "Contract"("EnterpriseID");

-- CreateIndex
CREATE INDEX "Contract_Status_idx" ON "Contract"("Status");

-- CreateIndex
CREATE INDEX "PaymentSchedule_ContractID_idx" ON "PaymentSchedule"("ContractID");

-- CreateIndex
CREATE INDEX "PaymentSchedule_DueDate_idx" ON "PaymentSchedule"("DueDate");

-- CreateIndex
CREATE INDEX "Document_ContractID_idx" ON "Document"("ContractID");

-- CreateIndex
CREATE INDEX "Document_ProjectID_idx" ON "Document"("ProjectID");

-- CreateIndex
CREATE INDEX "Document_Type_idx" ON "Document"("Type");

-- CreateIndex
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_createdAt_idx" ON "UserActivity"("createdAt");

-- CreateIndex
CREATE INDEX "UserActivity_entityType_entityId_idx" ON "UserActivity"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_module_idx" ON "Permission"("module");

-- CreateIndex
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");

-- CreateIndex
CREATE INDEX "UserPermission_permissionId_idx" ON "UserPermission"("permissionId");

-- CreateIndex
CREATE INDEX "ReportTemplate_module_idx" ON "ReportTemplate"("module");

-- CreateIndex
CREATE INDEX "ReportTemplate_isPublic_idx" ON "ReportTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "ReportTemplate_createdBy_idx" ON "ReportTemplate"("createdBy");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_expenseId_idx" ON "ApprovalWorkflow"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_SerialNumber_key" ON "Resource"("SerialNumber");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ProgramID_fkey" FOREIGN KEY ("ProgramID") REFERENCES "Program"("ProgramID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSite" ADD CONSTRAINT "ProjectSite_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSite" ADD CONSTRAINT "ProjectSite_SiteID_fkey" FOREIGN KEY ("SiteID") REFERENCES "Site"("SiteID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_ParentTaskID_fkey" FOREIGN KEY ("ParentTaskID") REFERENCES "Task"("TaskID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionStep" ADD CONSTRAINT "ConstructionStep_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionPhoto" ADD CONSTRAINT "ConstructionPhoto_StepID_fkey" FOREIGN KEY ("StepID") REFERENCES "ConstructionStep"("StepID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEnterprise" ADD CONSTRAINT "ProjectEnterprise_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEnterprise" ADD CONSTRAINT "ProjectEnterprise_EnterpriseID_fkey" FOREIGN KEY ("EnterpriseID") REFERENCES "Enterprise"("EnterpriseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_EnterpriseID_fkey" FOREIGN KEY ("EnterpriseID") REFERENCES "Enterprise"("EnterpriseID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_ContractID_fkey" FOREIGN KEY ("ContractID") REFERENCES "Contract"("ContractID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ContractID_fkey" FOREIGN KEY ("ContractID") REFERENCES "Contract"("ContractID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTemplate" ADD CONSTRAINT "ReportTemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
