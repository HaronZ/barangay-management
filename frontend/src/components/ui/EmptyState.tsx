import { FileText, Users, Calendar, MessageSquare, Search, Bell, Inbox } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
    type?: 'default' | 'search' | 'notifications' | 'messages' | 'documents' | 'users' | 'calendar';
    title?: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const illustrations = {
    default: Inbox,
    search: Search,
    notifications: Bell,
    messages: MessageSquare,
    documents: FileText,
    users: Users,
    calendar: Calendar,
};

const defaultMessages = {
    default: { title: 'No data yet', message: 'Start by adding some content.' },
    search: { title: 'No results found', message: 'Try adjusting your search or filters.' },
    notifications: { title: 'All caught up!', message: "You don't have any notifications." },
    messages: { title: 'No messages', message: 'Start a conversation with someone.' },
    documents: { title: 'No documents', message: 'Upload or create a new document.' },
    users: { title: 'No users found', message: 'Add users to get started.' },
    calendar: { title: 'No appointments', message: 'Schedule an appointment.' },
};

export default function EmptyState({
    type = 'default',
    title,
    message,
    action
}: EmptyStateProps) {
    const Icon = illustrations[type];
    const defaults = defaultMessages[type];

    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Icon size={48} />
            </div>
            <h3 className="empty-state-title">{title || defaults.title}</h3>
            <p className="empty-state-message">{message || defaults.message}</p>
            {action && (
                <button className="empty-state-action" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    );
}
