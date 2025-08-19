import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * components:
 *   schemas:
 *     BusinessPlan:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - studentId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the business plan
 *         title:
 *           type: string
 *           description: Business plan title
 *         description:
 *           type: string
 *           description: Business plan description
 *         studentId:
 *           type: string
 *           description: ID of the student who created the plan
 *         status:
 *           type: string
 *           enum: [DRAFT, SUBMITTED, APPROVED, REJECTED]
 *           description: Business plan status
 *         feedback:
 *           type: string
 *           description: Feedback on the business plan
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Business plan creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Business plan last update timestamp
 *     BusinessPlanInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - studentId
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         studentId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, SUBMITTED, APPROVED, REJECTED]
 *         feedback:
 *           type: string
 */

/**
 * @swagger
 * /business-plans:
 *   get:
 *     summary: Get the latest business plan for the current user
 *     tags: [Business Plans]
 *     responses:
 *       200:
 *         description: Latest business plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessPlan'
 *       404:
 *         description: No business plan found for the user
 */
export async function getLatestBusinessPlan(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Users can only see their own business plans
    // Get the most recent business plan for the user
    const latestPlan = await prisma.businessPlan.findFirst({
      where: {
        entrepreneurship: {
          ownerId: user.id
        }
      },
      include: {
        entrepreneurship: {
          select: {
            id: true,
            name: true,
            category: true,
            businessStage: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Return the latest plan or null if none exists
    return res.json(latestPlan);
  } catch (error: any) {
    console.error("Error getting latest business plan:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @swagger
 * /business-plans/all:
 *   get:
 *     summary: Get all business plans for the current user (admin only)
 *     tags: [Business Plans]
 *     responses:
 *       200:
 *         description: List of all business plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BusinessPlan'
 */
export async function listAllBusinessPlans(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Users can only see their own business plans
    const items = await prisma.businessPlan.findMany({
      where: {
        entrepreneurship: {
          ownerId: user.id
        }
      },
      include: {
        entrepreneurship: {
          select: {
            id: true,
            name: true,
            category: true,
            businessStage: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return res.json(items);
  } catch (error: any) {
    console.error("Error listing all business plans:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @swagger
 * /business-plans/{id}:
 *   get:
 *     summary: Get a business plan by ID
 *     tags: [Business Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business plan ID
 *     responses:
 *       200:
 *         description: Business plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessPlan'
 *       404:
 *         description: Business plan not found
 */
export async function getBusinessPlan(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const item = await prisma.businessPlan.findUnique({
      where: { id: id as string },
      include: {
        entrepreneurship: {
          select: {
            id: true,
            name: true,
            category: true,
            businessStage: true,
            ownerId: true
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: "Business plan not found" });
    }

    // Check if user owns this business plan
    if (item.entrepreneurship.ownerId !== user.id) {
      return res.status(403).json({ message: "Access denied. You can only view your own business plans" });
    }

    return res.json(item);
  } catch (error: any) {
    console.error("Error getting business plan:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @swagger
 * /business-plans:
 *   post:
 *     summary: Create a new business plan
 *     tags: [Business Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessPlanInput'
 *     responses:
 *       201:
 *         description: Business plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessPlan'
 *       400:
 *         description: Invalid input data
 */
export async function createBusinessPlan(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { entrepreneurshipId } = req.body;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!entrepreneurshipId) {
      return res.status(400).json({ message: "entrepreneurshipId is required" });
    }

    // Verify that the entrepreneurship belongs to the user
    const entrepreneurship = await prisma.entrepreneurship.findUnique({
      where: { id: entrepreneurshipId },
      select: { id: true, ownerId: true, name: true }
    });

    if (!entrepreneurship) {
      return res.status(404).json({ message: "Entrepreneurship not found" });
    }

    if (entrepreneurship.ownerId !== user.id) {
      return res.status(403).json({ message: "Access denied. You can only create business plans for your own entrepreneurship" });
    }

    // Check if business plan already exists for this entrepreneurship
    const existingPlan = await prisma.businessPlan.findUnique({
      where: { entrepreneurshipId }
    });

    if (existingPlan) {
      return res.status(400).json({ message: "Business plan already exists for this entrepreneurship" });
    }

    const newItem = await prisma.businessPlan.create({
      data: {
        ...req.body,
        entrepreneurshipId
      },
      include: {
        entrepreneurship: {
          select: {
            id: true,
            name: true,
            category: true,
            businessStage: true
          }
        }
      }
    });

    return res.status(201).json(newItem);
  } catch (error: any) {
    console.error("Error creating business plan:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @swagger
 * /business-plans/{id}:
 *   put:
 *     summary: Update a business plan
 *     tags: [Business Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessPlanInput'
 *     responses:
 *       200:
 *         description: Business plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessPlan'
 *       404:
 *         description: Business plan not found
 */
export async function updateBusinessPlan(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // First check if the business plan exists and belongs to the user
    const existingPlan = await prisma.businessPlan.findUnique({
      where: { id: id as string },
      include: {
        entrepreneurship: {
          select: { ownerId: true }
        }
      }
    });

    if (!existingPlan) {
      return res.status(404).json({ message: "Business plan not found" });
    }

    if (existingPlan.entrepreneurship.ownerId !== user.id) {
      return res.status(403).json({ message: "Access denied. You can only update your own business plans" });
    }

    const updated = await prisma.businessPlan.update({
      where: { id: id as string },
      data: req.body,
      include: {
        entrepreneurship: {
          select: {
            id: true,
            name: true,
            category: true,
            businessStage: true
          }
        }
      }
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("Error updating business plan:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @swagger
 * /business-plans/{id}:
 *   delete:
 *     summary: Delete a business plan
 *     tags: [Business Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business plan ID
 *     responses:
 *       204:
 *         description: Business plan deleted successfully
 *       404:
 *         description: Business plan not found
 */
export async function deleteBusinessPlan(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // First check if the business plan exists and belongs to the user
    const existingPlan = await prisma.businessPlan.findUnique({
      where: { id: id as string },
      include: {
        entrepreneurship: {
          select: { ownerId: true }
        }
      }
    });

    if (!existingPlan) {
      return res.status(404).json({ message: "Business plan not found" });
    }

    if (existingPlan.entrepreneurship.ownerId !== user.id) {
      return res.status(403).json({ message: "Access denied. You can only delete your own business plans" });
    }

    await prisma.businessPlan.delete({
      where: { id: id as string }
    });

    return res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting business plan:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @swagger
 * /businessplan/entrepreneurship/{entrepreneurshipId}:
 *   get:
 *     summary: Get business plan for a specific entrepreneurship
 *     tags: [Business Plans]
 *     parameters:
 *       - in: path
 *         name: entrepreneurshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: Entrepreneurship ID
 *     responses:
 *       200:
 *         description: Business plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessPlan'
 *       404:
 *         description: Business plan not found
 *       403:
 *         description: Access denied
 */
export async function getBusinessPlanByEntrepreneurship(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { entrepreneurshipId } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // First verify the entrepreneurship belongs to the user
    const entrepreneurship = await prisma.entrepreneurship.findUnique({
      where: { id: entrepreneurshipId as string },
      select: { id: true, ownerId: true, name: true }
    });

    if (!entrepreneurship) {
      return res.status(404).json({ message: "Entrepreneurship not found" });
    }

    if (entrepreneurship.ownerId !== user.id) {
      return res.status(403).json({ message: "Access denied. You can only view business plans for your own entrepreneurship" });
    }

    const businessPlan = await prisma.businessPlan.findFirst({
      where: { entrepreneurshipId: entrepreneurshipId as string },
      include: {
        entrepreneurship: {
          select: {
            id: true,
            name: true,
            category: true,
            businessStage: true
          }
        }
      }
    });

    if (!businessPlan) {
      return res.status(404).json({ message: "Business plan not found for this entrepreneurship" });
    }

    return res.json(businessPlan);
  } catch (error: any) {
    console.error("Error getting business plan by entrepreneurship:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/**
 * @swagger
 * /businessplan/simulator:
 *   post:
 *     summary: Save comprehensive business plan simulator data
 *     tags: [Business Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entrepreneurshipId:
 *                 type: string
 *                 description: ID of existing entrepreneurship (optional)
 *               entrepreneurshipData:
 *                 type: object
 *                 description: New entrepreneurship data (if creating new)
 *               tripleImpactAssessment:
 *                 type: object
 *                 description: Triple impact assessment data
 *               executiveSummary:
 *                 type: string
 *               businessDescription:
 *                 type: string
 *               marketAnalysis:
 *                 type: string
 *               competitiveAnalysis:
 *                 type: string
 *               marketingPlan:
 *                 type: string
 *               operationalPlan:
 *                 type: string
 *               managementTeam:
 *                 type: string
 *               financialProjections:
 *                 type: object
 *               riskAnalysis:
 *                 type: string
 *               businessModelCanvas:
 *                 type: object
 *               financialCalculator:
 *                 type: object
 *               currentStep:
 *                 type: number
 *               completionPercentage:
 *                 type: number
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Business plan simulator data saved successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 */
export async function saveBusinessPlanSimulator(req: Request, res: Response) {
  try {
    console.log('=== BusinessPlanSimulator Debug ===');
    console.log('Headers:', req.headers);
    console.log('User from request:', (req as any).user);
    
    const user = (req as any).user;
    
    if (!user) {
      console.log('❌ No user found in request');
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log('✅ User authenticated:', user);
    console.log('User role:', user.role);
    console.log('User type:', user.type);

    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    const {
      entrepreneurshipId,
      entrepreneurshipData,
      tripleImpactAssessment,
      executiveSummary,
      businessDescription, // Frontend field -> maps to executiveSummary if empty
      marketAnalysis,
      competitiveAnalysis,
      marketingPlan, // Frontend field -> maps to marketingStrategy
      operationalPlan,
      managementTeam,
      financialProjections, // Frontend field -> maps to revenueProjection
      riskAnalysis,
      businessModelCanvas,
      financialCalculator,
      currentStep,
      completionPercentage,
      isCompleted,
      tags,
      isPublic,
      attachments,
      helpResources
    } = req.body;

    // Map frontend fields to backend fields
    const mappedExecutiveSummary = executiveSummary || businessDescription || "";
    const mappedMarketingStrategy = marketingPlan || "";
    const mappedRevenueProjection = financialProjections || null;
    const mappedBusinessDescription = businessDescription || "";
    const mappedMarketingPlan = marketingPlan || "";

    // Validate minimum required fields according to frontend specification
    console.log('🔍 Validating tripleImpactAssessment:', !!tripleImpactAssessment);
    console.log('🔍 Validating executiveSummary:', !!executiveSummary);
    console.log('🔍 Validating isCompleted:', isCompleted);
    
    if (!tripleImpactAssessment) {
      console.log('❌ Validation failed: tripleImpactAssessment missing');
      return res.status(400).json({ 
        error: "Campos requeridos faltantes: tripleImpactAssessment es obligatorio" 
      });
    }

    // For autosave, we allow partial data
    // Only require executiveSummary if the plan is being marked as completed
    if (isCompleted && !executiveSummary) {
      console.log('❌ Validation failed: executiveSummary required for completion');
      return res.status(400).json({ 
        error: "Campos requeridos faltantes: executiveSummary es obligatorio para completar el plan" 
      });
    }

    console.log('✅ Validation passed');

    let finalEntrepreneurshipId = entrepreneurshipId;

    // Handle entrepreneurship creation/update
    console.log('🏢 Entrepreneurship handling:');
    console.log('  - entrepreneurshipData:', !!entrepreneurshipData);
    console.log('  - entrepreneurshipId:', entrepreneurshipId);
    
    if (entrepreneurshipData && !entrepreneurshipId) {
      console.log('📝 Creating new entrepreneurship...');
      // Create new entrepreneurship
      const newEntrepreneurship = await prisma.entrepreneurship.create({
        data: {
          ownerId: user.id,
          name: entrepreneurshipData.name,
          description: entrepreneurshipData.description,
          category: entrepreneurshipData.category,
          subcategory: entrepreneurshipData.subcategory,
          businessStage: entrepreneurshipData.businessStage,
          municipality: entrepreneurshipData.municipality,
          department: entrepreneurshipData.department || "Cochabamba",
          isPublic: isPublic || false
        }
      });
      finalEntrepreneurshipId = newEntrepreneurship.id;
      console.log('✅ New entrepreneurship created:', finalEntrepreneurshipId);
    } else if (entrepreneurshipId) {
      // Verify ownership of existing entrepreneurship
      const existingEntrepreneurship = await prisma.entrepreneurship.findUnique({
        where: { id: entrepreneurshipId },
        select: { id: true, ownerId: true }
      });

      if (!existingEntrepreneurship) {
        return res.status(404).json({ message: "Entrepreneurship not found" });
      }

      if (existingEntrepreneurship.ownerId !== user.id) {
        return res.status(403).json({ message: "Access denied. You can only modify your own entrepreneurship" });
      }

      // Update entrepreneurship if data provided
      if (entrepreneurshipData) {
        await prisma.entrepreneurship.update({
          where: { id: entrepreneurshipId },
          data: {
            name: entrepreneurshipData.name,
            description: entrepreneurshipData.description,
            category: entrepreneurshipData.category,
            subcategory: entrepreneurshipData.subcategory,
            businessStage: entrepreneurshipData.businessStage,
            municipality: entrepreneurshipData.municipality,
            department: entrepreneurshipData.department,
            isPublic: isPublic || false
          }
        });
      }
    } else {
      // Check if user already has any entrepreneurship
      const existingEntrepreneurship = await prisma.entrepreneurship.findFirst({
        where: { ownerId: user.id }
      });

      if (existingEntrepreneurship) {
        console.log('🔄 Using existing entrepreneurship:', existingEntrepreneurship.name);
        finalEntrepreneurshipId = existingEntrepreneurship.id;
      } else {
        console.log('📝 No entrepreneurship data provided, creating default entrepreneurship...');
        // Create a default entrepreneurship for the user
        const defaultEntrepreneurship = await prisma.entrepreneurship.create({
          data: {
            ownerId: user.id,
            name: "Mi Emprendimiento",
            description: "Emprendimiento creado desde el simulador",
            category: "General",
            businessStage: "IDEA",
            municipality: "Cochabamba",
            department: "Cochabamba",
            isPublic: false
          }
        });
        finalEntrepreneurshipId = defaultEntrepreneurship.id;
        console.log('✅ Default entrepreneurship created:', finalEntrepreneurshipId);
      }
    }

    // Calculate completion percentage if not provided
    const calculatedCompletion = completionPercentage || calculateCompletionPercentage({
      tripleImpactAssessment,
      executiveSummary,
      businessDescription,
      marketAnalysis,
      competitiveAnalysis,
      marketingPlan,
      operationalPlan,
      managementTeam,
      financialProjections,
      riskAnalysis,
      businessModelCanvas,
      financialCalculator
    });

    // Analyze triple impact
    const impactAnalysis = analyzeTripleImpact(tripleImpactAssessment);

    // Check if business plan already exists for this user (any entrepreneurship)
    const existingPlan = await prisma.businessPlan.findFirst({
      where: {
        entrepreneurship: {
          ownerId: user.id
        }
      },
      include: {
        entrepreneurship: {
          select: {
            id: true,
            name: true,
            category: true,
            businessStage: true
          }
        }
      }
    });

    let businessPlan;

    if (existingPlan) {
      console.log('🔄 Updating existing business plan:', existingPlan.id);
      console.log('📊 Current entrepreneurship:', existingPlan.entrepreneurship.name);
      
      // Use the existing entrepreneurship ID instead of creating a new one
      finalEntrepreneurshipId = existingPlan.entrepreneurshipId;
      // Update existing plan
      const updateData: any = {
        executiveSummary: mappedExecutiveSummary,
        missionStatement: businessDescription || '',
        marketAnalysis: marketAnalysis || '',
        competitiveAnalysis: competitiveAnalysis || '',
        marketingStrategy: mappedMarketingStrategy,
        operationalPlan: operationalPlan || '',
        riskAnalysis: riskAnalysis || '',
        revenueStreams: mappedRevenueProjection?.revenueStreams || [],
        initialInvestment: mappedRevenueProjection?.startupCosts || 0,
        monthlyExpenses: mappedRevenueProjection?.monthlyExpenses || 0,
        breakEvenPoint: mappedRevenueProjection?.breakEvenMonth || 0,
        tripleImpactAssessment: tripleImpactAssessment,
        isCompleted: isCompleted || false,
        lastSection: getLastSection(currentStep),
        completionPercentage: calculatedCompletion
      };

      if (managementTeam) {
        updateData.managementTeam = { team: managementTeam };
      }
      if (businessModelCanvas) {
        updateData.businessModelCanvas = businessModelCanvas;
      }
      if (financialProjections) {
        updateData.costStructure = {
          startupCosts: financialProjections.startupCosts || 0,
          monthlyExpenses: financialProjections.monthlyExpenses || 0,
          breakEvenMonth: financialProjections.breakEvenMonth || 0
        };
      }
      if (financialCalculator) {
        updateData.revenueProjection = {
          monthlyRevenue: financialCalculator.monthlyRevenue || 0,
          cashFlowProjection: financialCalculator.cashFlowProjection || []
        };
      }

      businessPlan = await prisma.businessPlan.update({
        where: { entrepreneurshipId: finalEntrepreneurshipId },
        data: updateData,
        include: {
          entrepreneurship: {
            select: {
              id: true,
              name: true,
              category: true,
              businessStage: true
            }
          }
        }
      });
    } else {
      // Create new plan
      const createData: any = {
        entrepreneurshipId: finalEntrepreneurshipId,
        executiveSummary: mappedExecutiveSummary,
        missionStatement: businessDescription || '',
        marketAnalysis: marketAnalysis || '',
        competitiveAnalysis: competitiveAnalysis || '',
        marketingStrategy: mappedMarketingStrategy,
        operationalPlan: operationalPlan || '',
        riskAnalysis: riskAnalysis || '',
        revenueStreams: mappedRevenueProjection?.revenueStreams || [],
        initialInvestment: mappedRevenueProjection?.startupCosts || 0,
        monthlyExpenses: mappedRevenueProjection?.monthlyExpenses || 0,
        breakEvenPoint: mappedRevenueProjection?.breakEvenMonth || 0,
        tripleImpactAssessment: tripleImpactAssessment,
        isCompleted: isCompleted || false,
        lastSection: getLastSection(currentStep),
        completionPercentage: calculatedCompletion
      };

      if (managementTeam) {
        createData.managementTeam = { team: managementTeam };
      }
      if (businessModelCanvas) {
        createData.businessModelCanvas = businessModelCanvas;
      }
      if (financialProjections) {
        createData.costStructure = {
          startupCosts: financialProjections.startupCosts || 0,
          monthlyExpenses: financialProjections.monthlyExpenses || 0,
          breakEvenMonth: financialProjections.breakEvenMonth || 0
        };
      }
      if (financialCalculator) {
        createData.revenueProjection = {
          monthlyRevenue: financialCalculator.monthlyRevenue || 0,
          cashFlowProjection: financialCalculator.cashFlowProjection || []
        };
      }

      businessPlan = await prisma.businessPlan.create({
        data: createData,
        include: {
          entrepreneurship: {
            select: {
              id: true,
              name: true,
              category: true,
              businessStage: true
            }
          }
        }
      });
    }

    // Calculate next recommended step based on frontend specification
    const nextRecommendedStep = getNextRecommendedStep(currentStep, calculatedCompletion);

    return res.status(201).json({
      success: true,
      data: {
        businessPlanId: businessPlan.id,
        entrepreneurshipId: finalEntrepreneurshipId,
        message: "Plan de negocios guardado exitosamente",
        completionPercentage: calculatedCompletion,
        nextRecommendedStep,
        impactAnalysis
      }
    });

  } catch (error: any) {
    console.error("Error saving business plan simulator:", error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
}

// Helper functions
function calculateCompletionPercentage(data: any): number {
  const sections = [
    'tripleImpactAssessment',
    'executiveSummary',
    'businessDescription',
    'marketAnalysis',
    'competitiveAnalysis',
    'marketingPlan',
    'operationalPlan',
    'managementTeam',
    'financialProjections',
    'riskAnalysis',
    'businessModelCanvas',
    'financialCalculator'
  ];

  let completedSections = 0;
  sections.forEach(section => {
    if (data[section]) {
      if (typeof data[section] === 'string' && data[section].trim().length > 0) {
        completedSections++;
      } else if (typeof data[section] === 'object') {
        // For objects, check if they have meaningful content
        if (section === 'tripleImpactAssessment') {
          const tia = data[section];
          const hasContent = tia.problemSolved?.trim() || 
                           tia.beneficiaries?.trim() || 
                           tia.resourcesUsed?.trim() || 
                           tia.communityInvolvement?.trim() || 
                           tia.longTermImpact?.trim();
          if (hasContent) completedSections++;
        } else if (section === 'financialProjections') {
          const fp = data[section];
          const hasContent = fp.startupCosts > 0 || 
                           fp.monthlyRevenue > 0 || 
                           fp.monthlyExpenses > 0 || 
                           fp.revenueStreams?.length > 0;
          if (hasContent) completedSections++;
        } else if (section === 'businessModelCanvas') {
          const bmc = data[section];
          const hasContent = Object.values(bmc).some(value => 
            typeof value === 'string' && value.trim().length > 0
          );
          if (hasContent) completedSections++;
        } else if (section === 'financialCalculator') {
          const fc = data[section];
          const hasContent = fc.initialInvestment > 0 || 
                           fc.monthlyRevenue > 0 || 
                           fc.cashFlowProjection?.length > 0;
          if (hasContent) completedSections++;
        } else {
          // For other objects, check if they have any non-empty string values
          const hasContent = Object.values(data[section]).some(value => 
            typeof value === 'string' && value.trim().length > 0
          );
          if (hasContent) completedSections++;
        }
      }
    }
  });

  return Math.round((completedSections / sections.length) * 100);
}

function analyzeTripleImpact(tripleImpactAssessment: any) {
  const analysis: {
    economic: boolean;
    social: boolean;
    environmental: boolean;
    impactScore: number;
    recommendations: string[];
  } = {
    economic: false,
    social: false,
    environmental: false,
    impactScore: 0,
    recommendations: []
  };

  // Analysis based on frontend specification
  const text = JSON.stringify(tripleImpactAssessment).toLowerCase();
  
  const economic = text.includes('trabajo') || 
                   text.includes('empleo') || 
                   text.includes('ingresos') || 
                   text.includes('finanzas') || 
                   text.includes('rentabilidad') ||
                   text.includes('económico');

  const social = text.includes('comunidad') || 
                 text.includes('personas') || 
                 text.includes('sociedad') || 
                 text.includes('familias') || 
                 text.includes('beneficiarios') ||
                 text.includes('social');

  const environmental = text.includes('sostenible') || 
                        text.includes('medio ambiente') || 
                        text.includes('verde') || 
                        text.includes('recicl') || 
                        text.includes('ambiental') ||
                        text.includes('ecológico');

  analysis.economic = economic;
  analysis.social = social;
  analysis.environmental = environmental;
  analysis.impactScore = [economic, social, environmental].filter(Boolean).length * 33.33;
  
  // Generate recommendations based on frontend specification
  if (!economic) {
    analysis.recommendations.push('Considera el impacto económico de tu emprendimiento');
  }
  if (!social) {
    analysis.recommendations.push('Evalúa el impacto social en la comunidad');
  }
  if (!environmental) {
    analysis.recommendations.push('Analiza el impacto ambiental de tu negocio');
  }

  return analysis;
}

function getLastSection(currentStep: number): string {
  const sections = [
    'triple_impact_assessment',
    'executive_summary',
    'business_description',
    'market_analysis',
    'competitive_analysis',
    'marketing_plan',
    'operational_plan',
    'financial_projections',
    'risk_analysis',
    'business_model_canvas'
  ];
  
  return sections[currentStep] || 'executive_summary';
}

function getNextRecommendedStep(currentStep: number, completionPercentage: number): number {
  // Based on frontend specification
  const sections = [
    'tripleImpactAssessment',
    'executiveSummary',
    'businessDescription', 
    'marketAnalysis',
    'competitiveAnalysis',
    'marketingPlan',
    'operationalPlan',
    'managementTeam',
    'financialProjections',
    'riskAnalysis'
  ];

  // If completed, return -1
  if (completionPercentage >= 100) return -1;
  
  // Find next incomplete section
  for (let i = currentStep; i < sections.length; i++) {
    // For now, just return the next step
    // In a full implementation, you'd check if the current step is complete
    return i;
  }
  
  return sections.length - 1; // Return last step if all are complete
}
