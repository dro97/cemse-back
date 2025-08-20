"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEntrepreneurships = listEntrepreneurships;
exports.getEntrepreneurship = getEntrepreneurship;
exports.getMyEntrepreneurships = getMyEntrepreneurships;
exports.listPublicEntrepreneurships = listPublicEntrepreneurships;
exports.createEntrepreneurship = createEntrepreneurship;
exports.updateEntrepreneurship = updateEntrepreneurship;
exports.deleteEntrepreneurship = deleteEntrepreneurship;
const prisma_1 = require("../lib/prisma");
async function listEntrepreneurships(req, res) {
    try {
        const user = req.user;
        const { category, businessStage, municipality } = req.query;
        let whereClause = { isActive: true };
        if (user) {
            if (user.type === 'user') {
                whereClause.OR = [
                    { ownerId: user.id },
                    { isPublic: true }
                ];
            }
            else {
                whereClause.isPublic = true;
            }
        }
        else {
            whereClause.isPublic = true;
        }
        if (category) {
            whereClause.category = category;
        }
        if (businessStage) {
            whereClause.businessStage = businessStage;
        }
        if (municipality) {
            whereClause.municipality = municipality;
        }
        const entrepreneurships = await prisma_1.prisma.entrepreneurship.findMany({
            where: whereClause,
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                },
                businessPlan: {
                    select: {
                        id: true,
                        isCompleted: true,
                        completionPercentage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.json(entrepreneurships);
    }
    catch (error) {
        console.error("Error listing entrepreneurships:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getEntrepreneurship(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        const entrepreneurship = await prisma_1.prisma.entrepreneurship.findUnique({
            where: { id: id },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                },
                businessPlan: {
                    select: {
                        id: true,
                        executiveSummary: true,
                        missionStatement: true,
                        visionStatement: true,
                        isCompleted: true,
                        completionPercentage: true
                    }
                }
            }
        });
        if (!entrepreneurship) {
            return res.status(404).json({ message: "Entrepreneurship not found" });
        }
        if (!entrepreneurship.isPublic && (!user || user.id !== entrepreneurship.ownerId)) {
            return res.status(403).json({ message: "Access denied" });
        }
        await prisma_1.prisma.entrepreneurship.update({
            where: { id: id },
            data: {
                viewsCount: {
                    increment: 1
                }
            }
        });
        return res.json(entrepreneurship);
    }
    catch (error) {
        console.error("Error getting entrepreneurship:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getMyEntrepreneurships(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.type !== 'user') {
            return res.status(403).json({ message: "Only users can have entrepreneurships" });
        }
        const entrepreneurships = await prisma_1.prisma.entrepreneurship.findMany({
            where: {
                ownerId: user.id,
                isActive: true
            },
            include: {
                businessPlan: {
                    select: {
                        id: true,
                        isCompleted: true,
                        completionPercentage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.json(entrepreneurships);
    }
    catch (error) {
        console.error("Error getting user entrepreneurships:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function listPublicEntrepreneurships(req, res) {
    try {
        const { category, businessStage, municipality } = req.query;
        let whereClause = {
            isActive: true,
            isPublic: true
        };
        if (category) {
            whereClause.category = category;
        }
        if (businessStage) {
            whereClause.businessStage = businessStage;
        }
        if (municipality) {
            whereClause.municipality = municipality;
        }
        const entrepreneurships = await prisma_1.prisma.entrepreneurship.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                subcategory: true,
                businessStage: true,
                municipality: true,
                department: true,
                logo: true,
                images: true,
                website: true,
                email: true,
                phone: true,
                address: true,
                founded: true,
                employees: true,
                annualRevenue: true,
                businessModel: true,
                targetMarket: true,
                viewsCount: true,
                rating: true,
                reviewsCount: true,
                createdAt: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                },
                businessPlan: {
                    select: {
                        id: true,
                        isCompleted: true,
                        completionPercentage: true
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ]
        });
        return res.json(entrepreneurships);
    }
    catch (error) {
        console.error("Error listing public entrepreneurships:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createEntrepreneurship(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.type !== 'user') {
            return res.status(403).json({ message: "Only users can create entrepreneurships" });
        }
        const { name, description, category, subcategory, businessStage, logo, images, website, email, phone, address, municipality, department = "Cochabamba", socialMedia, founded, employees, annualRevenue, businessModel, targetMarket, isPublic = true, isActive = true } = req.body;
        if (!name || !description || !category || !municipality) {
            return res.status(400).json({
                message: "Name, description, category, and municipality are required"
            });
        }
        if (businessStage && !['IDEA', 'STARTUP', 'GROWING', 'ESTABLISHED'].includes(businessStage)) {
            return res.status(400).json({
                message: "businessStage must be IDEA, STARTUP, GROWING, or ESTABLISHED"
            });
        }
        const newItem = await prisma_1.prisma.entrepreneurship.create({
            data: {
                ownerId: user.id,
                name,
                description,
                category,
                subcategory,
                businessStage: businessStage || 'IDEA',
                logo,
                images: images || [],
                website,
                email,
                phone,
                address,
                municipality,
                department,
                socialMedia: socialMedia || {},
                founded: founded ? new Date(founded) : null,
                employees: employees ? parseInt(employees) : null,
                annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
                businessModel,
                targetMarket,
                isPublic,
                isActive
            },
            include: {
                owner: {
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
        return res.status(201).json(newItem);
    }
    catch (error) {
        console.error("Error creating entrepreneurship:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateEntrepreneurship(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const entrepreneurship = await prisma_1.prisma.entrepreneurship.findUnique({
            where: { id: id }
        });
        if (!entrepreneurship) {
            return res.status(404).json({ message: "Entrepreneurship not found" });
        }
        if (entrepreneurship.ownerId !== user.id) {
            return res.status(403).json({ message: "Access denied. Only the owner can update this entrepreneurship" });
        }
        const { name, description, category, subcategory, businessStage, logo, images, website, email, phone, address, municipality, department, socialMedia, founded, employees, annualRevenue, businessModel, targetMarket, isPublic, isActive } = req.body;
        if (businessStage && !['IDEA', 'STARTUP', 'GROWING', 'ESTABLISHED'].includes(businessStage)) {
            return res.status(400).json({
                message: "businessStage must be IDEA, STARTUP, GROWING, or ESTABLISHED"
            });
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (category !== undefined)
            updateData.category = category;
        if (subcategory !== undefined)
            updateData.subcategory = subcategory;
        if (businessStage !== undefined)
            updateData.businessStage = businessStage;
        if (logo !== undefined)
            updateData.logo = logo;
        if (images !== undefined)
            updateData.images = images;
        if (website !== undefined)
            updateData.website = website;
        if (email !== undefined)
            updateData.email = email;
        if (phone !== undefined)
            updateData.phone = phone;
        if (address !== undefined)
            updateData.address = address;
        if (municipality !== undefined)
            updateData.municipality = municipality;
        if (department !== undefined)
            updateData.department = department;
        if (socialMedia !== undefined)
            updateData.socialMedia = socialMedia;
        if (founded !== undefined)
            updateData.founded = founded ? new Date(founded) : null;
        if (employees !== undefined)
            updateData.employees = employees ? parseInt(employees) : null;
        if (annualRevenue !== undefined)
            updateData.annualRevenue = annualRevenue ? parseFloat(annualRevenue) : null;
        if (businessModel !== undefined)
            updateData.businessModel = businessModel;
        if (targetMarket !== undefined)
            updateData.targetMarket = targetMarket;
        if (isPublic !== undefined)
            updateData.isPublic = isPublic;
        if (isActive !== undefined)
            updateData.active = isActive;
        const updatedItem = await prisma_1.prisma.entrepreneurship.update({
            where: { id: id },
            data: updateData,
            include: {
                owner: {
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
        return res.json(updatedItem);
    }
    catch (error) {
        console.error("Error updating entrepreneurship:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteEntrepreneurship(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const entrepreneurship = await prisma_1.prisma.entrepreneurship.findUnique({
            where: { id: id }
        });
        if (!entrepreneurship) {
            return res.status(404).json({ message: "Entrepreneurship not found" });
        }
        if (entrepreneurship.ownerId !== user.id) {
            return res.status(403).json({ message: "Access denied. Only the owner can delete this entrepreneurship" });
        }
        await prisma_1.prisma.entrepreneurship.update({
            where: { id: id },
            data: { isActive: false }
        });
        return res.status(204).end();
    }
    catch (error) {
        console.error("Error deleting entrepreneurship:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=EntrepreneurshipController.js.map