"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCompanies = listCompanies;
exports.searchCompanies = searchCompanies;
exports.testAuth = testAuth;
exports.getCompanyStats = getCompanyStats;
exports.getCompany = getCompany;
exports.createCompany = createCompany;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
async function listCompanies(req, res) {
    try {
        const user = req.user;
        let whereClause = { isActive: true };
        if (user && user.type === 'institution') {
            whereClause.institutionId = user.id;
        }
        if (user && user.type === 'company') {
            whereClause.id = user.id;
        }
        const companies = await prisma_1.prisma.company.findMany({
            where: whereClause,
            include: {
                municipality: {
                    select: {
                        id: true,
                        name: true,
                        department: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        return res.json(companies);
    }
    catch (error) {
        console.error("Error listing companies:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function searchCompanies(req, res) {
    try {
        const user = req.user;
        const { query, businessSector, companySize, institutionId, department, foundedYear, isActive, page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = req.query;
        let whereClause = {};
        if (user && user.type === 'municipality') {
            whereClause.municipalityId = user.id;
        }
        else if (user && user.type === 'company') {
            whereClause.id = user.id;
        }
        else {
            whereClause.isActive = true;
        }
        if (query) {
            whereClause.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { businessSector: { contains: query, mode: 'insensitive' } },
                { legalRepresentative: { contains: query, mode: 'insensitive' } }
            ];
        }
        if (businessSector) {
            whereClause.businessSector = { contains: businessSector, mode: 'insensitive' };
        }
        if (companySize) {
            whereClause.companySize = companySize;
        }
        if (institutionId) {
            whereClause.municipalityId = institutionId;
        }
        if (foundedYear) {
            whereClause.foundedYear = parseInt(foundedYear);
        }
        if (isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
        }
        const skip = (Number(page) - 1) * Number(limit);
        const includeClause = {
            municipality: {
                select: {
                    id: true,
                    name: true,
                    department: true
                }
            },
            creator: {
                select: {
                    id: true,
                    username: true,
                    role: true
                }
            }
        };
        if (department) {
            whereClause.municipality = {
                department: { contains: department, mode: 'insensitive' }
            };
        }
        const [companies, total] = await Promise.all([
            prisma_1.prisma.company.findMany({
                where: whereClause,
                include: includeClause,
                skip,
                take: Number(limit),
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma_1.prisma.company.count({ where: whereClause })
        ]);
        const businessSectors = await prisma_1.prisma.company.findMany({
            where: { isActive: true },
            select: { businessSector: true },
            distinct: ['businessSector']
        });
        const municipalities = await prisma_1.prisma.municipality.findMany({
            where: { isActive: true },
            select: { id: true, name: true, department: true },
            orderBy: { name: 'asc' }
        });
        return res.json({
            companies,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            },
            filters: {
                applied: {
                    query,
                    businessSector,
                    companySize,
                    institutionId,
                    department,
                    foundedYear,
                    isActive
                },
                available: {
                    businessSectors: businessSectors.map(bs => bs.businessSector).filter(Boolean),
                    companySizes: ['MICRO', 'SMALL', 'MEDIUM', 'LARGE'],
                    municipalities,
                    departments: [...new Set(municipalities.map(m => m.department))]
                }
            }
        });
    }
    catch (error) {
        console.error("Error searching companies:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function testAuth(req, res) {
    try {
        const user = req.user;
        console.log("Test auth - User object:", user);
        if (!user) {
            return res.status(401).json({ message: "No user found" });
        }
        return res.json({
            user,
            isSuperAdmin: user.role === client_1.UserRole.SUPERADMIN,
            isMunicipalGovernment: user.role === client_1.UserRole.MUNICIPAL_GOVERNMENTS,
            isMunicipality: user.type === 'municipality',
            message: "Authentication test successful"
        });
    }
    catch (error) {
        console.error("Test auth error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getCompanyStats(req, res) {
    try {
        const user = req.user;
        let whereClause = {};
        if (user && user.type === 'municipality') {
            whereClause.municipalityId = user.id;
        }
        if (user && user.type === 'company') {
            whereClause.id = user.id;
        }
        const [totalCompanies, activeCompanies, inactiveCompanies] = await Promise.all([
            prisma_1.prisma.company.count({ where: whereClause }),
            prisma_1.prisma.company.count({ where: { ...whereClause, isActive: true } }),
            prisma_1.prisma.company.count({ where: { ...whereClause, isActive: false } })
        ]);
        const totalEmployees = 0;
        const totalRevenue = 0;
        const pendingCompanies = 0;
        return res.json({
            totalCompanies,
            activeCompanies,
            pendingCompanies,
            inactiveCompanies,
            totalEmployees,
            totalRevenue
        });
    }
    catch (error) {
        console.error("Error getting company stats:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getCompany(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing company ID" });
        }
        const company = await prisma_1.prisma.company.findUnique({
            where: { id: id || '' },
            include: {
                municipality: {
                    select: {
                        id: true,
                        name: true,
                        department: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                },
                jobOffers: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                },
                profiles: {
                    where: { active: true },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        return res.json(company);
    }
    catch (error) {
        console.error("Error getting company:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function createCompany(req, res) {
    try {
        const user = req.user;
        console.log("User object:", user);
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const isSuperAdmin = user.role === client_1.UserRole.SUPERADMIN;
        const isMunicipalGovernment = user.role === client_1.UserRole.MUNICIPAL_GOVERNMENTS;
        const isMunicipality = user.type === 'municipality';
        console.log("User permissions:", { isSuperAdmin, isMunicipalGovernment, isMunicipality });
        if (!isSuperAdmin && !isMunicipalGovernment && !isMunicipality) {
            return res.status(403).json({ message: "Only SuperAdmin, Municipal Governments, and Municipalities can create companies" });
        }
        const { name, description, taxId, legalRepresentative, businessSector, companySize, website, email, phone, address, foundedYear, municipalityId, username, password, loginEmail } = req.body;
        console.log("Request body:", req.body);
        console.log("User details:", {
            id: user.id,
            username: user.username,
            type: user.type,
            role: user.role
        });
        let finalMunicipalityId = municipalityId;
        if (isMunicipality) {
            finalMunicipalityId = user.id;
            console.log("Using municipality's own ID:", finalMunicipalityId);
        }
        else {
            console.log("Using provided municipalityId:", finalMunicipalityId);
        }
        console.log("Validation check:", { name, username, password, municipalityId, isMunicipality });
        if (!name || !username || !password) {
            console.log("Missing required fields:", { name: !!name, username: !!username, password: !!password });
            return res.status(400).json({
                message: "Name, username, and password are required",
                debug: { name: !!name, username: !!username, password: !!password }
            });
        }
        if (!isMunicipality && !municipalityId) {
            console.log("Missing municipalityId for non-municipality user");
            return res.status(400).json({
                message: "MunicipalityId is required for non-municipality users",
                debug: { isMunicipality, municipalityId }
            });
        }
        const finalLoginEmail = loginEmail || email;
        console.log("Email validation:", { email, loginEmail, finalLoginEmail });
        if (!finalLoginEmail) {
            console.log("Missing email/loginEmail");
            return res.status(400).json({
                message: "Either loginEmail or email is required",
                debug: { email, loginEmail, finalLoginEmail }
            });
        }
        let finalCompanySize = companySize;
        if (companySize) {
            const validCompanySizes = ['MICRO', 'SMALL', 'MEDIUM', 'LARGE'];
            const normalizedCompanySize = companySize.toUpperCase();
            if (!validCompanySizes.includes(normalizedCompanySize)) {
                return res.status(400).json({
                    message: `Invalid companySize. Must be one of: ${validCompanySizes.join(', ')}`,
                    debug: { providedCompanySize: companySize, normalizedCompanySize }
                });
            }
            finalCompanySize = normalizedCompanySize;
        }
        const municipality = await prisma_1.prisma.municipality.findUnique({
            where: { id: finalMunicipalityId }
        });
        if (!municipality) {
            return res.status(400).json({
                message: "Municipality not found",
                debug: { municipalityId: finalMunicipalityId }
            });
        }
        if (!municipality.isActive) {
            return res.status(400).json({
                message: "Municipality is not active",
                debug: { municipalityId: finalMunicipalityId, municipalityName: municipality.name }
            });
        }
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        let createdBy = user.id;
        if (isMunicipality) {
            let institutionUser = await prisma_1.prisma.user.findFirst({
                where: { username: user.username }
            });
            if (!institutionUser) {
                institutionUser = await prisma_1.prisma.user.create({
                    data: {
                        username: user.username,
                        password: 'institution_user',
                        role: client_1.UserRole.MUNICIPAL_GOVERNMENTS,
                        isActive: true
                    }
                });
            }
            createdBy = institutionUser.id;
        }
        const company = await prisma_1.prisma.company.create({
            data: {
                name,
                description,
                taxId,
                legalRepresentative,
                businessSector,
                companySize: finalCompanySize,
                website,
                email,
                phone,
                address,
                foundedYear: foundedYear ? parseInt(foundedYear) : null,
                municipalityId: finalMunicipalityId,
                username,
                password: hashedPassword,
                loginEmail: finalLoginEmail,
                createdBy: createdBy,
                isActive: true
            },
            include: {
                municipality: {
                    select: {
                        id: true,
                        name: true,
                        department: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        const { password: _, ...companyWithoutPassword } = company;
        return res.status(201).json({
            ...companyWithoutPassword,
            credentials: {
                username,
                loginEmail: finalLoginEmail,
                password: password
            }
        });
    }
    catch (error) {
        console.error("Error creating company:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Company with this name already exists in this municipality" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function updateCompany(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const isSuperAdmin = user.role === client_1.UserRole.SUPERADMIN;
        const isMunicipalGovernment = user.role === client_1.UserRole.MUNICIPAL_GOVERNMENTS;
        const isMunicipality = user.type === 'municipality';
        if (!isSuperAdmin && !isMunicipalGovernment && !isMunicipality) {
            return res.status(403).json({ message: "Only SuperAdmin, Municipal Governments, and Municipalities can update companies" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing company ID" });
        }
        const { name, description, taxId, legalRepresentative, businessSector, companySize, website, email, phone, address, foundedYear, municipalityId, isActive } = req.body;
        const company = await prisma_1.prisma.company.update({
            where: { id: id || '' },
            data: {
                name,
                description,
                taxId,
                legalRepresentative,
                businessSector,
                companySize,
                website,
                email,
                phone,
                address,
                foundedYear: foundedYear ? parseInt(foundedYear) : null,
                municipalityId,
                isActive
            },
            include: {
                municipality: {
                    select: {
                        id: true,
                        name: true,
                        department: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        return res.json(company);
    }
    catch (error) {
        console.error("Error updating company:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Company not found" });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Company with this name already exists in this municipality" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function deleteCompany(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const isSuperAdmin = user.role === client_1.UserRole.SUPERADMIN;
        const isMunicipalGovernment = user.role === client_1.UserRole.MUNICIPAL_GOVERNMENTS;
        const isMunicipality = user.type === 'municipality';
        if (!isSuperAdmin && !isMunicipalGovernment && !isMunicipality) {
            return res.status(403).json({ message: "Only SuperAdmin, Municipal Governments, and Municipalities can delete companies" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing company ID" });
        }
        const company = await prisma_1.prisma.company.findUnique({
            where: { id: id || '' },
            include: {
                jobOffers: {
                    where: { isActive: true }
                }
            }
        });
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        if (company.jobOffers.length > 0) {
            return res.status(400).json({
                message: "Cannot delete company with active job offers. Deactivate job offers first."
            });
        }
        await prisma_1.prisma.company.delete({
            where: { id }
        });
        return res.status(204).end();
    }
    catch (error) {
        console.error("Error deleting company:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Company not found" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=CompanyController.js.map