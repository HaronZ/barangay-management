import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/error.middleware.js';

export interface CreateHouseholdInput {
    householdNumber: string;
    address: string;
    purok?: string;
}

export const getAllHouseholds = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [households, total] = await Promise.all([
        prisma.household.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { members: true },
                },
            },
        }),
        prisma.household.count(),
    ]);

    return {
        households,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getHouseholdById = async (id: string) => {
    const household = await prisma.household.findUnique({
        where: { id },
        include: {
            members: true,
        },
    });

    if (!household) {
        throw new ApiError('Household not found', 404);
    }

    return household;
};

export const createHousehold = async (input: CreateHouseholdInput) => {
    // Check for duplicate household number
    const existing = await prisma.household.findUnique({
        where: { householdNumber: input.householdNumber },
    });

    if (existing) {
        throw new ApiError('Household number already exists', 400);
    }

    const household = await prisma.household.create({
        data: input,
    });

    return household;
};

export const updateHousehold = async (id: string, input: Partial<CreateHouseholdInput>) => {
    const existing = await prisma.household.findUnique({ where: { id } });

    if (!existing) {
        throw new ApiError('Household not found', 404);
    }

    const household = await prisma.household.update({
        where: { id },
        data: input,
        include: {
            members: true,
        },
    });

    return household;
};

export const deleteHousehold = async (id: string) => {
    const existing = await prisma.household.findUnique({
        where: { id },
        include: { members: true },
    });

    if (!existing) {
        throw new ApiError('Household not found', 404);
    }

    if (existing.members.length > 0) {
        throw new ApiError('Cannot delete household with members', 400);
    }

    await prisma.household.delete({ where: { id } });

    return { message: 'Household deleted successfully' };
};
