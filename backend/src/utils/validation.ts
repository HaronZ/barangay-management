import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    civilStatus: z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'DIVORCED']).optional(),
    address: z.string().optional(),
    contactNumber: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Person validation schemas (renamed from Resident)
export const createPersonSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    birthDate: z.string().transform((val) => new Date(val)),
    birthPlace: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']),
    civilStatus: z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'DIVORCED']),
    nationality: z.string().default('Filipino'),
    religion: z.string().optional(),
    occupation: z.string().optional(),
    contactNumber: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().min(1, 'Address is required'),
    photo: z.string().optional(),
    householdId: z.string().uuid().optional(),
});

// Keep alias for backward compatibility
export const createResidentSchema = createPersonSchema;

// Official validation schema
export const createOfficialSchema = z.object({
    personId: z.string().uuid('Invalid person ID'),
    position: z.string().min(1, 'Position is required'),
    termStart: z.string().transform((val) => new Date(val)),
    termEnd: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

// Certificate validation schemas
export const createCertificateSchema = z.object({
    type: z.enum(['CLEARANCE', 'INDIGENCY', 'RESIDENCY', 'BUSINESS_PERMIT', 'CEDULA']),
    purpose: z.string().min(1, 'Purpose is required'),
    personId: z.string().uuid('Invalid person ID'),
    orNumber: z.string().optional(),
    amount: z.number().min(0).optional(),
});

// Household validation schemas
export const createHouseholdSchema = z.object({
    householdNumber: z.string().min(1, 'Household number is required'),
    address: z.string().min(1, 'Address is required'),
    purok: z.string().optional(),
});
