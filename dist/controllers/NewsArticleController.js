"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNewsArticles = listNewsArticles;
exports.listPublicNewsArticles = listPublicNewsArticles;
exports.getNewsArticle = getNewsArticle;
exports.createNewsArticle = createNewsArticle;
exports.updateNewsArticle = updateNewsArticle;
exports.deleteNewsArticle = deleteNewsArticle;
const prisma_1 = require("../lib/prisma");
const upload_1 = require("../middleware/upload");
async function listNewsArticles(req, res) {
    try {
        const user = req.user;
        const { status, category, authorType, authorId } = req.query;
        let whereClause = {};
        if (user) {
            if (user.type === 'company') {
                whereClause.OR = [
                    { authorId: user.id },
                    { status: 'PUBLISHED' }
                ];
            }
            else if (user.type === 'municipality') {
                whereClause.OR = [
                    { authorId: user.id },
                    { status: 'PUBLISHED' }
                ];
            }
            else if (user.role === 'SUPERADMIN') {
            }
            else {
                whereClause.status = 'PUBLISHED';
            }
        }
        else {
            whereClause.status = 'PUBLISHED';
        }
        if (status) {
            whereClause.status = status;
        }
        if (category) {
            whereClause.category = category;
        }
        if (authorType) {
            whereClause.authorType = authorType;
        }
        if (authorId) {
            whereClause.authorId = authorId;
        }
        const articles = await prisma_1.prisma.newsArticle.findMany({
            where: whereClause,
            orderBy: [
                { featured: 'desc' },
                { publishedAt: 'desc' },
                { createdAt: 'desc' }
            ]
        });
        return res.json(articles);
    }
    catch (error) {
        console.error("Error listing news articles:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function listPublicNewsArticles(req, res) {
    try {
        const { category, authorType, region, priority, featured, targetAudience, tags, limit = '20', page = '1' } = req.query;
        let whereClause = {
            status: 'PUBLISHED',
            publishedAt: { not: null }
        };
        if (category) {
            whereClause.category = category;
        }
        if (authorType) {
            whereClause.authorType = authorType;
        }
        if (region) {
            whereClause.region = region;
        }
        if (priority) {
            whereClause.priority = priority;
        }
        if (featured !== undefined) {
            whereClause.featured = featured === 'true';
        }
        if (targetAudience) {
            whereClause.targetAudience = {
                has: targetAudience
            };
        }
        if (tags) {
            whereClause.tags = {
                hasSome: Array.isArray(tags) ? tags : [tags]
            };
        }
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 20;
        const skip = (pageNumber - 1) * limitNumber;
        const totalCount = await prisma_1.prisma.newsArticle.count({
            where: whereClause
        });
        const articles = await prisma_1.prisma.newsArticle.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                summary: true,
                imageUrl: true,
                videoUrl: true,
                authorName: true,
                authorType: true,
                authorLogo: true,
                priority: true,
                featured: true,
                tags: true,
                category: true,
                publishedAt: true,
                viewCount: true,
                likeCount: true,
                commentCount: true,
                targetAudience: true,
                region: true,
                createdAt: true
            },
            orderBy: [
                { featured: 'desc' },
                { publishedAt: 'desc' }
            ],
            skip,
            take: limitNumber
        });
        return res.json({
            articles,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNumber),
                hasNext: pageNumber < Math.ceil(totalCount / limitNumber),
                hasPrev: pageNumber > 1
            }
        });
    }
    catch (error) {
        console.error("Error listing public news articles:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getNewsArticle(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        const article = await prisma_1.prisma.newsArticle.findUnique({
            where: { id: id },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                },
                comments: {
                    where: { parentId: null },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true
                            }
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        avatarUrl: true
                                    }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!article) {
            return res.status(404).json({ message: "News article not found" });
        }
        if (article.status !== 'PUBLISHED' && (!user || user.id !== article.authorId)) {
            return res.status(403).json({ message: "Access denied" });
        }
        await prisma_1.prisma.newsArticle.update({
            where: { id: id },
            data: {
                viewCount: {
                    increment: 1
                }
            }
        });
        return res.json(article);
    }
    catch (error) {
        console.error("Error getting news article:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createNewsArticle(req, res) {
    try {
        console.log('=== AUTH DEBUG ===');
        console.log('User object:', JSON.stringify(req.user, null, 2));
        console.log('==================');
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!['company', 'municipality'].includes(user.type) && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Only companies, municipalities, and admins can create news articles" });
        }
        const formData = req.body || {};
        const files = req.files || {};
        console.log('=== DEBUG: News Article Creation ===');
        console.log('req.body:', JSON.stringify(req.body, null, 2));
        console.log('req.files:', JSON.stringify(req.files, null, 2));
        console.log('formData:', JSON.stringify(formData, null, 2));
        console.log('Content-Type:', req.get('Content-Type'));
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Method:', req.method);
        console.log('URL:', req.url);
        console.log('=====================================');
        const title = formData.title;
        const content = formData.content;
        const summary = formData.summary;
        const category = formData.category;
        const priority = formData.priority || 'MEDIUM';
        const status = formData.status || 'DRAFT';
        let tags = formData.tags || [];
        if (typeof tags === 'string') {
            tags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
        }
        let featured = formData.featured || false;
        if (typeof featured === 'string') {
            featured = featured === 'true';
        }
        let targetAudience = formData.targetAudience || [];
        if (typeof targetAudience === 'string') {
            targetAudience = [targetAudience];
        }
        const region = formData.region;
        const imageUrl = formData.imageUrl;
        const videoUrl = formData.videoUrl;
        const relatedLinks = formData.relatedLinks;
        let finalImageUrl = imageUrl;
        if (files['image'] && files['image'][0]) {
            finalImageUrl = (0, upload_1.getFileUrl)(files['image'][0].filename);
        }
        if (!title?.trim() || !content?.trim() || !summary?.trim() || !category?.trim()) {
            return res.status(400).json({
                message: "Title, content, summary, and category are required"
            });
        }
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
        const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({
                message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
            });
        }
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        let authorType;
        if (user.type === 'company') {
            authorType = 'COMPANY';
        }
        else if (user.type === 'municipality') {
            authorType = 'GOVERNMENT';
        }
        else {
            authorType = 'GOVERNMENT';
        }
        console.log('=== AUTHOR DEBUG ===');
        console.log('User ID:', user.id);
        console.log('User type:', user.type);
        let authorId = user.id;
        let authorName = '';
        if (user.type === 'company') {
            const company = await prisma_1.prisma.company.findUnique({
                where: { id: user.id },
                select: { name: true }
            });
            authorName = company?.name || 'Company';
            console.log('Company found:', company);
        }
        else if (user.type === 'municipality') {
            const municipality = await prisma_1.prisma.municipality.findUnique({
                where: { id: user.id },
                select: { name: true }
            });
            authorName = municipality?.name || 'Municipality';
            console.log('Municipality found:', municipality);
        }
        else {
            authorName = 'Admin';
            console.log('Admin user');
        }
        console.log('Final authorId:', authorId);
        console.log('Final authorName:', authorName);
        console.log('=====================');
        console.log('=== ARTICLE CREATION DEBUG ===');
        console.log('authorId:', authorId);
        console.log('authorName:', authorName);
        console.log('authorType:', authorType);
        console.log('================================');
        const article = await prisma_1.prisma.newsArticle.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                summary: summary.trim(),
                imageUrl: finalImageUrl,
                videoUrl,
                authorId: authorId,
                authorName,
                authorType,
                category: category.trim(),
                priority: priority,
                status: status,
                tags,
                featured,
                targetAudience,
                region,
                relatedLinks,
                publishedAt: status === 'PUBLISHED' ? new Date() : null
            }
        });
        return res.status(201).json(article);
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
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const article = await prisma_1.prisma.newsArticle.findUnique({
            where: { id: id }
        });
        if (!article) {
            return res.status(404).json({ message: "News article not found" });
        }
        if (article.authorId !== user.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied. Only the author or admin can update this article" });
        }
        const formData = req.body || {};
        const files = req.files || {};
        const title = formData.title;
        const content = formData.content;
        const summary = formData.summary;
        const category = formData.category;
        const priority = formData.priority;
        const status = formData.status;
        let tags = formData.tags;
        if (tags !== undefined && typeof tags === 'string') {
            tags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
        }
        let featured = formData.featured;
        if (featured !== undefined && typeof featured === 'string') {
            featured = featured === 'true';
        }
        let targetAudience = formData.targetAudience;
        if (targetAudience !== undefined && typeof targetAudience === 'string') {
            targetAudience = [targetAudience];
        }
        const region = formData.region;
        const imageUrl = formData.imageUrl;
        const videoUrl = formData.videoUrl;
        const relatedLinks = formData.relatedLinks;
        let finalImageUrl = imageUrl;
        if (files['image'] && files['image'][0]) {
            finalImageUrl = (0, upload_1.getFileUrl)(files['image'][0].filename);
            if (article.imageUrl && article.imageUrl.startsWith('/uploads/')) {
                const oldFilename = article.imageUrl.split('/').pop();
                if (oldFilename) {
                    (0, upload_1.deleteFile)(oldFilename);
                }
            }
        }
        if (priority) {
            const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({
                    message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
                });
            }
        }
        if (status) {
            const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title.trim();
        if (content !== undefined)
            updateData.content = content.trim();
        if (summary !== undefined)
            updateData.summary = summary.trim();
        if (finalImageUrl !== undefined)
            updateData.imageUrl = finalImageUrl;
        if (videoUrl !== undefined)
            updateData.videoUrl = videoUrl;
        if (category !== undefined)
            updateData.category = category.trim();
        if (priority !== undefined)
            updateData.priority = priority;
        if (status !== undefined)
            updateData.status = status;
        if (tags !== undefined)
            updateData.tags = tags;
        if (featured !== undefined)
            updateData.featured = featured;
        if (targetAudience !== undefined)
            updateData.targetAudience = targetAudience;
        if (region !== undefined)
            updateData.region = region;
        if (relatedLinks !== undefined)
            updateData.relatedLinks = relatedLinks;
        if (status === 'PUBLISHED' && article.status !== 'PUBLISHED') {
            updateData.publishedAt = new Date();
        }
        const updatedArticle = await prisma_1.prisma.newsArticle.update({
            where: { id: id },
            data: updateData,
            include: {
                author: {
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
        return res.json(updatedArticle);
    }
    catch (error) {
        console.error("Error updating news article:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteNewsArticle(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const article = await prisma_1.prisma.newsArticle.findUnique({
            where: { id: id }
        });
        if (!article) {
            return res.status(404).json({ message: "News article not found" });
        }
        let userProfile = await prisma_1.prisma.profile.findUnique({
            where: { userId: user.id }
        });
        if (!userProfile) {
            userProfile = await prisma_1.prisma.profile.create({
                data: {
                    userId: user.id,
                    firstName: user.type === 'company' ? 'Company' : user.type === 'municipality' ? 'Municipality' : 'Admin',
                    lastName: '',
                    email: '',
                    role: user.role || 'COMPANIES'
                }
            });
        }
        if (article.authorId !== userProfile.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied. Only the author or admin can delete this article" });
        }
        if (article.imageUrl && article.imageUrl.startsWith('/uploads/')) {
            const filename = article.imageUrl.split('/').pop();
            if (filename) {
                (0, upload_1.deleteFile)(filename);
            }
        }
        await prisma_1.prisma.newsArticle.delete({
            where: { id: id }
        });
        return res.status(204).end();
    }
    catch (error) {
        console.error("Error deleting news article:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=NewsArticleController.js.map