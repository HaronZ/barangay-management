import { useState, useEffect } from 'react';
import {
    MessageSquare, Send, Search, ChevronLeft, User, Clock, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';

interface StaffMember {
    id: string;
    email: string;
    person?: {
        firstName: string;
        lastName: string;
    };
}

interface Conversation {
    partnerId: string;
    partnerName: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        email: string;
        resident?: { firstName: string; lastName: string };
    };
}

export default function Messages() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/messages/conversations', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setConversations(data.data);
            }
        } catch {
            toast.error('Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (partnerId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/messages/${partnerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setMessages(data.data);
            }
        } catch {
            toast.error('Failed to load messages');
        }
    };

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
        fetchMessages(conv.partnerId);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    receiverId: selectedConversation.partnerId,
                    content: newMessage,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages([...messages, data.data]);
                setNewMessage('');
                // Refresh conversations list so new conversation appears in sidebar
                fetchConversations();
            }
        } catch {
            toast.error('Failed to send message');
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-PH', { weekday: 'short' });
        }
        return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    };

    // Debounce search term for better performance
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredConversations = conversations.filter(c =>
        c.partnerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const fetchStaffList = async () => {
        setIsLoadingStaff(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/messages/staff', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setStaffList(data.data);
            }
        } catch {
            toast.error('Failed to load staff list');
        } finally {
            setIsLoadingStaff(false);
        }
    };

    const handleOpenStaffModal = () => {
        setShowStaffModal(true);
        fetchStaffList();
    };

    const handleSelectStaff = (staff: StaffMember) => {
        const staffName = staff.person
            ? `${staff.person.firstName} ${staff.person.lastName}`
            : staff.email;

        // Check if conversation already exists
        const existingConv = conversations.find(c => c.partnerId === staff.id);
        if (existingConv) {
            handleSelectConversation(existingConv);
        } else {
            // Create a temporary conversation to start messaging
            setSelectedConversation({
                partnerId: staff.id,
                partnerName: staffName,
                lastMessage: '',
                lastMessageAt: new Date().toISOString(),
                unreadCount: 0
            });
            setMessages([]);
        }
        setShowStaffModal(false);
    };

    return (
        <div className="messages-page fade-in">
            <div className="messages-container">
                {/* Sidebar */}
                <div className={`messages-sidebar ${selectedConversation ? 'hidden-mobile' : ''}`}>
                    <div className="messages-sidebar-header">
                        <h2><MessageSquare size={24} /> Messages</h2>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            onClick={handleOpenStaffModal}
                        >
                            <Plus size={16} /> New
                        </button>
                    </div>

                    <div className="messages-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="messages-list">
                        {isLoading ? (
                            <div className="messages-empty">Loading...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="messages-empty">
                                <MessageSquare size={48} />
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <div
                                    key={conv.partnerId}
                                    className={`messages-item ${selectedConversation?.partnerId === conv.partnerId ? 'active' : ''}`}
                                    onClick={() => handleSelectConversation(conv)}
                                >
                                    <div className="messages-item-avatar">
                                        <User size={20} />
                                    </div>
                                    <div className="messages-item-content">
                                        <div className="messages-item-header">
                                            <span className="name">{conv.partnerName}</span>
                                            <span className="time">{formatTime(conv.lastMessageAt)}</span>
                                        </div>
                                        <p className="preview">{conv.lastMessage}</p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="unread-badge">{conv.unreadCount}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`messages-chat ${!selectedConversation ? 'hidden-mobile' : ''}`}>
                    {selectedConversation ? (
                        <>
                            <div className="messages-chat-header">
                                <button
                                    className="back-btn"
                                    onClick={() => setSelectedConversation(null)}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="messages-chat-avatar">
                                    <User size={20} />
                                </div>
                                <div className="messages-chat-info">
                                    <h3>{selectedConversation.partnerName}</h3>
                                </div>
                            </div>

                            <div className="messages-chat-body">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`message-bubble ${msg.sender.id === selectedConversation.partnerId ? 'received' : 'sent'}`}
                                    >
                                        <p>{msg.content}</p>
                                        <span className="message-time">
                                            <Clock size={12} />
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <form className="messages-chat-input" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" disabled={!newMessage.trim()}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="messages-chat-empty">
                            <MessageSquare size={64} />
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Staff Selection Modal */}
            {showStaffModal && (
                <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Select Staff Member</h2>
                            <button className="modal-close" onClick={() => setShowStaffModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: 'var(--spacing-md)' }}>
                            {isLoadingStaff ? (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                    Loading staff...
                                </div>
                            ) : staffList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                                    <User size={48} />
                                    <p style={{ marginTop: 'var(--spacing-md)' }}>No staff members available</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {staffList.map((staff) => (
                                        <button
                                            key={staff.id}
                                            onClick={() => handleSelectStaff(staff)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-md)',
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                width: '100%',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--primary-50)';
                                                e.currentTarget.style.borderColor = 'var(--primary-500)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                                e.currentTarget.style.borderColor = 'var(--border)';
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'var(--primary-100)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--primary-600)'
                                            }}>
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 500, color: 'var(--text)', margin: 0 }}>
                                                    {staff.person
                                                        ? `${staff.person.firstName} ${staff.person.lastName}`
                                                        : staff.email}
                                                </p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                                    Staff Member
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
