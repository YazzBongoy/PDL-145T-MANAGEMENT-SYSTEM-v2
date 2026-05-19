import { Request, Response } from 'express';
import { normalizeBody } from '../utils/normalizeBody.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all projects
export async function getProjects(req: Request, res: Response) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        Program: {
          select: {
            ProgramID: true,
            Name: true
          }
        },
        ProjectSites: {
          include: {
            Site: {
              select: { SiteID: true, Name: true, Province: true, Type: true }
            }
          }
        },
        _count: {
          select: {
            Tasks: true,
            Sprints: true
          }
        }
      },
      orderBy: {
        CreatedAt: 'desc'
      }
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// Get project by ID
export async function getProjectById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { ProjectID: parseInt(id) },
      include: {
        Program: true,
        Tasks: {
          where: {
            ParentTaskID: null
          },
          include: {
            _count: {
              select: { SubTasks: true }
            }
          }
        },
        Sprints: true,
        _count: {
          select: {
            Tasks: true,
            Sprints: true,
            ProjectResources: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

// Create project
export async function createProject(req: Request, res: Response) {
  try {
    const { name, description, startDate, endDate, totalBudget, programID, siteIDs } = normalizeBody(req.body);
    const programId = programID;
    const siteIds = siteIDs;

    // Validate required fields
    if (!name || !programId) {
      return res.status(400).json({ error: 'Name and programId are required' });
    }

    const project = await prisma.project.create({
      data: {
        Name: name,
        Description: description,
        StartDate: startDate ? new Date(startDate) : new Date(),
        EndDate: endDate ? new Date(endDate) : null,
        TotalBudget: totalBudget ? parseFloat(totalBudget) : 0,
        ProgramID: parseInt(programId),
        ProjectSites: siteIds?.length ? {
          create: siteIds.map((sid: string) => ({ SiteID: sid }))
        } : undefined
      },
      include: {
        Program: { select: { ProgramID: true, Name: true } },
        ProjectSites: { include: { Site: { select: { SiteID: true, Name: true, Province: true, Type: true } } } }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

// Update project
export async function updateProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, totalBudget, status, siteIDs } = normalizeBody(req.body);
    const siteIds = siteIDs;

    const project = await prisma.project.update({
      where: { ProjectID: parseInt(id) },
      data: {
        Name: name,
        Description: description,
        StartDate: startDate ? new Date(startDate) : undefined,
        EndDate: endDate ? new Date(endDate) : undefined,
        TotalBudget: totalBudget !== undefined ? parseFloat(totalBudget) : undefined,
        ...(siteIds !== undefined ? {
          ProjectSites: {
            deleteMany: {},
            create: siteIds.map((sid: string) => ({ SiteID: sid }))
          }
        } : {})
      },
      include: {
        Program: { select: { ProgramID: true, Name: true } },
        ProjectSites: { include: { Site: { select: { SiteID: true, Name: true, Province: true, Type: true } } } }
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

// Delete project
export async function deleteProject(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { ProjectID: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

// Get project stats
export async function getProjectStats(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const [totalTasks, completedTasks, totalSprints] = await Promise.all([
      prisma.task.count({ where: { ProjectID: projectId } }),
      prisma.task.count({ where: { ProjectID: projectId, CompletionStatus: 'Completed' } }),
      prisma.sprint.count({ where: { ProjectID: projectId } })
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.json({
      totalTasks,
      completedTasks,
      totalSprints,
      completionRate: Math.round(completionRate * 100) / 100
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ error: 'Failed to fetch project stats' });
  }
}

// Get project tasks
export async function getProjectTasks(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const tasks = await prisma.task.findMany({
      where: { ProjectID: projectId },
      orderBy: { CreatedAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: 'Failed to fetch project tasks' });
  }
}

// Get project sprints
export async function getProjectSprints(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const sprints = await prisma.sprint.findMany({
      where: { ProjectID: projectId },
      orderBy: { StartDate: 'desc' }
    });

    res.json(sprints);
  } catch (error) {
    console.error('Error fetching project sprints:', error);
    res.status(500).json({ error: 'Failed to fetch project sprints' });
  }
}
