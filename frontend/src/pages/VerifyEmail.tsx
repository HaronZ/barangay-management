import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = '/api';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>('verifying');
    const [message, setMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('no-token');
            setMessage('No verification token provided.');
            return;
        }

        verifyEmail(token);
    }, [searchParams]);

    const verifyEmail = async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Your email has been verified successfully!');
                toast.success('Email verified! You can now log in.');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to verify email. The link may be invalid or expired.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('An error occurred while verifying your email. Please try again.');
        }
    };

    const handleResendVerification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resendEmail) {
            toast.error('Please enter your email address');
            return;
        }

        setIsResending(true);

        try {
            const response = await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resendEmail }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('If your email exists and is unverified, a new verification link has been sent.');
                setResendEmail('');
            } else {
                toast.error(data.message || 'Failed to resend verification email.');
            }
        } catch (error) {
            toast.error('Failed to resend verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="auth-split-page">
            {/* Left Panel - Branding */}
            <div className="auth-split-left">
                <div className="auth-split-bg"></div>
                <div className="auth-split-content">
                    <Link to="/" className="auth-split-logo">
                        <div className="auth-split-logo-icon">
                            <Building2 size={28} />
                        </div>
                        <div>
                            <h2>Barangay</h2>
                            <span>Management System</span>
                        </div>
                    </Link>

                    <div className="auth-split-hero">
                        <h1>Email Verification</h1>
                        <p>
                            Verifying your email ensures the security of your account
                            and enables full access to all barangay services.
                        </p>
                    </div>

                    <div className="auth-split-footer">
                        <p>© {new Date().getFullYear()} Barangay Management System</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Verification Status */}
            <div className="auth-split-right">
                <div className="auth-split-form-container">
                    {status === 'verifying' && (
                        <div className="verification-status">
                            <Loader2 size={64} className="spinner" style={{ color: 'var(--primary)' }} />
                            <h2>Verifying Your Email</h2>
                            <p>Please wait while we verify your email address...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="verification-status">
                            <CheckCircle size={64} style={{ color: 'var(--success)' }} />
                            <h2>Email Verified!</h2>
                            <p>{message}</p>
                            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                                Redirecting to login page...
                            </p>
                            <Link to="/login" className="auth-submit-btn" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>
                                Go to Login
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}

                    {(status === 'error' || status === 'no-token') && (
                        <div className="verification-status">
                            <XCircle size={64} style={{ color: 'var(--danger)' }} />
                            <h2>Verification Failed</h2>
                            <p>{message}</p>

                            <div style={{ marginTop: '2rem', width: '100%' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                                    Need a new verification link?
                                </h3>
                                <form onSubmit={handleResendVerification} className="auth-modern-form">
                                    <div className="auth-input-group">
                                        <label htmlFor="resendEmail">Email Address</label>
                                        <div className="auth-input-wrapper">
                                            <Mail size={18} />
                                            <input
                                                id="resendEmail"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={resendEmail}
                                                onChange={(e) => setResendEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="auth-submit-btn"
                                        disabled={isResending}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        {isResending ? (
                                            <>
                                                <Loader2 size={18} className="spinner" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Resend Verification Email
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="auth-footer-link" style={{ marginTop: '2rem' }}>
                                <Link to="/login">Back to Login</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .verification-status {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 2rem;
                }
                
                .verification-status h2 {
                    margin: 1.5rem 0 0.5rem;
                    color: var(--text);
                }
                
                .verification-status p {
                    color: var(--text-muted);
                    max-width: 400px;
                }
                
                .spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
