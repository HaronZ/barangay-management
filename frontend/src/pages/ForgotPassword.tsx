import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSubmitted(true);
            toast.success('Check your email for the reset link!');
        } catch (error: unknown) {
            // Always show success to prevent email enumeration
            setIsSubmitted(true);
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
                        <h1>Forgot Password?</h1>
                        <p>
                            No worries! Enter your email and we'll send you
                            a link to reset your password.
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
                    {!isSubmitted ? (
                        <>
                            <div className="auth-form-header">
                                <h2>Reset Password</h2>
                                <p>Enter your email to receive a reset link</p>
                            </div>

                            <form onSubmit={handleSubmit} className="auth-modern-form">
                                <div className="auth-input-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="auth-input-wrapper">
                                        <Mail size={18} />
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
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
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
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
                            <h2 style={{ marginBottom: '12px' }}>Check Your Email</h2>
                            <p style={{ color: 'var(--gray-400)', marginBottom: '24px' }}>
                                If an account exists with <strong>{email}</strong>,
                                you'll receive a password reset link shortly.
                            </p>
                            <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                        </div>
                    )}

                    <div className="auth-footer-link" style={{ marginTop: '24px' }}>
                        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
