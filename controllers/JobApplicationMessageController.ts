import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { SenderType, MessageType, MessageStatus } from "@prisma/client";

/**
 * @swagger
 * components:
 *   schemas:
 *     JobApplicationMessage:
 *       type: object
 *       required:
 *         - applicationId
 *         - senderId
 *         - senderType
 *         - content
 *       properties:
 *         id:
 *           type: string
 *         applicationId:
 *           type: string
 *         senderId:
 *           type: string
 *         senderType:
 *           type: string
 *           enum: [COMPANY, APPLICANT]
 *         content:
 *           type: string
 *         messageType:
 *           type: string
 *           enum: [TEXT, FILE, INTERVIEW_INVITE, STATUS_UPDATE]
 *         status:
 *           type: string
 *           enum: [SENT, DELIVERED, READ]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         readAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/jobapplication/{applicationId}/messages:
 *   get:
 *     summary: Get messages for a job application
 *     tags: [Job Application Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job application ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Messages per page
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this application
 *       404:
 *         description: Application not found
 */
export async function getMessages(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { applicationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify application exists and user has access
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          select: { userId: true }
        },
        jobOffer: {
          select: { companyId: true }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user has access to this application
    const isApplicant = user.type === 'user' && application.applicant.userId === user.id;
    const isCompany = user.type === 'company' && application.jobOffer.companyId === user.id;
    const isSuperAdmin = user.role === 'SUPERADMIN';

    if (!isApplicant && !isCompany && !isSuperAdmin) {
      return res.status(403).json({ message: "Not authorized to view this application" });
    }

    // Get messages with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const [messages, total] = await Promise.all([
      prisma.jobApplicationMessage.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: Number(limit),
        include: {
          application: {
            select: {
              applicant: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true
                }
              },
              jobOffer: {
                select: {
                  company: {
                    select: {
                      name: true,
                      email: true,
                      website: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.jobApplicationMessage.count({
        where: { applicationId }
      })
    ]);

    return res.json({
      messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

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
 * /api/jobapplication/{applicationId}/messages:
 *   post:
 *     summary: Send a message for a job application
 *     tags: [Job Application Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [TEXT, FILE, INTERVIEW_INVITE, STATUS_UPDATE]
 *                 default: TEXT
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to send messages for this application
 *       404:
 *         description: Application not found
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { applicationId } = req.params;
    const { content, messageType = 'TEXT' } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Verify application exists and user has access
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          select: { userId: true }
        },
        jobOffer: {
          select: { companyId: true }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user has access to this application
    const isApplicant = user.type === 'user' && application.applicant.userId === user.id;
    const isCompany = user.type === 'company' && application.jobOffer.companyId === user.id;
    const isSuperAdmin = user.role === 'SUPERADMIN';

    if (!isApplicant && !isCompany && !isSuperAdmin) {
      return res.status(403).json({ message: "Not authorized to send messages for this application" });
    }

    // Determine sender type
    const senderType = isApplicant ? SenderType.APPLICANT : SenderType.COMPANY;

    // Create message
    const message = await prisma.jobApplicationMessage.create({
      data: {
        applicationId,
        senderId: user.id,
        senderType,
        content: content.trim(),
        messageType: messageType as MessageType,
        status: MessageStatus.SENT
      },
      include: {
        application: {
          select: {
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            },
            jobOffer: {
              select: {
                company: {
                  select: {
                    name: true,
                    email: true,
                    website: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Emit real-time message (if Socket.IO is available)
    const io = (req.app as any).io;
    if (io) {
      io.to(`application_${applicationId}`).emit('new_message', message);
    }

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
 * /api/jobapplication/{applicationId}/messages/{messageId}/read:
 *   put:
 *     summary: Mark a message as read
 *     tags: [Job Application Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job application ID
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Message not found
 */
export async function markMessageAsRead(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { applicationId, messageId } = req.params;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify message exists and user has access
    const message = await prisma.jobApplicationMessage.findFirst({
      where: { 
        id: messageId,
        applicationId 
      },
      include: {
        application: {
          select: {
            applicant: {
              select: { userId: true }
            },
            jobOffer: {
              select: { companyId: true }
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user has access to this application
    const isApplicant = user.type === 'user' && message.application.applicant.userId === user.id;
    const isCompany = user.type === 'company' && message.application.jobOffer.companyId === user.id;
    const isSuperAdmin = user.role === 'SUPERADMIN';

    if (!isApplicant && !isCompany && !isSuperAdmin) {
      return res.status(403).json({ message: "Not authorized to access this message" });
    }

    // Only mark as read if the user is the receiver (not the sender)
    const isReceiver = (message.senderType === SenderType.COMPANY && isApplicant) || 
                      (message.senderType === SenderType.APPLICANT && isCompany);

    if (!isReceiver && !isSuperAdmin) {
      return res.status(403).json({ message: "Can only mark messages as read if you are the receiver" });
    }

    // Update message status
    const updatedMessage = await prisma.jobApplicationMessage.update({
      where: { id: messageId },
      data: { 
        status: MessageStatus.READ,
        readAt: new Date()
      }
    });

    return res.json(updatedMessage);

  } catch (error: any) {
    console.error("Error marking message as read:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /api/jobapplication/messages/unread-count:
 *   get:
 *     summary: Get unread message count for user
 *     tags: [Job Application Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let whereClause: any = {};

    if (user.type === 'user') {
      // For applicants, count messages from companies
      whereClause = {
        application: {
          applicant: {
            userId: user.id
          }
        },
        senderType: SenderType.COMPANY,
        status: {
          not: MessageStatus.READ
        }
      };
    } else if (user.type === 'company') {
      // For companies, count messages from applicants
      whereClause = {
        application: {
          jobOffer: {
            companyId: user.id
          }
        },
        senderType: SenderType.APPLICANT,
        status: {
          not: MessageStatus.READ
        }
      };
    }

    const unreadCount = await prisma.jobApplicationMessage.count({
      where: whereClause
    });

    return res.json({ unreadCount });

  } catch (error: any) {
    console.error("Error getting unread count:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
