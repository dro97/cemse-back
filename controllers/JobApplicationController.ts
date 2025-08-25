import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { ApplicationStatus } from "@prisma/client";
import { uploadToMinio, BUCKETS } from '../lib/minio';

export async function listJobApplications(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    // Build where clause based on user type
    let whereClause: any = {};
    
    // If user is a company, only show applications for their job offers
    if (user && user.type === 'company') {
      whereClause.jobOffer = {
        companyId: user.id
      };
    }
    
    // If user is a regular user (youth, adolescent), only show their own applications
    if (user && user.type === 'user') {
      whereClause.applicantId = user.id;
    }
    
    const items = await prisma.jobApplication.findMany({
      where: whereClause,
      include: {
        jobOffer: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                website: true,
                address: true
              }
            }
          }
        },
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
    });
    
    return res.json({
      items,
      total: items.length
    });
  } catch (error: any) {
    console.error("Error listing job applications:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function getJobApplication(req: Request, res: Response): Promise<Response> {
  try {
    const item = await prisma.jobApplication.findUnique({
      where: { id: req.params['id'] || '' as string },
      include: {
        jobOffer: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true
          }
        },
        questionAnswers: {
          include: {
            question: true
          }
        }
        // TODO: Uncomment after Prisma client regeneration
        // messages: {
        //   orderBy: {
        //     createdAt: 'asc'
        //   }
        // }
      }
    });
    
    if (!item) {
      return res.status(404).json({ message: "Job application not found" });
    }
    
    return res.json(item);
  } catch (error: any) {
    console.error("Error getting job application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function createJobApplication(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    console.log("Job application attempt:", { 
      user: user ? { id: user.id, type: user.type, role: user.role } : null,
      headers: req.headers.authorization ? "Bearer token present" : "No Bearer token"
    });
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only regular users (youth, adolescents) can create job applications
    if (user.type !== 'user') {
      console.log("User type check failed:", { userType: user.type, userId: user.id, userRole: user.role });
      return res.status(403).json({ 
        message: "Only regular users can create job applications",
        debug: { userType: user.type, userRole: user.role }
      });
    }
    
    const { jobOfferId, coverLetter, cvUrl, coverLetterUrl, message, questionAnswers, status } = req.body;
    
    // Mapear status del frontend a valores válidos del enum
    let applicationStatus = 'SENT'; // valor por defecto
    if (status) {
      switch (status.toUpperCase()) {
        case 'PENDING':
        case 'SENT':
          applicationStatus = 'SENT';
          break;
        case 'UNDER_REVIEW':
          applicationStatus = 'UNDER_REVIEW';
          break;
        case 'PRE_SELECTED':
          applicationStatus = 'PRE_SELECTED';
          break;
        case 'REJECTED':
          applicationStatus = 'REJECTED';
          break;
        case 'HIRED':
          applicationStatus = 'HIRED';
          break;
        default:
          applicationStatus = 'SENT';
      }
    }
    const cvFile = (req.files as any)?.cvFile?.[0];
    const coverLetterFile = (req.files as any)?.coverLetterFile?.[0];
    
    if (!jobOfferId) {
      return res.status(400).json({ message: "Job offer ID is required" });
    }
    
    // Check if job offer exists and is active
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobOfferId }
    });
    
    if (!jobOffer) {
      return res.status(404).json({ message: "Job offer not found" });
    }
    
    if (!jobOffer.isActive || jobOffer.status !== 'ACTIVE') {
      return res.status(400).json({ message: "Job offer is not available for applications" });
    }
    
    // Check if user already applied to this job offer
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        applicantId_jobOfferId: {
          applicantId: user.id,
          jobOfferId: jobOfferId
        }
      }
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this job offer" });
    }
    
    // Process uploaded files or URLs
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
      // Use URL provided in body
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
      // Use URL provided in body
      finalCoverLetterUrl = coverLetterUrl;
    }

    const item = await prisma.jobApplication.create({
      data: {
        applicantId: user.id,
        jobOfferId: jobOfferId,
        coverLetter: message || coverLetter || null,
        cvFile: finalCvUrl,
        coverLetterFile: finalCoverLetterUrl,
        status: applicationStatus as ApplicationStatus
      },
      include: {
        jobOffer: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    // Process question answers if provided
    if (questionAnswers && Array.isArray(questionAnswers) && questionAnswers.length > 0) {
      const questionAnswerData = questionAnswers.map((qa: any) => ({
        applicationId: item.id,
        questionId: qa.questionId,
        answer: qa.answer
      }));
      
      await prisma.jobQuestionAnswer.createMany({
        data: questionAnswerData
      });
    }
    
    // Update applications count on job offer
    await prisma.jobOffer.update({
      where: { id: jobOfferId },
      data: {
        applicationsCount: {
          increment: 1
        }
      }
    });
    
    return res.status(201).json(item);
  } catch (error: any) {
    console.error("Error creating job application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function updateJobApplication(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { id } = req.params;
    const { status, notes, rating } = req.body;
    
    // Find the application
    const application = await prisma.jobApplication.findUnique({
      where: { id: id as string },
      include: {
        jobOffer: true
      }
    });
    
    if (!application) {
      return res.status(404).json({ message: "Job application not found" });
    }
    
    // Check permissions
    const canUpdate = 
      user.type === 'company' && (application as any).jobOffer.companyId === user.id ||
      user.type === 'user' && application.applicantId === user.id ||
      user.role === 'SUPERADMIN';
    
    if (!canUpdate) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const updateData: any = {};
    
    // Companies can update status, notes, rating
    if (user.type === 'company' || user.role === 'SUPERADMIN') {
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (rating !== undefined) updateData.rating = rating;
      if (status && status !== 'SENT') {
        updateData.reviewedAt = new Date();
      }
    }
    
    // Users can only update their own cover letter and CV
    if (user.type === 'user') {
      if (req.body.coverLetter !== undefined) updateData.coverLetter = req.body.coverLetter;
      if (req.body.cvUrl !== undefined) updateData.cvUrl = req.body.cvUrl;
    }
    
    const item = await prisma.jobApplication.update({
      where: { id: id as string },
      data: updateData,
      include: {
        jobOffer: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    return res.json(item);
  } catch (error: any) {
    console.error("Error updating job application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function getApplicationsByJobOffer(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { jobOfferId } = req.query;
    
    if (!jobOfferId) {
      return res.status(400).json({ message: "Job offer ID is required" });
    }
    
    // Build where clause based on user type
    let whereClause: any = {
      jobOfferId: jobOfferId as string
    };
    
    // If user is a company, only show applications for their job offers
    if (user && user.type === 'company') {
      whereClause.jobOffer = {
        companyId: user.id
      };
    }
    
    // If user is a regular user (youth, adolescent), only show their own applications
    if (user && user.type === 'user') {
      whereClause.applicantId = user.id;
    }
    
    const items = await prisma.jobApplication.findMany({
      where: whereClause,
      include: {
        jobOffer: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });
    
    return res.json(items);
  } catch (error: any) {
    console.error("Error getting applications by job offer:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function testAuth(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    return res.json({
      message: "Authentication test successful",
      user: user ? {
        id: user.id,
        type: user.type,
        role: user.role,
        username: user.username
      } : null,
      canCreateApplication: user && user.type === 'user'
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteJobApplication(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { id } = req.params;
    
    // Find the application
    const application = await prisma.jobApplication.findUnique({
      where: { id: id as string },
      include: {
        jobOffer: true
      }
    });
    
    if (!application) {
      return res.status(404).json({ message: "Job application not found" });
    }
    
    // Check permissions
    const canDelete = 
      user.type === 'user' && application.applicantId === user.id ||
      user.role === 'SUPERADMIN';
    
    if (!canDelete) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await prisma.jobApplication.delete({
      where: { id: id as string }
    });
    
    // Update applications count on job offer
    await prisma.jobOffer.update({
      where: { id: application.jobOfferId },
      data: {
        applicationsCount: {
          decrement: 1
        }
      }
    });
    
    return res.json({ message: "Job application deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting job application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /api/jobapplication/check-application/{jobOfferId}:
 *   get:
 *     summary: Check if user has already applied to a specific job offer
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobOfferId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job offer ID to check
 *     responses:
 *       200:
 *         description: Application status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasApplied:
 *                   type: boolean
 *                 application:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job offer not found
 */
export async function checkApplicationStatus(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { jobOfferId } = req.params;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Only regular users can check their application status
    if (user.type !== 'user') {
      return res.status(403).json({ message: "Only users can check application status" });
    }

    // Check if job offer exists
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobOfferId as string }
    });

    if (!jobOffer) {
      return res.status(404).json({ message: "Job offer not found" });
    }

    // Check if user has already applied
    const application = await prisma.jobApplication.findFirst({
      where: {
        applicantId: user.id,
        jobOfferId: jobOfferId as string
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        reviewedAt: true,
        notes: true,
        rating: true
      }
    });

    return res.json({
      hasApplied: !!application,
      application: application
    });

  } catch (error: any) {
    console.error("Error checking application status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /api/jobapplication/{id}/status:
 *   put:
 *     summary: Update job application status with decision reason
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - decisionReason
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [UNDER_REVIEW, PRE_SELECTED, REJECTED, HIRED]
 *                 description: New status for the application
 *               decisionReason:
 *                 type: string
 *                 description: Reason for acceptance or rejection
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Optional rating (1-5)
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 application:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Application not found
 *       400:
 *         description: Invalid input data
 */
export async function updateApplicationStatus(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status, decisionReason, rating } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate required fields
    if (!status || !decisionReason) {
      return res.status(400).json({ 
        message: "Status and decision reason are required" 
      });
    }

    // Validate status
    const validStatuses = ['UNDER_REVIEW', 'PRE_SELECTED', 'REJECTED', 'HIRED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be one of: " + validStatuses.join(', ') 
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
    }

    // Find the application
    const application = await prisma.jobApplication.findUnique({
      where: { id: id as string },
      include: {
        jobOffer: {
          include: {
            company: true
          }
        },
        applicant: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: "Job application not found" });
    }

    // Check permissions - only company owners can update status
    if (user.type !== 'company' || (application as any).jobOffer.companyId !== user.id) {
      return res.status(403).json({ message: "Access denied. Only company owners can update application status" });
    }

    // Update the application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: id as string },
      data: {
        status: status as ApplicationStatus,
        decisionReason: decisionReason,
        rating: rating || null,
        reviewedAt: new Date()
      },
      include: {
        jobOffer: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Create a message to notify the applicant
    await prisma.jobApplicationMessage.create({
      data: {
        applicationId: id as string,
        senderId: user.id,
        senderType: 'COMPANY',
        content: `Tu aplicación ha sido ${getStatusMessage(status)}. Motivo: ${decisionReason}`,
        messageType: 'TEXT',
        status: 'SENT'
      }
    });

    return res.json({
      message: "Application status updated successfully",
      application: updatedApplication
    });

  } catch (error: any) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Helper function to get user-friendly status messages
function getStatusMessage(status: string): string {
  switch (status) {
    case 'UNDER_REVIEW':
      return 'puesta en revisión';
    case 'PRE_SELECTED':
      return 'preseleccionada';
    case 'REJECTED':
      return 'rechazada';
    case 'HIRED':
      return 'aceptada';
    default:
      return 'actualizada';
  }
}
