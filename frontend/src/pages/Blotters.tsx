import { useState, useEffect } from 'react';
import {
    FileWarning, Plus, Search, X, Loader2,
    Filter, Download, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blottersApi } from '../services/api';

interface Blotter {
    id: string;
    caseNumber: string;
    complainant: string;
    respondent: string;
    incidentDate: string;
    incidentPlace: string;
    narrative: string;
    status: string;
    resolution?: string;
    settledAt?: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
    PENDING: { icon: <Clock size={14} />, color: '#f59e0b', bg: '#fef3c7' },
    ONGOING: { icon: <AlertTriangle size={14} />, color: '#3b82f6', bg: '#dbeafe' },
    SETTLED: { icon: <CheckCircle size={14} />, color: '#22c55e', bg: '#dcfce7' },
};

interface AddBlotterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

function AddBlotterModal({ isOpen, onClose, onSubmit, isLoading }: AddBlotterModalProps) {
    const [formData, setFormData] = useState({
        complainant: '',
        respondent: '',
        incidentDate: '',
        incidentPlace: '',
        narrative: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ complainant: '', respondent: '', incidentDate: '', incidentPlace: '', narrative: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <FileWarning size={20} />
                        New Blotter Entry
                    </h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Complainant *</label>
                            <input type="text" className="form-input" value={formData.complainant}
                                onChange={e => setFormData({ ...formData, complainant: e.target.value })} required
                                placeholder="Full name of complainant" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Respondent *</label>
                            <input type="text" className="form-input" value={formData.respondent}
                                onChange={e => setFormData({ ...formData, respondent: e.target.value })} required
                                placeholder="Full name of respondent" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Incident Date *</label>
                            <input type="datetime-local" className="form-input" value={formData.incidentDate}
                                onChange={e => setFormData({ ...formData, incidentDate: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Incident Place *</label>
                            <input type="text" className="form-input" value={formData.incidentPlace}
                                onChange={e => setFormData({ ...formData, incidentPlace: e.target.value })} required
                                placeholder="Location of incident" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Narrative *</label>
                        <textarea className="form-input" value={formData.narrative} rows={4}
                            onChange={e => setFormData({ ...formData, narrative: e.target.value })} required
                            placeholder="Detailed description of the incident..." />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                            {isLoading ? <><Loader2 size={18} className="spinner" /> Creating...</> : 'Create Blotter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface UpdateStatusModalProps {
    isOpen: boolean;
    blotter: Blotter | null;
    onClose: () => void;
    onUpdate: (id: string, status: string, resolution?: string) => void;
    isLoading: boolean;
}

function UpdateStatusModal({ isOpen, blotter, onClose, onUpdate, isLoading }: UpdateStatusModalProps) {
    const [status, setStatus] = useState('');
    const [resolution, setResolution] = useState('');

    useEffect(() => {
        if (blotter) {
            setStatus(blotter.status);
            setResolution(blotter.resolution || '');
        }
    }, [blotter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (blotter) {
            onUpdate(blotter.id, status, resolution);
        }
    };

    if (!isOpen || !blotter) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Update Status</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                        Case: <strong>{blotter.caseNumber}</strong>
                    </p>

                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="PENDING">Pending</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="SETTLED">Settled</option>
                        </select>
                    </div>

                    {status === 'SETTLED' && (
                        <div className="form-group">
                            <label className="form-label">Resolution *</label>
                            <textarea className="form-input" value={resolution} rows={3}
                                onChange={e => setResolution(e.target.value)} required
                                placeholder="How was this case resolved?" />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className="spinner" /> : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Blotters() {
    const [blotters, setBlotters] = useState<Blotter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [updatingBlotter, setUpdatingBlotter] = useState<Blotter | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchBlotters = async () => {
        setIsLoading(true);
        try {
            const response = await blottersApi.getAll(pagination.page, pagination.limit, searchTerm || undefined);
            setBlotters(response.blotters || []);
            setPagination(prev => ({ ...prev, ...response.pagination }));
        } catch (error) {
            toast.error('Failed to load blotters');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBlotters();
    }, [pagination.page, searchTerm]);

    const handleCreate = async (data: any) => {
        setIsSaving(true);
        try {
            await blottersApi.create(data);
            toast.success('Blotter entry created');
            setIsAddModalOpen(false);
            fetchBlotters();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create blotter');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string, resolution?: string) => {
        setIsSaving(true);
        try {
            await blottersApi.updateStatus(id, status, resolution);
            toast.success('Status updated');
            setUpdatingBlotter(null);
            fetchBlotters();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredBlotters = blotters.filter(b =>
        (statusFilter === 'ALL' || b.status === statusFilter) &&
        (b.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.respondent.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const stats = {
        total: blotters.length,
        pending: blotters.filter(b => b.status === 'PENDING').length,
        ongoing: blotters.filter(b => b.status === 'ONGOING').length,
        settled: blotters.filter(b => b.status === 'SETTLED').length
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                        <FileWarning size={28} color="#22c55e" />
                        Blotter Records
                    </h1>
                    <p className="text-muted">Manage barangay blotter/incident records</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> New Blotter
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <FileWarning size={24} color="var(--primary)" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</p>
                    <p className="text-xs text-muted">Total Cases</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Clock size={24} color="#f59e0b" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.pending}</p>
                    <p className="text-xs text-muted">Pending</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <AlertTriangle size={24} color="#3b82f6" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.ongoing}</p>
                    <p className="text-xs text-muted">Ongoing</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <CheckCircle size={24} color="#22c55e" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.settled}</p>
                    <p className="text-xs text-muted">Settled</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                        <input type="text" className="form-input" placeholder="Search by case number, complainant, or respondent..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Filter size={18} color="var(--gray-400)" />
                        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="SETTLED">Settled</option>
                        </select>
                    </div>
                    <button className="btn btn-secondary">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <Loader2 size={40} className="spinner" color="var(--primary)" />
                        <p className="text-muted" style={{ marginTop: 'var(--spacing-md)' }}>Loading blotters...</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Case Number</th>
                                <th>Complainant</th>
                                <th>Respondent</th>
                                <th>Incident Date</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th style={{ width: '80px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBlotters.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                                        <FileWarning size={40} color="var(--gray-300)" style={{ marginBottom: 'var(--spacing-md)' }} />
                                        <p className="text-muted">No blotter records found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBlotters.map(blotter => (
                                    <tr key={blotter.id}>
                                        <td><strong>{blotter.caseNumber}</strong></td>
                                        <td>{blotter.complainant}</td>
                                        <td>{blotter.respondent}</td>
                                        <td className="text-sm">{formatDate(blotter.incidentDate)}</td>
                                        <td style={{ maxWidth: '150px' }}>
                                            {blotter.incidentPlace.length > 25
                                                ? blotter.incidentPlace.substring(0, 25) + '...'
                                                : blotter.incidentPlace}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem', fontWeight: 500,
                                                background: STATUS_CONFIG[blotter.status]?.bg || 'var(--gray-100)',
                                                color: STATUS_CONFIG[blotter.status]?.color || 'var(--gray-600)'
                                            }}>
                                                {STATUS_CONFIG[blotter.status]?.icon}
                                                {blotter.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                                onClick={() => setUpdatingBlotter(blotter)}>
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
                    <button className="btn btn-secondary" disabled={pagination.page === 1}
                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                        Previous
                    </button>
                    <span style={{ padding: 'var(--spacing-sm) var(--spacing-md)', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button className="btn btn-secondary" disabled={pagination.page === pagination.totalPages}
                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            <AddBlotterModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={isSaving}
            />
            <UpdateStatusModal
                isOpen={!!updatingBlotter}
                blotter={updatingBlotter}
                onClose={() => setUpdatingBlotter(null)}
                onUpdate={handleUpdateStatus}
                isLoading={isSaving}
            />
        </div>
    );
}
