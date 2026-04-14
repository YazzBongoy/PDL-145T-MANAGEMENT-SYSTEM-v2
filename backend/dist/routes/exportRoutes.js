import { Router } from 'express';
import { generateProjectReport, generateExcelData, generatePdfData } from '../services/exportService.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
const router = Router();
/**
 * GET /api/export/report/:projectId/json
 * Export project report as JSON
 */
router.get('/report/:projectId/json', requireAuth, requireRole(['ADMIN', 'SUPERVISOR']), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { includeAuditTrail, includeApprovals, includeReconciliation } = req.query;
        const report = await generateProjectReport({
            projectId: parseInt(projectId, 10),
            includeAuditTrail: includeAuditTrail === 'true',
            includeApprovals: includeApprovals === 'true',
            includeReconciliation: includeReconciliation === 'true',
        });
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="project-report-${projectId}-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(report);
    }
    catch (error) {
        console.error('Error exporting JSON report:', error);
        const errorMsg = error.message;
        res.status(500).json({
            success: false,
            error: errorMsg || 'Failed to export report',
        });
    }
});
/**
 * POST /api/export/report/:projectId/excel
 * Export project report as Excel (requires 'xlsx' package)
 * Note: Full implementation requires xlsx library integration
 */
router.post('/report/:projectId/excel', requireAuth, requireRole(['ADMIN', 'SUPERVISOR']), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { includeAuditTrail, includeApprovals, includeReconciliation } = req.body;
        const sheets = await generateExcelData({
            projectId: parseInt(projectId, 10),
            includeAuditTrail: includeAuditTrail || false,
            includeApprovals: includeApprovals || true,
            includeReconciliation: includeReconciliation || true,
        });
        // Return data structure for frontend to use with xlsx library
        res.json({
            success: true,
            data: sheets,
            filename: `project-report-${projectId}-${new Date().toISOString().split('T')[0]}.xlsx`,
        });
    }
    catch (error) {
        console.error('Error generating Excel data:', error);
        const errorMsg = error.message;
        res.status(500).json({
            success: false,
            error: errorMsg || 'Failed to export Excel report',
        });
    }
});
/**
 * GET /api/export/report/:projectId/pdf
 * Export project report as PDF (requires 'pdfkit' package)
 * Note: Full implementation requires pdfkit library integration
 */
router.get('/report/:projectId/pdf', requireAuth, requireRole(['ADMIN', 'SUPERVISOR']), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { includeAuditTrail, includeApprovals, includeReconciliation } = req.query;
        const pdfLines = await generatePdfData({
            projectId: parseInt(projectId, 10),
            includeAuditTrail: includeAuditTrail === 'true',
            includeApprovals: includeApprovals === 'true',
            includeReconciliation: includeReconciliation === 'true',
        });
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="project-report-${projectId}-${new Date().toISOString().split('T')[0]}.txt"`);
        res.send(pdfLines.join('\n'));
    }
    catch (error) {
        console.error('Error generating PDF report:', error);
        const errorMsg = error.message;
        res.status(500).json({
            success: false,
            error: errorMsg || 'Failed to export PDF report',
        });
    }
});
/**
 * GET /api/export/audit-trail/:projectId
 * Export audit trail for a project
 */
router.get('/audit-trail/:projectId', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { format = 'json' } = req.query;
        const report = await generateProjectReport({
            projectId: parseInt(projectId, 10),
            includeAuditTrail: true,
        });
        if (format === 'csv') {
            // Generate CSV
            let csvContent = 'Date,User,Action,Entity,Reason\n';
            if (report.auditTrail) {
                csvContent += report.auditTrail
                    .map((log) => [
                    new Date(log.timestamp).toLocaleString(),
                    log.user.name,
                    log.action,
                    log.entityType,
                    log.reason || '',
                ].join(','))
                    .join('\n');
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="audit-trail-${projectId}-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);
        }
        else {
            // JSON format
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="audit-trail-${projectId}-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(report.auditTrail || []);
        }
    }
    catch (error) {
        console.error('Error exporting audit trail:', error);
        const errorMsg = error.message;
        res.status(500).json({
            success: false,
            error: errorMsg || 'Failed to export audit trail',
        });
    }
});
/**
 * GET /api/export/reconciliation/:projectId
 * Export reconciliation summary
 */
router.get('/reconciliation/:projectId', requireAuth, requireRole(['ADMIN', 'CQ']), async (req, res) => {
    try {
        const { projectId } = req.params;
        const report = await generateProjectReport({
            projectId: parseInt(projectId, 10),
            includeReconciliation: true,
        });
        res.json({
            success: true,
            projectId: parseInt(projectId, 10),
            reconciliationSummary: report.reconciliationSummary,
            exportDate: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error exporting reconciliation:', error);
        const errorMsg = error.message;
        res.status(500).json({
            success: false,
            error: errorMsg || 'Failed to export reconciliation data',
        });
    }
});
export default router;
