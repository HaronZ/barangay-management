import { useState, useEffect } from 'react';
import {
    FileText, Filter, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
    user: {
        email: string;
        resident?: { firstName: string; lastName: string };
    } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const actionColors: Record<string, string> = {
    CREATE: '#22c55e',
    UPDATE: '#3b82f6',
    DELETE: '#ef4444',
    LOGIN: '#8b5cf6',
    LOGOUT: '#6b7280',
    VIEW: '#f59e0b',
};

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        entity: '',
    });

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });
            if (filters.action) params.append('action', filters.action);
            if (filters.entity) params.append('entity', filters.entity);

            const response = await fetch(`http://localhost:3000/api/audit?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (response.ok) {
                setLogs(data.data.logs);
                setPagination(data.data.pagination);
            }
        } catch {
            toast.error('Failed to load audit logs');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'];
    const entities = ['User', 'Resident', 'Certificate', 'Household', 'Message', 'Announcement', 'Appointment', 'Complaint'];

    return (
        <div className="audit-page fade-in">
            <div className="page-header">
                <div>
                    <h1><FileText size={28} /> Audit Logs</h1>
                    <p>System activity and change history</p>
                </div>
            </div>

            {/* Filters */}
            <div className="audit-filters card">
                <div className="filter-group">
                    <Filter size={18} />
                    <select
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        className="form-input"
                    >
                        <option value="">All Actions</option>
                        {actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={filters.entity}
                        onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                        className="form-input"
                    >
                        <option value="">All Entities</option>
                        {entities.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => setFilters({ action: '', entity: '' })}
                >
                    Clear Filters
                </button>
            </div>

            {/* Logs Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>Details</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No audit logs found
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <span className="log-time">
                                            <Clock size={14} />
                                            {formatDate(log.createdAt)}
                                        </span>
                                    </td>
                                    <td>
                                        {log.user?.resident
                                            ? `${log.user.resident.firstName} ${log.user.resident.lastName}`
                                            : log.user?.email || 'System'}
                                    </td>
                                    <td>
                                        <span
                                            className="action-badge"
                                            style={{ backgroundColor: actionColors[log.action] || '#6b7280' }}
                                        >
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.entity}</td>
                                    <td className="details-cell">{log.details || '-'}</td>
                                    <td>{log.ipAddress || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-secondary"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        className="btn btn-secondary"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
