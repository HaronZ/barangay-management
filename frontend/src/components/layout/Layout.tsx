import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Building2,
    LayoutDashboard,
    Users,
    Home,
    FileText,
    ClipboardList,
    LogOut,
    Menu,
    X,
    MessageSquare,
    Calendar,
    AlertCircle,
    BarChart3,
    ScrollText,
    Settings,
    Bell,
    Sun,
    Moon,
    Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'white' : 'var(--gray-400)',
                background: isActive ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                transition: 'all var(--transition-fast)',
                fontWeight: isActive ? 500 : 400,
                fontSize: '0.875rem',
            })}
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
}

export default function Layout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notification count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('/api/notifications/unread/count', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setUnreadCount(data.data.count || 0);
                }
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define all nav items with role restrictions
    const allNavItems = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['ADMIN', 'STAFF', 'RESIDENT'] },
        { to: '/certificates', icon: <FileText size={20} />, label: 'Certificates', roles: ['ADMIN', 'STAFF', 'RESIDENT'] },
        { to: '/track', icon: <Search size={20} />, label: 'Track Request', roles: ['ADMIN', 'STAFF', 'RESIDENT'] },
        { to: '/residents', icon: <Users size={20} />, label: 'Residents', roles: ['ADMIN', 'STAFF'] },
        { to: '/households', icon: <Home size={20} />, label: 'Households', roles: ['ADMIN', 'STAFF'] },
        { to: '/blotters', icon: <ClipboardList size={20} />, label: 'Blotters', roles: ['ADMIN', 'STAFF'] },
        { to: '/messages', icon: <MessageSquare size={20} />, label: 'Messages', roles: ['ADMIN', 'STAFF', 'RESIDENT'] },
        { to: '/appointments', icon: <Calendar size={20} />, label: 'Appointments', roles: ['ADMIN', 'STAFF', 'RESIDENT'] },
        { to: '/complaints', icon: <AlertCircle size={20} />, label: 'Complaints', roles: ['ADMIN', 'STAFF', 'RESIDENT'] },
        { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics', roles: ['ADMIN', 'STAFF'] },
    ];

    const adminNavItems = [
        { to: '/user-management', icon: <Users size={20} />, label: 'User Management' },
        { to: '/audit-logs', icon: <ScrollText size={20} />, label: 'Audit Logs' },
        { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    // Filter nav items based on user role
    const navItems = allNavItems.filter(item =>
        item.roles.includes(user?.role || 'RESIDENT')
    );

    // Get user display name
    const userName = user?.person
        ? `${user.person.firstName} ${user.person.lastName}`
        : user?.email?.split('@')[0] || 'User';

    const userInitial = userName[0]?.toUpperCase() || 'U';

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '16px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Building2 size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.875rem', marginBottom: '1px' }}>Barangay</h3>
                        <p style={{ fontSize: '0.625rem', color: 'var(--gray-400)' }}>Management System</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1 }}>
                    <p
                        style={{
                            fontSize: '0.6rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--gray-500)',
                            marginBottom: '6px',
                            paddingLeft: '12px'
                        }}
                    >
                        Main Menu
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {navItems.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </div>

                    {user?.role === 'ADMIN' && (
                        <>
                            <p
                                style={{
                                    fontSize: '0.6rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'var(--gray-500)',
                                    marginTop: '12px',
                                    marginBottom: '6px',
                                    paddingLeft: '12px'
                                }}
                            >
                                Administration
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {adminNavItems.map((item) => (
                                    <NavItem key={item.to} {...item} />
                                ))}
                            </div>
                        </>
                    )}
                </nav>
            </aside>

            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                    display: 'none',
                    position: 'fixed',
                    top: 'var(--spacing-md)',
                    left: 'var(--spacing-md)',
                    zIndex: 100,
                    padding: 'var(--spacing-sm)',
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                }}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Main Content with Header */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Top Header Bar */}
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 'var(--spacing-lg)',
                        padding: 'var(--spacing-md) var(--spacing-xl)',
                        background: 'var(--gray-900)',
                        borderBottom: '1px solid var(--gray-800)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 50,
                    }}
                >
                    {/* Notification Bell */}
                    <button
                        onClick={() => navigate('/notifications')}
                        title="View notifications"
                        style={{
                            position: 'relative',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--gray-400)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--gray-800)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--gray-400)';
                        }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    minWidth: '16px',
                                    height: '16px',
                                    background: 'var(--red-500)',
                                    borderRadius: '50%',
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 4px',
                                }}
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        style={{
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--gray-400)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--gray-800)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--gray-400)';
                        }}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'white',
                            }}
                        >
                            {userInitial}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'white' }}>
                                {userName}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{user?.role}</p>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            background: 'var(--red-600)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--red-500)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--red-600)';
                        }}
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </header>

                {/* Main Content */}
                <main className="main-content" style={{ flex: 1 }}>
                    <Outlet />
                </main>
            </div>
        </div >
    );
}
