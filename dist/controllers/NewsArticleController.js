"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNewsArticles = listNewsArticles;
exports.getNewsArticle = getNewsArticle;
exports.createNewsArticle = createNewsArticle;
exports.updateNewsArticle = updateNewsArticle;
exports.deleteNewsArticle = deleteNewsArticle;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
async function listNewsArticles(_req, res) {
    const items = await prisma_1.prisma.newsArticle.findMany();
    return res.json(items);
}
async function getNewsArticle(req, res) {
    const item = await prisma_1.prisma.newsArticle.findUnique({
        where: { id: req.params["id"] || "" }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createNewsArticle(req, res) {
    try {
        const user = req.user;
        console.log("User object:", user);
        const { title, content, summary, authorId, authorName, authorType, category, priority, status, tags, imageUrl, videoUrl, featured, targetAudience, region, relatedLinks, publishedAt, expiresAt } = req.body;
        console.log("Request body:", req.body);
        const requiredFields = {
            title: title?.trim(),
            content: content?.trim(),
            summary: summary?.trim(),
            authorName: authorName?.trim(),
            authorType: authorType?.trim(),
            category: category?.trim()
        };
        const missingFields = Object.entries(requiredFields)
            .filter(([_key, value]) => !value || value === '')
            .map(([key]) => key);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing or empty required fields: ${missingFields.join(', ')}`,
                debug: {
                    missingFields,
                    providedFields: requiredFields
                }
            });
        }
        const validatedTitle = requiredFields.title;
        const validatedContent = requiredFields.content;
        const validatedSummary = requiredFields.summary;
        const validatedAuthorName = requiredFields.authorName;
        const validatedCategory = requiredFields.category;
        const normalizedAuthorType = requiredFields.authorType.toUpperCase();
        const normalizedPriority = priority ? priority.toUpperCase() : 'MEDIUM';
        const normalizedStatus = status ? status.toUpperCase() : 'DRAFT';
        const validAuthorTypes = ['COMPANY', 'GOVERNMENT', 'NGO'];
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
        const validStatuses = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];
        if (!validAuthorTypes.includes(normalizedAuthorType)) {
            return res.status(400).json({
                message: `Invalid authorType. Must be one of: ${validAuthorTypes.join(', ')}`
            });
        }
        if (priority && !validPriorities.includes(normalizedPriority)) {
            return res.status(400).json({
                message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
            });
        }
        if (status && !validStatuses.includes(normalizedStatus)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        console.log("AuthorId from request:", authorId);
        console.log("User type:", user?.type);
        let finalAuthorId = null;
        let authorProfile = null;
        const existingProfile = await prisma_1.prisma.profile.findFirst({
            where: { active: true }
        });
        if (existingProfile) {
            console.log("Using existing profile as author:", existingProfile.userId);
            finalAuthorId = existingProfile.userId;
            authorProfile = existingProfile;
        }
        else {
            console.log("No profiles found, creating a default user and profile");
            try {
                const newUser = await prisma_1.prisma.user.create({
                    data: {
                        username: 'default_author',
                        password: 'default_author_password',
                        role: client_1.UserRole.SUPERADMIN,
                        isActive: true
                    }
                });
                console.log("Created default user:", newUser);
                authorProfile = await prisma_1.prisma.profile.create({
                    data: {
                        userId: newUser.id,
                        firstName: 'Default',
                        lastName: 'Author',
                        email: 'default@author.com',
                        role: client_1.UserRole.SUPERADMIN,
                        active: true
                    }
                });
                console.log("Created default author profile:", authorProfile);
                finalAuthorId = authorProfile.userId;
            }
            catch (error) {
                console.error("Error creating default author profile:", error);
                return res.status(500).json({
                    message: "Could not create default author profile",
                    debug: { error: error.message }
                });
            }
        }
        console.log("Final authorId determined:", finalAuthorId);
        console.log("Final authorId to be used:", finalAuthorId);
        if (!finalAuthorId || !authorProfile) {
            return res.status(400).json({
                message: "Could not determine valid authorId",
                debug: { userType: user?.type, userRole: user?.role, finalAuthorId }
            });
        }
        console.log("Author profile confirmed:", authorProfile);
        const newsData = {
            title: validatedTitle,
            content: validatedContent,
            summary: validatedSummary,
            authorId: finalAuthorId,
            authorName: validatedAuthorName,
            authorType: normalizedAuthorType,
            category: validatedCategory,
            status: normalizedStatus,
            priority: normalizedPriority,
            featured: featured || false,
            tags: tags || [],
            targetAudience: targetAudience || [],
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            imageUrl: imageUrl || null,
            videoUrl: videoUrl || null,
            region: region || null,
            relatedLinks: relatedLinks || null,
            publishedAt: publishedAt ? new Date(publishedAt) : null,
            expiresAt: expiresAt ? new Date(expiresAt) : null
        };
        console.log("Creating news article with data:", newsData);
        const newItem = await prisma_1.prisma.newsArticle.create({
            data: newsData
        });
        console.log("News article created successfully:", newItem);
        return res.status(201).json(newItem);
    }
    catch (error) {
        console.error("Error creating news article:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateNewsArticle(req, res) {
    const updated = await prisma_1.prisma.newsArticle.update({
        where: { id: req.params["id"] || "" },
        data: req.body
    });
    return res.json(updated);
}
async function deleteNewsArticle(req, res) {
    await prisma_1.prisma.newsArticle.delete({
        where: { id: req.params["id"] || "" }
    });
    return res.status(204).end();
}
//# sourceMappingURL=NewsArticleController.js.map