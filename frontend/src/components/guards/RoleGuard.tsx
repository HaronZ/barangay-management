import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

type Role = 'ADMIN' | 'STAFF' | 'RESIDENT';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: Role[];
    redirectTo?: string;
}

/**
 * Role-based access control component
 * Wraps routes that require specific roles
 */
export default function RoleGuard({ children, allowedRoles, redirectTo = '/dashboard' }: RoleGuardProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role as Role)) {
        // Show toast only once
        toast.error('You do not have permission to access this page', { id: 'role-guard' });
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
