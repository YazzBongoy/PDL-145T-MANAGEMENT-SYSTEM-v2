import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/index.js';
import { AuthenticatedRequest } from '../types/express.js';

const prisma = new PrismaClient();

// Get user settings (create default if not exists)
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user.userId;

  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  // Create default settings if not exists
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        theme: 'system',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        notifications: {},
        emailNotifications: {
          taskUpdates: true,
          approvals: true,
          dailySummary: false,
          maintenanceAlerts: true,
        },
        pushNotifications: {
          taskUpdates: true,
          approvals: true,
        },
      },
    });
  }

  res.json(settings);
});

// Update user settings
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user.userId;
  const { theme, language, dateFormat, notifications } = req.body;

  // Ensure settings exist
  const existing = await prisma.userSettings.findUnique({
    where: { userId },
  });

  let settings;
  if (existing) {
    settings = await prisma.userSettings.update({
      where: { userId },
      data: {
        ...(theme !== undefined && { theme }),
        ...(language !== undefined && { language }),
        ...(dateFormat !== undefined && { dateFormat }),
        ...(notifications !== undefined && { notifications }),
      },
    });
  } else {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        theme: theme || 'system',
        language: language || 'en',
        dateFormat: dateFormat || 'MM/DD/YYYY',
        notifications: notifications || {},
        emailNotifications: {
          taskUpdates: true,
          approvals: true,
          dailySummary: false,
          maintenanceAlerts: true,
        },
        pushNotifications: {
          taskUpdates: true,
          approvals: true,
        },
      },
    });
  }

  res.json(settings);
});

// Update notification preferences
export const updateNotifications = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user.userId;
  const { emailNotifications, pushNotifications } = req.body;

  const existing = await prisma.userSettings.findUnique({
    where: { userId },
  });

  let settings;
  if (existing) {
    settings = await prisma.userSettings.update({
      where: { userId },
      data: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
      },
    });
  } else {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        theme: 'system',
        dateFormat: 'MM/DD/YYYY',
        notifications: {},
        emailNotifications: emailNotifications || {
          taskUpdates: true,
          approvals: true,
          dailySummary: false,
          maintenanceAlerts: true,
        },
        pushNotifications: pushNotifications || {
          taskUpdates: true,
          approvals: true,
        },
      },
    });
  }

  res.json(settings);
});
