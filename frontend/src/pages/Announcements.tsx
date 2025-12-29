import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Megaphone, Calendar, AlertTriangle, Info, Star, Building2
} from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: string;
    category: string;
    publishedAt: string;
    author: {
        email: string;
        resident?: { firstName: string; lastName: string };
    };
}

const priorityConfig: Record<string, { icon: JSX.Element; color: string }> = {
    URGENT: { icon: <AlertTriangle size={16} />, color: '#ef4444' },
    NORMAL: { icon: <Info size={16} />, color: '#3b82f6' },
    LOW: { icon: <Star size={16} />, color: '#6b7280' },
};

const categoryColors: Record<string, string> = {
    GENERAL: '#6b7280',
    EVENT: '#8b5cf6',
    NOTICE: '#f59e0b',
    EMERGENCY: '#ef4444',
};

export default function Announcements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('/api/announcements');
            const data = await response.json();
            if (response.ok) {
                setAnnouncements(data.data);
            }
        } catch {
            console.error('Failed to load announcements');
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

    const categories = ['ALL', 'GENERAL', 'EVENT', 'NOTICE', 'EMERGENCY'];
    const filteredAnnouncements = selectedCategory === 'ALL'
        ? announcements
        : announcements.filter(a => a.category === selectedCategory);

    return (
        <div className="announcements-page">
            {/* Header */}
            <header className="announcements-header">
                <div className="announcements-header-content">
                    <Link to="/" className="announcements-logo">
                        <Building2 size={24} />
                        <span>Barangay Management System</span>
                    </Link>
                    <Link to="/login" className="announcements-login-btn">Sign In</Link>
                </div>
            </header>

            {/* Main */}
            <main className="announcements-main">
                <div className="announcements-container">
                    <div className="announcements-title-section">
                        <Megaphone size={40} />
                        <h1>Announcements</h1>
                        <p>Stay updated with the latest news and events from your barangay</p>
                    </div>

                    {/* Category Filter */}
                    <div className="announcements-filter">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Announcements List */}
                    <div className="announcements-grid">
                        {isLoading ? (
                            <div className="announcements-loading">Loading...</div>
                        ) : filteredAnnouncements.length === 0 ? (
                            <div className="announcements-empty">
                                <Megaphone size={64} />
                                <h3>No announcements yet</h3>
                                <p>Check back later for updates from your barangay.</p>
                            </div>
                        ) : (
                            filteredAnnouncements.map((announcement) => (
                                <article key={announcement.id} className="announcement-card fade-in">
                                    <div className="announcement-card-header">
                                        <span
                                            className="announcement-category"
                                            style={{ backgroundColor: categoryColors[announcement.category] }}
                                        >
                                            {announcement.category}
                                        </span>
                                        <span
                                            className="announcement-priority"
                                            style={{ color: priorityConfig[announcement.priority]?.color }}
                                        >
                                            {priorityConfig[announcement.priority]?.icon}
                                            {announcement.priority}
                                        </span>
                                    </div>
                                    <h2 className="announcement-title">{announcement.title}</h2>
                                    <p className="announcement-content">{announcement.content}</p>
                                    <div className="announcement-footer">
                                        <span className="announcement-date">
                                            <Calendar size={14} />
                                            {formatDate(announcement.publishedAt)}
                                        </span>
                                        <span className="announcement-author">
                                            Posted by {announcement.author.resident
                                                ? `${announcement.author.resident.firstName} ${announcement.author.resident.lastName}`
                                                : announcement.author.email
                                            }
                                        </span>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
