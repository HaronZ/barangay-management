import { useState, useEffect } from 'react';
import {
    FileText,
    Calendar,
    AlertCircle,
    Clock,
    CheckCircle,
    ArrowRight,
    ClipboardList,
    MessageSquare,
    Users,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, certificatesApi } from '../../services/api';
import toast from 'react-hot-toast';

const CHART_COLORS = {
    primary: '#22c55e',
    secondary: '#3b82f6',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#a855f7',
};

interface TaskCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    link: string;
    urgent?: boolean;
    loading?: boolean;
}

function TaskCard({ title, count, icon, color, link, urgent, loading }: TaskCardProps) {
    return (
        <Link
            to={link}
            className="card"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-lg)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
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
            {urgent && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: CHART_COLORS.danger,
                    animation: 'pulse 2s infinite'
                }} />
            )}
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <p className="text-sm text-muted">{title}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                    {loading ? <Loader2 size={24} className="spinner" /> : count}
                </p>
            </div>
            <ArrowRight size={20} color="var(--gray-300)" />
        </Link>
    );
}

interface QueueItemProps {
    id: string;
    type: string;
    requester: string;
    requestDate: string;
    status: 'PENDING' | 'APPROVED';
}

function QueueItem({ type, requester, requestDate, status }: QueueItemProps) {
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
                <p className="text-xs text-muted">{requester}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    background: status === 'PENDING' ? `${CHART_COLORS.warning}20` : `${CHART_COLORS.secondary}20`,
                    color: status === 'PENDING' ? CHART_COLORS.warning : CHART_COLORS.secondary
                }}>
                    {status}
                </span>
                <p className="text-xs text-muted" style={{ marginTop: '2px' }}>{requestDate}</p>
            </div>
        </div>
    );
}

export default function StaffDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingCertificates: 0,
        todayAppointments: 0,
        openComplaints: 0,
        unreadMessages: 0
    });
    const [pendingCertificates, setPendingCertificates] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch dashboard stats
                const dashboardStats = await analyticsApi.getDashboardStats();
                setStats({
                    pendingCertificates: dashboardStats.certificates?.pending || 0,
                    todayAppointments: dashboardStats.appointments?.pending || 0,
                    openComplaints: dashboardStats.complaints?.open || 0,
                    unreadMessages: 0 // Would need a separate API call
                });

                // Fetch pending certificates for the queue
                const certResponse = await certificatesApi.getAll(1, 5, 'PENDING');
                setPendingCertificates(certResponse.certificates || []);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                    <span style={{
                        background: `${CHART_COLORS.secondary}20`,
                        color: CHART_COLORS.secondary,
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        STAFF
                    </span>
                </div>
                <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>
                    Good morning, {user?.person?.firstName || 'Staff'}!
                </h1>
                <p className="text-muted">Here's your work overview for today</p>
            </div>

            {/* Task Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <TaskCard
                    title="Pending Certificates"
                    count={stats.pendingCertificates}
                    icon={<FileText size={24} />}
                    color={CHART_COLORS.warning}
                    link="/certificates"
                    urgent={stats.pendingCertificates > 0}
                    loading={isLoading}
                />
                <TaskCard
                    title="Pending Appointments"
                    count={stats.todayAppointments}
                    icon={<Calendar size={24} />}
                    color={CHART_COLORS.purple}
                    link="/appointments"
                    loading={isLoading}
                />
                <TaskCard
                    title="Open Complaints"
                    count={stats.openComplaints}
                    icon={<AlertCircle size={24} />}
                    color={CHART_COLORS.danger}
                    link="/complaints"
                    loading={isLoading}
                />
                <TaskCard
                    title="Messages"
                    count={stats.unreadMessages}
                    icon={<MessageSquare size={24} />}
                    color={CHART_COLORS.secondary}
                    link="/messages"
                    loading={isLoading}
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                {/* Certificate Queue */}
                <div className="card">
                    <div className="card-header">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <ClipboardList size={20} />
                            Certificate Queue
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
                        ) : pendingCertificates.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                <CheckCircle size={32} color="var(--gray-300)" />
                                <p className="text-sm text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>
                                    No pending certificates!
                                </p>
                            </div>
                        ) : (
                            pendingCertificates.map(cert => (
                                <QueueItem
                                    key={cert.id}
                                    id={cert.id}
                                    type={cert.type}
                                    requester={cert.person ? `${cert.person.firstName} ${cert.person.lastName}` : 'Unknown'}
                                    requestDate={formatDate(cert.createdAt)}
                                    status={cert.status}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="card">
                    <div className="card-header">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <Users size={20} />
                            Quick Stats
                        </h4>
                    </div>
                    <div style={{ padding: 'var(--spacing-md) 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-100)' }}>
                            <CheckCircle size={18} color={CHART_COLORS.primary} />
                            <span className="text-sm">
                                <strong>{stats.pendingCertificates}</strong> certificates need processing
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-100)' }}>
                            <Calendar size={18} color={CHART_COLORS.purple} />
                            <span className="text-sm">
                                <strong>{stats.todayAppointments}</strong> appointments pending
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-100)' }}>
                            <AlertCircle size={18} color={CHART_COLORS.danger} />
                            <span className="text-sm">
                                <strong>{stats.openComplaints}</strong> open complaints
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm) 0' }}>
                            <Clock size={18} color={CHART_COLORS.warning} />
                            <span className="text-sm">
                                Real-time data from API
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
