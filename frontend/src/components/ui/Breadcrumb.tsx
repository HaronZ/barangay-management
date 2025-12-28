import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[];
    showHome?: boolean;
}

// Auto-generate breadcrumbs from current path
const pathLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    residents: 'Residents',
    households: 'Households',
    certificates: 'Certificates',
    blotters: 'Blotters',
    messages: 'Messages',
    appointments: 'Appointments',
    complaints: 'Complaints',
    analytics: 'Analytics',
    notifications: 'Notifications',
    'user-management': 'User Management',
    'audit-logs': 'Audit Logs',
    settings: 'Settings',
    new: 'New',
    edit: 'Edit',
};

export default function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
    const location = useLocation();

    // If no items provided, auto-generate from path
    const breadcrumbs = items || location.pathname
        .split('/')
        .filter(Boolean)
        .map((segment, index, arr) => ({
            label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
            path: '/' + arr.slice(0, index + 1).join('/'),
        }));

    if (breadcrumbs.length === 0) return null;

    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                {showHome && (
                    <li className="breadcrumb-item">
                        <Link to="/dashboard" className="breadcrumb-link breadcrumb-home">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} className="breadcrumb-separator" />
                    </li>
                )}
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <li key={index} className="breadcrumb-item">
                            {isLast || !item.path ? (
                                <span className="breadcrumb-current">{item.label}</span>
                            ) : (
                                <>
                                    <Link to={item.path} className="breadcrumb-link">
                                        {item.label}
                                    </Link>
                                    <ChevronRight size={14} className="breadcrumb-separator" />
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
