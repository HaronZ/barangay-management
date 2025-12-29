import { useState, useEffect } from 'react';
import {
    AlertCircle, Send, Clock, CheckCircle, XCircle, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

interface Complaint {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    category: string;
    status: string;
    resolution: string | null;
    createdAt: string;
}

const statusConfig: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
    OPEN: { icon: <AlertCircle size={16} />, color: '#f59e0b', bg: '#fef3c7' },
    IN_PROGRESS: { icon: <Clock size={16} />, color: '#3b82f6', bg: '#dbeafe' },
    RESOLVED: { icon: <CheckCircle size={16} />, color: '#22c55e', bg: '#dcfce7' },
    CLOSED: { icon: <XCircle size={16} />, color: '#6b7280', bg: '#f3f4f6' },
};

const categories = ['INFRASTRUCTURE', 'SERVICE', 'SAFETY', 'SANITATION', 'OTHER'];

export default function Complaints() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: '',
        isAnonymous: false,
    });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/complaints/my-complaints`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setComplaints(data.data);
            }
        } catch {
            toast.error('Failed to load complaints');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(`Complaint submitted! Ticket: ${data.data.ticketNumber}`);
                setShowModal(false);
                setFormData({ subject: '', description: '', category: '', isAnonymous: false });
                fetchComplaints();
            } else {
                toast.error('Failed to submit complaint');
            }
        } catch {
            toast.error('Failed to submit complaint');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="complaints-page fade-in">
            <div className="page-header">
                <div>
                    <h1><AlertCircle size={28} /> Complaints & Feedback</h1>
                    <p>Submit and track your concerns</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Submit Complaint
                </button>
            </div>

            {/* Complaints List */}
            <div className="complaints-list">
                {isLoading ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
                ) : complaints.length === 0 ? (
                    <div className="complaints-empty card">
                        <AlertCircle size={64} />
                        <h3>No complaints submitted</h3>
                        <p>Have a concern? Submit a complaint and we'll look into it.</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} />
                            Submit Complaint
                        </button>
                    </div>
                ) : (
                    complaints.map((complaint) => (
                        <div key={complaint.id} className="complaint-card card">
                            <div className="complaint-header">
                                <span className="complaint-ticket">{complaint.ticketNumber}</span>
                                <span
                                    className="complaint-status"
                                    style={{
                                        backgroundColor: statusConfig[complaint.status]?.bg,
                                        color: statusConfig[complaint.status]?.color,
                                    }}
                                >
                                    {statusConfig[complaint.status]?.icon}
                                    {complaint.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h3>{complaint.subject}</h3>
                            <p className="complaint-description">{complaint.description}</p>
                            <div className="complaint-footer">
                                <span className="complaint-category">{complaint.category}</span>
                                <span className="complaint-date">
                                    <Clock size={14} />
                                    {formatDate(complaint.createdAt)}
                                </span>
                            </div>
                            {complaint.resolution && (
                                <div className="complaint-resolution">
                                    <strong>Resolution:</strong> {complaint.resolution}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Submit Complaint</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Brief description of your concern"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Details</label>
                                <textarea
                                    className="form-input"
                                    rows={5}
                                    placeholder="Provide as much detail as possible..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAnonymous}
                                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                    />
                                    Submit anonymously
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                <Send size={18} />
                                Submit Complaint
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
