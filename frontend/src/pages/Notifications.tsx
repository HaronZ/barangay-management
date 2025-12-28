import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Info, AlertTriangle, MessageSquare, FileText, Calendar, Loader2 } from 'lucide-react';
import { notificationsApi } from '../services/api';
import toast from 'react-hot-toast';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationsApi.getAll();
            setNotifications(data || []);
        } catch (error: any) {
            console.error('Failed to fetch notifications:', error);
            // If no notifications exist, just show empty state
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS':
            case 'success':
                return <CheckCircle size={20} />;
            case 'WARNING':
            case 'warning':
                return <AlertTriangle size={20} />;
            case 'MESSAGE':
            case 'message':
                return <MessageSquare size={20} />;
            case 'CERTIFICATE':
            case 'certificate':
                return <FileText size={20} />;
            case 'APPOINTMENT':
            case 'appointment':
                return <Calendar size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    const getColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return '#22c55e';
            case 'warning':
                return '#f59e0b';
            case 'message':
                return '#a855f7';
            case 'error':
                return '#ef4444';
            default:
                return '#3b82f6';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        // Navigate to linked page if available
        if (notification.link) {
            // Handle old links like /messages/{id} - just go to /messages
            let link = notification.link;
            if (link.startsWith('/messages/')) {
                link = '/messages';
            }
            navigate(link);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (isLoading) {
        return (
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Loader2 size={32} className="spinner" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div>
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>
                        <Bell size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                        Notifications
                    </h1>
                    <p className="text-muted">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification(s)` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--primary-500)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {notifications.length === 0 ? (
                    <div style={{
                        padding: 'var(--spacing-2xl)',
                        textAlign: 'center',
                        color: 'var(--gray-400)'
                    }}>
                        <Bell size={48} style={{ marginBottom: 'var(--spacing-md)' }} />
                        <p>No notifications yet</p>
                        <p className="text-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                            You'll see updates about your certificates, appointments, and messages here.
                        </p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-lg)',
                                borderBottom: '1px solid var(--gray-100)',
                                background: notification.isRead ? 'white' : 'var(--primary-50)',
                                cursor: notification.isRead ? 'default' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: `${getColor(notification.type)}15`,
                                color: getColor(notification.type),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {getIcon(notification.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <p style={{
                                        fontWeight: notification.isRead ? 400 : 600,
                                        marginBottom: '4px'
                                    }}>
                                        {notification.title}
                                    </p>
                                    {!notification.isRead && (
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-500)',
                                            flexShrink: 0
                                        }} />
                                    )}
                                </div>
                                <p className="text-sm text-muted">{notification.message}</p>
                                <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
                                    {formatDate(notification.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
