// Auto-detect API URL based on environment
export const getApiUrl = (): string => {
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

export const API_URL = getApiUrl();
