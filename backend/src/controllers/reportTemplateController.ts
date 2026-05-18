import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getReportTemplates(req: Request, res: Response) {
  try {
    const { module, isPublic } = req.query;
    const where: any = {};
    if (module) where.module = module as string;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const templates = await prisma.reportTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({ error: 'Failed to fetch report templates' });
  }
}

export async function getReportTemplateById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const template = await prisma.reportTemplate.findUnique({
      where: { id: parseInt(id) }
    });

    if (!template) {
      return res.status(404).json({ error: 'Report template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching report template:', error);
    res.status(500).json({ error: 'Failed to fetch report template' });
  }
}

export async function createReportTemplate(req: Request, res: Response) {
  try {
    const { name, description, module, config, isPublic = false } = req.body;
    const createdBy = (req as any).user?.id;

    if (!name || !module || !config) {
      return res.status(400).json({ error: 'name, module, and config are required' });
    }

    const template = await prisma.reportTemplate.create({
      data: {
        name,
        description,
        module,
        config,
        isPublic,
        createdBy
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating report template:', error);
    res.status(500).json({ error: 'Failed to create report template' });
  }
}

export async function updateReportTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, module, config, isPublic } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (module) updateData.module = module;
    if (config) updateData.config = config;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const template = await prisma.reportTemplate.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating report template:', error);
    res.status(500).json({ error: 'Failed to update report template' });
  }
}

export async function deleteReportTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.reportTemplate.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Report template deleted successfully' });
  } catch (error) {
    console.error('Error deleting report template:', error);
    res.status(500).json({ error: 'Failed to delete report template' });
  }
}
