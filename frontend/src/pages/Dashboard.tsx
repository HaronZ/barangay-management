import {
    Users,
    FileText,
    Home,
    ClipboardList,
    TrendingUp,
    Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
    return (
        <div className="card" style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
            <div
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-600)'
                }}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted" style={{ marginBottom: '4px' }}>{title}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</h3>
                {trend && (
                    <p
                        className="text-xs"
                        style={{
                            color: trendUp ? 'var(--primary-600)' : 'var(--red-500)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px'
                        }}
                    >
                        <TrendingUp size={14} />
                        {trend}
                    </p>
                )}
            </div>
        </div>
    );
}

interface ActivityItemProps {
    title: string;
    description: string;
    time: string;
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md) 0',
            borderBottom: '1px solid var(--gray-100)'
        }}>
            <div
                style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary-500)',
                    marginTop: '6px',
                    flexShrink: 0
                }}
            />
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, marginBottom: '2px' }}>{title}</p>
                <p className="text-sm text-muted">{description}</p>
            </div>
            <p className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {time}
            </p>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>
                    Welcome back, {user?.person?.firstName || 'User'}!
                </h1>
                <p className="text-muted">Here's what's happening in your barangay today</p>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-xl)'
                }}
            >
                <StatCard
                    title="Total Residents"
                    value="1,248"
                    icon={<Users size={24} />}
                    trend="+12% from last month"
                    trendUp
                />
                <StatCard
                    title="Certificates Issued"
                    value="156"
                    icon={<FileText size={24} />}
                    trend="+8% from last month"
                    trendUp
                />
                <StatCard
                    title="Households"
                    value="312"
                    icon={<Home size={24} />}
                />
                <StatCard
                    title="Pending Requests"
                    value="23"
                    icon={<ClipboardList size={24} />}
                />
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
                {/* Recent Activity */}
                <div className="card">
                    <div className="card-header">
                        <h4>Recent Activity</h4>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            View All
                        </button>
                    </div>
                    <div>
                        <ActivityItem
                            title="New Resident Registered"
                            description="Maria Santos was added to the system"
                            time="2 min ago"
                        />
                        <ActivityItem
                            title="Certificate Approved"
                            description="Barangay Clearance for Juan Dela Cruz"
                            time="15 min ago"
                        />
                        <ActivityItem
                            title="Blotter Report Filed"
                            description="Incident report #2024-0156 was submitted"
                            time="1 hour ago"
                        />
                        <ActivityItem
                            title="Household Updated"
                            description="Household #123 information was updated"
                            time="2 hours ago"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>Quick Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                        >
                            <Users size={18} />
                            Add New Resident
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                        >
                            <FileText size={18} />
                            Issue Certificate
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                        >
                            <Home size={18} />
                            Register Household
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                        >
                            <ClipboardList size={18} />
                            File Blotter Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
