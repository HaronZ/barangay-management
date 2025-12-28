import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Get all published announcements (public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: {
                isPublished: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: new Date() } },
                ],
            },
            include: {
                author: {
                    select: { email: true, person: { select: { firstName: true, lastName: true } } },
                },
            },
            orderBy: [
                { priority: 'asc' },
                { publishedAt: 'desc' },
            ],
        });
        res.json({ status: 'success', data: announcements });
    } catch (error) {
        next(error);
    }
});

// Create announcement (admin/staff only)
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorId = (req as any).user.id;
        const { title, content, priority, category, expiresAt } = req.body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                priority: priority || 'NORMAL',
                category: category || 'GENERAL',
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                authorId,
            },
        });
        res.status(201).json({ status: 'success', data: announcement });
    } catch (error) {
        next(error);
    }
});

// Update announcement
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, content, priority, category, isPublished, expiresAt } = req.body;

        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                title,
                content,
                priority,
                category,
                isPublished,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        });
        res.json({ status: 'success', data: announcement });
    } catch (error) {
        next(error);
    }
});

// Delete announcement
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({ where: { id } });
        res.json({ status: 'success', message: 'Announcement deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
