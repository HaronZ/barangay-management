import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface TrackingResult {
    controlNumber: string;
    type: string;
    purpose: string;
    status: string;
    requestedAt: string;
    issuedAt: string | null;
    remarks: string | null;
    resident: {
        firstName: string;
        lastName: string;
    };
}

const statusConfig: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
    PENDING: { icon: <Clock size={20} />, color: '#f59e0b', bg: '#fef3c7' },
    APPROVED: { icon: <CheckCircle size={20} />, color: '#22c55e', bg: '#dcfce7' },
    REJECTED: { icon: <XCircle size={20} />, color: '#ef4444', bg: '#fee2e2' },
    RELEASED: { icon: <CheckCircle size={20} />, color: '#3b82f6', bg: '#dbeafe' },
};

export default function TrackRequest() {
    const { user } = useAuth();
    const [controlNumber, setControlNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [notFound, setNotFound] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!controlNumber.trim()) return;

        setIsLoading(true);
        setResult(null);
        setNotFound(false);

        try {
            const response = await fetch(`/api/tracking/public/${controlNumber}`);
            const data = await response.json();

            if (!response.ok) {
                setNotFound(true);
                toast.error(data.message || 'Certificate not found');
            } else {
                setResult(data.data);
            }
        } catch {
            toast.error('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="track-page">
            {/* Header */}
            <header className="track-header">
                <div className="track-header-content">
                    <Link to="/" className="track-logo">
                        <Building2 size={24} />
                        <span>Barangay Management System</span>
                    </Link>
                    {user ? (
                        <Link to="/dashboard" className="track-login-btn">Go to Dashboard</Link>
                    ) : (
                        <Link to="/login" className="track-login-btn">Sign In</Link>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="track-main">
                <div className="track-container">
                    <div className="track-card">
                        <div className="track-card-header">
                            <FileText size={40} className="track-icon" />
                            <h1>Track Your Request</h1>
                            <p>Enter your control number to check the status of your certificate request</p>
                        </div>

                        <form onSubmit={handleSubmit} className="track-form">
                            <div className="track-input-wrapper">
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Enter control number (e.g., CRT-2024-0001)"
                                    value={controlNumber}
                                    onChange={(e) => setControlNumber(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Searching...' : 'Track Request'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        {/* Result */}
                        {result && (
                            <div className="track-result fade-in">
                                <div className="track-result-header">
                                    <h3>Request Found</h3>
                                    <div
                                        className="track-status-badge"
                                        style={{
                                            backgroundColor: statusConfig[result.status]?.bg || '#f3f4f6',
                                            color: statusConfig[result.status]?.color || '#6b7280'
                                        }}
                                    >
                                        {statusConfig[result.status]?.icon}
                                        <span>{result.status}</span>
                                    </div>
                                </div>

                                <div className="track-result-grid">
                                    <div className="track-result-item">
                                        <span className="label">Control Number</span>
                                        <span className="value">{result.controlNumber}</span>
                                    </div>
                                    <div className="track-result-item">
                                        <span className="label">Certificate Type</span>
                                        <span className="value">{result.type.replace('_', ' ')}</span>
                                    </div>
                                    <div className="track-result-item">
                                        <span className="label">Requested By</span>
                                        <span className="value">{result.resident.firstName} {result.resident.lastName}</span>
                                    </div>
                                    <div className="track-result-item">
                                        <span className="label">Purpose</span>
                                        <span className="value">{result.purpose}</span>
                                    </div>
                                    <div className="track-result-item">
                                        <span className="label">Date Requested</span>
                                        <span className="value">{formatDate(result.requestedAt)}</span>
                                    </div>
                                    {result.issuedAt && (
                                        <div className="track-result-item">
                                            <span className="label">Date Issued</span>
                                            <span className="value">{formatDate(result.issuedAt)}</span>
                                        </div>
                                    )}
                                </div>

                                {result.remarks && (
                                    <div className="track-remarks">
                                        <AlertCircle size={16} />
                                        <span>{result.remarks}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Not Found */}
                        {notFound && (
                            <div className="track-not-found fade-in">
                                <XCircle size={48} />
                                <h3>Request Not Found</h3>
                                <p>Please verify your control number and try again.</p>
                            </div>
                        )}
                    </div>

                    <p className="track-help">
                        {user ? (
                            <>Need help? <Link to="/dashboard">Go to Dashboard</Link> or visit your barangay office.</>
                        ) : (
                            <>Need help? <Link to="/login">Sign in</Link> or visit your barangay office.</>
                        )}
                    </p>
                </div>
            </main>
        </div>
    );
}
