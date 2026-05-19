import { Request, Response } from 'express';
import { normalizeBody } from '../utils/normalizeBody.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all enterprises
export async function getEnterprises(req: Request, res: Response) {
  try {
    const { type, role } = req.query;
    
    const where: any = {};
    if (type) where.Type = type;
    if (role) where.Role = role;

    const enterprises = await prisma.enterprise.findMany({
      where,
      include: {
        _count: {
          select: {
            Contracts: true,
            ProjectEnterprises: true
          }
        }
      },
      orderBy: { Name: 'asc' }
    });

    res.json(enterprises);
  } catch (error) {
    console.error('Error fetching enterprises:', error);
    res.status(500).json({ error: 'Failed to fetch enterprises' });
  }
}

// Get enterprise by ID
export async function getEnterpriseById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const enterprise = await prisma.enterprise.findUnique({
      where: { EnterpriseID: parseInt(id) },
      include: {
        Contracts: {
          select: {
            ContractID: true,
            ContractNumber: true,
            Title: true,
            Status: true,
            TotalAmount: true
          }
        },
        ProjectEnterprises: {
          include: {
            Project: {
              select: {
                ProjectID: true,
                Name: true,
                ProgramID: true
              }
            }
          }
        }
      }
    });

    if (!enterprise) {
      res.status(404).json({ error: 'Enterprise not found' });
      return;
    }

    res.json(enterprise);
  } catch (error) {
    console.error('Error fetching enterprise:', error);
    res.status(500).json({ error: 'Failed to fetch enterprise' });
  }
}

// Create enterprise
export async function createEnterprise(req: Request, res: Response) {
  try {
    const { name, type, role, contactemail, contactphone, address, taxid } = normalizeBody(req.body);
    const contactEmail = contactemail; const contactPhone = contactphone; const taxId = taxid;

    if (!name) { res.status(400).json({ error: 'Name is required' }); return; }

    const enterprise = await prisma.enterprise.create({
      data: {
        Name: name,
        Type: type,
        Role: role,
        ContactEmail: contactEmail || null,
        ContactPhone: contactPhone || null,
        Address: address || null,
        TaxID: taxId || null
      }
    });

    res.status(201).json(enterprise);
  } catch (error) {
    console.error('Error creating enterprise:', error);
    res.status(500).json({ error: 'Failed to create enterprise' });
  }
}

// Update enterprise
export async function updateEnterprise(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, type, role, contactemail, contactphone, address, taxid } = normalizeBody(req.body);
    const contactEmail = contactemail; const contactPhone = contactphone; const taxId = taxid;

    const enterprise = await prisma.enterprise.update({
      where: { EnterpriseID: parseInt(id) },
      data: {
        ...(name !== undefined && { Name: name }),
        ...(type !== undefined && { Type: type }),
        ...(role !== undefined && { Role: role }),
        ...(contactEmail !== undefined && { ContactEmail: contactEmail || null }),
        ...(contactPhone !== undefined && { ContactPhone: contactPhone || null }),
        ...(address !== undefined && { Address: address || null }),
        ...(taxId !== undefined && { TaxID: taxId || null }),
      }
    });

    res.json(enterprise);
  } catch (error) {
    console.error('Error updating enterprise:', error);
    res.status(500).json({ error: 'Failed to update enterprise' });
  }
}

// Delete enterprise
export async function deleteEnterprise(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.enterprise.delete({
      where: { EnterpriseID: parseInt(id) }
    });

    res.json({ message: 'Enterprise deleted successfully' });
  } catch (error) {
    console.error('Error deleting enterprise:', error);
    res.status(500).json({ error: 'Failed to delete enterprise' });
  }
}

// Get enterprises for a project
export async function getProjectEnterprises(req: Request, res: Response) {
  try {
    const { projectId } = req.params;

    const projectEnterprises = await prisma.projectEnterprise.findMany({
      where: { ProjectID: parseInt(projectId) },
      include: {
        Enterprise: true
      }
    });

    res.json(projectEnterprises);
  } catch (error) {
    console.error('Error fetching project enterprises:', error);
    res.status(500).json({ error: 'Failed to fetch project enterprises' });
  }
}

// Assign enterprise to project
export async function assignEnterpriseToProject(req: Request, res: Response) {
  try {
    const { projectId, enterpriseId, role } = req.body;

    const assignment = await prisma.projectEnterprise.create({
      data: {
        ProjectID: parseInt(projectId),
        EnterpriseID: parseInt(enterpriseId),
        Role: role
      },
      include: {
        Enterprise: true,
        Project: {
          select: {
            ProjectID: true,
            Name: true
          }
        }
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning enterprise:', error);
    res.status(500).json({ error: 'Failed to assign enterprise to project' });
  }
}

// Remove enterprise from project
export async function removeEnterpriseFromProject(req: Request, res: Response) {
  try {
    const { projectId, enterpriseId } = req.params;

    await prisma.projectEnterprise.delete({
      where: {
        ProjectID_EnterpriseID: {
          ProjectID: parseInt(projectId),
          EnterpriseID: parseInt(enterpriseId)
        }
      }
    });

    res.json({ message: 'Enterprise removed from project' });
  } catch (error) {
    console.error('Error removing enterprise:', error);
    res.status(500).json({ error: 'Failed to remove enterprise from project' });
  }
}
