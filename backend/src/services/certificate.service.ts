import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/error.middleware.js';
import { Prisma, CertificateType, CertificateStatus } from '../generated/prisma/client.js';

export interface CreateCertificateInput {
    type: CertificateType;
    purpose: string;
    personId: string;  // Changed from residentId
    orNumber?: string;
    amount?: number;
}

export interface UpdateCertificateStatusInput {
    status: CertificateStatus;
    remarks?: string;
    issuedBy?: string;
}

// Generate control number: BRGY-YYYY-NNNNNN
const generateControlNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const count = await prisma.certificate.count({
        where: {
            createdAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            },
        },
    });

    const sequence = (count + 1).toString().padStart(6, '0');
    return `BRGY-${year}-${sequence}`;
};

export const getAllCertificates = async (
    page: number = 1,
    limit: number = 10,
    status?: CertificateStatus,
    type?: CertificateType
) => {
    const skip = (page - 1) * limit;

    const where: Prisma.CertificateWhereInput = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [certificates, total] = await Promise.all([
        prisma.certificate.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                person: {  // Changed from resident
                    select: {
                        id: true,
                        firstName: true,
                        middleName: true,
                        lastName: true,
                        address: true,
                    },
                },
            },
        }),
        prisma.certificate.count({ where }),
    ]);

    return {
        certificates,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getCertificateById = async (id: string) => {
    const certificate = await prisma.certificate.findUnique({
        where: { id },
        include: {
            person: true,  // Changed from resident
        },
    });

    if (!certificate) {
        throw new ApiError('Certificate not found', 404);
    }

    return certificate;
};

export const createCertificate = async (input: CreateCertificateInput) => {
    // Verify person exists
    const person = await prisma.person.findUnique({
        where: { id: input.personId },
    });

    if (!person) {
        throw new ApiError('Person not found', 404);
    }

    const controlNumber = await generateControlNumber();

    const certificate = await prisma.certificate.create({
        data: {
            type: input.type,
            purpose: input.purpose,
            personId: input.personId,
            orNumber: input.orNumber,
            amount: input.amount,
            controlNumber,
        },
        include: {
            person: true,  // Changed from resident
        },
    });

    return certificate;
};

export const updateCertificateStatus = async (
    id: string,
    input: UpdateCertificateStatusInput
) => {
    const existing = await prisma.certificate.findUnique({ where: { id } });

    if (!existing) {
        throw new ApiError('Certificate not found', 404);
    }

    const updateData: Prisma.CertificateUpdateInput = {
        status: input.status,
        remarks: input.remarks,
    };

    if (input.status === 'RELEASED') {
        updateData.issuedAt = new Date();
        updateData.issuedBy = input.issuedBy;
    }

    const certificate = await prisma.certificate.update({
        where: { id },
        data: updateData,
        include: {
            person: true,  // Changed from resident
        },
    });

    return certificate;
};

export const getCertificatesByPerson = async (personId: string) => {
    const certificates = await prisma.certificate.findMany({
        where: { personId },
        orderBy: { createdAt: 'desc' },
    });

    return certificates;
};

// Backward compatibility alias
export const getCertificatesByResident = getCertificatesByPerson;
