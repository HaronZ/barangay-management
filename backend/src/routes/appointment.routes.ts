import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Time slots available for appointments
const TIME_SLOTS = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
];

// Get user's appointments
router.get('/my-appointments', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { person: true },  // Changed from resident
        });

        if (!user?.person) {
            return res.json({ status: 'success', data: [] });
        }

        const appointments = await prisma.appointment.findMany({
            where: { personId: user.person.id },  // Changed from residentId
            orderBy: { date: 'desc' },
        });
        res.json({ status: 'success', data: appointments });
    } catch (error) {
        next(error);
    }
});

// Get available time slots for a date
router.get('/slots/:date', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.params;
        const dateObj = new Date(date);

        const bookedSlots = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: new Date(dateObj.setHours(0, 0, 0, 0)),
                    lt: new Date(dateObj.setHours(23, 59, 59, 999)),
                },
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: { timeSlot: true },
        });

        const bookedSlotSet = new Set(bookedSlots.map(s => s.timeSlot));
        const availableSlots = TIME_SLOTS.filter(slot => !bookedSlotSet.has(slot));

        res.json({ status: 'success', data: availableSlots });
    } catch (error) {
        next(error);
    }
});

// Book an appointment
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { purpose, date, timeSlot, notes } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { person: true },  // Changed from resident
        });

        if (!user?.person) {
            return res.status(400).json({ status: 'error', message: 'No person profile found' });
        }

        const appointment = await prisma.appointment.create({
            data: {
                personId: user.person.id,  // Changed from residentId
                purpose,
                date: new Date(date),
                timeSlot,
                notes,
            },
        });

        res.status(201).json({ status: 'success', data: appointment });
    } catch (error) {
        next(error);
    }
});

// Update appointment status (staff/admin)
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status, notes },
            include: { person: { include: { user: true } } },  // Changed from resident
        });

        // Create notification for person if they have a user account
        if (appointment.person.user) {
            await prisma.notification.create({
                data: {
                    userId: appointment.person.user.id,
                    title: 'Appointment Update',
                    message: `Your appointment has been ${status.toLowerCase()}`,
                    type: 'APPOINTMENT',
                    link: '/appointments',
                },
            });
        }

        res.json({ status: 'success', data: appointment });
    } catch (error) {
        next(error);
    }
});

// Get all appointments (staff/admin)
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                person: {  // Changed from resident
                    select: { firstName: true, lastName: true, contactNumber: true },
                },
            },
            orderBy: { date: 'asc' },
        });
        res.json({ status: 'success', data: appointments });
    } catch (error) {
        next(error);
    }
});

export default router;
