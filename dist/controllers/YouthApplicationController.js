"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listYouthApplications = listYouthApplications;
exports.getYouthApplication = getYouthApplication;
exports.createYouthApplication = createYouthApplication;
exports.updateYouthApplication = updateYouthApplication;
exports.deleteYouthApplication = deleteYouthApplication;
exports.sendMessage = sendMessage;
exports.getMessages = getMessages;
exports.expressCompanyInterest = expressCompanyInterest;
exports.getCompanyInterests = getCompanyInterests;
const prisma_1 = require("../lib/prisma");
const minio_1 = require("../lib/minio");
async function listYouthApplications(req, res) {
    try {
        const { status, isPublic, youthProfileId } = req.query;
        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (isPublic !== undefined) {
            whereClause.isPublic = isPublic === 'true';
        }
        if (youthProfileId) {
            whereClause.youthProfileId = youthProfileId;
        }
        const items = await prisma_1.prisma.youthApplication.findMany({
            where: whereClause,
            include: {
                youthProfile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                        skills: true,
                        educationLevel: true,
                        currentDegree: true,
                        universityName: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
                companyInterests: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                businessSector: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.json(items);
    }
    catch (error) {
        console.error("Error listing youth applications:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getYouthApplication(req, res) {
    try {
        const { id } = req.params;
        const item = await prisma_1.prisma.youthApplication.findUnique({
            where: { id },
            include: {
                youthProfile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                        skills: true,
                        educationLevel: true,
                        currentDegree: true,
                        universityName: true,
                        workExperience: true,
                        languages: true,
                        projects: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                companyInterests: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                businessSector: true,
                                email: true,
                                website: true
                            }
                        }
                    }
                }
            }
        });
        if (!item) {
            return res.status(404).json({ message: "Youth application not found" });
        }
        await prisma_1.prisma.youthApplication.update({
            where: { id },
            data: {
                viewsCount: {
                    increment: 1
                }
            }
        });
        return res.json(item);
    }
    catch (error) {
        console.error("Error getting youth application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createYouthApplication(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.type !== 'user') {
            return res.status(403).json({
                message: "Only regular users can create youth applications"
            });
        }
        const title = req.body?.title;
        const description = req.body?.description;
        const youthProfileId = req.body?.youthProfileId;
        const cvUrl = req.body?.cvUrl;
        const coverLetterUrl = req.body?.coverLetterUrl;
        const isPublic = req.body?.isPublic || 'true';
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers['content-type']);
        console.log('Request files:', req.files);
        console.log('Received data:', {
            title,
            description,
            youthProfileId,
            isPublic,
            bodyKeys: Object.keys(req.body || {}),
            filesKeys: req.files ? Object.keys(req.files) : 'No files'
        });
        if (!title || !description || !youthProfileId) {
            console.log('Validation failed:', { title, description, youthProfileId });
            console.log('Full request body for debugging:', JSON.stringify(req.body, null, 2));
            return res.status(400).json({
                message: "Title, description, and youthProfileId are required",
                received: { title, description, youthProfileId },
                debug: {
                    bodyKeys: Object.keys(req.body || {}),
                    contentType: req.headers['content-type'],
                    hasFiles: !!req.files
                }
            });
        }
        console.log('Looking for profile with userId:', youthProfileId);
        console.log('Authenticated user id:', user.id);
        const youthProfile = await prisma_1.prisma.profile.findUnique({
            where: { userId: youthProfileId }
        });
        console.log('Found profile:', youthProfile ? 'Yes' : 'No');
        if (!youthProfile) {
            return res.status(404).json({
                message: "Youth profile not found",
                searchedUserId: youthProfileId,
                authenticatedUserId: user.id
            });
        }
        if (youthProfile.userId !== user.id) {
            return res.status(403).json({
                message: "You can only create applications for your own profile",
                profileUserId: youthProfile.userId,
                authenticatedUserId: user.id
            });
        }
        console.log('Files received:', req.files);
        console.log('Files type:', typeof req.files);
        console.log('Files keys:', req.files ? Object.keys(req.files) : 'No files');
        let cvFile = null;
        let coverLetterFile = null;
        if (req.files) {
            cvFile = req.files?.cvFile?.[0] || null;
            coverLetterFile = req.files?.coverLetterFile?.[0] || null;
        }
        console.log('Found files:', {
            cvFile: cvFile ? cvFile.originalname : 'Not found',
            coverLetterFile: coverLetterFile ? coverLetterFile.originalname : 'Not found'
        });
        let finalCvUrl = null;
        let finalCoverLetterUrl = null;
        if (cvFile) {
            const fileName = `cv_${user.id}_${Date.now()}.${cvFile.originalname.split('.').pop()}`;
            finalCvUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.DOCUMENTS, fileName, cvFile.buffer, cvFile.mimetype);
        }
        else if (cvUrl) {
            finalCvUrl = cvUrl;
        }
        if (coverLetterFile) {
            const fileName = `cover_${user.id}_${Date.now()}.${coverLetterFile.originalname.split('.').pop()}`;
            finalCoverLetterUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.DOCUMENTS, fileName, coverLetterFile.buffer, coverLetterFile.mimetype);
        }
        else if (coverLetterUrl) {
            finalCoverLetterUrl = coverLetterUrl;
        }
        const item = await prisma_1.prisma.youthApplication.create({
            data: {
                title,
                description,
                youthProfileId,
                cvFile: finalCvUrl,
                coverLetterFile: finalCoverLetterUrl,
                cvUrl: finalCvUrl,
                coverLetterUrl: finalCoverLetterUrl,
                isPublic: isPublic === 'true'
            },
            include: {
                youthProfile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                }
            }
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("Error creating youth application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateYouthApplication(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { title, description, status, isPublic, cvUrl, coverLetterUrl } = req.body;
        const existingApplication = await prisma_1.prisma.youthApplication.findUnique({
            where: { id },
            include: {
                youthProfile: true
            }
        });
        if (!existingApplication) {
            return res.status(404).json({ message: "Youth application not found" });
        }
        if (existingApplication.youthProfile.userId !== user.id) {
            return res.status(403).json({ message: "You can only update your own applications" });
        }
        const item = await prisma_1.prisma.youthApplication.update({
            where: { id },
            data: {
                title,
                description,
                status: status,
                isPublic,
                cvUrl,
                coverLetterUrl
            },
            include: {
                youthProfile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                }
            }
        });
        return res.json(item);
    }
    catch (error) {
        console.error("Error updating youth application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteYouthApplication(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const existingApplication = await prisma_1.prisma.youthApplication.findUnique({
            where: { id },
            include: {
                youthProfile: true
            }
        });
        if (!existingApplication) {
            return res.status(404).json({ message: "Youth application not found" });
        }
        if (existingApplication.youthProfile.userId !== user.id) {
            return res.status(403).json({ message: "You can only delete your own applications" });
        }
        await prisma_1.prisma.youthApplication.delete({
            where: { id }
        });
        return res.json({ message: "Youth application deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting youth application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function sendMessage(req, res) {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!content) {
            return res.status(400).json({ message: "Message content is required" });
        }
        const application = await prisma_1.prisma.youthApplication.findUnique({
            where: { id }
        });
        if (!application) {
            return res.status(404).json({ message: "Youth application not found" });
        }
        let senderType;
        if (user.type === 'company') {
            senderType = 'COMPANY';
        }
        else {
            senderType = 'YOUTH';
        }
        const message = await prisma_1.prisma.youthApplicationMessage.create({
            data: {
                applicationId: id,
                senderId: user.id,
                senderType,
                content
            },
            include: {
                application: {
                    include: {
                        youthProfile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });
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
async function getMessages(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const application = await prisma_1.prisma.youthApplication.findUnique({
            where: { id }
        });
        if (!application) {
            return res.status(404).json({ message: "Youth application not found" });
        }
        const messages = await prisma_1.prisma.youthApplicationMessage.findMany({
            where: { applicationId: id },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return res.json(messages);
    }
    catch (error) {
        console.error("Error getting messages:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function expressCompanyInterest(req, res) {
    try {
        const { id } = req.params;
        const { companyId, status, message } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.type !== 'company') {
            return res.status(403).json({ message: "Only companies can express interest" });
        }
        const application = await prisma_1.prisma.youthApplication.findUnique({
            where: { id }
        });
        if (!application) {
            return res.status(404).json({ message: "Youth application not found" });
        }
        const existingInterest = await prisma_1.prisma.youthApplicationCompanyInterest.findUnique({
            where: {
                applicationId_companyId: {
                    applicationId: id,
                    companyId
                }
            }
        });
        if (existingInterest) {
            const updatedInterest = await prisma_1.prisma.youthApplicationCompanyInterest.update({
                where: {
                    applicationId_companyId: {
                        applicationId: id,
                        companyId
                    }
                },
                data: {
                    status: status,
                    message
                },
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            businessSector: true
                        }
                    }
                }
            });
            return res.json(updatedInterest);
        }
        else {
            const newInterest = await prisma_1.prisma.youthApplicationCompanyInterest.create({
                data: {
                    applicationId: id,
                    companyId,
                    status: status,
                    message
                },
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            businessSector: true
                        }
                    }
                }
            });
            await prisma_1.prisma.youthApplication.update({
                where: { id },
                data: {
                    applicationsCount: {
                        increment: 1
                    }
                }
            });
            return res.status(201).json(newInterest);
        }
    }
    catch (error) {
        console.error("Error expressing company interest:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getCompanyInterests(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const application = await prisma_1.prisma.youthApplication.findUnique({
            where: { id }
        });
        if (!application) {
            return res.status(404).json({ message: "Youth application not found" });
        }
        const interests = await prisma_1.prisma.youthApplicationCompanyInterest.findMany({
            where: { applicationId: id },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        businessSector: true,
                        email: true,
                        website: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.json(interests);
    }
    catch (error) {
        console.error("Error getting company interests:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=YouthApplicationController.js.map