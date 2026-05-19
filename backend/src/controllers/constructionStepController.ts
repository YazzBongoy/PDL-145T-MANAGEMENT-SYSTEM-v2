import { Request, Response } from 'express';
import { normalizeBody } from '../utils/normalizeBody.js';
import { PrismaClient, ConstructionStepType, StepStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Default construction steps for ouvrages
const DEFAULT_STEPS: { type: ConstructionStepType; name: string; order: number }[] = [
  { type: 'INSTALLATION_CHANTIER', name: 'Installation chantier et base vie', order: 1 },
  { type: 'FOUILLES', name: 'Fouilles manuelles et mécaniques', order: 2 },
  { type: 'MACONNERIE_FONDATION', name: 'Maçonnerie de fondation', order: 3 },
  { type: 'SOCLES_COLONNES', name: 'Socles et colonnes', order: 4 },
  { type: 'REMBLAIS', name: 'Remblais et compactage', order: 5 },
  { type: 'SOUS_PAVEMENT', name: 'Sous pavement et préparation', order: 6 },
  { type: 'STRUCTURE_CHARPENTE', name: 'Structure métallique et charpente', order: 7 },
  { type: 'TOITURE', name: 'Toiture et couverture', order: 8 },
  { type: 'INSTALLATION_ELECTRIQUE', name: 'Installation électrique', order: 9 },
  { type: 'INSTALLATION_SANITAIRE', name: 'Installation sanitaire et plomberie', order: 10 },
  { type: 'MENUISERIES', name: 'Menuiseries et cloisons', order: 11 },
  { type: 'FINITIONS_INTERIEURES', name: 'Finitions intérieures', order: 12 },
  { type: 'FINITIONS_EXTERIEURES', name: 'Finitions extérieures', order: 13 },
  { type: 'AMENAGEMENT_ACCES', name: 'Aménagement accès et parkings', order: 14 },
  { type: 'CLOTURES', name: 'Clôtures et sécurisation', order: 15 },
  { type: 'RECEPTION', name: 'Tests et réception', order: 16 },
];

// Get all steps for a task
export async function getStepsByTaskId(req: Request, res: Response) {
  try {
    const { taskId } = req.params;
    
    const steps = await prisma.constructionStep.findMany({
      where: { TaskID: parseInt(taskId) },
      include: {
        _count: {
          select: {
            Photos: true
          }
        }
      },
      orderBy: {
        Order: 'asc'
      }
    });
    
    res.json(steps);
  } catch (error) {
    console.error('Error fetching construction steps:', error);
    res.status(500).json({ error: 'Failed to fetch construction steps' });
  }
}

// Get single step by ID
export async function getStepById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const step = await prisma.constructionStep.findUnique({
      where: { StepID: parseInt(id) },
      include: {
        Photos: true,
        Task: {
          select: {
            TaskID: true,
            Name: true,
            ouvrageType: true
          }
        }
      }
    });
    
    if (!step) {
      res.status(404).json({ error: 'Construction step not found' });
      return;
    }
    
    res.json(step);
  } catch (error) {
    console.error('Error fetching construction step:', error);
    res.status(500).json({ error: 'Failed to fetch construction step' });
  }
}

// Create a new step
export async function createStep(req: Request, res: Response) {
  try {
    const { taskid, steptype, name, description, order, estimatedcost } = normalizeBody(req.body);
    const taskId = taskid; const stepType = steptype; const estimatedCost = estimatedcost;
    
    const step = await prisma.constructionStep.create({
      data: {
        TaskID: parseInt(taskId),
        StepType: stepType as ConstructionStepType,
        Name: name,
        Description: description,
        Order: order || 0,
        EstimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        Status: 'NOT_STARTED',
        ProgressPercent: 0
      }
    });
    
    res.status(201).json(step);
  } catch (error) {
    console.error('Error creating construction step:', error);
    res.status(500).json({ error: 'Failed to create construction step' });
  }
}

// Create default steps for a task
export async function createDefaultSteps(req: Request, res: Response) {
  try {
    const { taskId } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { TaskID: parseInt(taskId) }
    });
    
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    // Check if steps already exist
    const existingSteps = await prisma.constructionStep.count({
      where: { TaskID: parseInt(taskId) }
    });
    
    if (existingSteps > 0) {
      res.status(400).json({ error: 'Steps already exist for this task' });
      return;
    }
    
    // Create default steps
    const steps = await prisma.$transaction(
      DEFAULT_STEPS.map(step => 
        prisma.constructionStep.create({
          data: {
            TaskID: parseInt(taskId),
            StepType: step.type,
            Name: step.name,
            Order: step.order,
            Status: 'NOT_STARTED',
            ProgressPercent: 0,
            EstimatedCost: 0
          }
        })
      )
    );
    
    res.status(201).json({
      message: 'Default construction steps created successfully',
      steps: steps
    });
  } catch (error) {
    console.error('Error creating default steps:', error);
    res.status(500).json({ error: 'Failed to create default steps' });
  }
}

