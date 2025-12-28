import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Get user's notifications
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({ status: 'success', data: notifications });
    } catch (error) {
        next(error);
    }
});

// Get unread notification count
router.get('/unread/count', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        });
        res.json({ status: 'success', data: { count } });
    } catch (error) {
        next(error);
    }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;

        await prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
        res.json({ status: 'success', message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
});

export default router;
