// User types
export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'STAFF' | 'RESIDENT' | 'OFFICIAL';
    person?: Person;
}

// Person types (formerly Resident)
export interface Person {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    birthDate: string;
    birthPlace?: string;
    gender: 'MALE' | 'FEMALE';
    civilStatus: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'SEPARATED' | 'DIVORCED';
    nationality: string;
    religion?: string;
    occupation?: string;
    contactNumber?: string;
    email?: string;
    address: string;
    photo?: string;
    householdId?: string;
    household?: Household;
    officialDetail?: OfficialDetail;
    createdAt: string;
    updatedAt: string;
}

// Official detail types
export interface OfficialDetail {
    id: string;
    position: string;
    termStart: string;
    termEnd?: string;
    isActive: boolean;
    personId: string;
    createdAt: string;
    updatedAt: string;
}

// Backward compatibility alias
export type Resident = Person;

// Household types
export interface Household {
    id: string;
    householdNumber: string;
    address: string;
    purok?: string;
    members?: Person[];
    createdAt: string;
    updatedAt: string;
}

// Certificate types
export type CertificateType = 'CLEARANCE' | 'INDIGENCY' | 'RESIDENCY' | 'BUSINESS_PERMIT' | 'CEDULA';
export type CertificateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RELEASED';

export interface Certificate {
    id: string;
    controlNumber: string;
    type: CertificateType;
    purpose: string;
    orNumber?: string;
    amount: number;
    status: CertificateStatus;
    remarks?: string;
    personId: string;
    person?: Person;
    issuedBy?: string;
    issuedAt?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
    status: 'success' | 'fail' | 'error';
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE';
    civilStatus?: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'SEPARATED' | 'DIVORCED';
    address?: string;
    contactNumber?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Official types for management
export interface CreateOfficialInput {
    personId: string;
    position: string;
    termStart: string;
    termEnd?: string;
}
