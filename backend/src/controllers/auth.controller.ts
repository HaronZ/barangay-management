import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { ApiError } from '../middleware/error.middleware.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('📝 Registration request received:', req.body.email);
        const validatedData = registerSchema.parse(req.body);
        console.log('✅ Validation passed for:', validatedData.email);
        const result = await authService.register(validatedData);
        console.log('✅ Registration completed for:', validatedData.email);
        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: result,
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const result = await authService.login(validatedData);
        res.json({
            status: 'success',
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ApiError('Not authenticated', 401);
        }
        const result = await authService.getProfile(req.user.userId);
        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Forgot Password - Request reset email
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new ApiError('Email is required', 400);
        }

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user) {
            res.json({
                status: 'success',
                message: 'If an account exists with this email, you will receive a password reset link.',
            });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Send email
        await sendPasswordResetEmail(email, resetToken);

        res.json({
            status: 'success',
            message: 'If an account exists with this email, you will receive a password reset link.',
        });
    } catch (error) {
        next(error);
    }
};

// Reset Password - Set new password using token
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            throw new ApiError('Token and password are required', 400);
        }

        if (password.length < 6) {
            throw new ApiError('Password must be at least 6 characters', 400);
        }

        // Find user with valid token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(), // Token must not be expired
                },
            },
        });

        if (!user) {
            throw new ApiError('Invalid or expired reset token', 400);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        res.json({
            status: 'success',
            message: 'Password reset successful. You can now login with your new password.',
        });
    } catch (error) {
        next(error);
    }
};

// Verify Email - Verify email using token from email link
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;

        if (!token) {
            throw new ApiError('Verification token is required', 400);
        }

        const result = await authService.verifyEmail(token);
        res.json({
            status: 'success',
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

// Resend Verification Email
export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new ApiError('Email is required', 400);
        }

        const result = await authService.resendVerificationEmail(email);
        res.json({
            status: 'success',
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

// Refresh Token - Get new JWT token
export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ApiError('Not authenticated', 401);
        }
        const result = await authService.refreshToken(req.user.userId);
        res.json({
            status: 'success',
            message: 'Token refreshed successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
