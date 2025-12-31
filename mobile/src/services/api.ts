import axios from 'axios';
import { Platform } from 'react-native';

// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
// Physical Device: Your Machine's Local IP (e.g., 192.168.1.X)
const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3000/api',
    ios: 'http://localhost:3000/api',
    default: 'http://localhost:3000/api',
});

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for auth token (placeholder)
api.interceptors.request.use(
    (config) => {
        // const token = await AsyncStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
