import { useState, useEffect } from 'react';
import {
    FileText, Plus, Search, X, Loader2,
    Filter, Download, Clock, CheckCircle, XCircle, FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { certificatesApi, personsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Certificate {
    id: string;
    controlNumber: string;
    type: string;
    purpose: string;
    status: string;
    remarks?: string;
    amount: number;
    personId: string;
    person?: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    issuedAt?: string;
}

const CERTIFICATE_TYPES = ['CLEARANCE', 'INDIGENCY', 'RESIDENCY', 'BUSINESS_PERMIT', 'CEDULA'];

const STATUS_CONFIG: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
    PENDING: { icon: <Clock size={14} />, color: '#f59e0b', bg: '#fef3c7' },
    APPROVED: { icon: <CheckCircle size={14} />, color: '#22c55e', bg: '#dcfce7' },
    REJECTED: { icon: <XCircle size={14} />, color: '#ef4444', bg: '#fee2e2' },
    RELEASED: { icon: <FileCheck size={14} />, color: '#3b82f6', bg: '#dbeafe' },
};

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

function RequestModal({ isOpen, onClose, onSubmit, isLoading }: RequestModalProps) {
    const [formData, setFormData] = useState({
        type: 'CLEARANCE',
        purpose: '',
        personId: ''
    });
    const [persons, setPersons] = useState<any[]>([]);
    const [loadingPersons, setLoadingPersons] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoadingPersons(true);
            personsApi.getAll(1, 100).then(res => {
                setPersons(res.persons || []);
            }).catch(console.error).finally(() => setLoadingPersons(false));
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <FileText size={20} />
                        Request Certificate
                    </h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Resident *</label>
                        {loadingPersons ? (
                            <p className="text-muted">Loading residents...</p>
                        ) : (
                            <select className="form-input" value={formData.personId}
                                onChange={e => setFormData({ ...formData, personId: e.target.value })} required>
                                <option value="">Select a resident</option>
                                {persons.map(p => (
                                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Certificate Type *</label>
                        <select className="form-input" value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}>
                            {CERTIFICATE_TYPES.map(type => (
                                <option key={type} value={type}>{type.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Purpose *</label>
                        <textarea className="form-input" value={formData.purpose} rows={3}
                            onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                            required placeholder="State the purpose of this certificate request" />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                            {isLoading ? <><Loader2 size={18} className="spinner" /> Submitting...</> : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface UpdateStatusModalProps {
    isOpen: boolean;
    certificate: Certificate | null;
    onClose: () => void;
    onUpdate: (id: string, status: string, remarks?: string) => void;
    isLoading: boolean;
}

function UpdateStatusModal({ isOpen, certificate, onClose, onUpdate, isLoading }: UpdateStatusModalProps) {
    const [status, setStatus] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (certificate) {
            setStatus(certificate.status);
            setRemarks(certificate.remarks || '');
        }
    }, [certificate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (certificate) {
            onUpdate(certificate.id, status, remarks);
        }
    };

    if (!isOpen || !certificate) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Update Status</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                        Updating: <strong>{certificate.controlNumber}</strong>
                    </p>

                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="RELEASED">Released</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Remarks</label>
                        <textarea className="form-input" value={remarks} rows={3}
                            onChange={e => setRemarks(e.target.value)} placeholder="Optional remarks" />
                    </div>

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

export default function Certificates() {
    const { user } = useAuth();
    const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [updatingCertificate, setUpdatingCertificate] = useState<Certificate | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchCertificates = async () => {
        setIsLoading(true);
        try {
            const status = statusFilter !== 'ALL' ? statusFilter : undefined;
            const type = typeFilter !== 'ALL' ? typeFilter : undefined;
            const response = await certificatesApi.getAll(pagination.page, pagination.limit, status, type);
            setCertificates(response.certificates || []);
            setPagination(prev => ({ ...prev, ...response.pagination }));
        } catch (error) {
            toast.error('Failed to load certificates');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, [pagination.page, statusFilter, typeFilter]);

    const handleRequest = async (data: any) => {
        setIsSaving(true);
        try {
            await certificatesApi.create(data);
            toast.success('Certificate request submitted');
            setIsRequestModalOpen(false);
            fetchCertificates();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string, remarks?: string) => {
        setIsSaving(true);
        try {
            await certificatesApi.updateStatus(id, status, remarks);
            toast.success('Status updated');
            setUpdatingCertificate(null);
            fetchCertificates();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCertificates = certificates.filter(cert =>
        cert.controlNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.person?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.person?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const stats = {
        total: certificates.length,
        pending: certificates.filter(c => c.status === 'PENDING').length,
        approved: certificates.filter(c => c.status === 'APPROVED').length,
        released: certificates.filter(c => c.status === 'RELEASED').length
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                        <FileText size={28} color="#22c55e" />
                        Certificates
                    </h1>
                    <p className="text-muted">Manage certificate requests and issuance</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsRequestModalOpen(true)}>
                    <Plus size={18} /> Request Certificate
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <FileText size={24} color="var(--primary)" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</p>
                    <p className="text-xs text-muted">Total</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Clock size={24} color="#f59e0b" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.pending}</p>
                    <p className="text-xs text-muted">Pending</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <CheckCircle size={24} color="#22c55e" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.approved}</p>
                    <p className="text-xs text-muted">Approved</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <FileCheck size={24} color="#3b82f6" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.released}</p>
                    <p className="text-xs text-muted">Released</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                        <input type="text" className="form-input" placeholder="Search by control number or name..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Filter size={18} color="var(--gray-400)" />
                        <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 'auto' }}>
                            <option value="ALL">All Types</option>
                            {CERTIFICATE_TYPES.map(type => (
                                <option key={type} value={type}>{type.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="RELEASED">Released</option>
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
                        <p className="text-muted" style={{ marginTop: 'var(--spacing-md)' }}>Loading certificates...</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Control Number</th>
                                <th>Type</th>
                                <th>Requested By</th>
                                <th>Purpose</th>
                                <th>Status</th>
                                <th>Date</th>
                                {isStaffOrAdmin && <th style={{ width: '80px' }}>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCertificates.length === 0 ? (
                                <tr>
                                    <td colSpan={isStaffOrAdmin ? 7 : 6} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                                        <FileText size={40} color="var(--gray-300)" style={{ marginBottom: 'var(--spacing-md)' }} />
                                        <p className="text-muted">No certificates found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCertificates.map(cert => (
                                    <tr key={cert.id}>
                                        <td><strong>{cert.controlNumber}</strong></td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem', fontWeight: 500,
                                                background: 'var(--gray-100)', color: 'var(--gray-700)'
                                            }}>
                                                {cert.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{cert.person ? `${cert.person.firstName} ${cert.person.lastName}` : '—'}</td>
                                        <td style={{ maxWidth: '200px' }}>
                                            {cert.purpose.length > 40 ? cert.purpose.substring(0, 40) + '...' : cert.purpose}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem', fontWeight: 500,
                                                background: STATUS_CONFIG[cert.status]?.bg || 'var(--gray-100)',
                                                color: STATUS_CONFIG[cert.status]?.color || 'var(--gray-600)'
                                            }}>
                                                {STATUS_CONFIG[cert.status]?.icon}
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="text-sm text-muted">{formatDate(cert.createdAt)}</td>
                                        {isStaffOrAdmin && (
                                            <td>
                                                <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                                    onClick={() => setUpdatingCertificate(cert)}>
                                                    Update
                                                </button>
                                            </td>
                                        )}
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
            <RequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSubmit={handleRequest}
                isLoading={isSaving}
            />
            <UpdateStatusModal
                isOpen={!!updatingCertificate}
                certificate={updatingCertificate}
                onClose={() => setUpdatingCertificate(null)}
                onUpdate={handleUpdateStatus}
                isLoading={isSaving}
            />
        </div>
    );
}
