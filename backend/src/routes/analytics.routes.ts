import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Get dashboard analytics (admin/staff)
router.get('/dashboard', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get counts
        const [
            totalResidents,
            totalHouseholds,
            totalCertificates,
            pendingCertificates,
            totalComplaints,
            openComplaints,
            totalAppointments,
            pendingAppointments,
        ] = await Promise.all([
            prisma.person.count(),  // Changed from resident
            prisma.household.count(),
            prisma.certificate.count(),
            prisma.certificate.count({ where: { status: 'PENDING' } }),
            prisma.complaint.count(),
            prisma.complaint.count({ where: { status: 'OPEN' } }),
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: 'PENDING' } }),
        ]);

        res.json({
            status: 'success',
            data: {
                residents: { total: totalResidents },
                households: { total: totalHouseholds },
                certificates: { total: totalCertificates, pending: pendingCertificates },
                complaints: { total: totalComplaints, open: openComplaints },
                appointments: { total: totalAppointments, pending: pendingAppointments },
            },
        });
    } catch (error) {
        next(error);
    }
});

// Get certificate analytics by type
router.get('/certificates', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const byType = await prisma.certificate.groupBy({
            by: ['type'],
            _count: { type: true },
        });

        const byStatus = await prisma.certificate.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        // Monthly trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = await prisma.certificate.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: sixMonthsAgo } },
            _count: { id: true },
        });

        res.json({
            status: 'success',
            data: {
                byType: byType.map(t => ({ type: t.type, count: t._count.type })),
                byStatus: byStatus.map(s => ({ status: s.status, count: s._count.status })),
                monthlyTrend: monthlyData,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Get resident demographics
router.get('/demographics', authenticate, authorize('ADMIN', 'STAFF'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const byGender = await prisma.person.groupBy({  // Changed from resident
            by: ['gender'],
            _count: { gender: true },
        });

        const byCivilStatus = await prisma.person.groupBy({  // Changed from resident
            by: ['civilStatus'],
            _count: { civilStatus: true },
        });

        // Age distribution
        const persons = await prisma.person.findMany({  // Changed from resident
            select: { birthDate: true },
        });

        const today = new Date();
        const ageGroups = { '0-17': 0, '18-35': 0, '36-59': 0, '60+': 0 };

        persons.forEach(p => {
            const age = today.getFullYear() - p.birthDate.getFullYear();
            if (age < 18) ageGroups['0-17']++;
            else if (age < 36) ageGroups['18-35']++;
            else if (age < 60) ageGroups['36-59']++;
            else ageGroups['60+']++;
        });

        res.json({
            status: 'success',
            data: {
                byGender: byGender.map(g => ({ gender: g.gender, count: g._count.gender })),
                byCivilStatus: byCivilStatus.map(c => ({ status: c.civilStatus, count: c._count.civilStatus })),
                byAgeGroup: Object.entries(ageGroups).map(([group, count]) => ({ group, count })),
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
