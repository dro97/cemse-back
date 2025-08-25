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
async function getUserAuthorId(user) {
    if (user.type === 'company' || user.role === 'COMPANIES') {
        const profile = await prisma_1.prisma.profile.findFirst({
            where: { companyId: user.id },
            select: { userId: true }
        });
        if (profile) {
            return profile.userId;
        }
    }
    else if (user.type === 'municipality' || user.role === 'MUNICIPAL_GOVERNMENTS') {
        const municipality = await prisma_1.prisma.municipality.findFirst({
            where: { createdBy: user.id },
            select: { id: true }
        });
        if (municipality) {
            const profile = await prisma_1.prisma.profile.findFirst({
                where: { userId: municipality.id },
                select: { userId: true }
            });
            if (profile) {
                return profile.userId;
            }
            else {
                return municipality.id;
            }
        }
    }
    return user.id;
}
async function listNewsArticles(req, res) {
    try {
        const user = req.user;
        const { status, category, authorType, authorId, municipalityId } = req.query;
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
        if (municipalityId) {
            console.log('Filtering by municipalityId:', municipalityId);
            const municipalityCompanies = await prisma_1.prisma.company.findMany({
                where: { municipalityId: municipalityId },
                select: { id: true }
            });
            const companyIds = municipalityCompanies.map(company => company.id);
            console.log('Found companies in municipality:', companyIds);
            const municipalityProfiles = await prisma_1.prisma.profile.findMany({
                where: {
                    OR: [
                        { companyId: { in: companyIds } },
                        { userId: municipalityId }
                    ]
                },
                select: { userId: true }
            });
            const profileUserIds = municipalityProfiles.map(profile => profile.userId);
            console.log('Found profile user IDs:', profileUserIds);
            if (profileUserIds.length > 0) {
                whereClause.authorId = { in: profileUserIds };
            }
            else {
                console.log('No profiles found for municipality, returning empty result');
                return res.json([]);
            }
        }
        else if (authorId) {
            whereClause.authorId = authorId;
        }
        console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));
        const articles = await prisma_1.prisma.newsArticle.findMany({
            where: whereClause,
            orderBy: [
                { featured: 'desc' },
                { publishedAt: 'desc' },
                { createdAt: 'desc' }
            ]
        });
        console.log('Found articles:', articles.length);
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
        if (article.status !== 'PUBLISHED') {
            if (!user) {
                return res.status(403).json({ message: "Access denied" });
            }
            const userAuthorId = await getUserAuthorId(user);
            if (userAuthorId !== article.authorId && user.role !== 'SUPERADMIN') {
                return res.status(403).json({ message: "Access denied" });
            }
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
        const allowedTypes = ['company', 'municipality'];
        const allowedRoles = ['SUPERADMIN', 'MUNICIPAL_GOVERNMENTS'];
        const hasValidType = user.type && allowedTypes.includes(user.type);
        const hasValidRole = user.role && allowedRoles.includes(user.role);
        if (!hasValidType && !hasValidRole) {
            return res.status(403).json({ message: "Only companies, municipalities, and admins can create news articles" });
        }
        const files = req.files || {};
        const contentType = req.get('Content-Type');
        const isJsonRequest = contentType && contentType.includes('application/json');
        console.log('=== FORM DATA DEBUG ===');
        console.log('Content-Type:', contentType);
        console.log('Is JSON request:', isJsonRequest);
        console.log('req.body keys:', Object.keys(req.body || {}));
        console.log('req.body.title:', req.body.title);
        console.log('req.body.content:', req.body.content);
        console.log('req.body.summary:', req.body.summary);
        console.log('req.body.category:', req.body.category);
        console.log('req.files:', req.files);
        console.log('========================');
        if (isJsonRequest && (!req.body || !req.body.title)) {
            return res.status(400).json({
                message: "Invalid JSON data. Required fields: title, content, summary, category",
                debug: {
                    contentType: contentType,
                    isJsonRequest: isJsonRequest,
                    bodyExists: !!req.body,
                    bodyKeys: req.body ? Object.keys(req.body) : []
                }
            });
        }
        console.log('=== DEBUG: News Article Creation ===');
        console.log('req.body:', JSON.stringify(req.body, null, 2));
        console.log('req.files:', JSON.stringify(req.files, null, 2));
        console.log('req.body:', JSON.stringify(req.body, null, 2));
        console.log('Content-Type:', req.get('Content-Type'));
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Method:', req.method);
        console.log('URL:', req.url);
        console.log('=====================================');
        const title = req.body.title;
        const content = req.body.content;
        const summary = req.body.summary;
        const category = req.body.category;
        const priority = req.body.priority || 'MEDIUM';
        const status = req.body.status || 'DRAFT';
        let tags = req.body.tags || [];
        if (typeof tags === 'string') {
            tags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
        }
        let featured = req.body.featured || false;
        if (typeof featured === 'string') {
            featured = featured === 'true';
        }
        let targetAudience = req.body.targetAudience || [];
        if (typeof targetAudience === 'string') {
            targetAudience = [targetAudience];
        }
        const region = req.body.region;
        const imageUrl = req.body.imageUrl;
        const videoUrl = req.body.videoUrl;
        const relatedLinks = req.body.relatedLinks;
        let finalImageUrl = imageUrl;
        console.log('=== IMAGE DEBUG ===');
        console.log('req.uploadedImages:', req.uploadedImages);
        console.log('req.files:', req.files);
        console.log('imageUrl from body:', imageUrl);
        console.log('finalImageUrl before processing:', finalImageUrl);
        if (req.uploadedImages && req.uploadedImages.image) {
            finalImageUrl = req.uploadedImages.image.url;
            console.log('📸 Imagen subida a MinIO:', finalImageUrl);
        }
        else {
            console.log('❌ No se encontró imagen subida en req.uploadedImages');
        }
        console.log('finalImageUrl after processing:', finalImageUrl);
        console.log('===================');
        if (!title?.trim() || !content?.trim() || !summary?.trim() || !category?.trim()) {
            return res.status(400).json({
                message: "Title, content, summary, and category are required",
                received: {
                    title: title?.trim(),
                    content: content?.trim(),
                    summary: summary?.trim(),
                    category: category?.trim()
                },
                debug: {
                    contentType: contentType,
                    isJsonRequest: isJsonRequest,
                    bodyKeys: Object.keys(req.body || {}),
                    bodyValues: {
                        title: req.body.title,
                        content: req.body.content,
                        summary: req.body.summary,
                        category: req.body.category
                    }
                }
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
        if (user.type === 'company' || user.role === 'COMPANIES') {
            authorType = 'COMPANY';
        }
        else if (user.type === 'municipality' || user.role === 'MUNICIPAL_GOVERNMENTS') {
            authorType = 'GOVERNMENT';
        }
        else {
            authorType = 'GOVERNMENT';
        }
        console.log('=== AUTHOR DEBUG ===');
        console.log('User ID:', user.id);
        console.log('User type:', user.type);
        console.log('User role:', user.role);
        console.log('Request authorId:', req.body.authorId);
        console.log('Request authorName:', req.body.authorName);
        let authorId;
        let authorName;
        if (user.type === 'company' || user.role === 'COMPANIES') {
            const company = await prisma_1.prisma.company.findUnique({
                where: { id: user.id },
                select: { id: true, name: true }
            });
            if (!company) {
                return res.status(404).json({ message: "Company not found" });
            }
            const profile = await prisma_1.prisma.profile.findFirst({
                where: { companyId: user.id },
                select: { userId: true, firstName: true, lastName: true }
            });
            if (!profile) {
                const newProfile = await prisma_1.prisma.profile.create({
                    data: {
                        userId: user.id,
                        firstName: company.name,
                        lastName: '',
                        email: user.email || '',
                        role: 'COMPANIES',
                        companyId: user.id
                    }
                });
                authorId = newProfile.userId;
                authorName = company.name;
            }
            else {
                authorId = profile.userId;
                authorName = company.name;
            }
            console.log('Company found:', company);
            console.log('Profile for company:', profile);
        }
        else if (user.type === 'municipality' || user.role === 'MUNICIPAL_GOVERNMENTS') {
            console.log('Processing municipality user');
            const profile = await prisma_1.prisma.profile.findUnique({
                where: { userId: user.id },
                select: { userId: true, firstName: true, lastName: true }
            });
            if (!profile) {
                const newProfile = await prisma_1.prisma.profile.create({
                    data: {
                        userId: user.id,
                        firstName: req.body.authorName || user.username,
                        lastName: '',
                        email: user.email || '',
                        role: 'MUNICIPAL_GOVERNMENTS'
                    }
                });
                authorId = newProfile.userId;
                authorName = req.body.authorName || user.username;
            }
            else {
                authorId = profile.userId;
                authorName = req.body.authorName || profile.firstName || user.username;
            }
            console.log('Municipality user profile found/created:', profile);
        }
        else {
            const profile = await prisma_1.prisma.profile.findUnique({
                where: { userId: user.id },
                select: { userId: true, firstName: true, lastName: true }
            });
            if (!profile) {
                const newProfile = await prisma_1.prisma.profile.create({
                    data: {
                        userId: user.id,
                        firstName: 'Admin',
                        lastName: '',
                        email: user.email || '',
                        role: 'SUPERADMIN'
                    }
                });
                authorId = newProfile.userId;
                authorName = 'Admin';
            }
            else {
                authorId = profile.userId;
                authorName = profile.firstName || 'Admin';
            }
            console.log('Admin user');
            console.log('Profile for admin:', profile);
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
        const userAuthorId = await getUserAuthorId(user);
        if (article.authorId !== userAuthorId && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied. Only the author or admin can update this article" });
        }
        const files = req.files || {};
        const title = req.body.title;
        const content = req.body.content;
        const summary = req.body.summary;
        const category = req.body.category;
        const priority = req.body.priority;
        const status = req.body.status;
        let tags = req.body.tags;
        if (tags !== undefined && typeof tags === 'string') {
            tags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
        }
        let featured = req.body.featured;
        if (featured !== undefined && typeof featured === 'string') {
            featured = featured === 'true';
        }
        let targetAudience = req.body.targetAudience;
        if (targetAudience !== undefined && typeof targetAudience === 'string') {
            targetAudience = [targetAudience];
        }
        const region = req.body.region;
        const imageUrl = req.body.imageUrl;
        const videoUrl = req.body.videoUrl;
        const relatedLinks = req.body.relatedLinks;
        let finalImageUrl = imageUrl;
        if (req.uploadedImages && req.uploadedImages.image) {
            finalImageUrl = req.uploadedImages.image.url;
            console.log('📸 Imagen actualizada en MinIO:', finalImageUrl);
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
        const userAuthorId = await getUserAuthorId(user);
        if (article.authorId !== userAuthorId && user.role !== 'SUPERADMIN') {
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