import { Link } from 'react-router-dom';
import {
    Building2,
    FileText,
    Users,
    ClipboardList,
    Shield,
    Phone,
    Mail,
    MapPin,
    ChevronRight,
    Award,
    Clock,
    CheckCircle
} from 'lucide-react';

export default function LandingPage() {
    const services = [
        {
            icon: <FileText size={32} />,
            title: 'Barangay Clearance',
            description: 'Get your barangay clearance for employment, business permits, and other legal requirements.',
            color: 'var(--primary-500)'
        },
        {
            icon: <Shield size={32} />,
            title: 'Certificate of Indigency',
            description: 'Request certificates for medical, educational, and other assistance programs.',
            color: 'var(--blue-500)'
        },
        {
            icon: <Users size={32} />,
            title: 'Residency Certificate',
            description: 'Official proof of residence for government and private transactions.',
            color: 'var(--purple-500)'
        },
        {
            icon: <ClipboardList size={32} />,
            title: 'Blotter Reports',
            description: 'File complaints and incident reports for documentation and resolution.',
            color: 'var(--orange-500)'
        }
    ];

    const stats = [
        { value: '10,000+', label: 'Residents Served' },
        { value: '5,000+', label: 'Certificates Issued' },
        { value: '24/7', label: 'Online Access' },
        { value: '100%', label: 'Digital Records' }
    ];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-container">
                    <div className="landing-logo">
                        <div className="landing-logo-icon">
                            <Building2 size={28} />
                        </div>
                        <div>
                            <h1>Barangay</h1>
                            <span>Management System</span>
                        </div>
                    </div>
                    <div className="landing-nav-links">
                        <a href="#services">Services</a>
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                        <Link to="/login" className="btn btn-outline">Sign In</Link>
                        <Link to="/register" className="btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-bg"></div>
                <div className="landing-hero-content">
                    <div className="landing-hero-badge">
                        <Award size={16} />
                        <span>Official Barangay Portal</span>
                    </div>
                    <h1>Your Community,<br /><span>Digitally Empowered</span></h1>
                    <p>
                        Access barangay services online. Request certificates, file reports,
                        and stay connected with your community — all from the comfort of your home.
                    </p>
                    <div className="landing-hero-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Account
                            <ChevronRight size={20} />
                        </Link>
                        <a href="#services" className="btn btn-glass btn-lg">
                            View Services
                        </a>
                    </div>
                    <div className="landing-hero-features">
                        <div className="landing-hero-feature">
                            <CheckCircle size={18} />
                            <span>Fast Processing</span>
                        </div>
                        <div className="landing-hero-feature">
                            <CheckCircle size={18} />
                            <span>Secure & Private</span>
                        </div>
                        <div className="landing-hero-feature">
                            <CheckCircle size={18} />
                            <span>24/7 Available</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="landing-stats">
                <div className="landing-stats-container">
                    {stats.map((stat, index) => (
                        <div key={index} className="landing-stat">
                            <span className="landing-stat-value">{stat.value}</span>
                            <span className="landing-stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="landing-services">
                <div className="landing-section-header">
                    <span className="landing-section-tag">Our Services</span>
                    <h2>What We Offer</h2>
                    <p>Quick and easy access to essential barangay services</p>
                </div>
                <div className="landing-services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="landing-service-card">
                            <div
                                className="landing-service-icon"
                                style={{ background: `${service.color}20`, color: service.color }}
                            >
                                {service.icon}
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                            <Link to="/register" className="landing-service-link">
                                Request Now <ChevronRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="landing-about">
                <div className="landing-about-content">
                    <span className="landing-section-tag">About Us</span>
                    <h2>Serving Our Community</h2>
                    <p>
                        The Barangay Management System is designed to streamline government
                        services and bring them closer to our residents. Our goal is to make
                        every transaction faster, more transparent, and accessible to all.
                    </p>
                    <div className="landing-about-features">
                        <div className="landing-about-feature">
                            <Clock size={24} />
                            <div>
                                <h4>Quick Processing</h4>
                                <p>Get your documents processed within 24-48 hours</p>
                            </div>
                        </div>
                        <div className="landing-about-feature">
                            <Shield size={24} />
                            <div>
                                <h4>Secure Platform</h4>
                                <p>Your data is protected with enterprise-grade security</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="landing-about-image">
                    <div className="landing-about-card">
                        <Building2 size={64} />
                        <h3>Barangay Hall</h3>
                        <p>Open Monday - Friday<br />8:00 AM - 5:00 PM</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="landing-contact">
                <div className="landing-section-header">
                    <span className="landing-section-tag">Get In Touch</span>
                    <h2>Contact Us</h2>
                    <p>We're here to help with any questions or concerns</p>
                </div>
                <div className="landing-contact-grid">
                    <div className="landing-contact-card">
                        <div className="landing-contact-icon">
                            <MapPin size={24} />
                        </div>
                        <h3>Visit Us</h3>
                        <p>Barangay Hall, Main Street<br />Your City, Province 1234</p>
                    </div>
                    <div className="landing-contact-card">
                        <div className="landing-contact-icon">
                            <Phone size={24} />
                        </div>
                        <h3>Call Us</h3>
                        <p>(02) 123-4567<br />0917-123-4567</p>
                    </div>
                    <div className="landing-contact-card">
                        <div className="landing-contact-icon">
                            <Mail size={24} />
                        </div>
                        <h3>Email Us</h3>
                        <p>info@barangay.gov.ph<br />support@barangay.gov.ph</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta">
                <div className="landing-cta-content">
                    <h2>Ready to Get Started?</h2>
                    <p>Create your account today and access all barangay services online.</p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Create Your Account
                        <ChevronRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer-content">
                    <div className="landing-footer-brand">
                        <div className="landing-logo">
                            <div className="landing-logo-icon">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3>Barangay</h3>
                                <span>Management System</span>
                            </div>
                        </div>
                        <p>Empowering communities through digital innovation.</p>
                    </div>
                    <div className="landing-footer-links">
                        <h4>Quick Links</h4>
                        <a href="#services">Services</a>
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                    </div>
                    <div className="landing-footer-links">
                        <h4>Legal</h4>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Data Protection</a>
                    </div>
                </div>
                <div className="landing-footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Barangay Management System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
