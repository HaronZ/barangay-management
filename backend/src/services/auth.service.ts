import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../middleware/error.middleware.js';
import { sendVerificationEmail } from './email.service.js';

export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE';
    civilStatus?: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'SEPARATED' | 'DIVORCED';
    address?: string;
    contactNumber?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export const register = async (input: RegisterInput) => {
    const {
        email,
        password,
        firstName,
        lastName,
        middleName,
        birthDate,
        gender = 'MALE',
        civilStatus = 'SINGLE',
        address = 'To be updated',
        contactNumber
    } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with linked person profile (NOT verified yet)
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: 'RESIDENT',
            emailVerified: false,
            verificationToken,
            verificationTokenExpiry,
            person: {
                create: {
                    firstName,
                    lastName,
                    middleName,
                    birthDate: birthDate ? new Date(birthDate) : new Date('2000-01-01'),
                    gender,
                    civilStatus,
                    address,
                    contactNumber,
                    email, // Store email in person profile too
                },
            },
        },
        include: {
            person: true,
        },
    });

    // Send verification email
    try {
        console.log(`📧 Attempting to send verification email to ${email}...`);
        await sendVerificationEmail(email, verificationToken);
        console.log(`✅ Verification email sent successfully to ${email}`);
    } catch (emailError) {
        console.error(`❌ Failed to send verification email to ${email}:`, emailError);
        // Don't throw - user is still registered, they can resend later
    }

    // Return success message (NO token - user must verify first)
    return {
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
            id: user.id,
            email: user.email,
            firstName: user.person?.firstName,
            lastName: user.person?.lastName,
        },
    };
};

export const login = async (input: LoginInput) => {
    const { email, password } = input;

    // Find user with person profile
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            person: {
                include: {
                    officialDetail: true,
                },
            },
        },
    });

    if (!user) {
        throw new ApiError('Invalid email or password', 401);
    }

    if (!user.isActive) {
        throw new ApiError('Account is deactivated', 401);
    }

    // Check if email is verified
    if (!user.emailVerified) {
        throw new ApiError('Please verify your email before logging in. Check your inbox for the verification link.', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            person: user.person,
        },
    };
};

export const verifyEmail = async (token: string) => {
    // Find user with valid verification token
    const user = await prisma.user.findFirst({
        where: {
            verificationToken: token,
            verificationTokenExpiry: {
                gt: new Date(), // Token must not be expired
            },
        },
    });

    if (!user) {
        throw new ApiError('Invalid or expired verification token', 400);
    }

    // Mark email as verified and clear token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
        },
    });

    return {
        message: 'Email verified successfully! You can now log in.',
    };
};

export const resendVerificationEmail = async (email: string) => {
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
        return {
            message: 'If an account exists with this email, a new verification link will be sent.',
        };
    }

    // Check if already verified
    if (user.emailVerified) {
        throw new ApiError('This email is already verified. You can log in.', 400);
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            verificationToken,
            verificationTokenExpiry,
        },
    });

    // Send verification email
    try {
        console.log(`📧 Resending verification email to ${email}...`);
        await sendVerificationEmail(email, verificationToken);
        console.log(`✅ Verification email resent successfully to ${email}`);
    } catch (emailError) {
        console.error(`❌ Failed to resend verification email to ${email}:`, emailError);
        throw emailError;
    }

    return {
        message: 'If an account exists with this email, a new verification link will be sent.',
    };
};

export const getProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            person: {
                include: {
                    officialDetail: true,
                    household: true,
                },
            },
        },
    });

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        person: user.person,
    };
};

/**
 * Refresh an existing valid token
 * Returns a new token with extended expiry
 */
export const refreshToken = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            person: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    address: true,
                    contactNumber: true,
                },
            },
        },
    });

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    if (!user.isActive) {
        throw new ApiError('Account is deactivated', 403);
    }

    // Generate new token
    const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            person: user.person,
        },
    };
};
