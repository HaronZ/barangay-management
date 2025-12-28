import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
    statusCode?: number;
    status?: string;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'fail',
            message: err.errors[0]?.message || 'Validation error',
            errors: err.errors,
        });
    }

    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    console.error(`[Error] ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export class ApiError extends Error {
    statusCode: number;
    status: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}
