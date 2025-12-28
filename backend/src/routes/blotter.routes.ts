import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all blotters with pagination
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { caseNumber: { contains: search, mode: 'insensitive' as const } },
                { complainant: { contains: search, mode: 'insensitive' as const } },
                { respondent: { contains: search, mode: 'insensitive' as const } },
            ]
        } : {};

        const [blotters, total] = await Promise.all([
            prisma.blotter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.blotter.count({ where }),
        ]);

        res.json({
            status: 'success',
            data: {
                blotters,
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

// Get blotter by ID
router.get('/:id', async (req, res, next) => {
    try {
        const blotter = await prisma.blotter.findUnique({
            where: { id: req.params.id },
        });

        if (!blotter) {
            return res.status(404).json({ status: 'error', message: 'Blotter not found' });
        }

        res.json({ status: 'success', data: blotter });
    } catch (error) {
        next(error);
    }
});

// Create new blotter (Staff/Admin only)
router.post('/', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const { complainant, respondent, incidentDate, incidentPlace, narrative } = req.body;

        // Generate case number
        const count = await prisma.blotter.count();
        const caseNumber = `BLT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const blotter = await prisma.blotter.create({
            data: {
                caseNumber,
                complainant,
                respondent,
                incidentDate: new Date(incidentDate),
                incidentPlace,
                narrative,
                status: 'PENDING',
            },
        });

        res.status(201).json({
            status: 'success',
            message: 'Blotter created successfully',
            data: blotter,
        });
    } catch (error) {
        next(error);
    }
});

// Update blotter status (Staff/Admin only)
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const { status, resolution } = req.body;
        const updateData: any = { status };

        if (resolution) {
            updateData.resolution = resolution;
        }

        if (status === 'SETTLED') {
            updateData.settledAt = new Date();
        }

        const blotter = await prisma.blotter.update({
            where: { id: req.params.id },
            data: updateData,
        });

        res.json({
            status: 'success',
            message: 'Blotter status updated',
            data: blotter,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
