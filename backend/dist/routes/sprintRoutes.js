import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';
const router = express.Router();
const prisma = new PrismaClient();
// Get all sprints for a project
router.get('/projects/:projectId/sprints', authenticateJWT, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    try {
        const sprints = await prisma.sprint.findMany({
            where: { ProjectID: projectId },
            include: {
                Tasks: true,
                _count: {
                    select: { Tasks: true }
                }
            },
            orderBy: { StartDate: 'desc' }
        });
        res.json(sprints);
    }
    catch (error) {
        console.error('Error fetching sprints:', error);
        res.status(500).json({ error: 'Failed to fetch sprints' });
    }
});
// Get a single sprint by ID
router.get('/sprints/:id', authenticateJWT, async (req, res) => {
    const sprintId = parseInt(req.params.id);
    try {
        const sprint = await prisma.sprint.findUnique({
            where: { SprintID: sprintId },
            include: {
                Tasks: true,
                Project: {
                    select: { ProjectID: true, Name: true }
                }
            }
        });
        if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }
        res.json(sprint);
    }
    catch (error) {
        console.error('Error fetching sprint:', error);
        res.status(500).json({ error: 'Failed to fetch sprint' });
    }
});
// Create a new sprint
router.post('/projects/:projectId/sprints', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const { Name, StartDate, EndDate, Status } = req.body;
    if (!Name || !StartDate || !EndDate) {
        return res.status(400).json({ error: 'Name, StartDate, and EndDate are required' });
    }
    try {
        const sprint = await prisma.sprint.create({
            data: {
                ProjectID: projectId,
                Name,
                StartDate: new Date(StartDate),
                EndDate: new Date(EndDate),
                Status: Status || 'PLANNED'
            }
        });
        res.status(201).json(sprint);
    }
    catch (error) {
        console.error('Error creating sprint:', error);
        res.status(500).json({ error: 'Failed to create sprint' });
    }
});
// Update a sprint
router.put('/sprints/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
    const sprintId = parseInt(req.params.id);
    const { Name, StartDate, EndDate, Status } = req.body;
    try {
        const existingSprint = await prisma.sprint.findUnique({
            where: { SprintID: sprintId }
        });
        if (!existingSprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }
        const sprint = await prisma.sprint.update({
            where: { SprintID: sprintId },
            data: {
                Name: Name ?? existingSprint.Name,
                StartDate: StartDate ? new Date(StartDate) : existingSprint.StartDate,
                EndDate: EndDate ? new Date(EndDate) : existingSprint.EndDate,
                Status: Status ?? existingSprint.Status
            }
        });
        res.json(sprint);
    }
    catch (error) {
        console.error('Error updating sprint:', error);
        res.status(500).json({ error: 'Failed to update sprint' });
    }
});
// Delete a sprint
router.delete('/sprints/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
    const sprintId = parseInt(req.params.id);
    try {
        const existingSprint = await prisma.sprint.findUnique({
            where: { SprintID: sprintId }
        });
        if (!existingSprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }
        await prisma.sprint.delete({
            where: { SprintID: sprintId }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting sprint:', error);
        res.status(500).json({ error: 'Failed to delete sprint' });
    }
});
// Assign task to sprint
router.put('/tasks/:taskId/sprint', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const { sprintId } = req.body;
    try {
        const task = await prisma.task.update({
            where: { TaskID: taskId },
            data: { SprintID: sprintId || null }
        });
        res.json(task);
    }
    catch (error) {
        console.error('Error assigning task to sprint:', error);
        res.status(500).json({ error: 'Failed to assign task to sprint' });
    }
});
// Get sprint board (tasks grouped by status)
router.get('/sprints/:id/board', authenticateJWT, async (req, res) => {
    const sprintId = parseInt(req.params.id);
    try {
        const sprint = await prisma.sprint.findUnique({
            where: { SprintID: sprintId },
            include: {
                Tasks: {
                    include: {
                        Expenses: true
                    }
                }
            }
        });
        if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }
        // Group tasks by completion status
        const board = {
            sprint,
            columns: {
                'NotStarted': sprint.Tasks.filter(t => t.CompletionStatus === 'NotStarted'),
                'InProgress': sprint.Tasks.filter(t => t.CompletionStatus === 'InProgress'),
                'Completed': sprint.Tasks.filter(t => t.CompletionStatus === 'Completed')
            }
        };
        res.json(board);
    }
    catch (error) {
        console.error('Error fetching sprint board:', error);
        res.status(500).json({ error: 'Failed to fetch sprint board' });
    }
});
export default router;
