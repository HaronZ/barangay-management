import { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    Home,
    ClipboardList,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Activity,
    Shield,
    UserPlus,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, type DashboardStats, type CertificateAnalytics } from '../../services/api';
import toast from 'react-hot-toast';

// Professional color palette for charts
const CHART_COLORS = {
    primary: '#22c55e',
    secondary: '#3b82f6',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#a855f7',
    cyan: '#06b6d4',
};

// Map certificate types to readable labels
const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
    'BARANGAY_CLEARANCE': 'Barangay Clearance',
    'CERTIFICATE_OF_INDIGENCY': 'Indigency',
    'CERTIFICATE_OF_RESIDENCY': 'Residency',
    'BUSINESS_CLEARANCE': 'Business Permit',
    'CEDULA': 'Cedula',
};

// Map certificate status to colors
const STATUS_COLORS: Record<string, string> = {
    'PENDING': CHART_COLORS.warning,
    'APPROVED': CHART_COLORS.primary,
    'RELEASED': CHART_COLORS.secondary,
    'REJECTED': CHART_COLORS.danger,
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    color?: string;
    loading?: boolean;
}

function StatCard({ title, value, icon, trend, trendLabel, color = CHART_COLORS.primary, loading }: StatCardProps) {
    const isPositive = trend && trend > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p className="text-sm text-muted" style={{ marginBottom: '8px' }}>{title}</p>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}>
                            <Loader2 size={20} className="spinner" />
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{value}</h2>
                            {trend !== undefined && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: isPositive ? CHART_COLORS.primary : CHART_COLORS.danger,
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }}>
                                    <TrendIcon size={16} />
                                    <span>{Math.abs(trend)}%</span>
                                    {trendLabel && <span className="text-muted" style={{ fontWeight: 400 }}>{trendLabel}</span>}
                                </div>
                            )}
                        </>
                    )}
                </div>
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
            </div>
            {/* Decorative gradient bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${color}, ${color}80)`
            }} />
        </div>
    );
}

// Professional Bar Chart Component
interface BarChartProps {
    data: { label: string; value: number; color?: string }[];
    maxValue?: number;
    title: string;
    showValues?: boolean;
    loading?: boolean;
}

function BarChart({ data, maxValue, title, showValues = true, loading }: BarChartProps) {
    const max = maxValue || Math.max(...data.map(d => d.value), 1);

    return (
        <div className="card">
            <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>{title}</h4>
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                    <Loader2 size={32} className="spinner" />
                </div>
            ) : data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--gray-400)' }}>
                    No data available
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {data.map((item, index) => (
                        <div key={index}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span className="text-sm">{item.label}</span>
                                {showValues && <span className="text-sm" style={{ fontWeight: 600 }}>{item.value}</span>}
                            </div>
                            <div style={{
                                height: '12px',
                                background: 'var(--gray-100)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(item.value / max) * 100}%`,
                                    background: `linear-gradient(90deg, ${item.color || CHART_COLORS.primary}, ${item.color || CHART_COLORS.primary}cc)`,
                                    borderRadius: 'var(--radius-full)',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Professional Donut Chart Component
interface DonutChartProps {
    data: { label: string; value: number; color: string }[];
    title: string;
    centerLabel?: string;
    centerValue?: string | number;
    loading?: boolean;
}

function DonutChart({ data, title, centerLabel, centerValue, loading }: DonutChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const segments = data.map(item => {
        const angle = total > 0 ? (item.value / total) * 360 : 0;
        const segment = {
            ...item,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
        };
        currentAngle += angle;
        return segment;
    });

    // Create SVG arc path
    const createArc = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
        if (endAngle - startAngle < 0.5) return '';
        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        const x1 = 100 + outerRadius * Math.cos(startRad);
        const y1 = 100 + outerRadius * Math.sin(startRad);
        const x2 = 100 + outerRadius * Math.cos(endRad);
        const y2 = 100 + outerRadius * Math.sin(endRad);
        const x3 = 100 + innerRadius * Math.cos(endRad);
        const y3 = 100 + innerRadius * Math.sin(endRad);
        const x4 = 100 + innerRadius * Math.cos(startRad);
        const y4 = 100 + innerRadius * Math.sin(startRad);

        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    };

    return (
        <div className="card">
            <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>{title}</h4>
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                    <Loader2 size={32} className="spinner" />
                </div>
            ) : total === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--gray-400)' }}>
                    No data available
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                            {segments.map((segment, index) => (
                                <path
                                    key={index}
                                    d={createArc(segment.startAngle, segment.endAngle - 0.5, 85, 55)}
                                    fill={segment.color}
                                    style={{ transition: 'all 0.3s ease' }}
                                />
                            ))}
                        </svg>
                        {(centerLabel || centerValue !== undefined) && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{centerValue}</div>
                                <div className="text-xs text-muted">{centerLabel}</div>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {segments.filter(s => s.value > 0).map((segment, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '3px',
                                    background: segment.color
                                }} />
                                <span className="text-sm">{segment.label}</span>
                                <span className="text-sm text-muted">({segment.percentage}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Activity Timeline Component
interface ActivityItem {
    id: string;
    action: string;
    description: string;
    time: string;
    type: 'success' | 'info' | 'warning' | 'danger';
}

function ActivityTimeline({ activities, loading }: { activities: ActivityItem[]; loading?: boolean }) {
    const getTypeColor = (type: ActivityItem['type']) => {
        switch (type) {
            case 'success': return CHART_COLORS.primary;
            case 'info': return CHART_COLORS.secondary;
            case 'warning': return CHART_COLORS.warning;
            case 'danger': return CHART_COLORS.danger;
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h4>Recent Activity</h4>
                <Link to="/audit-logs" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    View All <ArrowUpRight size={14} />
                </Link>
            </div>
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                    <Loader2 size={32} className="spinner" />
                </div>
            ) : activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--gray-400)' }}>
                    No recent activity
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            style={{
                                display: 'flex',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-md) 0',
                                borderBottom: index < activities.length - 1 ? '1px solid var(--gray-100)' : 'none'
                            }}
                        >
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: getTypeColor(activity.type),
                                marginTop: '5px',
                                flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 500, marginBottom: '2px' }}>{activity.action}</p>
                                <p className="text-sm text-muted">{activity.description}</p>
                            </div>
                            <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                                <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                {activity.time}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [certAnalytics, setCertAnalytics] = useState<CertificateAnalytics | null>(null);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [dashboardStats, certificateStats] = await Promise.all([
                    analyticsApi.getDashboardStats(),
                    analyticsApi.getCertificateAnalytics()
                ]);
                setStats(dashboardStats);
                setCertAnalytics(certificateStats);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Transform certificate type data for bar chart
    const certificateData = certAnalytics?.byType.map((item, index) => ({
        label: CERTIFICATE_TYPE_LABELS[item.type] || item.type,
        value: item.count,
        color: [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.purple, CHART_COLORS.warning, CHART_COLORS.cyan][index % 5]
    })) || [];

    // Transform certificate status data for donut chart
    const certificateStatusData = certAnalytics?.byStatus.map(item => ({
        label: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
        value: item.count,
        color: STATUS_COLORS[item.status] || CHART_COLORS.primary
    })) || [];

    const totalCertificates = certAnalytics?.byStatus.reduce((sum, item) => sum + item.count, 0) || 0;

    // Activity placeholder (would need audit log API)
    const recentActivities: ActivityItem[] = [
        { id: '1', action: 'Dashboard loaded', description: 'Real-time data from the database', time: 'Just now', type: 'success' },
    ];

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                        <Shield size={24} color={CHART_COLORS.primary} />
                        <span style={{
                            background: `${CHART_COLORS.primary}20`,
                            color: CHART_COLORS.primary,
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            ADMIN
                        </span>
                    </div>
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>
                        Welcome back, {user?.person?.firstName || 'Administrator'}!
                    </h1>
                    <p className="text-muted">System overview and management dashboard</p>
                </div>
                <Link to="/residents" className="btn btn-primary">
                    <UserPlus size={18} />
                    Add Resident
                </Link>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <StatCard
                    title="Total Residents"
                    value={stats?.residents.total.toLocaleString() || '0'}
                    icon={<Users size={24} />}
                    color={CHART_COLORS.primary}
                    loading={isLoading}
                />
                <StatCard
                    title="Households"
                    value={stats?.households.total || 0}
                    icon={<Home size={24} />}
                    color={CHART_COLORS.secondary}
                    loading={isLoading}
                />
                <StatCard
                    title="Pending Certificates"
                    value={stats?.certificates.pending || 0}
                    icon={<FileText size={24} />}
                    color={CHART_COLORS.warning}
                    loading={isLoading}
                />
                <StatCard
                    title="Open Complaints"
                    value={stats?.complaints.open || 0}
                    icon={<AlertCircle size={24} />}
                    color={CHART_COLORS.danger}
                    loading={isLoading}
                />
            </div>

            {/* Secondary Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div className="card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md) var(--spacing-lg)'
                }}>
                    <Calendar size={20} color={CHART_COLORS.purple} />
                    <div>
                        <span className="text-sm text-muted">Pending Appointments</span>
                        <p style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                            {isLoading ? <Loader2 size={16} className="spinner" /> : stats?.appointments.pending || 0}
                        </p>
                    </div>
                </div>
                <div className="card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md) var(--spacing-lg)'
                }}>
                    <Activity size={20} color={CHART_COLORS.cyan} />
                    <div>
                        <span className="text-sm text-muted">Total Appointments</span>
                        <p style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                            {isLoading ? <Loader2 size={16} className="spinner" /> : stats?.appointments.total || 0}
                        </p>
                    </div>
                </div>
                <div className="card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md) var(--spacing-lg)'
                }}>
                    <CheckCircle size={20} color={CHART_COLORS.primary} />
                    <div>
                        <span className="text-sm text-muted">Total Certificates</span>
                        <p style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                            {isLoading ? <Loader2 size={16} className="spinner" /> : stats?.certificates.total || 0}
                        </p>
                    </div>
                </div>
                <div className="card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md) var(--spacing-lg)'
                }}>
                    <ClipboardList size={20} color={CHART_COLORS.secondary} />
                    <div>
                        <span className="text-sm text-muted">Total Complaints</span>
                        <p style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                            {isLoading ? <Loader2 size={16} className="spinner" /> : stats?.complaints.total || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <BarChart
                    title="Certificates by Type"
                    data={certificateData}
                    loading={isLoading}
                />
                <DonutChart
                    title="Certificate Status"
                    data={certificateStatusData}
                    centerValue={totalCertificates}
                    centerLabel="Total"
                    loading={isLoading}
                />
            </div>

            {/* Activity & Quick Actions Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
                <ActivityTimeline activities={recentActivities} loading={false} />

                {/* Quick Actions */}
                <div className="card">
                    <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>Quick Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <Link to="/residents" className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <UserPlus size={18} />
                            Add New Resident
                        </Link>
                        <Link to="/certificates" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <FileText size={18} />
                            Process Certificates
                        </Link>
                        <Link to="/households" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <Home size={18} />
                            Manage Households
                        </Link>
                        <Link to="/user-management" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <Users size={18} />
                            User Management
                        </Link>
                        <Link to="/audit-logs" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <Activity size={18} />
                            View Audit Logs
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
