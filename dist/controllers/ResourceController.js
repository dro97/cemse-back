"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listResources = listResources;
exports.getResource = getResource;
exports.createResource = createResource;
exports.updateResource = updateResource;
exports.deleteResource = deleteResource;
const prisma_1 = require("../lib/prisma");
async function listResources(_req, res) {
    const items = await prisma_1.prisma.resource.findMany();
    return res.json(items);
}
async function getResource(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const item = await prisma_1.prisma.resource.findUnique({ where: { id } });
    if (!item)
        return res.status(404).json({ message: "Resource not found" });
    return res.json(item);
}
async function createResource(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const allowedRoles = ['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'];
        const allowedTypes = ['user', 'municipality', 'company'];
        const hasValidRole = user.role && allowedRoles.includes(user.role);
        const hasValidType = user.type && allowedTypes.includes(user.type);
        if (!hasValidRole && !hasValidType) {
            return res.status(403).json({
                message: "Access denied. Only SuperAdmin and organizations can create resources"
            });
        }
        console.log('🔍 [DEBUG] req.body:', req.body);
        console.log('📁 [DEBUG] req.files:', req.files);
        console.log('📋 [DEBUG] (req as any).uploadedResource:', req.uploadedResource);
        const { title, description, type, category, format, author, externalUrl, tags } = req.body || {};
        const files = req.files || {};
        if (!title || !description || !type || !category || !format || !author) {
            console.log('❌ [DEBUG] Missing required fields:', { title, description, type, category, format, author });
            return res.status(400).json({
                message: "title, description, type, category, format, and author are required",
                received: { title, description, type, category, format, author }
            });
        }
        let downloadUrl = '';
        let thumbnail = '';
        let filePath = '';
        let fileSize = 0;
        if (req.uploadedResource) {
            console.log('📁 [DEBUG] Procesando (req as any).uploadedResource');
            downloadUrl = req.uploadedResource.url;
            filePath = req.uploadedResource.filename;
            fileSize = req.uploadedResource.size;
            thumbnail = downloadUrl || '';
            console.log('📁 [DEBUG] Resource URL desde uploadedResource:', downloadUrl);
        }
        else if (files['file'] && files['file'][0]) {
            console.log('⚠️ [DEBUG] Fallback a archivo local');
            const file = files['file'][0];
            downloadUrl = `/uploads/resources/${file.filename}`;
            filePath = file.path;
            fileSize = file?.size;
            thumbnail = downloadUrl || '';
        }
        else if (externalUrl) {
            downloadUrl = externalUrl;
            thumbnail = externalUrl || '';
        }
        else {
            return res.status(400).json({
                message: "Either a file or externalUrl must be provided"
            });
        }
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            }
            catch (error) {
                parsedTags = tags.split(',').map((tag) => tag.trim());
            }
        }
        const item = await prisma_1.prisma.resource.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                type: type.trim(),
                category: category.trim(),
                format: format.trim(),
                downloadUrl,
                externalUrl: externalUrl || null,
                thumbnail,
                author: author.trim(),
                publishedDate: new Date(),
                downloads: 0,
                rating: 0,
                tags: parsedTags
            }
        });
        return res.status(201).json({
            ...item,
            filePath,
            fileSize
        });
    }
    catch (error) {
        console.error("Error creating resource:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateResource(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const allowedRoles = ['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'];
        const allowedTypes = ['user', 'municipality', 'company'];
        const hasValidRole = user.role && allowedRoles.includes(user.role);
        const hasValidType = user.type && allowedTypes.includes(user.type);
        if (!hasValidRole && !hasValidType) {
            return res.status(403).json({
                message: "Access denied. Only SuperAdmin and organizations can update resources"
            });
        }
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: "Missing id" });
        const existingResource = await prisma_1.prisma.resource.findUnique({ where: { id } });
        if (!existingResource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        const { title, description, type, category, format, author, externalUrl, tags } = req.body || {};
        const files = req.files || {};
        let downloadUrl = existingResource.downloadUrl;
        let thumbnail = existingResource.thumbnail || '';
        let filePath = '';
        let fileSize = 0;
        if (req.uploadedResource) {
            console.log('📁 [DEBUG] Procesando actualización con uploadedResource');
            downloadUrl = req.uploadedResource.url;
            filePath = req.uploadedResource.filename;
            fileSize = req.uploadedResource.size;
            thumbnail = downloadUrl || '';
        }
        else if (files['file'] && files['file'][0]) {
            console.log('⚠️ [DEBUG] Fallback a archivo local para actualización');
            const file = files['file'][0];
            downloadUrl = `/uploads/resources/${file.filename}`;
            filePath = file.path;
            fileSize = file?.size;
            thumbnail = downloadUrl || '';
        }
        else if (externalUrl) {
            downloadUrl = externalUrl;
            thumbnail = externalUrl || '';
        }
        let parsedTags = existingResource.tags;
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            }
            catch (error) {
                parsedTags = tags.split(',').map((tag) => tag.trim());
            }
        }
        const updateData = {};
        if (title)
            updateData.title = title.trim();
        if (description)
            updateData.description = description.trim();
        if (type)
            updateData.type = type.trim();
        if (category)
            updateData.category = category.trim();
        if (format)
            updateData.format = format.trim();
        if (author)
            updateData.author = author.trim();
        if (downloadUrl)
            updateData.downloadUrl = downloadUrl;
        if (externalUrl !== undefined)
            updateData.externalUrl = externalUrl || null;
        if (thumbnail)
            updateData.thumbnail = thumbnail;
        if (parsedTags)
            updateData.tags = parsedTags;
        try {
            const item = await prisma_1.prisma.resource.update({
                where: { id: id || '' },
                data: updateData
            });
            return res.json({
                ...item,
                filePath,
                fileSize
            });
        }
        catch {
            return res.status(404).json({ message: "Resource not found" });
        }
    }
    catch (error) {
        console.error("Error updating resource:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteResource(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                message: "Access denied. Only SuperAdmin can delete resources"
            });
        }
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: "Missing id" });
        try {
            await prisma_1.prisma.resource.delete({ where: { id } });
            return res.status(204).end();
        }
        catch {
            return res.status(404).json({ message: "Resource not found" });
        }
    }
    catch (error) {
        console.error("Error deleting resource:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=ResourceController.js.map