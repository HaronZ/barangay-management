import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', { token, password });
            setIsSuccess(true);
            toast.success('Password reset successful!');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.';
            toast.error(message);
            setError(message);
        } finally {
            setIsLoading(false);
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
                        <h1>Create New Password</h1>
                        <p>
                            Your new password must be at least 6 characters
                            and different from your previous password.
                        </p>
                    </div>

                    <div className="auth-split-footer">
                        <p>© {new Date().getFullYear()} Barangay Management System</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="auth-split-right">
                <div className="auth-split-form-container">
                    {error && !isSuccess ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}>
                                <XCircle size={40} style={{ color: 'var(--red-500)' }} />
                            </div>
                            <h2 style={{ marginBottom: '12px' }}>Invalid Link</h2>
                            <p style={{ color: 'var(--gray-400)', marginBottom: '24px' }}>
                                {error}
                            </p>
                            <Link to="/forgot-password">
                                <button className="auth-submit-btn">
                                    Request New Reset Link
                                </button>
                            </Link>
                        </div>
                    ) : isSuccess ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(34, 197, 94, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}>
                                <CheckCircle size={40} style={{ color: 'var(--primary-500)' }} />
                            </div>
                            <h2 style={{ marginBottom: '12px' }}>Password Reset!</h2>
                            <p style={{ color: 'var(--gray-400)', marginBottom: '24px' }}>
                                Your password has been reset successfully.
                                Redirecting to login...
                            </p>
                            <Link to="/login">
                                <button className="auth-submit-btn">
                                    Go to Login
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="auth-form-header">
                                <h2>Set New Password</h2>
                                <p>Enter your new password below</p>
                            </div>

                            <form onSubmit={handleSubmit} className="auth-modern-form">
                                <div className="auth-input-group">
                                    <label htmlFor="password">New Password</label>
                                    <div className="auth-input-wrapper">
                                        <Lock size={18} />
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="auth-input-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div className="auth-input-wrapper">
                                        <Lock size={18} />
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="auth-submit-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="spinner" />
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
