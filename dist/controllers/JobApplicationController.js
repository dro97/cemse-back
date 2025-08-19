"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobApplications = listJobApplications;
exports.getJobApplication = getJobApplication;
exports.createJobApplication = createJobApplication;
exports.updateJobApplication = updateJobApplication;
exports.deleteJobApplication = deleteJobApplication;
const prisma_1 = require("../lib/prisma");
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
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.type !== 'user') {
            return res.status(403).json({
                message: "Only regular users can create job applications"
            });
        }
        const { jobOfferId, coverLetter, cvData, profileImage } = req.body;
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
        const item = await prisma_1.prisma.jobApplication.create({
            data: {
                applicantId: user.id,
                jobOfferId: jobOfferId,
                coverLetter: coverLetter || null,
                cvData: cvData || null,
                profileImage: profileImage || null,
                status: 'SENT'
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
//# sourceMappingURL=JobApplicationController.js.map