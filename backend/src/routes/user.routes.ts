import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

const router = Router();

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get all users with pagination
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { person: { firstName: { contains: search, mode: 'insensitive' as const } } },
                { person: { lastName: { contains: search, mode: 'insensitive' as const } } },
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                    emailVerified: true,
                    createdAt: true,
                    person: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            status: 'success',
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

// Create a new user (admin only)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, role, firstName, lastName } = req.body;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with person record
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'RESIDENT',
                emailVerified: true, // Admin-created users are auto-verified
                person: firstName && lastName ? {
                    create: {
                        firstName,
                        lastName,
                        birthDate: new Date('2000-01-01'), // Default placeholder
                        gender: 'MALE',
                        civilStatus: 'SINGLE',
                        address: 'To be updated',
                    }
                } : undefined
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                person: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

// Update user role
router.patch('/:id/role', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            }
        });

        res.json({
            status: 'success',
            message: 'User role updated',
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

// Toggle user active status
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive: !user.isActive },
            select: {
                id: true,
                email: true,
                isActive: true,
            }
        });

        res.json({
            status: 'success',
            message: `User ${updated.isActive ? 'activated' : 'deactivated'}`,
            data: updated,
        });
    } catch (error) {
        next(error);
    }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // First delete the person record if exists
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { person: true }
        });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        // Delete in correct order to avoid FK constraints
        if (user.person) {
            await prisma.person.delete({ where: { id: user.person.id } });
        }
        await prisma.user.delete({ where: { id: req.params.id } });

        res.json({
            status: 'success',
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
