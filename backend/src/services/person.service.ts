import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/error.middleware.js';
import { Prisma } from '../generated/prisma/client.js';

export interface CreatePersonInput {
    firstName: string;
    middleName?: string;
    lastName: string;
    birthDate: Date;
    birthPlace?: string;
    gender: 'MALE' | 'FEMALE';
    civilStatus: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'SEPARATED' | 'DIVORCED';
    nationality?: string;
    religion?: string;
    occupation?: string;
    contactNumber?: string;
    email?: string;
    address: string;
    photo?: string;
    householdId?: string;
}

export const getAllPersons = async (
    page: number = 1,
    limit: number = 10,
    search?: string
) => {
    const skip = (page - 1) * limit;

    const where: Prisma.PersonWhereInput = search
        ? {
            OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};

    const [persons, total] = await Promise.all([
        prisma.person.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                household: true,
                officialDetail: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
                _count: {
                    select: { certificates: true },
                },
            },
        }),
        prisma.person.count({ where }),
    ]);

    return {
        persons,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getPersonById = async (id: string) => {
    const person = await prisma.person.findUnique({
        where: { id },
        include: {
            household: true,
            officialDetail: true,
            certificates: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            },
        },
    });

    if (!person) {
        throw new ApiError('Person not found', 404);
    }

    return person;
};

export const createPerson = async (input: CreatePersonInput) => {
    const person = await prisma.person.create({
        data: input,
        include: {
            household: true,
            officialDetail: true,
        },
    });

    return person;
};

export const updatePerson = async (id: string, input: Partial<CreatePersonInput>) => {
    const existing = await prisma.person.findUnique({ where: { id } });

    if (!existing) {
        throw new ApiError('Person not found', 404);
    }

    const person = await prisma.person.update({
        where: { id },
        data: input,
        include: {
            household: true,
            officialDetail: true,
        },
    });

    return person;
};

export const deletePerson = async (id: string) => {
    const existing = await prisma.person.findUnique({ where: { id } });

    if (!existing) {
        throw new ApiError('Person not found', 404);
    }

    await prisma.person.delete({ where: { id } });

    return { message: 'Person deleted successfully' };
};

// Get all officials (persons with officialDetail)
export const getOfficials = async () => {
    const officials = await prisma.person.findMany({
        where: {
            officialDetail: {
                isNot: null,
            },
        },
        include: {
            officialDetail: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            officialDetail: {
                position: 'asc',
            },
        },
    });

    return officials;
};

// Add official details to a person
export const makeOfficial = async (personId: string, officialData: {
    position: string;
    termStart: Date;
    termEnd?: Date;
}) => {
    const person = await prisma.person.findUnique({ where: { id: personId } });

    if (!person) {
        throw new ApiError('Person not found', 404);
    }

    // Check if already an official
    const existingOfficial = await prisma.officialDetail.findUnique({
        where: { personId },
    });

    if (existingOfficial) {
        throw new ApiError('Person is already an official', 400);
    }

    const updatedPerson = await prisma.person.update({
        where: { id: personId },
        data: {
            officialDetail: {
                create: {
                    position: officialData.position,
                    termStart: officialData.termStart,
                    termEnd: officialData.termEnd,
                },
            },
        },
        include: {
            officialDetail: true,
            user: true,
        },
    });

    // If the person has a user account, update their role to OFFICIAL
    if (updatedPerson.userId) {
        await prisma.user.update({
            where: { id: updatedPerson.userId },
            data: { role: 'OFFICIAL' },
        });
    }

    return updatedPerson;
};

// Remove official status from a person
export const removeOfficial = async (personId: string) => {
    const official = await prisma.officialDetail.findUnique({
        where: { personId },
    });

    if (!official) {
        throw new ApiError('Person is not an official', 404);
    }

    // Delete official detail
    await prisma.officialDetail.delete({
        where: { personId },
    });

    // Get the person to check if they have a user account
    const person = await prisma.person.findUnique({
        where: { id: personId },
        include: { user: true },
    });

    // If they have a user account, revert role to RESIDENT
    if (person?.userId) {
        await prisma.user.update({
            where: { id: person.userId },
            data: { role: 'RESIDENT' },
        });
    }

    return { message: 'Official status removed successfully' };
};
