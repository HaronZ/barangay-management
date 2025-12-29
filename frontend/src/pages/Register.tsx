import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Lock, User, Loader2, ArrowRight, CheckCircle, MailCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Auto-detect API URL based on environment
const getApiUrl = (): string => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
        return 'https://barangay-management-production.up.railway.app/api';
    }
    return '/api';
};
const API_URL = getApiUrl();

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            setRegisteredEmail(formData.email);
            setIsRegistered(true);
            toast.success('Registration successful! Check your email.');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            const response = await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: registeredEmail }),
            });

            if (response.ok) {
                toast.success('Verification email resent!');
            } else {
                toast.error('Failed to resend. Please try again.');
            }
        } catch {
            toast.error('Failed to resend. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const benefits = [
        'Track your certificate requests online',
        'Message barangay staff directly',
        'Book appointments conveniently',
        'Receive real-time notifications',
    ];

    // Show success screen after registration
    if (isRegistered) {
        return (
            <div className="auth-split-page">
                {/* Left Panel - Branding */}
                <div className="auth-split-left auth-split-left-register">
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
                            <h1>Almost There!</h1>
                            <p>
                                One more step to complete your registration
                                and join your community.
                            </p>
                        </div>

                        <div className="auth-split-footer">
                            <p>© {new Date().getFullYear()} Barangay Management System</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Success Message */}
                <div className="auth-split-right">
                    <div className="auth-split-form-container">
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '2rem'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <MailCheck size={40} color="white" />
                            </div>

                            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>
                                Check Your Email
                            </h2>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px' }}>
                                We've sent a verification link to <strong>{registeredEmail}</strong>.
                                Please click the link in the email to verify your account.
                            </p>

                            <div style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.5rem',
                                width: '100%',
                                maxWidth: '400px',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--text)' }}>
                                    What's Next?
                                </h4>
                                <ol style={{
                                    textAlign: 'left',
                                    color: 'var(--text-muted)',
                                    paddingLeft: '1.25rem',
                                    margin: 0,
                                    lineHeight: '1.8'
                                }}>
                                    <li>Open your email inbox</li>
                                    <li>Find the email from Barangay Management</li>
                                    <li>Click the "Verify Email" button</li>
                                    <li>Return to login page</li>
                                </ol>
                            </div>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                Didn't receive the email?
                            </p>

                            <button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="auth-submit-btn"
                                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 size={18} className="spinner" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail size={18} />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>

                            <div className="auth-footer-link" style={{ marginTop: '2rem' }}>
                                <Link to="/login">Back to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-split-page">
            {/* Left Panel - Branding */}
            <div className="auth-split-left auth-split-left-register">
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
                        <h1>Join Your Community</h1>
                        <p>
                            Create an account to access all barangay services
                            and stay connected with your community.
                        </p>
                    </div>

                    <div className="auth-split-benefits">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="auth-split-benefit">
                                <CheckCircle size={18} />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="auth-split-footer">
                        <p>© {new Date().getFullYear()} Barangay Management System</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="auth-split-right">
                <div className="auth-split-form-container">
                    <div className="auth-form-header">
                        <h2>Create Account</h2>
                        <p>Fill in your details to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-modern-form">
                        <div className="auth-input-row">
                            <div className="auth-input-group">
                                <label htmlFor="firstName">First Name</label>
                                <div className="auth-input-wrapper">
                                    <User size={18} />
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        placeholder="Juan"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="auth-input-group">
                                <label htmlFor="lastName">Last Name</label>
                                <div className="auth-input-wrapper">
                                    <User size={18} />
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        placeholder="Dela Cruz"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="auth-input-wrapper">
                                <Mail size={18} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="password">Password</label>
                            <div className="auth-input-wrapper">
                                <Lock size={18} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="At least 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                <Lock size={18} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-terms">
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">
                                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="spinner" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer-link">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
