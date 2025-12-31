import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

interface AuthContextType {
    user: any;
    token: string | null;
    isLoading: boolean;
    login: (token: string, userData: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Key for storage
const AUTH_KEY = '@auth_data';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const authDataSerialized = await AsyncStorage.getItem(AUTH_KEY);
            if (authDataSerialized) {
                const { token: storedToken, user: storedUser } = JSON.parse(authDataSerialized);
                setToken(storedToken);
                setUser(storedUser);
                // Set axios header
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (newToken: string, newUser: any) => {
        try {
            setToken(newToken);
            setUser(newUser);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ token: newToken, user: newUser }));
        } catch (e) {
            console.error('Failed to save auth data', e);
        }
    };

    const logout = async () => {
        try {
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
            await AsyncStorage.removeItem(AUTH_KEY);
        } catch (e) {
            console.error('Failed to remove auth data', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
