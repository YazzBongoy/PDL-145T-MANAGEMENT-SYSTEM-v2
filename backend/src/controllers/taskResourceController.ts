import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all task-resource links
export async function getTaskResources(req: Request, res: Response) {
  try {
    const taskResources = await prisma.taskResource.findMany({
      include: {
        Resource: true,
        Task: true
      }
    });
    res.json(taskResources);
  } catch (error) {
    console.error('Error fetching task resources:', error);
    res.status(500).json({ error: 'Failed to fetch task resources' });
  }
}

// Create task-resource link
export async function createTaskResource(req: Request, res: Response) {
  try {
    const { TaskID, ResourceID, AllocatedQuantity } = req.body;
    
    if (!TaskID || !ResourceID || !AllocatedQuantity) {
      res.status(400).json({ error: 'TaskID, ResourceID, and AllocatedQuantity are required' });
      return;
    }

    const taskResource = await prisma.taskResource.create({
      data: {
        TaskID,
        ResourceID,
        AllocatedQuantity,
        ActualQuantity: null,
        UsageDate: new Date()
      },
      include: {
        Resource: true,
        Task: true
      }
    });
    
    res.status(201).json(taskResource);
  } catch (error) {
    console.error('Error creating task resource:', error);
    res.status(500).json({ error: 'Failed to create task resource link' });
  }
}

// Delete task-resource link
export async function deleteTaskResource(req: Request, res: Response) {
  try {
    const { taskId, resourceId } = req.params;
    
    await prisma.taskResource.delete({
      where: {
        TaskID_ResourceID: {
          TaskID: parseInt(taskId),
          ResourceID: parseInt(resourceId)
        }
      }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task resource:', error);
    res.status(500).json({ error: 'Failed to delete task resource link' });
  }
}
