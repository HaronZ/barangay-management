import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/error.middleware.js';

// Get conversations for a user
export const getConversations = async (userId: string) => {
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId },
            ],
        },
        include: {
            sender: {
                select: { id: true, email: true, person: { select: { firstName: true, lastName: true } } },  // Changed from resident
            },
            receiver: {
                select: { id: true, email: true, person: { select: { firstName: true, lastName: true } } },  // Changed from resident
            },
            certificate: {
                select: { controlNumber: true, type: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationsMap = new Map();
    messages.forEach(msg => {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;

        if (!conversationsMap.has(partnerId)) {
            conversationsMap.set(partnerId, {
                partnerId,
                partnerName: partner.person
                    ? `${partner.person.firstName} ${partner.person.lastName}`
                    : partner.email,
                lastMessage: msg.content,
                lastMessageAt: msg.createdAt,
                unreadCount: 0,
            });
        }

        if (msg.receiverId === userId && !msg.isRead) {
            const conv = conversationsMap.get(partnerId);
            conv.unreadCount++;
        }
    });

    return Array.from(conversationsMap.values());
};

// Get messages in a conversation
export const getMessages = async (userId: string, partnerId: string) => {
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId },
            ],
        },
        include: {
            sender: {
                select: { id: true, email: true, person: { select: { firstName: true, lastName: true } } },  // Changed from resident
            },
            certificate: {
                select: { controlNumber: true, type: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
        where: {
            senderId: partnerId,
            receiverId: userId,
            isRead: false,
        },
        data: { isRead: true },
    });

    return messages;
};

// Send a message
export const sendMessage = async (
    senderId: string,
    receiverId: string,
    content: string,
    certificateId?: string
) => {
    const message = await prisma.message.create({
        data: {
            senderId,
            receiverId,
            content,
            certificateId,
        },
        include: {
            sender: {
                select: { id: true, email: true, person: { select: { firstName: true, lastName: true } } },  // Changed from resident
            },
        },
    });

    // Create notification for receiver
    await prisma.notification.create({
        data: {
            userId: receiverId,
            title: 'New Message',
            message: `You have a new message`,
            type: 'MESSAGE',
            link: `/messages`,
        },
    });

    return message;
};

// Get unread message count
export const getUnreadCount = async (userId: string) => {
    return prisma.message.count({
        where: {
            receiverId: userId,
            isRead: false,
        },
    });
};
