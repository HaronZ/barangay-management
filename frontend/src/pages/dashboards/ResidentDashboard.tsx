import { useState, useEffect } from 'react';
import {
    FileText,
    Calendar,
    MessageSquare,
    AlertCircle,
    Plus,
    ArrowRight,
    Clock,
    CheckCircle,
    XCircle,
    Bell,
    Megaphone,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { certificatesApi } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CHART_COLORS = {
    primary: '#22c55e',
    secondary: '#3b82f6',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#a855f7',
};

interface QuickActionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    link: string;
}

function QuickAction({ title, description, icon, color, link }: QuickActionProps) {
    return (
        <Link
            to={link}
            className="card"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-lg)',
                transition: 'all 0.2s',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
        >
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '2px' }}>{title}</p>
                <p className="text-sm text-muted">{description}</p>
            </div>
            <ArrowRight size={20} color="var(--gray-300)" />
        </Link>
    );
}

interface Certificate {
    id: string;
    controlNumber: string;
    type: string;
    status: string;
    createdAt: string;
}

function RequestCard({ controlNumber, type, status, date }: { controlNumber: string; type: string; status: string; date: string }) {
    const statusLower = status.toLowerCase() as 'pending' | 'approved' | 'rejected' | 'released';
    const statusConfig = {
        pending: { color: CHART_COLORS.warning, icon: <Clock size={16} />, label: 'Pending' },
        approved: { color: CHART_COLORS.primary, icon: <CheckCircle size={16} />, label: 'Approved' },
        rejected: { color: CHART_COLORS.danger, icon: <XCircle size={16} />, label: 'Rejected' },
        released: { color: CHART_COLORS.secondary, icon: <CheckCircle size={16} />, label: 'Released' }
    };

    const config = statusConfig[statusLower] || statusConfig.pending;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-sm)'
        }}>
            <FileText size={20} color={CHART_COLORS.secondary} />
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{type.replace('_', ' ')}</p>
                <p className="text-xs text-muted">{controlNumber}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    background: `${config.color}20`,
                    color: config.color
                }}>
                    {config.icon}
                    {config.label}
                </span>
                <p className="text-xs text-muted" style={{ marginTop: '4px' }}>{date}</p>
            </div>
        </div>
    );
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: string;
    publishedAt: string;
}

function AnnouncementCard({ title, content, date, priority }: { title: string; content: string; date: string; priority: string }) {
    const isUrgent = priority === 'URGENT';
    return (
        <div style={{
            padding: 'var(--spacing-md)',
            background: isUrgent ? `${CHART_COLORS.danger}10` : 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            borderLeft: `3px solid ${isUrgent ? CHART_COLORS.danger : CHART_COLORS.primary}`,
            marginBottom: 'var(--spacing-sm)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</p>
                {isUrgent && (
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        background: CHART_COLORS.danger,
                        color: 'white'
                    }}>
                        URGENT
                    </span>
                )}
            </div>
            <p className="text-sm text-muted" style={{ marginBottom: '4px', lineHeight: 1.5 }}>
                {content.length > 100 ? content.substring(0, 100) + '...' : content}
            </p>
            <p className="text-xs text-muted">{date}</p>
        </div>
    );
}

