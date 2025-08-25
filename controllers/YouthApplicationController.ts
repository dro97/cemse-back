import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadToMinio, BUCKETS } from '../lib/minio';

// Tipos para TypeScript
type YouthApplicationStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'HIRED';
type YouthMessageSenderType = 'YOUTH' | 'COMPANY';
type CompanyInterestStatus = 'INTERESTED' | 'CONTACTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'NOT_INTERESTED';

/**
 * @swagger
 * components:
 *   schemas:
 *     YouthApplication:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - youthProfileId
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         cvFile:
 *           type: string
 *           nullable: true
 *         coverLetterFile:
 *           type: string
 *           nullable: true
 *         cvUrl:
 *           type: string
 *           nullable: true
 *         coverLetterUrl:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [ACTIVE, PAUSED, CLOSED, HIRED]
 *         isPublic:
 *           type: boolean
 *         viewsCount:
 *           type: integer
 *         applicationsCount:
 *           type: integer
 *         youthProfileId:
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
 * /youth-application:
 *   get:
 *     summary: Get all youth applications
 *     tags: [Youth Applications]
 *     responses:
 *       200:
 *         description: List of all youth applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/YouthApplication'
 */
export async function listYouthApplications(req: Request, res: Response): Promise<Response> {
  try {
    const { status, isPublic, youthProfileId } = req.query;
    
    // Build where clause
    let whereClause: any = {};
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status as YouthApplicationStatus;
    }
    
    // Filter by public status if provided
    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic === 'true';
    }
    
    // Filter by youth profile if provided
    if (youthProfileId) {
      whereClause.youthProfileId = youthProfileId as string;
    }
    
    const items = await prisma.youthApplication.findMany({
      where: whereClause,
      include: {
        youthProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            skills: true,
            educationLevel: true,
            currentDegree: true,
            universityName: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        companyInterests: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                businessSector: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json(items);
  } catch (error: any) {
    console.error("Error listing youth applications:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /youth-application/{id}:
 *   get:
 *     summary: Get a youth application by ID
 *     tags: [Youth Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Youth application ID
 *     responses:
 *       200:
 *         description: Youth application found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YouthApplication'
 *       404:
 *         description: Youth application not found
 */
export async function getYouthApplication(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    
    const item = await prisma.youthApplication.findUnique({
      where: { id },
      include: {
        youthProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            skills: true,
            educationLevel: true,
            currentDegree: true,
            universityName: true,
            workExperience: true,
            languages: true,
            projects: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        companyInterests: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                businessSector: true,
                email: true,
                website: true
              }
            }
          }
        }
      }
    });
    
    if (!item) {
      return res.status(404).json({ message: "Youth application not found" });
    }
    
    // Increment views count
    await prisma.youthApplication.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1
        }
      }
    });
    
    return res.json(item);
  } catch (error: any) {
    console.error("Error getting youth application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /youth-application:
 *   post:
 *     summary: Create a new youth application
 *     tags: [Youth Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - youthProfileId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               youthProfileId:
 *                 type: string
 *               cvFile:
 *                 type: string
 *                 format: binary
 *               coverLetterFile:
 *                 type: string
 *                 format: binary
 *               cvUrl:
 *                 type: string
 *               coverLetterUrl:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Youth application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YouthApplication'
 *       400:
 *         description: Invalid input data
 */
export async function createYouthApplication(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only regular users (youth, adolescents) can create youth applications
    if (user.type !== 'user') {
      return res.status(403).json({ 
        message: "Only regular users can create youth applications"
      });
    }
    
    // Extract data from request - handle both multipart and JSON
    const title = req.body?.title;
    const description = req.body?.description;
    const youthProfileId = req.body?.youthProfileId;
    const cvUrl = req.body?.cvUrl;
    const coverLetterUrl = req.body?.coverLetterUrl;
    const isPublic = req.body?.isPublic || 'true';
    
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers['content-type']);
    console.log('Request files:', req.files);
    
    console.log('Received data:', {
      title,
      description,
      youthProfileId,
      isPublic,
      bodyKeys: Object.keys(req.body || {}),
      filesKeys: req.files ? Object.keys(req.files) : 'No files'
    });
    
    if (!title || !description || !youthProfileId) {
      console.log('Validation failed:', { title, description, youthProfileId });
      console.log('Full request body for debugging:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({ 
        message: "Title, description, and youthProfileId are required",
        received: { title, description, youthProfileId },
        debug: {
          bodyKeys: Object.keys(req.body || {}),
          contentType: req.headers['content-type'],
          hasFiles: !!req.files
        }
      });
    }
    
    // Verify youth profile exists and belongs to the authenticated user
    console.log('Looking for profile with userId:', youthProfileId);
    console.log('Authenticated user id:', user.id);
    
    const youthProfile = await prisma.profile.findUnique({
      where: { userId: youthProfileId }
    });
    
    console.log('Found profile:', youthProfile ? 'Yes' : 'No');
    
    if (!youthProfile) {
      return res.status(404).json({ 
        message: "Youth profile not found",
        searchedUserId: youthProfileId,
        authenticatedUserId: user.id
      });
    }
    
    if (youthProfile.userId !== user.id) {
      return res.status(403).json({ 
        message: "You can only create applications for your own profile",
        profileUserId: youthProfile.userId,
        authenticatedUserId: user.id
      });
    }
    
    // Process uploaded files
    console.log('Files received:', req.files);
    console.log('Files type:', typeof req.files);
    console.log('Files keys:', req.files ? Object.keys(req.files) : 'No files');
    
    let cvFile = null;
    let coverLetterFile = null;
    
    // Handle files when using multer.fields()
    if (req.files) {
      cvFile = (req.files as any)?.cvFile?.[0] || null;
      coverLetterFile = (req.files as any)?.coverLetterFile?.[0] || null;
    }
    
    console.log('Found files:', {
      cvFile: cvFile ? cvFile.originalname : 'Not found',
      coverLetterFile: coverLetterFile ? coverLetterFile.originalname : 'Not found'
    });
    
    let finalCvUrl = null;
    let finalCoverLetterUrl = null;

    // Priority: uploaded files > URLs from body
    if (cvFile) {
      const fileName = `cv_${user.id}_${Date.now()}.${cvFile.originalname.split('.').pop()}`;
      finalCvUrl = await uploadToMinio(
        BUCKETS.DOCUMENTS,
        fileName,
        cvFile.buffer,
        cvFile.mimetype
      );
    } else if (cvUrl) {
      finalCvUrl = cvUrl;
    }

    if (coverLetterFile) {
      const fileName = `cover_${user.id}_${Date.now()}.${coverLetterFile.originalname.split('.').pop()}`;
      finalCoverLetterUrl = await uploadToMinio(
        BUCKETS.DOCUMENTS,
        fileName,
        coverLetterFile.buffer,
        coverLetterFile.mimetype
      );
    } else if (coverLetterUrl) {
      finalCoverLetterUrl = coverLetterUrl;
    }

    const item = await prisma.youthApplication.create({
      data: {
        title,
        description,
        youthProfileId,
        cvFile: finalCvUrl,
        coverLetterFile: finalCoverLetterUrl,
        cvUrl: finalCvUrl,
        coverLetterUrl: finalCoverLetterUrl,
        isPublic: isPublic === 'true'
      },
      include: {
        youthProfile: {
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
    
    return res.status(201).json(item);
  } catch (error: any) {
    console.error("Error creating youth application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /youth-application/{id}:
 *   put:
 *     summary: Update a youth application
 *     tags: [Youth Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Youth application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/YouthApplication'
 *     responses:
 *       200:
 *         description: Youth application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YouthApplication'
 *       404:
 *         description: Youth application not found
 */
export async function updateYouthApplication(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { title, description, status, isPublic, cvUrl, coverLetterUrl } = req.body;
    
    // Check if application exists and belongs to the user
    const existingApplication = await prisma.youthApplication.findUnique({
      where: { id },
      include: {
        youthProfile: true
      }
    });
    
    if (!existingApplication) {
      return res.status(404).json({ message: "Youth application not found" });
    }
    
    if (existingApplication.youthProfile.userId !== user.id) {
      return res.status(403).json({ message: "You can only update your own applications" });
    }
    
    const item = await prisma.youthApplication.update({
      where: { id },
      data: {
        title,
        description,
        status: status as YouthApplicationStatus,
        isPublic,
        cvUrl,
        coverLetterUrl
      },
      include: {
        youthProfile: {
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
    
    return res.json(item);
  } catch (error: any) {
    console.error("Error updating youth application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /youth-application/{id}:
 *   delete:
 *     summary: Delete a youth application
 *     tags: [Youth Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Youth application ID
 *     responses:
 *       200:
 *         description: Youth application deleted successfully
 *       404:
 *         description: Youth application not found
 */
export async function deleteYouthApplication(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if application exists and belongs to the user
    const existingApplication = await prisma.youthApplication.findUnique({
      where: { id },
      include: {
        youthProfile: true
      }
    });
    
    if (!existingApplication) {
      return res.status(404).json({ message: "Youth application not found" });
    }
    
    if (existingApplication.youthProfile.userId !== user.id) {
      return res.status(403).json({ message: "You can only delete your own applications" });
    }
    
    await prisma.youthApplication.delete({
      where: { id }
    });
    
    return res.json({ message: "Youth application deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting youth application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /youth-application/{id}/message:
 *   post:
 *     summary: Send a message to a youth application
 *     tags: [Youth Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Youth application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       404:
 *         description: Youth application not found
 */
export async function sendMessage(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    // Check if application exists
    const application = await prisma.youthApplication.findUnique({
      where: { id }
    });
    
    if (!application) {
      return res.status(404).json({ message: "Youth application not found" });
    }
    
    // Determine sender type
    let senderType: YouthMessageSenderType;
    if (user.type === 'company') {
      senderType = 'COMPANY';
    } else {
      senderType = 'YOUTH';
    }
    
    const message = await prisma.youthApplicationMessage.create({
      data: {
        applicationId: id,
        senderId: user.id,
        senderType,
        content
      },
      include: {
        application: {
          include: {
            youthProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
    
    return res.status(201).json(message);
  } catch (error: any) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /youth-application/{id}/messages:
 *   get:
 *     summary: Get messages for a youth application
 *     tags: [Youth Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Youth application ID
 *     responses:
 *       200:
 *         description: List of messages
 *       404:
 *         description: Youth application not found
 */
export async function getMessages(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if application exists
    const application = await prisma.youthApplication.findUnique({
      where: { id }
    });
    
    if (!application) {
      return res.status(404).json({ message: "Youth application not found" });
    }
    
    const messages = await prisma.youthApplicationMessage.findMany({
      where: { applicationId: id },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return res.json(messages);
  } catch (error: any) {
    console.error("Error getting messages:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /youth-application/{id}/company-interest:
 *   post:
 *     summary: Express company interest in a youth application
 *     tags: [Youth Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Youth application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - status
 *             properties:
 *               companyId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [INTERESTED, CONTACTED, INTERVIEW_SCHEDULED, HIRED, NOT_INTERESTED]
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company interest recorded successfully
 *       404:
 *         description: Youth application not found
 */
export async function expressCompanyInterest(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const { companyId, status, message } = req.body;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only companies can express interest
    if (user.type !== 'company') {
      return res.status(403).json({ message: "Only companies can express interest" });
    }
    
    // Check if application exists
    const application = await prisma.youthApplication.findUnique({
      where: { id }
    });
    
    if (!application) {
      return res.status(404).json({ message: "Youth application not found" });
    }
    
    // Check if company already expressed interest
    const existingInterest = await prisma.youthApplicationCompanyInterest.findUnique({
      where: {
        applicationId_companyId: {
          applicationId: id,
          companyId
        }
      }
    });
    
    if (existingInterest) {
      // Update existing interest
      const updatedInterest = await prisma.youthApplicationCompanyInterest.update({
        where: {
          applicationId_companyId: {
            applicationId: id,
            companyId
          }
        },
        data: {
          status: status as CompanyInterestStatus,
          message
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              businessSector: true
            }
          }
        }
      });
      
      return res.json(updatedInterest);
    } else {
      // Create new interest
      const newInterest = await prisma.youthApplicationCompanyInterest.create({
        data: {
          applicationId: id,
          companyId,
          status: status as CompanyInterestStatus,
          message
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              businessSector: true
            }
          }
        }
      });
      
      // Increment applications count
      await prisma.youthApplication.update({
        where: { id },
        data: {
          applicationsCount: {
            increment: 1
          }
        }
      });
      
      return res.status(201).json(newInterest);
    }
  } catch (error: any) {
    console.error("Error expressing company interest:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /youth-application/{id}/company-interests:
 *   get:
 *     summary: Get company interests for a youth application
 *     tags: [Youth Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Youth application ID
 *     responses:
 *       200:
 *         description: List of company interests
 *       404:
 *         description: Youth application not found
 */
export async function getCompanyInterests(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if application exists
    const application = await prisma.youthApplication.findUnique({
      where: { id }
    });
    
    if (!application) {
      return res.status(404).json({ message: "Youth application not found" });
    }
    
    const interests = await prisma.youthApplicationCompanyInterest.findMany({
      where: { applicationId: id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            businessSector: true,
            email: true,
            website: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json(interests);
  } catch (error: any) {
    console.error("Error getting company interests:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
