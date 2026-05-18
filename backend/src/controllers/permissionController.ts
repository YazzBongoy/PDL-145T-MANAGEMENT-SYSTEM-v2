import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPermissions(req: Request, res: Response) {
  try {
    const { module } = req.query;
    const where: any = {};
    if (module) where.module = module as string;

    const permissions = await prisma.permission.findMany({
      where,
      orderBy: { module: 'asc' }
    });

    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
}

export async function getPermissionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const permission = await prisma.permission.findUnique({
      where: { id: parseInt(id) },
      include: {
        userPermissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    res.json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ error: 'Failed to fetch permission' });
  }
}

export async function createPermission(req: Request, res: Response) {
  try {
    const { name, description, module, action } = req.body;

    if (!name || !module || !action) {
      return res.status(400).json({ error: 'name, module, and action are required' });
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        module,
        action
      }
    });

    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
}

export async function updatePermission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, module, action } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (module) updateData.module = module;
    if (action) updateData.action = action;

    const permission = await prisma.permission.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(permission);
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ error: 'Failed to update permission' });
  }
}

export async function deletePermission(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.permission.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({ error: 'Failed to delete permission' });
  }
}

export async function grantPermission(req: Request, res: Response) {
  try {
    const { userId, permissionId } = req.body;
    const grantedBy = (req as any).user?.id;

    if (!userId || !permissionId) {
      return res.status(400).json({ error: 'userId and permissionId are required' });
    }

    const userPermission = await prisma.userPermission.create({
      data: {
        userId: parseInt(userId),
        permissionId: parseInt(permissionId),
        grantedBy
      },
      include: {
        permission: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(userPermission);
  } catch (error) {
    console.error('Error granting permission:', error);
    res.status(500).json({ error: 'Failed to grant permission' });
  }
}

export async function revokePermission(req: Request, res: Response) {
  try {
    const { userId, permissionId } = req.body;

    if (!userId || !permissionId) {
      return res.status(400).json({ error: 'userId and permissionId are required' });
    }

    await prisma.userPermission.updateMany({
      where: {
        userId: parseInt(userId),
        permissionId: parseInt(permissionId),
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    res.json({ message: 'Permission revoked successfully' });
  } catch (error) {
    console.error('Error revoking permission:', error);
    res.status(500).json({ error: 'Failed to revoke permission' });
  }
}

export async function getUserPermissions(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const userPermissions = await prisma.userPermission.findMany({
      where: {
        userId: parseInt(userId),
        revokedAt: null
      },
      include: {
        permission: true
      }
    });

    res.json(userPermissions);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
}
