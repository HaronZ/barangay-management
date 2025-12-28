import { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    MoreVertical,
    Shield,
    Edit2,
    Trash2,
    Check,
    X,
    Loader2,
    Filter,
    Download,
    Mail,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../services/api';

type Role = 'ADMIN' | 'STAFF' | 'RESIDENT';
type UserStatus = 'active' | 'inactive';

interface UserData {
    id: string;
    email: string;
    role: Role;
    isActive: boolean;
    person?: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    lastLogin?: string;
}

const ROLE_COLORS = {
    ADMIN: { bg: '#22c55e20', color: '#22c55e', label: 'Admin' },
    STAFF: { bg: '#3b82f620', color: '#3b82f6', label: 'Staff' },
    RESIDENT: { bg: '#a855f720', color: '#a855f7', label: 'Resident' }
};

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (user: Partial<UserData> & { password: string }) => void;
}

function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'RESIDENT' as Role
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        onAdd({
            email: formData.email,
            password: formData.password,
            role: formData.role,
            isActive: true,
            person: {
                firstName: formData.firstName,
                lastName: formData.lastName
            }
        });

        setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'RESIDENT' });
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <UserPlus size={20} />
                        Add New User
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            className="form-input"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                        >
                            <option value="RESIDENT">Resident</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="spinner" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Create User
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface EditRoleModalProps {
    isOpen: boolean;
    user: UserData | null;
    onClose: () => void;
    onSave: (userId: string, role: Role) => void;
}

function EditRoleModal({ isOpen, user, onClose, onSave }: EditRoleModalProps) {
    const [role, setRole] = useState<Role>(user?.role || 'RESIDENT');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) setRole(user.role);
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onSave(user.id, role);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit User Role</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                        Change role for <strong>{user.person?.firstName} {user.person?.lastName}</strong>
                    </p>

                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            className="form-input"
                            value={role}
                            onChange={e => setRole(e.target.value as Role)}
                        >
                            <option value="RESIDENT">Resident</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className="spinner" /> : <Check size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [, setIsLoading] = useState(true);
    const [, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await usersApi.getAll(pagination.page, pagination.limit, searchTerm || undefined);
            setUsers(response.users || []);
            setPagination(prev => ({ ...prev, ...response.pagination }));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, searchTerm]);

    const filteredUsers = users.filter(user => {
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'active' ? user.isActive : !user.isActive);
        return matchesRole && matchesStatus;
    });

    const handleAddUser = async (userData: Partial<UserData> & { password: string }) => {
        setIsSaving(true);
        try {
            await usersApi.create({
                email: userData.email || '',
                password: userData.password,
                role: userData.role || 'RESIDENT',
                firstName: userData.person?.firstName,
                lastName: userData.person?.lastName
            });
            toast.success('User created successfully');
            setIsAddModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditRole = async (userId: string, role: Role) => {
        try {
            await usersApi.updateRole(userId, role);
            toast.success('Role updated successfully');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleToggleStatus = async (userId: string) => {
        try {
            await usersApi.toggleStatus(userId);
            toast.success('User status updated');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
        setDropdownOpen(null);
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await usersApi.delete(userId);
                toast.success('User deleted');
                fetchUsers();
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            }
        }
        setDropdownOpen(null);
    };

    const stats = {
        total: pagination.total,
        admins: users.filter(u => u.role === 'ADMIN').length,
        staff: users.filter(u => u.role === 'STAFF').length,
        residents: users.filter(u => u.role === 'RESIDENT').length,
        active: users.filter(u => u.isActive).length
    };

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
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                        <Shield size={28} color="#22c55e" />
                        User Management
                    </h1>
                    <p className="text-muted">Manage user accounts and assign roles</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    <UserPlus size={18} />
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Users size={24} color="var(--gray-500)" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</p>
                    <p className="text-xs text-muted">Total Users</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Shield size={24} color={ROLE_COLORS.ADMIN.color} style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.admins}</p>
                    <p className="text-xs text-muted">Admins</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Users size={24} color={ROLE_COLORS.STAFF.color} style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.staff}</p>
                    <p className="text-xs text-muted">Staff</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Users size={24} color={ROLE_COLORS.RESIDENT.color} style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.residents}</p>
                    <p className="text-xs text-muted">Residents</p>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <Check size={24} color="#22c55e" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.active}</p>
                    <p className="text-xs text-muted">Active</p>
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
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Filter size={18} color="var(--gray-400)" />
                        <select
                            className="form-input"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value as Role | 'ALL')}
                            style={{ width: 'auto' }}
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="STAFF">Staff</option>
                            <option value="RESIDENT">Resident</option>
                        </select>
                        <select
                            className="form-input"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as UserStatus | 'ALL')}
                            style={{ width: 'auto' }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Last Login</th>
                            <th style={{ width: '80px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                                    <AlertCircle size={40} color="var(--gray-300)" style={{ marginBottom: 'var(--spacing-md)' }} />
                                    <p className="text-muted">No users found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: ROLE_COLORS[user.role].bg,
                                                color: ROLE_COLORS[user.role].color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}>
                                                {user.person?.firstName?.[0]}{user.person?.lastName?.[0]}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>
                                                {user.person?.firstName} {user.person?.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Mail size={14} color="var(--gray-400)" />
                                            {user.email}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 10px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            background: ROLE_COLORS[user.role].bg,
                                            color: ROLE_COLORS[user.role].color
                                        }}>
                                            {user.role === 'ADMIN' && <Shield size={12} />}
                                            {ROLE_COLORS[user.role].label}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 10px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            background: user.isActive ? '#22c55e20' : '#ef444420',
                                            color: user.isActive ? '#22c55e' : '#ef4444'
                                        }}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="text-sm text-muted">{user.createdAt}</td>
                                    <td className="text-sm text-muted">{user.lastLogin || '—'}</td>
                                    <td>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '6px' }}
                                                onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {dropdownOpen === user.id && (
                                                <div style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: '100%',
                                                    marginTop: '4px',
                                                    background: 'white',
                                                    borderRadius: 'var(--radius-md)',
                                                    boxShadow: 'var(--shadow-lg)',
                                                    minWidth: '160px',
                                                    zIndex: 10,
                                                    overflow: 'hidden'
                                                }}>
                                                    <button
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 'var(--spacing-sm)',
                                                            width: '100%',
                                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                                            textAlign: 'left',
                                                            fontSize: '0.875rem'
                                                        }}
                                                        onClick={() => { setEditingUser(user); setDropdownOpen(null); }}
                                                    >
                                                        <Edit2 size={14} />
                                                        Edit Role
                                                    </button>
                                                    <button
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 'var(--spacing-sm)',
                                                            width: '100%',
                                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                                            textAlign: 'left',
                                                            fontSize: '0.875rem'
                                                        }}
                                                        onClick={() => handleToggleStatus(user.id)}
                                                    >
                                                        {user.isActive ? <X size={14} /> : <Check size={14} />}
                                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 'var(--spacing-sm)',
                                                            width: '100%',
                                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                                            textAlign: 'left',
                                                            fontSize: '0.875rem',
                                                            color: '#ef4444'
                                                        }}
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddUser}
            />
            <EditRoleModal
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleEditRole}
            />
        </div>
    );
}
