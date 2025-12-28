import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';

// Audit log helper
export const createAuditLog = async (
    userId: string | null,
    action: string,
    entity: string,
    entityId?: string,
    details?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details,
                oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
                newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

// Middleware to automatically log requests
export const auditMiddleware = (entity: string, action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json.bind(res);

        res.json = function (data: any) {
            // Log after response
            const userId = (req as any).user?.id || null;
            const entityId = req.params.id || data?.data?.id;

            createAuditLog(
                userId,
                action,
                entity,
                entityId,
                `${req.method} ${req.originalUrl}`,
                req.method !== 'POST' ? req.body : null,
                data?.data,
                req.ip,
                req.get('user-agent')
            );

            return originalJson(data);
        };

        next();
    };
};
