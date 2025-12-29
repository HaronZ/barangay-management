import axios from 'axios';
import type {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
    ApiResponse,
    Certificate,
    Household
} from '../types';

// Auto-detect API URL based on environment
const getApiUrl = (): string => {
    // If VITE_API_URL is set, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // In production (Railway), use the backend URL
    if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
        return 'https://barangay-management-production.up.railway.app/api';
    }

    // Default to /api for local development (Vite proxy)
    return '/api';
};

const API_URL = getApiUrl();
console.log('🌐 API URL:', API_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
        return data.data;
    },

    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
        return data.data;
    },

    getProfile: async () => {
        const { data } = await api.get<ApiResponse<AuthResponse['user']>>('/auth/profile');
        return data.data;
    },
};

// Persons API (for Residents page - matches backend /persons routes)
export const personsApi = {
    getAll: async (page = 1, limit = 10, search?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append('search', search);
        const { data } = await api.get<ApiResponse<{ persons: any[]; pagination: PaginationMeta }>>(`/persons?${params}`);
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<ApiResponse<any>>(`/persons/${id}`);
        return data.data;
    },

    create: async (person: any) => {
        const { data } = await api.post<ApiResponse<any>>('/persons', person);
        return data.data;
    },

    update: async (id: string, person: any) => {
        const { data } = await api.put<ApiResponse<any>>(`/persons/${id}`, person);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/persons/${id}`);
    },
};

// Blotters API
export const blottersApi = {
    getAll: async (page = 1, limit = 10, search?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append('search', search);
        const { data } = await api.get<ApiResponse<{ blotters: any[]; pagination: PaginationMeta }>>(`/blotters?${params}`);
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<ApiResponse<any>>(`/blotters/${id}`);
        return data.data;
    },

    create: async (blotter: any) => {
        const { data } = await api.post<ApiResponse<any>>('/blotters', blotter);
        return data.data;
    },

    updateStatus: async (id: string, status: string, resolution?: string) => {
        const { data } = await api.patch<ApiResponse<any>>(`/blotters/${id}/status`, { status, resolution });
        return data.data;
    },
};

// Legacy alias for backward compatibility
export const residentsApi = personsApi;

// Users API (for User Management page - admin only)
export const usersApi = {
    getAll: async (page = 1, limit = 10, search?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append('search', search);
        const { data } = await api.get<ApiResponse<{ users: any[]; pagination: PaginationMeta }>>(`/users?${params}`);
        return data.data;
    },

    create: async (userData: { email: string; password: string; role: string; firstName?: string; lastName?: string }) => {
        const { data } = await api.post<ApiResponse<any>>('/users', userData);
        return data.data;
    },

    updateRole: async (id: string, role: string) => {
        const { data } = await api.patch<ApiResponse<any>>(`/users/${id}/role`, { role });
        return data.data;
    },

    toggleStatus: async (id: string) => {
        const { data } = await api.patch<ApiResponse<any>>(`/users/${id}/status`, {});
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};

// Certificates API
export const certificatesApi = {
    getAll: async (page = 1, limit = 10, status?: string, type?: string) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.append('status', status);
        if (type) params.append('type', type);
        const { data } = await api.get<ApiResponse<{ certificates: Certificate[]; pagination: PaginationMeta }>>(`/certificates?${params}`);
        return data.data;
    },

    getById: async (id: string): Promise<Certificate> => {
        const { data } = await api.get<ApiResponse<Certificate>>(`/certificates/${id}`);
        return data.data;
    },

    create: async (certificate: Partial<Certificate>): Promise<Certificate> => {
        const { data } = await api.post<ApiResponse<Certificate>>('/certificates', certificate);
        return data.data;
    },

    updateStatus: async (id: string, status: string, remarks?: string): Promise<Certificate> => {
        const { data } = await api.patch<ApiResponse<Certificate>>(`/certificates/${id}/status`, { status, remarks });
        return data.data;
    },
};

// Households API
export const householdsApi = {
    getAll: async (page = 1, limit = 10) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        const { data } = await api.get<ApiResponse<{ households: Household[]; pagination: PaginationMeta }>>(`/households?${params}`);
        return data.data;
    },

    getById: async (id: string): Promise<Household> => {
        const { data } = await api.get<ApiResponse<Household>>(`/households/${id}`);
        return data.data;
    },

    create: async (household: Partial<Household>): Promise<Household> => {
        const { data } = await api.post<ApiResponse<Household>>('/households', household);
        return data.data;
    },

    update: async (id: string, household: Partial<Household>): Promise<Household> => {
        const { data } = await api.put<ApiResponse<Household>>(`/households/${id}`, household);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/households/${id}`);
    },
};

// Analytics API
export interface DashboardStats {
    residents: { total: number };
    households: { total: number };
    certificates: { total: number; pending: number };
    complaints: { total: number; open: number };
    appointments: { total: number; pending: number };
}

export interface CertificateAnalytics {
    byType: { type: string; count: number }[];
    byStatus: { status: string; count: number }[];
    monthlyTrend: { createdAt: string; _count: { id: number } }[];
}

export interface DemographicsData {
    byGender: { gender: string; count: number }[];
    byCivilStatus: { status: string; count: number }[];
    byAgeGroup: { group: string; count: number }[];
}

export const analyticsApi = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const { data } = await api.get<ApiResponse<DashboardStats>>('/analytics/dashboard');
        return data.data;
    },

    getCertificateAnalytics: async (): Promise<CertificateAnalytics> => {
        const { data } = await api.get<ApiResponse<CertificateAnalytics>>('/analytics/certificates');
        return data.data;
    },

    getDemographics: async (): Promise<DemographicsData> => {
        const { data } = await api.get<ApiResponse<DemographicsData>>('/analytics/demographics');
        return data.data;
    },
};

// Audit Logs API
export interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    details: string;
    createdAt: string;
    user: {
        email: string;
        person?: {
            firstName: string;
            lastName: string;
        };
    };
}

export const auditApi = {
    getRecentLogs: async (limit = 10): Promise<AuditLog[]> => {
        const { data } = await api.get<ApiResponse<{ logs: AuditLog[] }>>(`/audit?limit=${limit}`);
        return data.data.logs;
    },
};

// Notifications API
export const notificationsApi = {
    getAll: async () => {
        const { data } = await api.get<ApiResponse<any[]>>('/notifications');
        return data.data;
    },

    getUnreadCount: async () => {
        const { data } = await api.get<ApiResponse<{ count: number }>>('/notifications/unread/count');
        return data.data.count;
    },

    markAsRead: async (id: string) => {
        await api.put(`/notifications/${id}/read`);
    },

    markAllAsRead: async () => {
        await api.put('/notifications/read-all');
    },
};

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default api;
