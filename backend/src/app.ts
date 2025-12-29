import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import personRoutes from './routes/person.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import householdRoutes from './routes/household.routes.js';
import blotterRoutes from './routes/blotter.routes.js';
import userRoutes from './routes/user.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import messageRoutes from './routes/message.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditRoutes from './routes/audit.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';

config();

// Validate required environment variables (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
}

const app = express();

// Trust proxy for Railway/production (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Request logging (before other middleware)
app.use(requestLogger);

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet - Sets various HTTP security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for development
}));

// CORS - Restrict to allowed origins
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8090',  // Mobile web preview
    'http://10.140.50.179:8090',  // Mobile web preview on LAN
    'http://10.140.50.179:5173',  // Frontend on LAN
    'https://barangay-management.up.railway.app',  // Railway frontend
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting - General API rate limit (skip in test environment)
const isTestEnv = process.env.NODE_ENV === 'test';

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: { status: 'fail', message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTestEnv, // Skip in test environment
});

// Strict rate limiting for auth routes (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: { status: 'fail', message: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    skip: () => isTestEnv, // Skip in test environment
});

// Apply general rate limit to all routes
app.use('/api', generalLimiter);

// ===========================================
// BODY PARSING MIDDLEWARE
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// HEALTH CHECK
// ===========================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Barangay Management API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// ===========================================
// API ROUTES
// ===========================================

// Apply strict rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Auth routes
app.use('/api/auth', authRoutes);

// Core data routes
app.use('/api/persons', personRoutes);
app.use('/api/residents', personRoutes); // Backward compatibility
app.use('/api/certificates', certificateRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/blotters', blotterRoutes);
app.use('/api/users', userRoutes);

// Service routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/complaints', complaintRoutes);

// Analytics and admin routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================
app.use(errorHandler);

export default app;
