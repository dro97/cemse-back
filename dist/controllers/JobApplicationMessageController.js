"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
exports.markMessageAsRead = markMessageAsRead;
exports.getUnreadCount = getUnreadCount;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
async function getMessages(req, res) {
    try {
        const user = req.user;
        const { applicationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const application = await prisma_1.prisma.jobApplication.findUnique({
            where: { id: applicationId || '' },
            include: {
                applicant: {
                    select: { userId: true }
                },
                jobOffer: {
                    select: { companyId: true }
                }
            }
        });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        const isApplicant = user.type === 'user' && application.applicant.userId === user.id;
        const isCompany = user.type === 'company' && application.jobOffer.companyId === user.id;
        const isSuperAdmin = user.role === 'SUPERADMIN';
        if (!isApplicant && !isCompany && !isSuperAdmin) {
            return res.status(403).json({ message: "Not authorized to view this application" });
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [messages, total] = await Promise.all([
            prisma_1.prisma.jobApplicationMessage.findMany({
                where: { applicationId: applicationId || '' },
                orderBy: { createdAt: 'asc' },
                skip,
                take: Number(limit),
                include: {
                    application: {
                        select: {
                            applicant: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    avatarUrl: true
                                }
                            },
                            jobOffer: {
                                select: {
                                    company: {
                                        select: {
                                            name: true,
                                            email: true,
                                            website: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma_1.prisma.jobApplicationMessage.count({
                where: { applicationId: applicationId || '' }
            })
        ]);
        return res.json({
            messages,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("Error getting messages:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function sendMessage(req, res) {
    try {
        const user = req.user;
        const { applicationId } = req.params;
        const { content, messageType = 'TEXT' } = req.body;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Message content is required" });
        }
        const application = await prisma_1.prisma.jobApplication.findUnique({
            where: { id: applicationId || '' },
            include: {
                applicant: {
                    select: { userId: true }
                },
                jobOffer: {
                    select: { companyId: true }
                }
            }
        });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        const isApplicant = user.type === 'user' && application.applicant.userId === user.id;
        const isCompany = user.type === 'company' && application.jobOffer.companyId === user.id;
        const isSuperAdmin = user.role === 'SUPERADMIN';
        if (!isApplicant && !isCompany && !isSuperAdmin) {
            return res.status(403).json({ message: "Not authorized to send messages for this application" });
        }
        const senderType = isApplicant ? client_1.SenderType.APPLICANT : client_1.SenderType.COMPANY;
        const message = await prisma_1.prisma.jobApplicationMessage.create({
            data: {
                applicationId: applicationId || '',
                senderId: user.id,
                senderType,
                content: content.trim(),
                messageType: messageType,
                status: client_1.MessageStatus.SENT
            },
            include: {
                application: {
                    select: {
                        applicant: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true
                            }
                        },
                        jobOffer: {
                            select: {
                                company: {
                                    select: {
                                        name: true,
                                        email: true,
                                        website: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const io = req.app.io;
        if (io) {
            io.to(`application_${applicationId}`).emit('new_message', message);
        }
        return res.status(201).json(message);
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
        const { applicationId, messageId } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const message = await prisma_1.prisma.jobApplicationMessage.findFirst({
            where: {
                id: messageId,
                applicationId
            },
            include: {
                application: {
                    select: {
                        applicant: {
                            select: { userId: true }
                        },
                        jobOffer: {
                            select: { companyId: true }
                        }
                    }
                }
            }
        });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        const isApplicant = user.type === 'user' && message.application?.applicant?.userId === user.id;
        const isCompany = user.type === 'company' && message.application?.jobOffer?.companyId === user.id;
        const isSuperAdmin = user.role === 'SUPERADMIN';
        if (!isApplicant && !isCompany && !isSuperAdmin) {
            return res.status(403).json({ message: "Not authorized to access this message" });
        }
        const isReceiver = (message.senderType === client_1.SenderType.COMPANY && isApplicant) ||
            (message.senderType === client_1.SenderType.APPLICANT && isCompany);
        if (!isReceiver && !isSuperAdmin) {
            return res.status(403).json({ message: "Can only mark messages as read if you are the receiver" });
        }
        const updatedMessage = await prisma_1.prisma.jobApplicationMessage.update({
            where: { id: messageId || '' },
            data: {
                status: client_1.MessageStatus.READ,
                readAt: new Date()
            }
        });
        return res.json(updatedMessage);
    }
    catch (error) {
        console.error("Error marking message as read:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getUnreadCount(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        let whereClause = {};
        if (user.type === 'user') {
            whereClause = {
                application: {
                    applicant: {
                        userId: user.id
                    }
                },
                senderType: client_1.SenderType.COMPANY,
                status: {
                    not: client_1.MessageStatus.READ
                }
            };
        }
        else if (user.type === 'company') {
            whereClause = {
                application: {
                    jobOffer: {
                        companyId: user.id
                    }
                },
                senderType: client_1.SenderType.APPLICANT,
                status: {
                    not: client_1.MessageStatus.READ
                }
            };
        }
        const unreadCount = await prisma_1.prisma.jobApplicationMessage.count({
            where: whereClause
        });
        return res.json({ unreadCount });
    }
    catch (error) {
        console.error("Error getting unread count:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=JobApplicationMessageController.js.map