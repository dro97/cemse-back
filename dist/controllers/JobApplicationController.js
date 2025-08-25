"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobApplications = listJobApplications;
exports.getJobApplication = getJobApplication;
exports.createJobApplication = createJobApplication;
exports.updateJobApplication = updateJobApplication;
exports.getApplicationsByJobOffer = getApplicationsByJobOffer;
exports.testAuth = testAuth;
exports.deleteJobApplication = deleteJobApplication;
exports.checkApplicationStatus = checkApplicationStatus;
exports.updateApplicationStatus = updateApplicationStatus;
const prisma_1 = require("../lib/prisma");
const minio_1 = require("../lib/minio");
async function listJobApplications(req, res) {
    try {
        const user = req.user;
        let whereClause = {};
        if (user && user.type === 'company') {
            whereClause.jobOffer = {
                companyId: user.id
            };
        }
        if (user && user.type === 'user') {
            whereClause.applicantId = user.id;
        }
        const items = await prisma_1.prisma.jobApplication.findMany({
            where: whereClause,
            include: {
                jobOffer: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                website: true,
                                address: true
                            }
                        }
                    }
                },
                applicant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: {
                appliedAt: 'desc'
            }
        });
        return res.json({
            items,
            total: items.length
        });
    }
    catch (error) {
        console.error("Error listing job applications:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getJobApplication(req, res) {
    try {
        const item = await prisma_1.prisma.jobApplication.findUnique({
            where: { id: req.params['id'] || '' },
            include: {
                jobOffer: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                address: true
                            }
                        }
                    }
                },
                applicant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        address: true
                    }
                },
                questionAnswers: {
                    include: {
                        question: true
                    }
                }
            }
        });
        if (!item) {
            return res.status(404).json({ message: "Job application not found" });
        }
        return res.json(item);
    }
    catch (error) {
        console.error("Error getting job application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createJobApplication(req, res) {
    try {
        const user = req.user;
        console.log("Job application attempt:", {
            user: user ? { id: user.id, type: user.type, role: user.role } : null,
            headers: req.headers.authorization ? "Bearer token present" : "No Bearer token"
        });
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.type !== 'user') {
            console.log("User type check failed:", { userType: user.type, userId: user.id, userRole: user.role });
            return res.status(403).json({
                message: "Only regular users can create job applications",
                debug: { userType: user.type, userRole: user.role }
            });
        }
        const { jobOfferId, coverLetter, cvUrl, coverLetterUrl, message, questionAnswers, status } = req.body;
        let applicationStatus = 'SENT';
        if (status) {
            switch (status.toUpperCase()) {
                case 'PENDING':
                case 'SENT':
                    applicationStatus = 'SENT';
                    break;
                case 'UNDER_REVIEW':
                    applicationStatus = 'UNDER_REVIEW';
                    break;
                case 'PRE_SELECTED':
                    applicationStatus = 'PRE_SELECTED';
                    break;
                case 'REJECTED':
                    applicationStatus = 'REJECTED';
                    break;
                case 'HIRED':
                    applicationStatus = 'HIRED';
                    break;
                default:
                    applicationStatus = 'SENT';
            }
        }
        const cvFile = req.files?.cvFile?.[0];
        const coverLetterFile = req.files?.coverLetterFile?.[0];
        if (!jobOfferId) {
            return res.status(400).json({ message: "Job offer ID is required" });
        }
        const jobOffer = await prisma_1.prisma.jobOffer.findUnique({
            where: { id: jobOfferId }
        });
        if (!jobOffer) {
            return res.status(404).json({ message: "Job offer not found" });
        }
        if (!jobOffer.isActive || jobOffer.status !== 'ACTIVE') {
            return res.status(400).json({ message: "Job offer is not available for applications" });
        }
        const existingApplication = await prisma_1.prisma.jobApplication.findUnique({
            where: {
                applicantId_jobOfferId: {
                    applicantId: user.id,
                    jobOfferId: jobOfferId
                }
            }
        });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied to this job offer" });
        }
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
        const item = await prisma_1.prisma.jobApplication.create({
            data: {
                applicantId: user.id,
                jobOfferId: jobOfferId,
                coverLetter: message || coverLetter || null,
                cvFile: finalCvUrl,
                coverLetterFile: finalCoverLetterUrl,
                status: applicationStatus
            },
            include: {
                jobOffer: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                applicant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        if (questionAnswers && Array.isArray(questionAnswers) && questionAnswers.length > 0) {
            const questionAnswerData = questionAnswers.map((qa) => ({
                applicationId: item.id,
                questionId: qa.questionId,
                answer: qa.answer
            }));
            await prisma_1.prisma.jobQuestionAnswer.createMany({
                data: questionAnswerData
            });
        }
        await prisma_1.prisma.jobOffer.update({
            where: { id: jobOfferId },
            data: {
                applicationsCount: {
                    increment: 1
                }
            }
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("Error creating job application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateJobApplication(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { id } = req.params;
        const { status, notes, rating } = req.body;
        const application = await prisma_1.prisma.jobApplication.findUnique({
            where: { id: id },
            include: {
                jobOffer: true
            }
        });
        if (!application) {
            return res.status(404).json({ message: "Job application not found" });
        }
        const canUpdate = user.type === 'company' && application.jobOffer.companyId === user.id ||
            user.type === 'user' && application.applicantId === user.id ||
            user.role === 'SUPERADMIN';
        if (!canUpdate) {
            return res.status(403).json({ message: "Access denied" });
        }
        const updateData = {};
        if (user.type === 'company' || user.role === 'SUPERADMIN') {
            if (status)
                updateData.status = status;
            if (notes !== undefined)
                updateData.notes = notes;
            if (rating !== undefined)
                updateData.rating = rating;
            if (status && status !== 'SENT') {
                updateData.reviewedAt = new Date();
            }
        }
        if (user.type === 'user') {
            if (req.body.coverLetter !== undefined)
                updateData.coverLetter = req.body.coverLetter;
            if (req.body.cvUrl !== undefined)
                updateData.cvUrl = req.body.cvUrl;
        }
        const item = await prisma_1.prisma.jobApplication.update({
            where: { id: id },
            data: updateData,
            include: {
                jobOffer: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                applicant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return res.json(item);
    }
    catch (error) {
        console.error("Error updating job application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getApplicationsByJobOffer(req, res) {
    try {
        const user = req.user;
        const { jobOfferId } = req.query;
        if (!jobOfferId) {
            return res.status(400).json({ message: "Job offer ID is required" });
        }
        let whereClause = {
            jobOfferId: jobOfferId
        };
        if (user && user.type === 'company') {
            whereClause.jobOffer = {
                companyId: user.id
            };
        }
        if (user && user.type === 'user') {
            whereClause.applicantId = user.id;
        }
        const items = await prisma_1.prisma.jobApplication.findMany({
            where: whereClause,
            include: {
                jobOffer: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                applicant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                appliedAt: 'desc'
            }
        });
        return res.json(items);
    }
    catch (error) {
        console.error("Error getting applications by job offer:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function testAuth(req, res) {
    try {
        const user = req.user;
        return res.json({
            message: "Authentication test successful",
            user: user ? {
                id: user.id,
                type: user.type,
                role: user.role,
                username: user.username
            } : null,
            canCreateApplication: user && user.type === 'user'
        });
    }
    catch (error) {
        console.error("Auth test error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function deleteJobApplication(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { id } = req.params;
        const application = await prisma_1.prisma.jobApplication.findUnique({
            where: { id: id },
            include: {
                jobOffer: true
            }
        });
        if (!application) {
            return res.status(404).json({ message: "Job application not found" });
        }
        const canDelete = user.type === 'user' && application.applicantId === user.id ||
            user.role === 'SUPERADMIN';
        if (!canDelete) {
            return res.status(403).json({ message: "Access denied" });
        }
        await prisma_1.prisma.jobApplication.delete({
            where: { id: id }
        });
        await prisma_1.prisma.jobOffer.update({
            where: { id: application.jobOfferId },
            data: {
                applicationsCount: {
                    decrement: 1
                }
            }
        });
        return res.json({ message: "Job application deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting job application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function checkApplicationStatus(req, res) {
    try {
        const user = req.user;
        const { jobOfferId } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.type !== 'user') {
            return res.status(403).json({ message: "Only users can check application status" });
        }
        const jobOffer = await prisma_1.prisma.jobOffer.findUnique({
            where: { id: jobOfferId }
        });
        if (!jobOffer) {
            return res.status(404).json({ message: "Job offer not found" });
        }
        const application = await prisma_1.prisma.jobApplication.findFirst({
            where: {
                applicantId: user.id,
                jobOfferId: jobOfferId
            },
            select: {
                id: true,
                status: true,
                appliedAt: true,
                reviewedAt: true,
                notes: true,
                rating: true
            }
        });
        return res.json({
            hasApplied: !!application,
            application: application
        });
    }
    catch (error) {
        console.error("Error checking application status:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateApplicationStatus(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        const { status, decisionReason, rating } = req.body;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!status || !decisionReason) {
            return res.status(400).json({
                message: "Status and decision reason are required"
            });
        }
        const validStatuses = ['UNDER_REVIEW', 'PRE_SELECTED', 'REJECTED', 'HIRED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be one of: " + validStatuses.join(', ')
            });
        }
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }
        const application = await prisma_1.prisma.jobApplication.findUnique({
            where: { id: id },
            include: {
                jobOffer: {
                    include: {
                        company: true
                    }
                },
                applicant: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        if (!application) {
            return res.status(404).json({ message: "Job application not found" });
        }
        if (user.type !== 'company' || application.jobOffer.companyId !== user.id) {
            return res.status(403).json({ message: "Access denied. Only company owners can update application status" });
        }
        const updatedApplication = await prisma_1.prisma.jobApplication.update({
            where: { id: id },
            data: {
                status: status,
                decisionReason: decisionReason,
                rating: rating || null,
                reviewedAt: new Date()
            },
            include: {
                jobOffer: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                applicant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
        await prisma_1.prisma.jobApplicationMessage.create({
            data: {
                applicationId: id,
                senderId: user.id,
                senderType: 'COMPANY',
                content: `Tu aplicación ha sido ${getStatusMessage(status)}. Motivo: ${decisionReason}`,
                messageType: 'TEXT',
                status: 'SENT'
            }
        });
        return res.json({
            message: "Application status updated successfully",
            application: updatedApplication
        });
    }
    catch (error) {
        console.error("Error updating application status:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
function getStatusMessage(status) {
    switch (status) {
        case 'UNDER_REVIEW':
            return 'puesta en revisión';
        case 'PRE_SELECTED':
            return 'preseleccionada';
        case 'REJECTED':
            return 'rechazada';
        case 'HIRED':
            return 'aceptada';
        default:
            return 'actualizada';
    }
}
//# sourceMappingURL=JobApplicationController.js.map