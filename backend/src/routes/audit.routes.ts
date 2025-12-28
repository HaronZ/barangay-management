import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Get audit logs (admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = '1', limit = '50', action, entity, userId, startDate, endDate } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (action) where.action = action;
        if (entity) where.entity = entity;
        if (userId) where.userId = userId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate as string);
            if (endDate) where.createdAt.lte = new Date(endDate as string);
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: { email: true, person: { select: { firstName: true, lastName: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.auditLog.count({ where }),
        ]);

        res.json({
            status: 'success',
            data: {
                logs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

// Get audit log summary (admin only)
router.get('/summary', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [byAction, byEntity, todayCount, totalCount] = await Promise.all([
            prisma.auditLog.groupBy({
                by: ['action'],
                _count: { action: true },
            }),
            prisma.auditLog.groupBy({
                by: ['entity'],
                _count: { entity: true },
            }),
            prisma.auditLog.count({ where: { createdAt: { gte: today } } }),
            prisma.auditLog.count(),
        ]);

        res.json({
            status: 'success',
            data: {
                byAction: byAction.map(a => ({ action: a.action, count: a._count.action })),
                byEntity: byEntity.map(e => ({ entity: e.entity, count: e._count.entity })),
                todayCount,
                totalCount,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
