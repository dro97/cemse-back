"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchYouthUsers = searchYouthUsers;
exports.sendContactRequest = sendContactRequest;
exports.getReceivedContactRequests = getReceivedContactRequests;
exports.acceptContactRequest = acceptContactRequest;
exports.rejectContactRequest = rejectContactRequest;
exports.getContacts = getContacts;
exports.removeContact = removeContact;
exports.getNetworkStats = getNetworkStats;
const prisma_1 = require("../lib/prisma");
async function searchYouthUsers(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { query, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const whereClause = {
            role: "YOUTH",
            userId: { not: user.id }
        };
        if (query) {
            whereClause.OR = [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ];
        }
        const [users, total] = await Promise.all([
            prisma_1.prisma.profile.findMany({
                where: whereClause,
                select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatarUrl: true,
                    skills: true,
                    interests: true,
                    educationLevel: true,
                    currentInstitution: true,
                    department: true,
                    municipality: true,
                    createdAt: true
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.profile.count({ where: whereClause })
        ]);
        const contactStatuses = await Promise.all(users.map(async (profile) => {
            const contact = await prisma_1.prisma.contact.findFirst({
                where: {
                    OR: [
                        { userId: user.id, contactId: profile.userId },
                        { userId: profile.userId, contactId: user.id }
                    ]
                }
            });
            return {
                userId: profile.userId,
                contactStatus: contact?.status || null,
                contactId: contact?.id || null
            };
        }));
        const usersWithContactStatus = users.map((user, index) => ({
            ...user,
            contactStatus: contactStatuses[index].contactStatus,
            contactId: contactStatuses[index].contactId
        }));
        return res.json({
            users: usersWithContactStatus,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("Error searching youth users:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function sendContactRequest(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { contactId, requestMessage } = req.body;
        if (!contactId) {
            return res.status(400).json({ message: "Contact ID is required" });
        }
        const targetUser = await prisma_1.prisma.profile.findUnique({
            where: { userId: contactId },
            select: { role: true }
        });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if (targetUser.role !== "YOUTH") {
            return res.status(400).json({ message: "Can only send contact requests to youth users" });
        }
        if (user.id === contactId) {
            return res.status(400).json({ message: "Cannot send contact request to yourself" });
        }
        const existingContact = await prisma_1.prisma.contact.findFirst({
            where: {
                OR: [
                    { userId: user.id, contactId },
                    { userId: contactId, contactId: user.id }
                ]
            }
        });
        if (existingContact) {
            return res.status(400).json({
                message: "Contact request already exists",
                status: existingContact.status
            });
        }
        const contact = await prisma_1.prisma.contact.create({
            data: {
                userId: user.id,
                contactId,
                requestMessage: requestMessage || null
            },
            include: {
                contact: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                }
            }
        });
        return res.status(201).json({
            message: "Contact request sent successfully",
            contact
        });
    }
    catch (error) {
        console.error("Error sending contact request:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getReceivedContactRequests(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [requests, total] = await Promise.all([
            prisma_1.prisma.contact.findMany({
                where: {
                    contactId: user.id,
                    status: "PENDING"
                },
                include: {
                    user: {
                        select: {
                            userId: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatarUrl: true,
                            skills: true,
                            interests: true,
                            educationLevel: true,
                            currentInstitution: true,
                            department: true,
                            municipality: true
                        }
                    }
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.contact.count({
                where: {
                    contactId: user.id,
                    status: "PENDING"
                }
            })
        ]);
        return res.json({
            requests,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("Error getting received contact requests:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function acceptContactRequest(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { contactId } = req.params;
        if (!contactId) {
            return res.status(400).json({ message: "Contact ID is required" });
        }
        const contact = await prisma_1.prisma.contact.findFirst({
            where: {
                id: contactId,
                contactId: user.id,
                status: "PENDING"
            }
        });
        if (!contact) {
            return res.status(404).json({ message: "Contact request not found" });
        }
        const updatedContact = await prisma_1.prisma.contact.update({
            where: { id: contactId },
            data: { status: "ACCEPTED" },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return res.json({
            message: "Contact request accepted successfully",
            contact: updatedContact
        });
    }
    catch (error) {
        console.error("Error accepting contact request:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function rejectContactRequest(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { contactId } = req.params;
        if (!contactId) {
            return res.status(400).json({ message: "Contact ID is required" });
        }
        const contact = await prisma_1.prisma.contact.findFirst({
            where: {
                id: contactId,
                contactId: user.id,
                status: "PENDING"
            }
        });
        if (!contact) {
            return res.status(404).json({ message: "Contact request not found" });
        }
        await prisma_1.prisma.contact.update({
            where: { id: contactId },
            data: { status: "REJECTED" }
        });
        return res.json({
            message: "Contact request rejected successfully"
        });
    }
    catch (error) {
        console.error("Error rejecting contact request:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getContacts(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const sentContacts = await prisma_1.prisma.contact.findMany({
            where: {
                userId: user.id,
                status: "ACCEPTED"
            },
            include: {
                contact: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                        skills: true,
                        interests: true,
                        educationLevel: true,
                        currentInstitution: true,
                        department: true,
                        municipality: true,
                        createdAt: true
                    }
                }
            }
        });
        const receivedContacts = await prisma_1.prisma.contact.findMany({
            where: {
                contactId: user.id,
                status: "ACCEPTED"
            },
            include: {
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                        skills: true,
                        interests: true,
                        educationLevel: true,
                        currentInstitution: true,
                        department: true,
                        municipality: true,
                        createdAt: true
                    }
                }
            }
        });
        const allContacts = [
            ...sentContacts.map(c => ({ ...c.contact, connectionDate: c.createdAt })),
            ...receivedContacts.map(c => ({ ...c.user, connectionDate: c.createdAt }))
        ];
        allContacts.sort((a, b) => new Date(b.connectionDate).getTime() - new Date(a.connectionDate).getTime());
        const total = allContacts.length;
        const contacts = allContacts.slice(skip, skip + Number(limit));
        return res.json({
            contacts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("Error getting contacts:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function removeContact(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { contactId } = req.params;
        if (!contactId) {
            return res.status(400).json({ message: "Contact ID is required" });
        }
        const contact = await prisma_1.prisma.contact.findFirst({
            where: {
                OR: [
                    { userId: user.id, contactId },
                    { userId: contactId, contactId: user.id }
                ],
                status: "ACCEPTED"
            }
        });
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        await prisma_1.prisma.contact.delete({
            where: { id: contact.id }
        });
        return res.json({
            message: "Contact removed successfully"
        });
    }
    catch (error) {
        console.error("Error removing contact:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getNetworkStats(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const [contactsCount, pendingRequestsCount, sentRequestsCount] = await Promise.all([
            prisma_1.prisma.contact.count({
                where: {
                    OR: [
                        { userId: user.id, status: "ACCEPTED" },
                        { contactId: user.id, status: "ACCEPTED" }
                    ]
                }
            }),
            prisma_1.prisma.contact.count({
                where: {
                    contactId: user.id,
                    status: "PENDING"
                }
            }),
            prisma_1.prisma.contact.count({
                where: {
                    userId: user.id,
                    status: "PENDING"
                }
            })
        ]);
        return res.json({
            stats: {
                totalContacts: contactsCount,
                pendingRequests: pendingRequestsCount,
                sentRequests: sentRequestsCount
            }
        });
    }
    catch (error) {
        console.error("Error getting network stats:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=ContactController.js.map