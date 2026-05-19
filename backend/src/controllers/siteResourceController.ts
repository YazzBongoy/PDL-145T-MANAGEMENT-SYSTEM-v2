import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all site-resource links
export async function getSiteResources(req: Request, res: Response) {
  try {
    const siteResources = await prisma.siteResource.findMany({
      include: {
        Resource: true,
        Site: true
      }
    });
    res.json(siteResources);
  } catch (error) {
    console.error('Error fetching site resources:', error);
    res.status(500).json({ error: 'Failed to fetch site resources' });
  }
}

// Create site-resource link
export async function createSiteResource(req: Request, res: Response) {
  try {
    const { SiteID, ResourceID, AllocatedQuantity } = req.body;
    
    if (!SiteID || !ResourceID || !AllocatedQuantity) {
      res.status(400).json({ error: 'SiteID, ResourceID, and AllocatedQuantity are required' });
      return;
    }

    const siteResource = await prisma.siteResource.create({
      data: {
        SiteID,
        ResourceID,
        AllocatedQuantity,
        ActualQuantity: null,
        UsageDate: new Date()
      },
      include: {
        Resource: true,
        Site: true
      }
    });
    
    res.status(201).json(siteResource);
  } catch (error) {
    console.error('Error creating site resource:', error);
    res.status(500).json({ error: 'Failed to create site resource link' });
  }
}

// Delete site-resource link
export async function deleteSiteResource(req: Request, res: Response) {
  try {
    const { siteId, resourceId } = req.params;
    
    await prisma.siteResource.delete({
      where: {
        SiteID_ResourceID: {
          SiteID: siteId,
          ResourceID: parseInt(resourceId)
        }
      }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting site resource:', error);
    res.status(500).json({ error: 'Failed to delete site resource link' });
  }
}
