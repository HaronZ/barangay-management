import { useState, FormEvent } from 'react';
import { Search, FileText, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

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

const STATUS_CONFIG: Record<string, { icon: JSX.Element; color: string; bg: string; label: string }> = {
    PENDING: { icon: <Clock size={16} />, color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
    APPROVED: { icon: <CheckCircle size={16} />, color: '#22c55e', bg: '#dcfce7', label: 'Approved' },
    REJECTED: { icon: <XCircle size={16} />, color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
    RELEASED: { icon: <CheckCircle size={16} />, color: '#3b82f6', bg: '#dbeafe', label: 'Released' },
};

export default function DashboardTrackRequest() {
    const [controlNumber, setControlNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!controlNumber.trim()) return;

        setIsLoading(true);
        setResult(null);
        setNotFound(false);
        setHasSearched(true);

        try {
            const response = await fetch(`${API_URL}/tracking/public/${controlNumber}`);
            const data = await response.json();

            if (!response.ok) {
                setNotFound(true);
                toast.error(data.message || 'Certificate not found');
            } else {
                setResult(data.data);
                toast.success('Request found!');
            }
        } catch {
            toast.error('Failed to connect to server');
            setNotFound(true);
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

    const handleClear = () => {
        setControlNumber('');
        setResult(null);
        setNotFound(false);
        setHasSearched(false);
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                    <Search size={28} color="#22c55e" />
                    Track Request
                </h1>
                <p className="text-muted">Check the status of your certificate request using your control number</p>
            </div>

            {/* Search Card */}
            <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <label className="form-label">Control Number</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter control number (e.g., CRT-2024-0001)"
                                value={controlNumber}
                                onChange={(e) => setControlNumber(e.target.value.toUpperCase())}
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ height: '44px' }}>
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="spinner" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                Track Request
                            </>
                        )}
                    </button>
                    {hasSearched && (
                        <button type="button" className="btn btn-secondary" onClick={handleClear} style={{ height: '44px' }}>
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {/* Result Card */}
            {result && (
                <div className="card fade-in" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                                background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FileText size={24} color="var(--primary)" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{result.controlNumber}</h2>
                                <p className="text-muted text-sm">{result.type.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: 'var(--radius-full)',
                            fontSize: '0.875rem', fontWeight: 600,
                            background: STATUS_CONFIG[result.status]?.bg || 'var(--gray-100)',
                            color: STATUS_CONFIG[result.status]?.color || 'var(--gray-600)'
                        }}>
                            {STATUS_CONFIG[result.status]?.icon}
                            {STATUS_CONFIG[result.status]?.label || result.status}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        <div>
                            <p className="text-xs text-muted" style={{ marginBottom: '4px' }}>Requested By</p>
                            <p style={{ fontWeight: 500 }}>{result.resident.firstName} {result.resident.lastName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted" style={{ marginBottom: '4px' }}>Purpose</p>
                            <p style={{ fontWeight: 500 }}>{result.purpose}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted" style={{ marginBottom: '4px' }}>Date Requested</p>
                            <p style={{ fontWeight: 500 }}>{formatDate(result.requestedAt)}</p>
                        </div>
                        {result.issuedAt && (
                            <div>
                                <p className="text-xs text-muted" style={{ marginBottom: '4px' }}>Date Issued</p>
                                <p style={{ fontWeight: 500 }}>{formatDate(result.issuedAt)}</p>
                            </div>
                        )}
                    </div>

                    {result.remarks && (
                        <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                            <AlertCircle size={18} color="var(--gray-500)" style={{ marginTop: '2px' }} />
                            <div>
                                <p className="text-xs text-muted" style={{ marginBottom: '4px' }}>Remarks</p>
                                <p className="text-sm">{result.remarks}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Not Found */}
            {notFound && (
                <div className="card fade-in" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <XCircle size={64} color="var(--red-400)" style={{ marginBottom: 'var(--spacing-md)' }} />
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Request Not Found</h3>
                    <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto' }}>
                        We couldn't find a certificate request with that control number.
                        Please verify your control number and try again.
                    </p>
                </div>
            )}

            {/* Initial State */}
            {!hasSearched && (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <Search size={64} color="var(--gray-300)" style={{ marginBottom: 'var(--spacing-md)' }} />
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Enter Your Control Number</h3>
                    <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto' }}>
                        Your control number was provided when you submitted your certificate request.
                        Enter it above to check the current status.
                    </p>
                </div>
            )}
        </div>
    );
}
