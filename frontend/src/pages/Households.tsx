import { useState, useEffect } from 'react';
import {
    Home, Plus, Search, Edit2, Trash2, X, Loader2,
    Download, Users, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { householdsApi } from '../services/api';

interface Household {
    id: string;
    householdNumber: string;
    address: string;
    purok?: string;
    members?: any[];
    _count?: { members: number };
    createdAt: string;
}

interface AddEditModalProps {
    isOpen: boolean;
    household?: Household | null;
    onClose: () => void;
    onSave: (household: Partial<Household>) => void;
    isLoading: boolean;
}

function AddEditModal({ isOpen, household, onClose, onSave, isLoading }: AddEditModalProps) {
    const [formData, setFormData] = useState({
        householdNumber: '',
        address: '',
        purok: ''
    });

    useEffect(() => {
        if (household) {
            setFormData({
                householdNumber: household.householdNumber || '',
                address: household.address || '',
                purok: household.purok || ''
            });
        } else {
            setFormData({ householdNumber: '', address: '', purok: '' });
        }
    }, [household, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Home size={20} />
                        {household ? 'Edit Household' : 'Add New Household'}
                    </h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Household Number *</label>
                        <input type="text" className="form-input" value={formData.householdNumber}
                            onChange={e => setFormData({ ...formData, householdNumber: e.target.value })}
                            required placeholder="e.g., HH-2024-001" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address *</label>
                        <input type="text" className="form-input" value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            required placeholder="Complete address" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Purok/Zone</label>
                        <input type="text" className="form-input" value={formData.purok}
                            onChange={e => setFormData({ ...formData, purok: e.target.value })}
                            placeholder="e.g., Purok 1" />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                            {isLoading ? <><Loader2 size={18} className="spinner" /> Saving...</> :
                                household ? 'Update Household' : 'Add Household'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Households() {
    const [households, setHouseholds] = useState<Household[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHousehold, setEditingHousehold] = useState<Household | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchHouseholds = async () => {
        setIsLoading(true);
        try {
            const response = await householdsApi.getAll(pagination.page, pagination.limit);
            setHouseholds(response.households || []);
            setPagination(prev => ({ ...prev, ...response.pagination }));
        } catch (error) {
            toast.error('Failed to load households');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHouseholds();
    }, [pagination.page]);

    const handleSave = async (householdData: Partial<Household>) => {
        setIsSaving(true);
        try {
            if (editingHousehold) {
                await householdsApi.update(editingHousehold.id, householdData);
                toast.success('Household updated successfully');
            } else {
                await householdsApi.create(householdData);
                toast.success('Household added successfully');
            }
            setIsModalOpen(false);
            setEditingHousehold(null);
            fetchHouseholds();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save household');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this household?')) return;
        try {
            await householdsApi.delete(id);
            toast.success('Household deleted');
            fetchHouseholds();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete household');
        }
    };

    const filteredHouseholds = households.filter(h =>
        h.householdNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.purok && h.purok.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalMembers = households.reduce((sum, h) => sum + (h._count?.members || h.members?.length || 0), 0);

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                        <Home size={28} color="#22c55e" />
                        Households Management
                    </h1>
                    <p className="text-muted">Manage household records and members</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingHousehold(null); setIsModalOpen(true); }}>
                    <Plus size={18} /> Add Household
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Home size={24} color="var(--primary)" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pagination.total}</p>
                    <p className="text-xs text-muted">Total Households</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Users size={24} color="#3b82f6" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalMembers}</p>
                    <p className="text-xs text-muted">Total Members</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Users size={24} color="#f59e0b" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {pagination.total > 0 ? (totalMembers / pagination.total).toFixed(1) : 0}
                    </p>
                    <p className="text-xs text-muted">Avg Members/Household</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by household number, address, or purok..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
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
                        <p className="text-muted" style={{ marginTop: 'var(--spacing-md)' }}>Loading households...</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Household Number</th>
                                <th>Address</th>
                                <th>Purok/Zone</th>
                                <th>Members</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHouseholds.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                                        <Home size={40} color="var(--gray-300)" style={{ marginBottom: 'var(--spacing-md)' }} />
                                        <p className="text-muted">No households found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredHouseholds.map(household => (
                                    <tr key={household.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                                    background: 'var(--primary-100)',
                                                    color: 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <Home size={18} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{household.householdNumber}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={14} color="var(--gray-400)" />
                                                {household.address}
                                            </span>
                                        </td>
                                        <td>{household.purok || '—'}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem', fontWeight: 500,
                                                background: '#3b82f620', color: '#3b82f6'
                                            }}>
                                                <Users size={12} />
                                                {household._count?.members || household.members?.length || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                                <button className="btn btn-secondary" style={{ padding: '6px' }}
                                                    onClick={() => { setEditingHousehold(household); setIsModalOpen(true); }}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="btn btn-secondary" style={{ padding: '6px', color: '#ef4444' }}
                                                    onClick={() => handleDelete(household.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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

            {/* Modal */}
            <AddEditModal
                isOpen={isModalOpen}
                household={editingHousehold}
                onClose={() => { setIsModalOpen(false); setEditingHousehold(null); }}
                onSave={handleSave}
                isLoading={isSaving}
            />
        </div>
    );
}
