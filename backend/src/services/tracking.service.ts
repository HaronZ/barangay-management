import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/error.middleware.js';

export interface TrackingResult {
    controlNumber: string;
    type: string;
    purpose: string;
    status: string;
    requestedAt: Date;
    issuedAt: Date | null;
    remarks: string | null;
    person: {  // Changed from resident
        firstName: string;
        lastName: string;
    };
}

// Track certificate by control number (public access)
export const trackByControlNumber = async (controlNumber: string): Promise<TrackingResult> => {
    const certificate = await prisma.certificate.findUnique({
        where: { controlNumber },
        include: {
            person: {  // Changed from resident
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    if (!certificate) {
        throw new ApiError('Certificate not found. Please check the control number.', 404);
    }

    return {
        controlNumber: certificate.controlNumber,
        type: certificate.type,
        purpose: certificate.purpose,
        status: certificate.status,
        requestedAt: certificate.createdAt,
        issuedAt: certificate.issuedAt,
        remarks: certificate.remarks,
        person: {  // Changed from resident
            firstName: certificate.person.firstName,
            lastName: certificate.person.lastName,
        },
    };
};

// Get all requests for a specific user
export const getMyRequests = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            person: {  // Changed from resident
                include: {
                    certificates: {
                        orderBy: { createdAt: 'desc' },
                    },
                },
            },
        },
    });

    if (!user?.person) {
        return [];
    }

    return user.person.certificates.map(cert => ({
        id: cert.id,
        controlNumber: cert.controlNumber,
        type: cert.type,
        purpose: cert.purpose,
        status: cert.status,
        amount: cert.amount,
        requestedAt: cert.createdAt,
        issuedAt: cert.issuedAt,
        remarks: cert.remarks,
    }));
};

// Get request statistics for a user
export const getRequestStats = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },  // Changed from resident
    });

    if (!user?.person) {
        return {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            released: 0,
        };
    }

    const stats = await prisma.certificate.groupBy({
        by: ['status'],
        where: { personId: user.person.id },  // Changed from residentId
        _count: { status: true },
    });

    const result = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        released: 0,
    };

    stats.forEach(stat => {
        const count = stat._count.status;
        result.total += count;
        switch (stat.status) {
            case 'PENDING':
                result.pending = count;
                break;
            case 'APPROVED':
                result.approved = count;
                break;
            case 'REJECTED':
                result.rejected = count;
                break;
            case 'RELEASED':
                result.released = count;
                break;
        }
    });

    return result;
};
