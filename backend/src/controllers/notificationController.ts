import { Request, Response } from 'express';
import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { unreadOnly, type, limit = 50, offset = 0 } = req.query;

    const where: any = { userId };
    if (unreadOnly === 'true') where.isRead = false;
    if (type) where.type = type as NotificationType;

    const notifications = await prisma.notification.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({ notifications, total, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function getNotificationById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
}

export async function createNotification(req: Request, res: Response) {
  try {
    const { userId, type, title, message, metadata, expiresAt } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'userId, type, title, and message are required' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        type: type as NotificationType,
        title,
        message,
        metadata,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true, readAt: new Date() }
    });

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}

export async function deleteNotification(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
}