// Update a step
export async function updateStep(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, status, progresspercent, startdate, enddate, actualcost, estimatedcost } = normalizeBody(req.body);
    const progressPercent = progresspercent; const startDate = startdate; const endDate = enddate;
    const actualCost = actualcost; const estimatedCost = estimatedcost;
    
    const step = await prisma.constructionStep.update({
      where: { StepID: parseInt(id) },
      data: {
        Name: name,
        Description: description,
        Status: status as StepStatus,
        ProgressPercent: progressPercent !== undefined ? parseInt(progressPercent) : undefined,
        StartDate: startDate ? new Date(startDate) : undefined,
        EndDate: endDate ? new Date(endDate) : undefined,
        ActualCost: actualCost !== undefined ? parseFloat(actualCost) : undefined,
        EstimatedCost: estimatedCost !== undefined ? parseFloat(estimatedCost) : undefined
      }
    });
    
    // Update parent task progress
    await updateTaskProgress(step.TaskID);
    
    res.json(step);
  } catch (error) {
    console.error('Error updating construction step:', error);
    res.status(500).json({ error: 'Failed to update construction step' });
  }
}

// Update only progress
export async function updateStepProgress(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { progresspercent, status } = normalizeBody(req.body);
    const progressPercent = progresspercent;
    
    const step = await prisma.constructionStep.update({
      where: { StepID: parseInt(id) },
      data: {
        ProgressPercent: parseInt(progressPercent),
        Status: status as StepStatus,
        // Auto-set end date if completed
        EndDate: status === 'COMPLETED' ? new Date() : undefined
      }
    });
    
    // Update parent task progress
    await updateTaskProgress(step.TaskID);
    
    res.json(step);
  } catch (error) {
    console.error('Error updating step progress:', error);
    res.status(500).json({ error: 'Failed to update step progress' });
  }
}

// Delete a step
export async function deleteStep(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    await prisma.constructionStep.delete({
      where: { StepID: parseInt(id) }
    });
    
    res.json({ message: 'Construction step deleted successfully' });
  } catch (error) {
    console.error('Error deleting construction step:', error);
    res.status(500).json({ error: 'Failed to delete construction step' });
  }
}

// Add photo to step
export async function addPhotoToStep(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { url, caption, takenby, latitude, longitude } = normalizeBody(req.body);
    const takenBy = takenby;
    
    const photo = await prisma.constructionPhoto.create({
      data: {
        StepID: parseInt(id),
        URL: url,
        Caption: caption,
        TakenBy: takenBy,
        Latitude: latitude ? parseFloat(latitude) : null,
        Longitude: longitude ? parseFloat(longitude) : null
      }
    });
    
    res.status(201).json(photo);
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ error: 'Failed to add photo' });
  }
}

// Get photos for a step
export async function getStepPhotos(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const photos = await prisma.constructionPhoto.findMany({
      where: { StepID: parseInt(id) },
      orderBy: { TakenAt: 'desc' }
    });
    
    res.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
}

// Helper function to update task progress based on steps
async function updateTaskProgress(taskId: number) {
  try {
    const steps = await prisma.constructionStep.findMany({
      where: { TaskID: taskId }
    });
    
    if (steps.length === 0) return;
    
    // Calculate average progress
    const totalProgress = steps.reduce((sum, step) => sum + step.ProgressPercent, 0);
    const averageProgress = Math.round(totalProgress / steps.length);
    
    // Determine status based on steps
    let status = 'NotStarted';
    if (steps.every(s => s.Status === 'COMPLETED')) {
      status = 'Completed';
    } else if (steps.some(s => s.Status === 'IN_PROGRESS' || s.ProgressPercent > 0)) {
      status = 'InProgress';
    }
    
    // Update task
    await prisma.task.update({
      where: { TaskID: taskId },
      data: {
        progressPercentage: averageProgress,
        CompletionStatus: status as any
      }
    });
  } catch (error) {
    console.error('Error updating task progress:', error);
  }
}
