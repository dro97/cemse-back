"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversations = getConversations;
exports.getConversationMessages = getConversationMessages;
exports.sendMessage = sendMessage;
exports.markMessageAsRead = markMessageAsRead;
exports.getMessagingStats = getMessagingStats;
exports.deleteMessage = deleteMessage;
const prisma_1 = require("../lib/prisma");
async function getConversations(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const conversations = await prisma_1.prisma.conversation.findMany({
            where: {
                participants: {
                    has: user.id
                }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            skip,
            take: Number(limit)
        });
        const formattedConversations = conversations.map(conversation => {
            const otherParticipantId = conversation.participants.find(id => id !== user.id);
            const lastMessage = conversation.messages[0];
            return {
                id: conversation.id,
                otherParticipantId,
                lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    messageType: lastMessage.messageType,
                    status: lastMessage.status,
                    createdAt: lastMessage.createdAt,
                    sender: lastMessage.sender
                } : null,
                unreadCount: conversation.unreadCount,
                updatedAt: conversation.updatedAt
            };
        });
        const otherParticipantIds = formattedConversations
            .map(conv => conv.otherParticipantId)
            .filter(Boolean);
        const participants = await prisma_1.prisma.profile.findMany({
            where: {
                userId: { in: otherParticipantIds }
            },
            select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true
            }
        });
        const conversationsWithParticipants = formattedConversations.map(conversation => {
            const participant = participants.find(p => p.userId === conversation.otherParticipantId);
            return {
                ...conversation,
                participant
            };
        });
        const total = await prisma_1.prisma.conversation.count({
            where: {
                participants: {
                    has: user.id
                }
            }
        });
        return res.json({
            conversations: conversationsWithParticipants,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("Error getting conversations:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getConversationMessages(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { contactId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        if (!contactId) {
            return res.status(400).json({ message: "Contact ID is required" });
        }
        const contact = await prisma_1.prisma.contact.findFirst({
            where: {
                OR: [
                    { userId: user.id, contactId, status: "ACCEPTED" },
                    { userId: contactId, contactId: user.id, status: "ACCEPTED" }
                ]
            }
        });
        if (!contact) {
            return res.status(403).json({ message: "You can only message your contacts" });
        }
        const participants = [user.id, contactId].sort();
        let conversation = await prisma_1.prisma.conversation.findUnique({
            where: {
                participants
            }
        });
        if (!conversation) {
            conversation = await prisma_1.prisma.conversation.create({
                data: {
                    participants
                }
            });
        }
        const messages = await prisma_1.prisma.message.findMany({
            where: {
                conversationId: conversation.id
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit)
        });
        const total = await prisma_1.prisma.message.count({
            where: {
                conversationId: conversation.id
            }
        });
        await prisma_1.prisma.message.updateMany({
            where: {
                conversationId: conversation.id,
                receiverId: user.id,
                status: { not: "READ" }
            },
            data: {
                status: "READ",
                readAt: new Date()
            }
        });
        await prisma_1.prisma.conversation.update({
            where: { id: conversation.id },
            data: { unreadCount: 0 }
        });
        return res.json({
            conversationId: conversation.id,
            messages: messages.reverse(),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("Error getting conversation messages:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function sendMessage(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { receiverId, content, messageType = "TEXT" } = req.body;
        if (!receiverId || !content) {
            return res.status(400).json({ message: "Receiver ID and content are required" });
        }
        const contact = await prisma_1.prisma.contact.findFirst({
            where: {
                OR: [
                    { userId: user.id, contactId: receiverId, status: "ACCEPTED" },
                    { userId: receiverId, contactId: user.id, status: "ACCEPTED" }
                ]
            }
        });
        if (!contact) {
            return res.status(403).json({ message: "You can only message your contacts" });
        }
        const participants = [user.id, receiverId].sort();
        let conversation = await prisma_1.prisma.conversation.findUnique({
            where: {
                participants
            }
        });
        if (!conversation) {
            conversation = await prisma_1.prisma.conversation.create({
                data: {
                    participants
                }
            });
        }
        const message = await prisma_1.prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: user.id,
                receiverId,
                content,
                messageType,
                status: "SENT"
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                }
            }
        });
        await prisma_1.prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessageContent: content,
                lastMessageTime: new Date(),
                unreadCount: {
                    increment: 1
                },
                updatedAt: new Date()
            }
        });
        return res.status(201).json({
            message: "Message sent successfully",
            data: message
        });
    }
    catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function markMessageAsRead(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { messageId } = req.params;
        if (!messageId) {
            return res.status(400).json({ message: "Message ID is required" });
        }
        const message = await prisma_1.prisma.message.findFirst({
            where: {
                id: messageId,
                receiverId: user.id
            },
            include: {
                conversation: true
            }
        });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        const updatedMessage = await prisma_1.prisma.message.update({
            where: { id: messageId },
            data: {
                status: "READ",
                readAt: new Date()
            }
        });
        await prisma_1.prisma.conversation.update({
            where: { id: message.conversationId },
            data: {
                unreadCount: {
                    decrement: 1
                }
            }
        });
        return res.json({
            message: "Message marked as read",
            data: updatedMessage
        });
    }
    catch (error) {
        console.error("Error marking message as read:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getMessagingStats(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const [totalConversations, totalMessages, unreadMessages] = await Promise.all([
            prisma_1.prisma.conversation.count({
                where: {
                    participants: {
                        has: user.id
                    }
                }
            }),
            prisma_1.prisma.message.count({
                where: {
                    OR: [
                        { senderId: user.id },
                        { receiverId: user.id }
                    ]
                }
            }),
            prisma_1.prisma.message.count({
                where: {
                    receiverId: user.id,
                    status: { not: "READ" }
                }
            })
        ]);
        return res.json({
            stats: {
                totalConversations,
                totalMessages,
                unreadMessages
            }
        });
    }
    catch (error) {
        console.error("Error getting messaging stats:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteMessage(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { messageId } = req.params;
        if (!messageId) {
            return res.status(400).json({ message: "Message ID is required" });
        }
        const message = await prisma_1.prisma.message.findFirst({
            where: {
                id: messageId,
                senderId: user.id
            }
        });
        if (!message) {
            return res.status(404).json({ message: "Message not found or you don't have permission to delete it" });
        }
        await prisma_1.prisma.message.delete({
            where: { id: messageId }
        });
        return res.json({
            message: "Message deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting message:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=MessageController.js.map