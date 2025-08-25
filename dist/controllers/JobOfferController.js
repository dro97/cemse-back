"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobOffers = listJobOffers;
exports.getJobOffer = getJobOffer;
exports.createJobOffer = createJobOffer;
exports.updateJobOffer = updateJobOffer;
exports.deleteJobOffer = deleteJobOffer;
const prisma_1 = require("../lib/prisma");
async function listJobOffers(req, res) {
    try {
        const { companyId, status } = req.query;
        let whereClause = {};
        if (companyId) {
            whereClause.companyId = companyId;
        }
        if (status) {
            whereClause.status = status;
        }
        const items = await prisma_1.prisma.jobOffer.findMany({
            where: whereClause,
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        website: true,
                        email: true,
                        phone: true,
                        address: true,
                        businessSector: true,
                        companySize: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(items);
    }
    catch (error) {
        console.error("Error listing job offers:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getJobOffer(req, res) {
    try {
        const user = req.user;
        const { includeApplications } = req.query;
        let includeClause = {
            company: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    website: true,
                    email: true,
                    phone: true,
                    address: true,
                    businessSector: true,
                    companySize: true
                }
            }
        };
        if (includeApplications === 'true' && user) {
            if (user.type === 'company') {
                includeClause.applications = {
                    include: {
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
                };
            }
            else if (user.role === 'SUPERADMIN') {
                includeClause.applications = {
                    include: {
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
                };
            }
        }
        const item = await prisma_1.prisma.jobOffer.findUnique({
            where: { id: req.params["id"] || "" },
            include: includeClause
        });
        if (!item) {
            return res.status(404).json({ message: "Job offer not found" });
        }
        if (user && user.type === 'company' && item.companyId !== user.id) {
            return res.status(403).json({ message: "Access denied" });
        }
        return res.json(item);
    }
    catch (error) {
        console.error("Error getting job offer:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createJobOffer(req, res) {
    console.log('🚀 === INICIO DE CREACIÓN DE JOB OFFER ===');
    console.log('📋 Headers recibidos:', req.headers['content-type']);
    console.log('📦 Datos del body recibidos:', JSON.stringify(req.body, null, 2));
    console.log('📁 Archivos subidos a MinIO:', req.uploadedJobImages ? 'SÍ' : 'NO');
    const { title, description, requirements, salaryMin, salaryMax, location, latitude, longitude, contractType, workSchedule, workModality, experienceLevel, companyId, municipality, department, educationRequired, skillsRequired, desiredSkills, applicationDeadline, benefits } = req.body;
    if (!title || !description || !requirements || !location || !contractType || !workSchedule || !workModality || !experienceLevel || !companyId || !municipality) {
        return res.status(400).json({
            message: "title, description, requirements, location, contractType, workSchedule, workModality, experienceLevel, companyId, and municipality are required"
        });
    }
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId }
    });
    if (!company || !company.isActive) {
        return res.status(400).json({ message: "Invalid or inactive company" });
    }
    let imageUrls = [];
    let logoUrl = null;
    console.log('📸 === LOGS DE PROCESAMIENTO DE IMÁGENES MINIO ===');
    console.log('🔍 Verificando si hay archivos en req.uploadedJobImages:', !!req.uploadedJobImages);
    if (req.uploadedJobImages) {
        console.log('📁 Archivos recibidos en req.uploadedJobImages:', Object.keys(req.uploadedJobImages));
        console.log('📋 Contenido completo de req.uploadedJobImages:', JSON.stringify(req.uploadedJobImages, null, 2));
        if (req.uploadedJobImages.images) {
            console.log('🖼️ Imágenes encontradas:', req.uploadedJobImages.images.length);
            console.log('📝 Detalles de las imágenes:');
            req.uploadedJobImages.images.forEach((image, index) => {
                console.log(`   Imagen ${index + 1}:`);
                console.log(`     - Nombre original: ${image.originalName}`);
                console.log(`     - Nombre guardado: ${image.filename}`);
                console.log(`     - Tamaño: ${image.size} bytes`);
                console.log(`     - Tipo MIME: ${image.mimetype}`);
                console.log(`     - URL MinIO: ${image.url}`);
            });
            imageUrls = req.uploadedJobImages.images.map((image) => image.url);
            console.log('🔗 URLs de imágenes de MinIO:', imageUrls);
        }
        else {
            console.log('❌ No se encontraron imágenes en req.uploadedJobImages.images');
        }
        if (req.uploadedJobImages.logo) {
            const logo = req.uploadedJobImages.logo;
            console.log('🏢 Logo encontrado:');
            console.log(`   - Nombre original: ${logo.originalName}`);
            console.log(`   - Nombre guardado: ${logo.filename}`);
            console.log(`   - Tamaño: ${logo.size} bytes`);
            console.log(`   - Tipo MIME: ${logo.mimetype}`);
            console.log(`   - URL MinIO: ${logo.url}`);
            logoUrl = logo.url;
            console.log('🔗 URL del logo de MinIO:', logoUrl);
        }
        else {
            console.log('❌ No se encontró logo en req.uploadedJobImages.logo');
        }
    }
    else {
        console.log('❌ No se encontraron archivos en req.uploadedJobImages');
    }
    console.log('📊 Resumen final:');
    console.log(`   - Número de imágenes: ${imageUrls.length}`);
    console.log(`   - URLs de imágenes: ${JSON.stringify(imageUrls)}`);
    console.log(`   - URL del logo: ${logoUrl}`);
    console.log('📸 === FIN DE LOGS DE IMÁGENES MINIO ===');
    const skillsRequiredArray = skillsRequired ? (typeof skillsRequired === 'string' ? JSON.parse(skillsRequired) : skillsRequired) : [];
    const desiredSkillsArray = desiredSkills ? (typeof desiredSkills === 'string' ? JSON.parse(desiredSkills) : desiredSkills) : [];
    const newItem = await prisma_1.prisma.jobOffer.create({
        data: {
            title,
            description,
            requirements,
            salaryMin: salaryMin ? parseFloat(salaryMin) : null,
            salaryMax: salaryMax ? parseFloat(salaryMax) : null,
            location,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            images: imageUrls,
            logo: logoUrl,
            contractType,
            workSchedule,
            workModality,
            experienceLevel,
            companyId,
            municipality,
            department: department || "Cochabamba",
            educationRequired: educationRequired || null,
            skillsRequired: skillsRequiredArray,
            desiredSkills: desiredSkillsArray,
            applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
            benefits: benefits || null,
            isActive: true
        }
    });
    console.log('✅ === JOB OFFER CREADO EXITOSAMENTE ===');
    console.log('🆔 ID del JobOffer creado:', newItem.id);
    console.log('📸 Imágenes guardadas:', newItem.images);
    console.log('🏢 Logo guardado:', newItem.logo);
    console.log('📊 Datos completos del JobOffer creado:', JSON.stringify(newItem, null, 2));
    console.log('🚀 === FIN DE CREACIÓN DE JOB OFFER ===');
    return res.status(201).json(newItem);
}
async function updateJobOffer(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing job offer ID" });
        }
        const existingJobOffer = await prisma_1.prisma.jobOffer.findUnique({
            where: { id }
        });
        if (!existingJobOffer) {
            return res.status(404).json({ message: "Job offer not found" });
        }
        const { title, description, requirements, salaryMin, salaryMax, location, latitude, longitude, contractType, workSchedule, workModality, experienceLevel, municipality, department, educationRequired, skillsRequired, desiredSkills, applicationDeadline, benefits, isActive, status } = req.body;
        let imageUrls = existingJobOffer.images || [];
        let logoUrl = existingJobOffer.logo;
        if (req.uploadedJobImages && req.uploadedJobImages.images) {
            const newImageUrls = req.uploadedJobImages.images.map((image) => image.url);
            imageUrls = newImageUrls;
        }
        if (req.uploadedJobImages && req.uploadedJobImages.logo) {
            const logo = req.uploadedJobImages.logo;
            logoUrl = logo.url;
        }
        const skillsRequiredArray = skillsRequired ? (typeof skillsRequired === 'string' ? JSON.parse(skillsRequired) : skillsRequired) : existingJobOffer.skillsRequired;
        const desiredSkillsArray = desiredSkills ? (typeof desiredSkills === 'string' ? JSON.parse(desiredSkills) : desiredSkills) : existingJobOffer.desiredSkills;
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (requirements !== undefined)
            updateData.requirements = requirements;
        if (benefits !== undefined)
            updateData.benefits = benefits;
        if (salaryMin !== undefined)
            updateData.salaryMin = salaryMin ? parseFloat(salaryMin) : null;
        if (salaryMax !== undefined)
            updateData.salaryMax = salaryMax ? parseFloat(salaryMax) : null;
        if (location !== undefined)
            updateData.location = location;
        if (latitude !== undefined)
            updateData.latitude = latitude ? parseFloat(latitude) : null;
        if (longitude !== undefined)
            updateData.longitude = longitude ? parseFloat(longitude) : null;
        if (contractType !== undefined)
            updateData.contractType = contractType;
        if (workSchedule !== undefined)
            updateData.workSchedule = workSchedule;
        if (workModality !== undefined)
            updateData.workModality = workModality;
        if (experienceLevel !== undefined)
            updateData.experienceLevel = experienceLevel;
        if (municipality !== undefined)
            updateData.municipality = municipality;
        if (department !== undefined)
            updateData.department = department;
        if (educationRequired !== undefined)
            updateData.educationRequired = educationRequired;
        if (applicationDeadline !== undefined)
            updateData.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
        if (isActive !== undefined)
            updateData.isActive = isActive === 'true' || isActive === true;
        if (status !== undefined)
            updateData.status = status;
        updateData.skillsRequired = skillsRequiredArray;
        updateData.desiredSkills = desiredSkillsArray;
        updateData.images = imageUrls;
        updateData.logo = logoUrl;
        const updated = await prisma_1.prisma.jobOffer.update({
            where: { id },
            data: updateData
        });
        return res.json(updated);
    }
    catch (error) {
        console.error("Error updating job offer:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteJobOffer(req, res) {
    await prisma_1.prisma.jobOffer.delete({
        where: { id: req.params["id"] || "" }
    });
    res.status(204).end();
}
//# sourceMappingURL=JobOfferController.js.map