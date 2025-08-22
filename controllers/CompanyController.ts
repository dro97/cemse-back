import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - name
 *         - institutionId
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         taxId:
 *           type: string
 *         legalRepresentative:
 *           type: string
 *         businessSector:
 *           type: string
 *         companySize:
 *           type: string
 *           enum: [MICRO, SMALL, MEDIUM, LARGE]
 *         website:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         foundedYear:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         institutionId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/company:
 *   get:
 *     summary: Get companies (filtered by user type)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - SuperAdmin and Municipal Governments: See all companies
 *       - Institutions: See only companies from their institution
 *       - Companies: See only their own company
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 */
export async function listCompanies(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    // Build where clause based on user type
    let whereClause: any = { isActive: true };
    
    // If user is an institution, only show companies from their institution
    if (user && user.type === 'institution') {
      whereClause.institutionId = user.id;
    }
    
    // If user is a company, only show their own company
    if (user && user.type === 'company') {
      whereClause.id = user.id;
    }
    
    // SuperAdmin can see all companies
    // Regular users with MUNICIPAL_GOVERNMENTS role can see all companies
    
    const companies = await prisma.company.findMany({
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
  } catch (error) {
    console.error("Error listing companies:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/company/search:
 *   get:
 *     summary: Search companies with filters
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for company name, description, or business sector
 *       - in: query
 *         name: businessSector
 *         schema:
 *           type: string
 *         description: Filter by business sector
 *       - in: query
 *         name: companySize
 *         schema:
 *           type: string
 *           enum: [MICRO, SMALL, MEDIUM, LARGE]
 *         description: Filter by company size
 *       - in: query
 *         name: institutionId
 *         schema:
 *           type: string
 *         description: Filter by institution ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: foundedYear
 *         schema:
 *           type: integer
 *         description: Filter by founding year
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, foundedYear, companySize]
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Search results with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 filters:
 *                   type: object
 *                   description: Applied filters
 */
export async function searchCompanies(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const {
      query,
      businessSector,
      companySize,
      institutionId,
      municipalityId,
      department,
      foundedYear,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build where clause based on user type and filters
    let whereClause: any = {};

    // Apply user type restrictions
    if (user && user.type === 'municipality') {
      whereClause.municipalityId = user.id;
    } else if (user && user.type === 'company') {
      whereClause.id = user.id;
    } else {
      // For other users, only show active companies by default
      // But allow municipalityId filter to override this
      if (!municipalityId) {
        whereClause.isActive = true;
      }
    }

    // Apply search query
    if (query) {
      whereClause.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } },
        { businessSector: { contains: query as string, mode: 'insensitive' } },
        { legalRepresentative: { contains: query as string, mode: 'insensitive' } }
      ];
    }

    // Apply filters
    if (businessSector) {
      whereClause.businessSector = { contains: businessSector as string, mode: 'insensitive' };
    }

    if (companySize) {
      whereClause.companySize = companySize;
    }

    if (municipalityId) {
      // municipalityId filter takes precedence over user type restrictions
      whereClause.municipalityId = municipalityId;
    } else if (institutionId) {
      whereClause.municipalityId = institutionId;
    }

    if (foundedYear) {
      whereClause.foundedYear = parseInt(foundedYear as string);
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Build include clause
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

    // Add department filter if specified
    if (department) {
      whereClause.municipality = {
        department: { contains: department as string, mode: 'insensitive' }
      };
    }

    // Execute search with pagination
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        include: includeClause,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder }
      }),
      prisma.company.count({ where: whereClause })
    ]);

    // Get unique business sectors for filter options
    const businessSectors = await prisma.company.findMany({
      where: { isActive: true },
      select: { businessSector: true },
      distinct: ['businessSector']
    });

    // Get unique municipalities for filter options
    const municipalities = await prisma.municipality.findMany({
      where: { isActive: true as any },
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
          municipalityId,
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
  } catch (error) {
    console.error("Error searching companies:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/company/test-auth:
 *   get:
 *     summary: Test authentication and user info
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User authentication info
 */
export async function testAuth(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    console.log("Test auth - User object:", user);
    
    if (!user) {
      return res.status(401).json({ message: "No user found" });
    }
    
    return res.json({
      user,
      isSuperAdmin: user.role === UserRole.SUPERADMIN,
      isMunicipalGovernment: user.role === UserRole.MUNICIPAL_GOVERNMENTS,
      isMunicipality: user.type === 'municipality',
      message: "Authentication test successful"
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/company/stats:
 *   get:
 *     summary: Get company statistics (filtered by user type)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns statistics for companies based on user type:
 *       - SuperAdmin and Municipal Governments: All companies
 *       - Municipalities: Only companies from their municipality
 *       - Companies: Only their own company
 *     responses:
 *       200:
 *         description: Company statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCompanies:
 *                   type: number
 *                 activeCompanies:
 *                   type: number
 *                 pendingCompanies:
 *                   type: number
 *                 inactiveCompanies:
 *                   type: number
 *                 totalEmployees:
 *                   type: number
 *                 totalRevenue:
 *                   type: number
 */
export async function getCompanyStats(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    // Build where clause based on user type
    let whereClause: any = {};
    
    // If user is a municipality, only count companies from their municipality
    if (user && user.type === 'municipality') {
      whereClause.municipalityId = user.id;
    }
    
    // If user is a company, only count their own company
    if (user && user.type === 'company') {
      whereClause.id = user.id;
    }
    
    // SuperAdmin can see all companies
    // Regular users with MUNICIPAL_GOVERNMENTS role can see all companies
    
    const [
      totalCompanies,
      activeCompanies,
      inactiveCompanies
    ] = await Promise.all([
      prisma.company.count({ where: whereClause }),
      prisma.company.count({ where: { ...whereClause, isActive: true } }),
      prisma.company.count({ where: { ...whereClause, isActive: false } })
    ]);
    
    // For now, we'll set these to 0 as they're not in the current schema
    const totalEmployees = 0;
    const totalRevenue = 0;
    const pendingCompanies = 0; // Companies don't have a pending status in current schema
    
    return res.json({
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      inactiveCompanies,
      totalEmployees,
      totalRevenue
    });
  } catch (error) {
    console.error("Error getting company stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/company/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Company not found
 */
export async function getCompany(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing company ID" });
    }

    const company = await prisma.company.findUnique({
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
  } catch (error) {
    console.error("Error getting company:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/company:
 *   post:
 *     summary: Create a new company (SuperAdmin, Municipal Governments, or Municipalities only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               taxId:
 *                 type: string
 *               legalRepresentative:
 *                 type: string
 *               businessSector:
 *                 type: string
 *               companySize:
 *                 type: string
 *                 enum: [MICRO, SMALL, MEDIUM, LARGE]
 *               website:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               foundedYear:
 *                 type: integer
 *               institutionId:
 *                 type: string
 *                 description: Required for non-institution users. Auto-assigned for institutions.
 *               username:
 *                 type: string
 *                 description: Unique username for company login
 *               password:
 *                 type: string
 *                 description: Password for company login
 *               loginEmail:
 *                 type: string
 *                 description: Email for company login (optional, uses email if not provided)
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid input data
 */
export async function createCompany(req: Request, res: Response): Promise<Response> {
  try {
    // IMPORTANTE: Cuando un municipio crea una empresa, el sistema puede crear un usuario adicional
    // en la tabla 'users' para satisfacer la relación Company.creator que requiere un User.
    // Esto es necesario debido a la estructura del esquema de Prisma.
    
    // Check if user is Municipal Government, Municipality, or SuperAdmin
    const user = (req as any).user;
    console.log("User object:", user); // Debug log
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Allow SuperAdmin, Municipal Governments, and Municipalities
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;
    const isMunicipalGovernment = user.role === UserRole.MUNICIPAL_GOVERNMENTS;
    const isMunicipality = user.type === 'municipality';
    
    console.log("User permissions:", { isSuperAdmin, isMunicipalGovernment, isMunicipality }); // Debug log
    
    if (!isSuperAdmin && !isMunicipalGovernment && !isMunicipality) {
      return res.status(403).json({ message: "Only SuperAdmin, Municipal Governments, and Municipalities can create companies" });
    }

    const { 
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
      foundedYear,
      municipalityId,
      username,
      password,
      loginEmail
    } = req.body;
    
    console.log("Request body:", req.body); // Debug log
    console.log("User details:", { 
      id: user.id, 
      username: user.username, 
      type: user.type, 
      role: user.role 
    }); // Debug log

    // Determine the municipality ID
    let finalMunicipalityId = municipalityId;
    
    // If user is a municipality, use their own ID
    if (isMunicipality) {
      finalMunicipalityId = user.id;
      console.log("Using municipality's own ID:", finalMunicipalityId);
    } else {
      console.log("Using provided municipalityId:", finalMunicipalityId);
    }
    
    console.log("Validation check:", { name, username, password, municipalityId, isMunicipality }); // Debug log
    
    if (!name || !username || !password) {
      console.log("Missing required fields:", { name: !!name, username: !!username, password: !!password }); // Debug log
      return res.status(400).json({ 
        message: "Name, username, and password are required",
        debug: { name: !!name, username: !!username, password: !!password }
      });
    }
    
    // For non-municipality users, municipalityId is required
    if (!isMunicipality && !municipalityId) {
      console.log("Missing municipalityId for non-municipality user"); // Debug log
      return res.status(400).json({ 
        message: "MunicipalityId is required for non-municipality users",
        debug: { isMunicipality, municipalityId }
      });
    }

    // Use email as loginEmail if not provided
    const finalLoginEmail = loginEmail || email;
    console.log("Email validation:", { email, loginEmail, finalLoginEmail }); // Debug log
    if (!finalLoginEmail) {
      console.log("Missing email/loginEmail"); // Debug log
      return res.status(400).json({ 
        message: "Either loginEmail or email is required",
        debug: { email, loginEmail, finalLoginEmail }
      });
    }

    // Validate companySize if provided
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
      
      // Use normalized value
      finalCompanySize = normalizedCompanySize;
    }

    // Verify municipality exists and is active
    const municipality = await prisma.municipality.findUnique({
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

    // Log municipality state BEFORE company creation
    console.log("Municipality state BEFORE company creation:", {
      id: municipality.id,
      username: municipality.username,
      email: municipality.email,
      isActive: municipality.isActive,
      updatedAt: municipality.updatedAt
    });

    // Hash the password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine the createdBy field based on user type
    let createdBy = user.id;
    
    // If user is a municipality, we need to handle the createdBy field carefully
    if (isMunicipality) {
      // Check if there's already a user for this municipality
      let institutionUser = await prisma.user.findFirst({
        where: { username: user.username }
      });
      
      if (!institutionUser) {
        // Create a user record for the municipality if it doesn't exist
        // This is necessary because the Company.creator relation requires a User
        institutionUser = await prisma.user.create({
          data: {
            username: user.username,
            password: user.password, // Use the same password as municipality
            role: UserRole.MUNICIPAL_GOVERNMENTS,
            isActive: true
          }
        });
        console.log("Created user record for municipality:", institutionUser.id);
      } else {
        console.log("Found existing user record for municipality:", institutionUser.id);
        // Update the user password to match municipality if it's different
        if (institutionUser.password !== user.password) {
          await prisma.user.update({
            where: { id: institutionUser.id },
            data: { password: user.password }
          });
          console.log("Updated user password to match municipality");
        }
      }
      
      createdBy = institutionUser.id;
    }
    
    const company = await prisma.company.create({
      data: {
        name,
        description,
        taxId,
        legalRepresentative,
        businessSector,
        companySize: finalCompanySize, // Usar el valor normalizado
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

    // Don't return the password in the response
    const { password: _, ...companyWithoutPassword } = company;
    
    // Log municipality state AFTER company creation to check for any modifications
    const municipalityAfter = await prisma.municipality.findUnique({
      where: { id: finalMunicipalityId }
    });
    
    console.log("Municipality state AFTER company creation:", {
      id: municipalityAfter?.id,
      username: municipalityAfter?.username,
      email: municipalityAfter?.email,
      isActive: municipalityAfter?.isActive,
      updatedAt: municipalityAfter?.updatedAt
    });
    
    // Check if municipality was modified
    if (municipalityAfter && (
      municipalityAfter.username !== municipality.username ||
      municipalityAfter.email !== municipality.email ||
      municipalityAfter.isActive !== municipality.isActive ||
      municipalityAfter.updatedAt.getTime() !== municipality.updatedAt.getTime()
    )) {
      console.log("⚠️ WARNING: Municipality was modified during company creation!");
      console.log("Changes detected:", {
        usernameChanged: municipalityAfter.username !== municipality.username,
        emailChanged: municipalityAfter.email !== municipality.email,
        isActiveChanged: municipalityAfter.isActive !== municipality.isActive,
        updatedAtChanged: municipalityAfter.updatedAt.getTime() !== municipality.updatedAt.getTime()
      });
      
      // Check if only updatedAt changed (which is normal)
      const onlyUpdatedAtChanged = 
        municipalityAfter.username === municipality.username &&
        municipalityAfter.email === municipality.email &&
        municipalityAfter.isActive === municipality.isActive &&
        municipalityAfter.updatedAt.getTime() !== municipality.updatedAt.getTime();
      
      if (onlyUpdatedAtChanged) {
        console.log("ℹ️  INFO: Only updatedAt field changed - this is NORMAL behavior for @updatedAt fields in Prisma");
        console.log("ℹ️  INFO: Municipality credentials were NOT modified");
      } else {
        console.log("❌ ERROR: Municipality credentials or other fields were unexpectedly modified!");
      }
    } else {
      console.log("✅ Municipality was NOT modified during company creation");
    }
    
    // Return company data with credentials info
    return res.status(201).json({
      ...companyWithoutPassword,
      credentials: {
        username,
        loginEmail: finalLoginEmail,
        password: password // Return plain password for initial setup
      }
    });
  } catch (error: any) {
    console.error("Error creating company:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Company with this name already exists in this municipality" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/company/{id}:
 *   put:
 *     summary: Update company (SuperAdmin, Municipal Governments, or Municipalities only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Company not found
 */
export async function updateCompany(req: Request, res: Response): Promise<Response> {
  try {
    // Check if user is Municipal Government, Municipality, or SuperAdmin
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Allow SuperAdmin, Municipal Governments, and Municipalities
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;
    const isMunicipalGovernment = user.role === UserRole.MUNICIPAL_GOVERNMENTS;
    const isMunicipality = user.type === 'municipality';
    
    if (!isSuperAdmin && !isMunicipalGovernment && !isMunicipality) {
      return res.status(403).json({ message: "Only SuperAdmin, Municipal Governments, and Municipalities can update companies" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing company ID" });
    }

    const { 
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
      foundedYear,
      municipalityId,
      isActive 
    } = req.body;

    const company = await prisma.company.update({
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
  } catch (error: any) {
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

/**
 * @swagger
 * /api/company/{id}:
 *   delete:
 *     summary: Delete company (SuperAdmin, Municipal Governments, or Municipalities only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       204:
 *         description: Company deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Company not found
 */
export async function deleteCompany(req: Request, res: Response): Promise<Response> {
  try {
    // Check if user is Municipal Government, Municipality, or SuperAdmin
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Allow SuperAdmin, Municipal Governments, and Municipalities
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;
    const isMunicipalGovernment = user.role === UserRole.MUNICIPAL_GOVERNMENTS;
    const isMunicipality = user.type === 'municipality';
    
    if (!isSuperAdmin && !isMunicipalGovernment && !isMunicipality) {
      return res.status(403).json({ message: "Only SuperAdmin, Municipal Governments, and Municipalities can delete companies" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing company ID" });
    }

    // Check if company has active job offers
    const company = await prisma.company.findUnique({
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

    await prisma.company.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting company:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
} 