import { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Edit2, Trash2, X, Loader2,
    Filter, Download, User, Phone, MapPin, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { personsApi } from '../services/api';

interface Person {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE';
    civilStatus: string;
    address: string;
    contactNumber?: string;
    email?: string;
    occupation?: string;
    nationality: string;
}

const GENDER_COLORS = {
    MALE: { bg: '#3b82f620', color: '#3b82f6' },
    FEMALE: { bg: '#ec489920', color: '#ec4899' }
};

const CIVIL_STATUS_OPTIONS = ['SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'DIVORCED'];

interface AddEditModalProps {
    isOpen: boolean;
    person?: Person | null;
    onClose: () => void;
    onSave: (person: Partial<Person>) => void;
    isLoading: boolean;
}

function AddEditModal({ isOpen, person, onClose, onSave, isLoading }: AddEditModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        birthDate: '',
        gender: 'MALE' as 'MALE' | 'FEMALE',
        civilStatus: 'SINGLE',
        address: '',
        contactNumber: '',
        email: '',
        occupation: '',
        nationality: 'Filipino'
    });

    useEffect(() => {
        if (person) {
            setFormData({
                firstName: person.firstName || '',
                lastName: person.lastName || '',
                middleName: person.middleName || '',
                birthDate: person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : '',
                gender: person.gender || 'MALE',
                civilStatus: person.civilStatus || 'SINGLE',
                address: person.address || '',
                contactNumber: person.contactNumber || '',
                email: person.email || '',
                occupation: person.occupation || '',
                nationality: person.nationality || 'Filipino'
            });
        } else {
            setFormData({
                firstName: '', lastName: '', middleName: '', birthDate: '',
                gender: 'MALE', civilStatus: 'SINGLE', address: '',
                contactNumber: '', email: '', occupation: '', nationality: 'Filipino'
            });
        }
    }, [person, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <User size={20} />
                        {person ? 'Edit Resident' : 'Add New Resident'}
                    </h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">First Name *</label>
                            <input type="text" className="form-input" value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name *</label>
                            <input type="text" className="form-input" value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Middle Name</label>
                            <input type="text" className="form-input" value={formData.middleName}
                                onChange={e => setFormData({ ...formData, middleName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Birth Date *</label>
                            <input type="date" className="form-input" value={formData.birthDate}
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender *</label>
                            <select className="form-input" value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Civil Status *</label>
                            <select className="form-input" value={formData.civilStatus}
                                onChange={e => setFormData({ ...formData, civilStatus: e.target.value })}>
                                {CIVIL_STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contact Number</label>
                            <input type="text" className="form-input" value={formData.contactNumber}
                                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address *</label>
                        <input type="text" className="form-input" value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-input" value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Occupation</label>
                            <input type="text" className="form-input" value={formData.occupation}
                                onChange={e => setFormData({ ...formData, occupation: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                            {isLoading ? <><Loader2 size={18} className="spinner" /> Saving...</> :
                                person ? 'Update Resident' : 'Add Resident'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Residents() {
    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState<string>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchPersons = async () => {
        setIsLoading(true);
        try {
            const response = await personsApi.getAll(pagination.page, pagination.limit, searchTerm || undefined);
            setPersons(response.persons || []);
            setPagination(prev => ({ ...prev, ...response.pagination }));
        } catch (error) {
            toast.error('Failed to load residents');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPersons();
    }, [pagination.page, searchTerm]);

    const handleSave = async (personData: Partial<Person>) => {
        setIsSaving(true);
        try {
            if (editingPerson) {
                await personsApi.update(editingPerson.id, personData);
                toast.success('Resident updated successfully');
            } else {
                await personsApi.create(personData);
                toast.success('Resident added successfully');
            }
            setIsModalOpen(false);
            setEditingPerson(null);
            fetchPersons();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save resident');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resident?')) return;
        try {
            await personsApi.delete(id);
            toast.success('Resident deleted');
            fetchPersons();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete resident');
        }
    };

    const filteredPersons = persons.filter(p =>
        genderFilter === 'ALL' || p.gender === genderFilter
    );

    const calculateAge = (birthDate: string) => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                        <Users size={28} color="#22c55e" />
                        Residents Management
                    </h1>
                    <p className="text-muted">Manage barangay residents and their information</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingPerson(null); setIsModalOpen(true); }}>
                    <Plus size={18} /> Add Resident
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Users size={24} color="var(--primary)" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pagination.total}</p>
                    <p className="text-xs text-muted">Total Residents</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <User size={24} color="#3b82f6" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{persons.filter(p => p.gender === 'MALE').length}</p>
                    <p className="text-xs text-muted">Male</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <User size={24} color="#ec4899" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{persons.filter(p => p.gender === 'FEMALE').length}</p>
                    <p className="text-xs text-muted">Female</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Calendar size={24} color="#f59e0b" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{persons.filter(p => calculateAge(p.birthDate) >= 60).length}</p>
                    <p className="text-xs text-muted">Seniors (60+)</p>
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
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Filter size={18} color="var(--gray-400)" />
                        <select className="form-input" value={genderFilter} onChange={e => setGenderFilter(e.target.value)} style={{ width: 'auto' }}>
                            <option value="ALL">All Genders</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
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
                        <p className="text-muted" style={{ marginTop: 'var(--spacing-md)' }}>Loading residents...</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Gender</th>
                                <th>Age</th>
                                <th>Civil Status</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPersons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                                        <Users size={40} color="var(--gray-300)" style={{ marginBottom: 'var(--spacing-md)' }} />
                                        <p className="text-muted">No residents found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPersons.map(person => (
                                    <tr key={person.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: GENDER_COLORS[person.gender].bg,
                                                    color: GENDER_COLORS[person.gender].color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 600, fontSize: '0.875rem'
                                                }}>
                                                    {person.firstName[0]}{person.lastName[0]}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 500 }}>{person.firstName} {person.middleName ? person.middleName[0] + '. ' : ''}{person.lastName}</p>
                                                    {person.email && <p className="text-xs text-muted">{person.email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem', fontWeight: 500,
                                                background: GENDER_COLORS[person.gender].bg,
                                                color: GENDER_COLORS[person.gender].color
                                            }}>
                                                {person.gender}
                                            </span>
                                        </td>
                                        <td>{calculateAge(person.birthDate)} yrs</td>
                                        <td>{person.civilStatus}</td>
                                        <td>
                                            {person.contactNumber ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Phone size={14} color="var(--gray-400)" />
                                                    {person.contactNumber}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={14} color="var(--gray-400)" />
                                                {person.address.length > 30 ? person.address.substring(0, 30) + '...' : person.address}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                                <button className="btn btn-secondary" style={{ padding: '6px' }}
                                                    onClick={() => { setEditingPerson(person); setIsModalOpen(true); }}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="btn btn-secondary" style={{ padding: '6px', color: '#ef4444' }}
                                                    onClick={() => handleDelete(person.id)}>
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
                person={editingPerson}
                onClose={() => { setIsModalOpen(false); setEditingPerson(null); }}
                onSave={handleSave}
                isLoading={isSaving}
            />
        </div>
    );
}
