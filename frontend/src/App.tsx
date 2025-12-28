import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import DashboardRouter from './pages/DashboardRouter';
import LandingPage from './pages/LandingPage';
import TrackRequest from './pages/TrackRequest';
import Messages from './pages/Messages';
import Announcements from './pages/Announcements';
import Appointments from './pages/Appointments';
import Complaints from './pages/Complaints';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';
import Residents from './pages/Residents';
import Households from './pages/Households';
import Certificates from './pages/Certificates';
import Blotters from './pages/Blotters';
import Notifications from './pages/Notifications';

// Layout and Guards
import Layout from './components/layout/Layout';
import RoleGuard from './components/guards/RoleGuard';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }} />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

// Placeholder pages for routes
function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: 'var(--spacing-md)' }}>{title}</h1>
            <p className="text-muted">This page is under construction.</p>
        </div>
    );
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/track" element={<TrackRequest />} />
            <Route path="/announcements" element={<Announcements />} />

            {/* Auth Routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />
            <Route path="/forgot-password" element={
                <PublicRoute>
                    <ForgotPassword />
                </PublicRoute>
            } />
            <Route path="/reset-password" element={
                <PublicRoute>
                    <ResetPassword />
                </PublicRoute>
            } />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<DashboardRouter />} />
            </Route>
            <Route path="/residents" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={
                    <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
                        <Residents />
                    </RoleGuard>
                } />
            </Route>
            <Route path="/households" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={
                    <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
                        <Households />
                    </RoleGuard>
                } />
            </Route>
            <Route path="/certificates" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Certificates />} />
            </Route>
            <Route path="/blotters" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={
                    <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
                        <Blotters />
                    </RoleGuard>
                } />
            </Route>
            <Route path="/messages" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Messages />} />
            </Route>
            <Route path="/appointments" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Appointments />} />
            </Route>
            <Route path="/complaints" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Complaints />} />
            </Route>
            <Route path="/analytics" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={
                    <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
                        <Analytics />
                    </RoleGuard>
                } />
            </Route>
            <Route path="/audit-logs" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                        <AuditLogs />
                    </RoleGuard>
                } />
            </Route>
            <Route path="/user-management" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                        <UserManagement />
                    </RoleGuard>
                } />
            </Route>
            <Route path="/notifications" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Notifications />} />
            </Route>
            <Route path="/settings" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                        <PlaceholderPage title="Settings" />
                    </RoleGuard>
                } />
            </Route>

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: 'var(--gray-900)',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                            },
                            success: {
                                iconTheme: {
                                    primary: 'var(--primary-500)',
                                    secondary: 'white',
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

