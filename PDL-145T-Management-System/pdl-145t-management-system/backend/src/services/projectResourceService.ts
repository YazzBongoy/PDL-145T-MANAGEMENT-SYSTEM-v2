import { PrismaClient } from '@prisma/client';
import { ProjectResourceCreateRequest } from '../types/express.js';

const prisma = new PrismaClient();

export class ProjectResourceService {
  // Add resource to project
  async addResourceToProject(data: ProjectResourceCreateRequest) {
    // Verify that the project and resource exist
    const [project, resource] = await Promise.all([
      prisma.project.findUnique({
        where: { ProjectID: data.ProjectID },
      }),
      prisma.resource.findUnique({
        where: { ResourceID: data.ResourceID },
      }),
    ]);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Check if relationship already exists
    const existing = await prisma.projectResource.findUnique({
      where: {
        ProjectID_ResourceID: {
          ProjectID: data.ProjectID,
          ResourceID: data.ResourceID,
        },
      },
    });

    if (existing) {
      throw new Error('Resource is already assigned to this project');
    }

    return await prisma.projectResource.create({
      data: {
        ProjectID: data.ProjectID,
        ResourceID: data.ResourceID,
      },
    });
  }

  // Get all resources for a project
  async getResourcesByProject(projectId: number) {
    return await prisma.projectResource.findMany({
      where: { ProjectID: projectId },
      include: {
        Resource: true,
      },
    });
  }

  // Get all projects for a resource
  async getProjectsByResource(resourceId: number) {
    return await prisma.projectResource.findMany({
      where: { ResourceID: resourceId },
      include: {
        Project: true,
      },
    });
  }

  // Remove resource from project
  async removeResourceFromProject(projectId: number, resourceId: number) {
    const projectResource = await prisma.projectResource.findUnique({
      where: {
        ProjectID_ResourceID: {
          ProjectID: projectId,
          ResourceID: resourceId,
        },
      },
    });

    if (!projectResource) {
      throw new Error('Resource is not assigned to this project');
    }

    await prisma.projectResource.delete({
      where: {
        ProjectID_ResourceID: {
          ProjectID: projectId,
          ResourceID: resourceId,
        },
      },
    });

    return { success: true };
  }

  // Check if resource is assigned to project
  async isResourceAssignedToProject(projectId: number, resourceId: number) {
    const projectResource = await prisma.projectResource.findUnique({
      where: {
        ProjectID_ResourceID: {
          ProjectID: projectId,
          ResourceID: resourceId,
        },
      },
    });

    return !!projectResource;
  }

  // Get all project-resource relationships
  async getAllProjectResources() {
    return await prisma.projectResource.findMany({
      include: {
        Project: {
          select: {
            ProjectID: true,
            Name: true,
          },
        },
        Resource: {
          select: {
            ResourceID: true,
            Type: true,
            Quantity: true,
          },
        },
      },
    });
  }
}
