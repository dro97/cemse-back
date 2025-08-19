import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

// Obtener conversaciones del usuario
export async function getConversations(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Buscar conversaciones donde el usuario participa
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          has: user.id
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: Number(limit)
    });

    // Formatear las conversaciones
    const formattedConversations = conversations.map(conversation => {
      const otherParticipantId = conversation.participants.find(id => id !== user.id);
      const lastMessage = conversation.messages[0];
      
      return {
        id: conversation.id,
        otherParticipantId,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          messageType: lastMessage.messageType,
          status: lastMessage.status,
          createdAt: lastMessage.createdAt,
          sender: lastMessage.sender
        } : null,
        unreadCount: conversation.unreadCount,
        updatedAt: conversation.updatedAt
      };
    });

    // Obtener información de los otros participantes
    const otherParticipantIds = formattedConversations
      .map(conv => conv.otherParticipantId)
      .filter(Boolean);

    const participants = await prisma.profile.findMany({
      where: {
        userId: { in: otherParticipantIds as string[] }
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true
      }
    });

    // Combinar información
    const conversationsWithParticipants = formattedConversations.map(conversation => {
      const participant = participants.find(p => p.userId === conversation.otherParticipantId);
      return {
        ...conversation,
        participant
      };
    });

    const total = await prisma.conversation.count({
      where: {
        participants: {
          has: user.id
        }
      }
    });

    return res.json({
      conversations: conversationsWithParticipants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error("Error getting conversations:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Obtener mensajes de una conversación específica
export async function getConversationMessages(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { contactId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    // Verificar que son contactos
    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: user.id, contactId, status: "ACCEPTED" },
          { userId: contactId, contactId: user.id, status: "ACCEPTED" }
        ]
      }
    });

    if (!contact) {
      return res.status(403).json({ message: "You can only message your contacts" });
    }

    // Buscar o crear la conversación
    const participants = [user.id, contactId].sort();
    let conversation = await prisma.conversation.findUnique({
      where: {
        participants
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants
        }
      });
    }

    // Obtener mensajes
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.message.count({
      where: {
        conversationId: conversation.id
      }
    });

    // Marcar mensajes como leídos si el usuario es el receptor
    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        receiverId: user.id,
        status: { not: "READ" }
      },
      data: {
        status: "READ",
        readAt: new Date()
      }
    });

    // Actualizar contador de no leídos
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { unreadCount: 0 }
    });

    return res.json({
      conversationId: conversation.id,
      messages: messages.reverse(), // Ordenar cronológicamente
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error("Error getting conversation messages:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Enviar mensaje
export async function sendMessage(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { receiverId, content, messageType = "TEXT" } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver ID and content are required" });
    }

    // Verificar que son contactos
    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: user.id, contactId: receiverId, status: "ACCEPTED" },
          { userId: receiverId, contactId: user.id, status: "ACCEPTED" }
        ]
      }
    });

    if (!contact) {
      return res.status(403).json({ message: "You can only message your contacts" });
    }

    // Buscar o crear la conversación
    const participants = [user.id, receiverId].sort();
    let conversation = await prisma.conversation.findUnique({
      where: {
        participants
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants
        }
      });
    }

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        receiverId,
        content,
        messageType,
        status: "SENT"
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Actualizar la conversación
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageContent: content,
        lastMessageTime: new Date(),
        unreadCount: {
          increment: 1
        },
        updatedAt: new Date()
      }
    });

    return res.status(201).json({
      message: "Message sent successfully",
      data: message
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Marcar mensaje como leído
export async function markMessageAsRead(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    // Verificar que el usuario es el receptor del mensaje
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: user.id
      },
      include: {
        conversation: true
      }
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Marcar como leído
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        status: "READ",
        readAt: new Date()
      }
    });

    // Actualizar contador de no leídos en la conversación
    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: {
        unreadCount: {
          decrement: 1
        }
      }
    });

    return res.json({
      message: "Message marked as read",
      data: updatedMessage
    });
  } catch (error: any) {
    console.error("Error marking message as read:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Obtener estadísticas de mensajería
export async function getMessagingStats(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [totalConversations, totalMessages, unreadMessages] = await Promise.all([
      // Total de conversaciones
      prisma.conversation.count({
        where: {
          participants: {
            has: user.id
          }
        }
      }),
      // Total de mensajes enviados y recibidos
      prisma.message.count({
        where: {
          OR: [
            { senderId: user.id },
            { receiverId: user.id }
          ]
        }
      }),
      // Mensajes no leídos
      prisma.message.count({
        where: {
          receiverId: user.id,
          status: { not: "READ" }
        }
      })
    ]);

    return res.json({
      stats: {
        totalConversations,
        totalMessages,
        unreadMessages
      }
    });
  } catch (error: any) {
    console.error("Error getting messaging stats:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Eliminar mensaje (solo el remitente puede eliminar)
export async function deleteMessage(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    // Verificar que el usuario es el remitente del mensaje
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id
      }
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found or you don't have permission to delete it" });
    }

    // Eliminar el mensaje
    await prisma.message.delete({
      where: { id: messageId }
    });

    return res.json({
      message: "Message deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
