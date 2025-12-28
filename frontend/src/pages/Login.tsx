import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Loader2, ArrowRight, Shield, Clock, Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login({ email, password });
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: <Shield size={20} />, text: 'Secure & Protected' },
        { icon: <Clock size={20} />, text: 'Fast Processing' },
        { icon: <Users size={20} />, text: 'Community First' },
    ];

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
                        <h1>Welcome Back!</h1>
                        <p>
                            Access your barangay services, track your requests,
                            and stay connected with your community.
                        </p>
                    </div>

                    <div className="auth-split-features">
                        {features.map((feature, index) => (
                            <div key={index} className="auth-split-feature">
                                {feature.icon}
                                <span>{feature.text}</span>
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
                        <h2>Sign In</h2>
                        <p>Enter your credentials to access your account</p>
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

                        <div className="auth-input-group">
                            <div className="auth-label-row">
                                <label htmlFor="password">Password</label>
                                <Link to="/forgot-password" className="auth-forgot-link">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="auth-input-wrapper">
                                <Lock size={18} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="spinner" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer-link">
                        Don't have an account?{' '}
                        <Link to="/register">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
