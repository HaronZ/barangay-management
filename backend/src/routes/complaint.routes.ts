import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Generate unique ticket number
const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CMP-${year}${month}-${random}`;
};

// Submit a complaint
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { subject, description, category, isAnonymous } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { person: true },  // Changed from resident
        });

        const complaint = await prisma.complaint.create({
            data: {
                ticketNumber: generateTicketNumber(),
                subject,
                description,
                category,
                isAnonymous: isAnonymous || false,
                personId: isAnonymous ? null : user?.person?.id,  // Changed from residentId
            },
        });

        res.status(201).json({ status: 'success', data: complaint });
    } catch (error) {
        next(error);
    }
});

// Track complaint by ticket number (public)
router.get('/track/:ticketNumber', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticketNumber } = req.params;
        const complaint = await prisma.complaint.findUnique({
            where: { ticketNumber },
            select: {
                ticketNumber: true,
                subject: true,
                category: true,
                status: true,
                resolution: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!complaint) {
            return res.status(404).json({ status: 'error', message: 'Complaint not found' });
        }

        res.json({ status: 'success', data: complaint });
    } catch (error) {
        next(error);
    }
});

// Get user's complaints
router.get('/my-complaints', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { person: true },  // Changed from resident
        });

        if (!user?.person) {
            return res.json({ status: 'success', data: [] });
        }

        const complaints = await prisma.complaint.findMany({
            where: { personId: user.person.id },  // Changed from residentId
            orderBy: { createdAt: 'desc' },
        });
        res.json({ status: 'success', data: complaints });
    } catch (error) {
        next(error);
    }
});

// Get all complaints (staff/admin)
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const complaints = await prisma.complaint.findMany({
            include: {
                person: {  // Changed from resident
                    select: { firstName: true, lastName: true },
                },
                assignedStaff: {
                    select: { email: true, person: { select: { firstName: true, lastName: true } } },  // Changed from resident
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ status: 'success', data: complaints });
    } catch (error) {
        next(error);
    }
});

// Update complaint (staff/admin)
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, resolution, assignedTo } = req.body;

        const complaint = await prisma.complaint.update({
            where: { id },
            data: { status, resolution, assignedTo },
            include: { person: { include: { user: true } } },  // Changed from resident
        });

        // Notify person if not anonymous
        if (complaint.person?.user) {
            await prisma.notification.create({
                data: {
                    userId: complaint.person.user.id,
                    title: 'Complaint Update',
                    message: `Your complaint ${complaint.ticketNumber} is now ${status.toLowerCase()}`,
                    type: 'COMPLAINT',
                    link: '/complaints',
                },
            });
        }

        res.json({ status: 'success', data: complaint });
    } catch (error) {
        next(error);
    }
});

export default router;
