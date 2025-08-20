import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * /api/entrepreneurship:
 *   get:
 *     summary: Get all entrepreneurships (filtered by user type)
 *     tags: [Entrepreneurships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: businessStage
 *         schema:
 *           type: string
 *         description: Filter by business stage
 *       - in: query
 *         name: municipality
 *         schema:
 *           type: string
 *         description: Filter by municipality
 *     responses:
 *       200:
 *         description: List of entrepreneurships
 */
export async function listEntrepreneurships(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { category, businessStage, municipality } = req.query;
    
    // Build where clause
    let whereClause: any = { isActive: true };
    
    // If user is authenticated, filter based on user type
    if (user) {
      if (user.type === 'user') {
        // Regular users see their own entrepreneurships + public ones
        whereClause.OR = [
          { ownerId: user.id },
          { isPublic: true }
        ];
      }
      // Other user types (companies, municipalities, etc.) see only public entrepreneurships
      else {
        whereClause.isPublic = true;
      }
    } else {
      // Unauthenticated users see only public entrepreneurships
      whereClause.isPublic = true;
    }
    
    // Apply filters
    if (category) {
      whereClause.category = category;
    }
    if (businessStage) {
      whereClause.businessStage = businessStage;
    }
    if (municipality) {
      whereClause.municipality = municipality;
    }
    
    const entrepreneurships = await prisma.entrepreneurship.findMany({
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
  } catch (error: any) {
    console.error("Error listing entrepreneurships:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/entrepreneurship/{id}:
 *   get:
 *     summary: Get entrepreneurship by ID
 *     tags: [Entrepreneurships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entrepreneurship found
 *       404:
 *         description: Entrepreneurship not found
 */
export async function getEntrepreneurship(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const entrepreneurship = await prisma.entrepreneurship.findUnique({
      where: { id: id as string },
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
    
    // Check access permissions
    if (!entrepreneurship.isPublic && (!user || user.id !== entrepreneurship.ownerId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Increment view count
    await prisma.entrepreneurship.update({
      where: { id: id as string },
      data: {
        viewsCount: {
          increment: 1
        }
      }
    });
    
    return res.json(entrepreneurship);
  } catch (error: any) {
    console.error("Error getting entrepreneurship:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/entrepreneurship/my:
 *   get:
 *     summary: Get current user's entrepreneurships
 *     tags: [Entrepreneurships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's entrepreneurships
 *       401:
 *         description: Unauthorized
 */
export async function getMyEntrepreneurships(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only regular users can have entrepreneurships
    if (user.type !== 'user') {
      return res.status(403).json({ message: "Only users can have entrepreneurships" });
    }
    
    const entrepreneurships = await prisma.entrepreneurship.findMany({
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
  } catch (error: any) {
    console.error("Error getting user entrepreneurships:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/entrepreneurship/public:
 *   get:
 *     summary: Get all public entrepreneurships (public endpoint)
 *     tags: [Entrepreneurships]
 *     description: Public endpoint to get entrepreneurships for browsing
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: businessStage
 *         schema:
 *           type: string
 *         description: Filter by business stage
 *       - in: query
 *         name: municipality
 *         schema:
 *           type: string
 *         description: Filter by municipality
 *     responses:
 *       200:
 *         description: List of public entrepreneurships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *                   businessStage:
 *                     type: string
 *                   municipality:
 *                     type: string
 *                   owner:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 */
export async function listPublicEntrepreneurships(req: Request, res: Response): Promise<Response> {
  try {
    const { category, businessStage, municipality } = req.query;
    
    // Build where clause - only public and active entrepreneurships
    let whereClause: any = { 
      isActive: true,
      isPublic: true
    };
    
    // Apply filters
    if (category) {
      whereClause.category = category;
    }
    if (businessStage) {
      whereClause.businessStage = businessStage;
    }
    if (municipality) {
      whereClause.municipality = municipality;
    }
    
    const entrepreneurships = await prisma.entrepreneurship.findMany({
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
  } catch (error: any) {
    console.error("Error listing public entrepreneurships:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/entrepreneurship:
 *   post:
 *     summary: Create a new entrepreneurship
 *     tags: [Entrepreneurships]
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
 *               - description
 *               - category
 *               - municipality
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               businessStage:
 *                 type: string
 *                 enum: [IDEA, STARTUP, GROWING, ESTABLISHED]
 *               logo:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               website:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               municipality:
 *                 type: string
 *               department:
 *                 type: string
 *               socialMedia:
 *                 type: object
 *               founded:
 *                 type: string
 *                 format: date-time
 *               employees:
 *                 type: integer
 *               annualRevenue:
 *                 type: number
 *               businessModel:
 *                 type: string
 *               targetMarket:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Entrepreneurship created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input data
 */
export async function createEntrepreneurship(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Only regular users (youth, adolescents) can create entrepreneurships
    if (user.type !== 'user') {
      return res.status(403).json({ message: "Only users can create entrepreneurships" });
    }

    const { 
      name, 
      description, 
      category, 
      subcategory, 
      businessStage, 
      logo, 
      images, 
      website, 
      email, 
      phone, 
      address, 
      municipality, 
      department = "Cochabamba",
      socialMedia, 
      founded, 
      employees, 
      annualRevenue, 
      businessModel, 
      targetMarket, 
      isPublic = true, 
      isActive = true 
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !municipality) {
      return res.status(400).json({ 
        message: "Name, description, category, and municipality are required" 
      });
    }

    // Validate businessStage if provided
    if (businessStage && !['IDEA', 'STARTUP', 'GROWING', 'ESTABLISHED'].includes(businessStage)) {
      return res.status(400).json({ 
        message: "businessStage must be IDEA, STARTUP, GROWING, or ESTABLISHED" 
      });
    }

    const newItem = await prisma.entrepreneurship.create({
      data: {
        ownerId: user.id, // Automatically assign the authenticated user as owner
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
  } catch (error: any) {
    console.error("Error creating entrepreneurship:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/entrepreneurship/{id}:
 *   put:
 *     summary: Update entrepreneurship
 *     tags: [Entrepreneurships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               businessStage:
 *                 type: string
 *                 enum: [IDEA, STARTUP, GROWING, ESTABLISHED]
 *               logo:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               website:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               municipality:
 *                 type: string
 *               department:
 *                 type: string
 *               socialMedia:
 *                 type: object
 *               founded:
 *                 type: string
 *                 format: date-time
 *               employees:
 *                 type: integer
 *               annualRevenue:
 *                 type: number
 *               businessModel:
 *                 type: string
 *               targetMarket:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Entrepreneurship updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Entrepreneurship not found
 */
export async function updateEntrepreneurship(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Find the entrepreneurship
    const entrepreneurship = await prisma.entrepreneurship.findUnique({
      where: { id: id as string }
    });
    
    if (!entrepreneurship) {
      return res.status(404).json({ message: "Entrepreneurship not found" });
    }
    
    // Check ownership
    if (entrepreneurship.ownerId !== user.id) {
      return res.status(403).json({ message: "Access denied. Only the owner can update this entrepreneurship" });
    }
    
    const { 
      name, 
      description, 
      category, 
      subcategory, 
      businessStage, 
      logo, 
      images, 
      website, 
      email, 
      phone, 
      address, 
      municipality, 
      department,
      socialMedia, 
      founded, 
      employees, 
      annualRevenue, 
      businessModel, 
      targetMarket, 
      isPublic, 
      isActive 
    } = req.body;
    
    // Validate businessStage if provided
    if (businessStage && !['IDEA', 'STARTUP', 'GROWING', 'ESTABLISHED'].includes(businessStage)) {
      return res.status(400).json({ 
        message: "businessStage must be IDEA, STARTUP, GROWING, or ESTABLISHED" 
      });
    }
    
    // Build update data object with only provided fields
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (businessStage !== undefined) updateData.businessStage = businessStage;
    if (logo !== undefined) updateData.logo = logo;
    if (images !== undefined) updateData.images = images;
    if (website !== undefined) updateData.website = website;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (municipality !== undefined) updateData.municipality = municipality;
    if (department !== undefined) updateData.department = department;
    if (socialMedia !== undefined) updateData.socialMedia = socialMedia;
    if (founded !== undefined) updateData.founded = founded ? new Date(founded) : null;
    if (employees !== undefined) updateData.employees = employees ? parseInt(employees) : null;
    if (annualRevenue !== undefined) updateData.annualRevenue = annualRevenue ? parseFloat(annualRevenue) : null;
    if (businessModel !== undefined) updateData.businessModel = businessModel;
    if (targetMarket !== undefined) updateData.targetMarket = targetMarket;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (isActive !== undefined) updateData.active = isActive;
    
    const updatedItem = await prisma.entrepreneurship.update({
      where: { id: id as string },
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
  } catch (error: any) {
    console.error("Error updating entrepreneurship:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/entrepreneurship/{id}:
 *   delete:
 *     summary: Delete entrepreneurship
 *     tags: [Entrepreneurships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Entrepreneurship deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Entrepreneurship not found
 */
export async function deleteEntrepreneurship(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Find the entrepreneurship
    const entrepreneurship = await prisma.entrepreneurship.findUnique({
      where: { id: id as string }
    });
    
    if (!entrepreneurship) {
      return res.status(404).json({ message: "Entrepreneurship not found" });
    }
    
    // Check ownership
    if (entrepreneurship.ownerId !== user.id) {
      return res.status(403).json({ message: "Access denied. Only the owner can delete this entrepreneurship" });
    }
    
    // Soft delete by setting isActive to false
    await prisma.entrepreneurship.update({
      where: { id: id as string },
      data: { isActive: false }
    });
    
    return res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting entrepreneurship:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}
