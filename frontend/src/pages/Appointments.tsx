import { useState, useEffect } from 'react';
import {
    Calendar, Clock, Plus, X, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Appointment {
    id: string;
    purpose: string;
    date: string;
    timeSlot: string;
    status: string;
    notes: string | null;
}

const TIME_SLOTS = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
];

const statusConfig: Record<string, { color: string; bg: string }> = {
    PENDING: { color: '#f59e0b', bg: '#fef3c7' },
    CONFIRMED: { color: '#22c55e', bg: '#dcfce7' },
    CANCELLED: { color: '#ef4444', bg: '#fee2e2' },
    COMPLETED: { color: '#3b82f6', bg: '#dbeafe' },
};

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        purpose: '',
        date: '',
        timeSlot: '',
        notes: '',
    });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/appointments/my-appointments', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setAppointments(data.data);
            }
        } catch {
            toast.error('Failed to load appointments');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableSlots = async (date: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/appointments/slots/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setAvailableSlots(data.data);
            }
        } catch {
            setAvailableSlots(TIME_SLOTS);
        }
    };

    const handleDateChange = (date: string) => {
        setFormData({ ...formData, date, timeSlot: '' });
        fetchAvailableSlots(date);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Appointment booked successfully!');
                setShowModal(false);
                setFormData({ purpose: '', date: '', timeSlot: '', notes: '' });
                fetchAppointments();
            } else {
                toast.error('Failed to book appointment');
            }
        } catch {
            toast.error('Failed to book appointment');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <div className="appointments-page fade-in">
            <div className="page-header">
                <div>
                    <h1><Calendar size={28} /> Appointments</h1>
                    <p>Book and manage your barangay appointments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Book Appointment
                </button>
            </div>

            {/* Appointments List */}
            <div className="appointments-grid">
                {isLoading ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
                ) : appointments.length === 0 ? (
                    <div className="appointments-empty card">
                        <Calendar size={64} />
                        <h3>No appointments yet</h3>
                        <p>Book an appointment to visit the barangay office</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} />
                            Book Now
                        </button>
                    </div>
                ) : (
                    appointments.map((apt) => (
                        <div key={apt.id} className="appointment-card card">
                            <div className="appointment-card-header">
                                <span
                                    className="appointment-status"
                                    style={{
                                        backgroundColor: statusConfig[apt.status]?.bg,
                                        color: statusConfig[apt.status]?.color,
                                    }}
                                >
                                    {apt.status}
                                </span>
                            </div>
                            <h3>{apt.purpose}</h3>
                            <div className="appointment-details">
                                <span><Calendar size={16} /> {formatDate(apt.date)}</span>
                                <span><Clock size={16} /> {apt.timeSlot}</span>
                            </div>
                            {apt.notes && <p className="appointment-notes">{apt.notes}</p>}
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Book Appointment</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Purpose</label>
                                <select
                                    className="form-input"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    required
                                >
                                    <option value="">Select purpose</option>
                                    <option value="Certificate Request">Certificate Request</option>
                                    <option value="Document Submission">Document Submission</option>
                                    <option value="Consultation">Consultation</option>
                                    <option value="Complaint Follow-up">Complaint Follow-up</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    min={getMinDate()}
                                    required
                                />
                            </div>
                            {formData.date && (
                                <div className="form-group">
                                    <label className="form-label">Available Time Slots</label>
                                    <div className="time-slots">
                                        {availableSlots.length === 0 ? (
                                            <p className="text-muted">No available slots for this date</p>
                                        ) : (
                                            availableSlots.map((slot) => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    className={`time-slot ${formData.timeSlot === slot ? 'selected' : ''}`}
                                                    onClick={() => setFormData({ ...formData, timeSlot: slot })}
                                                >
                                                    <Clock size={14} />
                                                    {slot}
                                                    {formData.timeSlot === slot && <CheckCircle size={14} />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Notes (Optional)</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Any additional information..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                disabled={!formData.purpose || !formData.date || !formData.timeSlot}
                            >
                                <Calendar size={18} />
                                Book Appointment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
