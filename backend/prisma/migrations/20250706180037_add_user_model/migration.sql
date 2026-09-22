-- CreateEnum
CREATE TYPE "TaskCompletionStatus" AS ENUM ('NotStarted', 'InProgress', 'Completed');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPERVISOR', 'FINANCE', 'CONSTRUCTION');

-- CreateTable
CREATE TABLE "Project" (
    "ProjectID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3),
    "TotalBudget" DECIMAL(65,30) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("ProjectID")
);

-- CreateTable
CREATE TABLE "Task" (
    "TaskID" SERIAL NOT NULL,
    "ProjectID" INTEGER NOT NULL,
    "Description" TEXT,
    "Duration" INTEGER,
    "AssignedTo" TEXT,
    "CompletionStatus" "TaskCompletionStatus" NOT NULL DEFAULT 'NotStarted',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("TaskID")
);

-- CreateTable
CREATE TABLE "Expense" (
    "ExpenseID" SERIAL NOT NULL,
    "TaskID" INTEGER NOT NULL,
    "Description" TEXT,
    "Cost" DECIMAL(65,30) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("ExpenseID")
);

-- CreateTable
CREATE TABLE "Resource" (
    "ResourceID" SERIAL NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" DECIMAL(65,30) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("ResourceID")
);

-- CreateTable
CREATE TABLE "ProjectResource" (
    "ProjectID" INTEGER NOT NULL,
    "ResourceID" INTEGER NOT NULL,

    CONSTRAINT "ProjectResource_pkey" PRIMARY KEY ("ProjectID","ResourceID")
);

-- CreateTable
CREATE TABLE "TaskResource" (
    "TaskID" INTEGER NOT NULL,
    "ResourceID" INTEGER NOT NULL,

    CONSTRAINT "TaskResource_pkey" PRIMARY KEY ("TaskID","ResourceID")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "MeasurementID" SERIAL NOT NULL,
    "TaskID" INTEGER NOT NULL,
    "SiteID" TEXT NOT NULL,
    "MeasurementType" TEXT NOT NULL,
    "Value" DECIMAL(65,30) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("MeasurementID")
);

-- CreateTable
CREATE TABLE "Validation" (
    "ValidationID" SERIAL NOT NULL,
    "TaskID" INTEGER NOT NULL,
    "SiteID" TEXT NOT NULL,
    "Status" "ValidationStatus" NOT NULL DEFAULT 'Pending',
    "Notes" TEXT,
    "GeneratedBy" TEXT NOT NULL,
    "Timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Validation_pkey" PRIMARY KEY ("ValidationID")
);

-- CreateTable
CREATE TABLE "Report" (
    "ReportID" SERIAL NOT NULL,
    "ValidationID" INTEGER NOT NULL,
    "ProjectID" INTEGER NOT NULL,
    "GeneratedBy" TEXT NOT NULL,
    "Timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("ReportID")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResource" ADD CONSTRAINT "ProjectResource_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResource" ADD CONSTRAINT "ProjectResource_ResourceID_fkey" FOREIGN KEY ("ResourceID") REFERENCES "Resource"("ResourceID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskResource" ADD CONSTRAINT "TaskResource_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskResource" ADD CONSTRAINT "TaskResource_ResourceID_fkey" FOREIGN KEY ("ResourceID") REFERENCES "Resource"("ResourceID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_TaskID_fkey" FOREIGN KEY ("TaskID") REFERENCES "Task"("TaskID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_ValidationID_fkey" FOREIGN KEY ("ValidationID") REFERENCES "Validation"("ValidationID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE RESTRICT ON UPDATE CASCADE;
