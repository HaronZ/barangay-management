import { useState, useEffect } from 'react';
import {
    BarChart3, Users, FileText, AlertCircle, Calendar, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
    residents: { total: number };
    households: { total: number };
    certificates: { total: number; pending: number };
    complaints: { total: number; open: number };
    appointments: { total: number; pending: number };
}

interface DemographicsData {
    byGender: { gender: string; count: number }[];
    byCivilStatus: { status: string; count: number }[];
    byAgeGroup: { group: string; count: number }[];
}

export default function Analytics() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [demographics, setDemographics] = useState<DemographicsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, demoRes] = await Promise.all([
                fetch('http://localhost:3000/api/analytics/dashboard', { headers }),
                fetch('http://localhost:3000/api/analytics/demographics', { headers }),
            ]);

            const statsData = await statsRes.json();
            const demoData = await demoRes.json();

            if (statsRes.ok) setStats(statsData.data);
            if (demoRes.ok) setDemographics(demoData.data);
        } catch {
            toast.error('Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="analytics-page fade-in">
                <div className="page-header">
                    <h1><BarChart3 size={28} /> Analytics Dashboard</h1>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className="analytics-page fade-in">
            <div className="page-header">
                <div>
                    <h1><BarChart3 size={28} /> Analytics Dashboard</h1>
                    <p>System overview and statistics</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="analytics-stats">
                <div className="stat-card card">
                    <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
                        <Users size={24} style={{ color: '#3b82f6' }} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.residents.total || 0}</span>
                        <span className="stat-label">Total Residents</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>
                        <FileText size={24} style={{ color: '#22c55e' }} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.certificates.total || 0}</span>
                        <span className="stat-label">Certificates Issued</span>
                    </div>
                    <span className="stat-badge pending">{stats?.certificates.pending || 0} pending</span>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
                        <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.complaints.total || 0}</span>
                        <span className="stat-label">Total Complaints</span>
                    </div>
                    <span className="stat-badge open">{stats?.complaints.open || 0} open</span>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ backgroundColor: '#f3e8ff' }}>
                        <Calendar size={24} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.appointments.total || 0}</span>
                        <span className="stat-label">Appointments</span>
                    </div>
                    <span className="stat-badge pending">{stats?.appointments.pending || 0} pending</span>
                </div>
            </div>

            {/* Demographics */}
            <div className="analytics-charts">
                {/* Gender Distribution */}
                <div className="chart-card card">
                    <h3><Users size={20} /> Gender Distribution</h3>
                    <div className="chart-bars">
                        {demographics?.byGender.map((item) => {
                            const total = demographics.byGender.reduce((a, b) => a + b.count, 0);
                            const percentage = total > 0 ? (item.count / total) * 100 : 0;
                            return (
                                <div key={item.gender} className="bar-item">
                                    <div className="bar-label">
                                        <span>{item.gender}</span>
                                        <span>{item.count}</span>
                                    </div>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: item.gender === 'MALE' ? '#3b82f6' : '#ec4899'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Age Distribution */}
                <div className="chart-card card">
                    <h3><TrendingUp size={20} /> Age Distribution</h3>
                    <div className="chart-bars">
                        {demographics?.byAgeGroup.map((item) => {
                            const total = demographics.byAgeGroup.reduce((a, b) => a + b.count, 0);
                            const percentage = total > 0 ? (item.count / total) * 100 : 0;
                            const colors: Record<string, string> = {
                                '0-17': '#22d3ee',
                                '18-35': '#22c55e',
                                '36-59': '#f59e0b',
                                '60+': '#8b5cf6',
                            };
                            return (
                                <div key={item.group} className="bar-item">
                                    <div className="bar-label">
                                        <span>{item.group} years</span>
                                        <span>{item.count}</span>
                                    </div>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: colors[item.group] || '#6b7280'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Civil Status */}
                <div className="chart-card card">
                    <h3><Users size={20} /> Civil Status</h3>
                    <div className="chart-legend">
                        {demographics?.byCivilStatus.map((item) => (
                            <div key={item.status} className="legend-item">
                                <span className="legend-dot" />
                                <span className="legend-label">{item.status}</span>
                                <span className="legend-value">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
