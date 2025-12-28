import { Request, Response, NextFunction } from 'express';
import * as trackingService from '../services/tracking.service.js';

// Track certificate by control number (public)
export const trackByControlNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { controlNumber } = req.params;
        const result = await trackingService.trackByControlNumber(controlNumber);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Get current user's requests
export const getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const requests = await trackingService.getMyRequests(userId);
        res.json({
            status: 'success',
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

// Get request statistics for current user
export const getRequestStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const stats = await trackingService.getRequestStats(userId);
        res.json({
            status: 'success',
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};
