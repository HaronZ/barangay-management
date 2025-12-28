import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger.js';

/**
 * Request logging middleware
 * Logs all incoming requests with method, path, and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log request
    const requestInfo = {
        method: req.method,
        path: req.path,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
    };

    // Log response on finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

        logger.log(logLevel, `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
            ...requestInfo,
            statusCode: res.statusCode,
            duration,
        });
    });

    next();
};
