import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all programs
export async function getPrograms(req: Request, res: Response) {
  try {
    const programs = await prisma.program.findMany({
      include: {
        Projects: {
          select: {
            ProjectID: true,
            Name: true,
            StartDate: true,
            EndDate: true,
            TotalBudget: true,
            ProjectSites: {
              include: {
                Site: { select: { SiteID: true, Name: true, Province: true, Type: true } }
              }
            },
            _count: {
              select: {
                Tasks: true
              }
            }
          }
        },
        _count: {
          select: {
            Projects: true
          }
        }
      },
      orderBy: {
        CreatedAt: 'desc'
      }
    });

    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
}

// Get program by ID
export async function getProgramById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const program = await prisma.program.findUnique({
      where: { ProgramID: parseInt(id) },
      include: {
        Projects: {
          include: {
            Tasks: {
              where: {
                ParentTaskID: null // Only top-level tasks
              },
              select: {
                TaskID: true,
                Name: true,
                CompletionStatus: true,
                progressPercentage: true
              }
            },
            _count: {
              select: {
                Tasks: true
              }
            }
          }
        },
        _count: {
          select: {
            Projects: true
          }
        }
      }
    });

    if (!program) {
      res.status(404).json({ error: 'Program not found' });
      return;
    }

    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
}

// Create program
export async function createProgram(req: Request, res: Response) {
  try {
    const { name, description, startDate, endDate, budget } = req.body;

    const program = await prisma.program.create({
      data: {
        Name: name,
        Description: description,
        StartDate: startDate ? new Date(startDate) : null,
        EndDate: endDate ? new Date(endDate) : null,
        Budget: budget ? parseFloat(budget) : null
      }
    });

    res.status(201).json(program);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ error: 'Failed to create program' });
  }
}

// Update program
export async function updateProgram(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, budget, status } = req.body;

    const program = await prisma.program.update({
      where: { ProgramID: parseInt(id) },
      data: {
        Name: name,
        Description: description,
        StartDate: startDate ? new Date(startDate) : undefined,
        EndDate: endDate ? new Date(endDate) : undefined,
        Budget: budget !== undefined ? parseFloat(budget) : undefined,
        Status: status
      }
    });

    res.json(program);
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
}

// Delete program
export async function deleteProgram(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.program.delete({
      where: { ProgramID: parseInt(id) }
    });

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: 'Failed to delete program' });
  }
}

// Get program statistics
export async function getProgramStats(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const program = await prisma.program.findUnique({
      where: { ProgramID: parseInt(id) },
      include: {
        Projects: {
          include: {
            Tasks: {
              select: {
                CompletionStatus: true,
                progressPercentage: true
              }
            }
          }
        }
      }
    });

    if (!program) {
      res.status(404).json({ error: 'Program not found' });
      return;
    }

    // Calculate statistics
    const totalProjects = program.Projects.length;
    const totalTasks = program.Projects.reduce((acc: number, p: any) => acc + p.Tasks.length, 0);
    const completedTasks = program.Projects.reduce(
      (acc: number, p: any) => acc + p.Tasks.filter((t: any) => t.CompletionStatus === 'Completed').length, 
      0
    );
    const inProgressTasks = program.Projects.reduce(
      (acc: number, p: any) => acc + p.Tasks.filter((t: any) => t.CompletionStatus === 'InProgress').length,
      0
    );
    const notStartedTasks = totalTasks - completedTasks - inProgressTasks;

    const totalBudget = program.Projects.reduce((acc: number, p: any) => acc + Number(p.TotalBudget), 0);

    const avgProgress = totalTasks > 0 
      ? program.Projects.reduce((acc: number, p: any) => 
          acc + p.Tasks.reduce((tacc: number, t: any) => tacc + t.progressPercentage, 0), 0) / totalTasks
      : 0;

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      totalBudget,
      averageProgress: Math.round(avgProgress * 100) / 100,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching program stats:', error);
    res.status(500).json({ error: 'Failed to fetch program statistics' });
  }
}