export default function ResidentDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [myRequests, setMyRequests] = useState<Certificate[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [stats, setStats] = useState({ certificates: 0, appointments: 0, complaints: 0, messages: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user's certificates
                const certResponse = await certificatesApi.getAll(1, 5);
                setMyRequests(certResponse.certificates || []);
                setStats(prev => ({ ...prev, certificates: certResponse.pagination?.total || 0 }));

                // Fetch announcements
                const token = localStorage.getItem('token');
                const annResponse = await fetch(`${API_URL}/announcements?limit=3`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (annResponse.ok) {
                    const annData = await annResponse.json();
                    setAnnouncements(annData.data?.announcements || []);
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fade-in">
            {/* Welcome Header */}
            <div style={{
                background: `linear-gradient(135deg, ${CHART_COLORS.primary}10, ${CHART_COLORS.secondary}10)`,
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>
                    {getGreeting()}, {user?.person?.firstName || 'Resident'}!
                </h1>
                <p className="text-muted">Welcome to your personal barangay portal. What would you like to do today?</p>
            </div>

            {/* Quick Actions */}
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Quick Actions</h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <QuickAction
                    title="Request Certificate"
                    description="Apply for barangay certificates and documents"
                    icon={<Plus size={24} />}
                    color={CHART_COLORS.primary}
                    link="/certificates"
                />
                <QuickAction
                    title="Book Appointment"
                    description="Schedule a visit to the barangay hall"
                    icon={<Calendar size={24} />}
                    color={CHART_COLORS.secondary}
                    link="/appointments"
                />
                <QuickAction
                    title="Submit Complaint"
                    description="Report issues or submit suggestions"
                    icon={<AlertCircle size={24} />}
                    color={CHART_COLORS.warning}
                    link="/complaints"
                />
                <QuickAction
                    title="Contact Staff"
                    description="Send a message to barangay staff"
                    icon={<MessageSquare size={24} />}
                    color={CHART_COLORS.purple}
                    link="/messages"
                />
            </div>

            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                    <FileText size={24} color={CHART_COLORS.primary} style={{ marginBottom: '8px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {isLoading ? <Loader2 size={20} className="spinner" /> : stats.certificates}
                    </p>
                    <p className="text-sm text-muted">My Certificates</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                    <Calendar size={24} color={CHART_COLORS.secondary} style={{ marginBottom: '8px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.appointments}</p>
                    <p className="text-sm text-muted">Appointments</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                    <AlertCircle size={24} color={CHART_COLORS.warning} style={{ marginBottom: '8px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.complaints}</p>
                    <p className="text-sm text-muted">My Complaints</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                    <MessageSquare size={24} color={CHART_COLORS.purple} style={{ marginBottom: '8px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.messages}</p>
                    <p className="text-sm text-muted">Messages</p>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--spacing-lg)' }}>
                {/* My Requests */}
                <div className="card">
                    <div className="card-header">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <FileText size={20} />
                            My Recent Requests
                        </h4>
                        <Link to="/certificates" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            View All
                        </Link>
                    </div>
                    <div>
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                <Loader2 size={24} className="spinner" color="var(--primary)" />
                            </div>
                        ) : myRequests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                <FileText size={32} color="var(--gray-300)" />
                                <p className="text-sm text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>
                                    No certificate requests yet
                                </p>
                            </div>
                        ) : (
                            myRequests.map(request => (
                                <RequestCard
                                    key={request.id}
                                    controlNumber={request.controlNumber}
                                    type={request.type}
                                    status={request.status}
                                    date={formatDate(request.createdAt)}
                                />
                            ))
                        )}
                    </div>
                    <Link
                        to="/certificates"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                    >
                        <Plus size={18} />
                        Request New Certificate
                    </Link>
                </div>

                {/* Announcements */}
                <div className="card">
                    <div className="card-header">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <Megaphone size={20} />
                            Announcements
                        </h4>
                        <Link to="/announcements" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            View All
                        </Link>
                    </div>
                    <div>
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                <Loader2 size={24} className="spinner" color="var(--primary)" />
                            </div>
                        ) : announcements.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                <Megaphone size={32} color="var(--gray-300)" />
                                <p className="text-sm text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>
                                    No announcements yet
                                </p>
                            </div>
                        ) : (
                            announcements.map(announcement => (
                                <AnnouncementCard
                                    key={announcement.id}
                                    title={announcement.title}
                                    content={announcement.content}
                                    date={formatDate(announcement.publishedAt)}
                                    priority={announcement.priority}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: `${CHART_COLORS.secondary}10`,
                border: `1px solid ${CHART_COLORS.secondary}30`,
                borderRadius: 'var(--radius-lg)',
                marginTop: 'var(--spacing-xl)'
            }}>
                <Bell size={20} color={CHART_COLORS.secondary} />
                <p className="text-sm" style={{ flex: 1 }}>
                    <strong>Tip:</strong> You can track the status of your certificate requests anytime on the{' '}
                    <Link to="/track" style={{ color: CHART_COLORS.secondary, fontWeight: 500 }}>Track Request</Link> page using your control number.
                </p>
            </div>
        </div>
    );
}
