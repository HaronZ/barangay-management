import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import ResidentDashboard from './dashboards/ResidentDashboard';

/**
 * Smart dashboard router that renders the appropriate dashboard
 * based on the user's role
 */
export default function DashboardRouter() {
    const { user } = useAuth();

    switch (user?.role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'STAFF':
            return <StaffDashboard />;
        case 'RESIDENT':
        default:
            return <ResidentDashboard />;
    }
}
