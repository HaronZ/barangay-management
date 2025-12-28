import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as messageService from '../services/message.service.js';
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// Get available staff for messaging
router.get('/staff', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const staff = await prisma.user.findMany({
            where: {
                role: 'STAFF',
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                person: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            },
            orderBy: {
                person: {
                    firstName: 'asc'
                }
            }
        });
        res.json({ status: 'success', data: staff });
    } catch (error) {
        next(error);
    }
});

// Get conversations
router.get('/conversations', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const conversations = await messageService.getConversations(userId);
        res.json({ status: 'success', data: conversations });
    } catch (error) {
        next(error);
    }
});

// Get messages with a specific user
router.get('/:partnerId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const { partnerId } = req.params;
        const messages = await messageService.getMessages(userId, partnerId);
        res.json({ status: 'success', data: messages });
    } catch (error) {
        next(error);
    }
});

// Send a message
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const senderId = (req as any).user.userId;
        const { receiverId, content, certificateId } = req.body;
        const message = await messageService.sendMessage(senderId, receiverId, content, certificateId);
        res.status(201).json({ status: 'success', data: message });
    } catch (error) {
        next(error);
    }
});

// Get unread count
router.get('/unread/count', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const count = await messageService.getUnreadCount(userId);
        res.json({ status: 'success', data: { count } });
    } catch (error) {
        next(error);
    }
});

export default router;
