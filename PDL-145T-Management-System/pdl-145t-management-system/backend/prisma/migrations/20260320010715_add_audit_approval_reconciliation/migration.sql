-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "ApprovalLevel" AS ENUM ('LEVEL_1_RL', 'LEVEL_2_RC', 'LEVEL_3_CQ', 'LEVEL_4_CFEF');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('Matched', 'Discrepancy', 'Pending', 'Resolved');

-- AlterTable: Add new columns to Task table
ALTER TABLE "Task" ADD COLUMN "progressPercentage" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Task" ADD COLUMN "actualCost" DECIMAL(65,30);
ALTER TABLE "Task" ADD COLUMN "estimatedCost" DECIMAL(65,30);
ALTER TABLE "Task" ADD COLUMN "statusReason" TEXT;

-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changes" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ExpenseHistory
CREATE TABLE "ExpenseHistory" (
    "id" SERIAL NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" INTEGER NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ApprovalWorkflow
CREATE TABLE "ApprovalWorkflow" (
    "id" SERIAL NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "currentLevel" "ApprovalLevel" NOT NULL DEFAULT 'LEVEL_1_RL',
    "level1_approver" INTEGER,
    "level1_status" "ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "level1_date" TIMESTAMP(3),
    "level1_notes" TEXT,
    "level2_approver" INTEGER,
    "level2_status" "ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "level2_date" TIMESTAMP(3),
    "level2_notes" TEXT,
    "level3_approver" INTEGER,
    "level3_status" "ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "level3_date" TIMESTAMP(3),
    "level3_notes" TEXT,
    "level4_approver" INTEGER,
    "level4_status" "ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "level4_date" TIMESTAMP(3),
    "level4_notes" TEXT,
    "paymentBlockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ReconciliationAudit
CREATE TABLE "ReconciliationAudit" (
    "id" SERIAL NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'Pending',
    "discrepancyReason" TEXT,
    "auditedBy" INTEGER NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolutionDate" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "ExpenseHistory_expenseId_idx" ON "ExpenseHistory"("expenseId");
CREATE INDEX "ExpenseHistory_changedBy_idx" ON "ExpenseHistory"("changedBy");
CREATE INDEX "ExpenseHistory_changedAt_idx" ON "ExpenseHistory"("changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalWorkflow_expenseId_key" ON "ApprovalWorkflow"("expenseId");
CREATE INDEX "ApprovalWorkflow_currentLevel_idx" ON "ApprovalWorkflow"("currentLevel");
CREATE INDEX "ApprovalWorkflow_level1_status_idx" ON "ApprovalWorkflow"("level1_status");
CREATE INDEX "ApprovalWorkflow_level4_status_idx" ON "ApprovalWorkflow"("level4_status");

-- CreateIndex
CREATE INDEX "ReconciliationAudit_expenseId_idx" ON "ReconciliationAudit"("expenseId");
CREATE INDEX "ReconciliationAudit_status_idx" ON "ReconciliationAudit"("status");
CREATE INDEX "ReconciliationAudit_invoiceId_idx" ON "ReconciliationAudit"("invoiceId");
CREATE INDEX "ReconciliationAudit_auditDate_idx" ON "ReconciliationAudit"("auditDate");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseHistory" ADD CONSTRAINT "ExpenseHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseHistory" ADD CONSTRAINT "ExpenseHistory_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("ExpenseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("ExpenseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_level1_approver_fkey" FOREIGN KEY ("level1_approver") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_level2_approver_fkey" FOREIGN KEY ("level2_approver") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_level3_approver_fkey" FOREIGN KEY ("level3_approver") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_level4_approver_fkey" FOREIGN KEY ("level4_approver") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationAudit" ADD CONSTRAINT "ReconciliationAudit_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("ExpenseID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationAudit" ADD CONSTRAINT "ReconciliationAudit_auditedBy_fkey" FOREIGN KEY ("auditedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
