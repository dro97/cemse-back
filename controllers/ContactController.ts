import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

// Buscar jóvenes para agregar a la red
export async function searchYouthUsers(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { query, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Buscar usuarios jóvenes (excluyendo al usuario actual)
    const whereClause: any = {
      role: "YOUTH",
      userId: { not: user.id }
    };

    if (query) {
      whereClause.OR = [
        { firstName: { contains: query as string, mode: 'insensitive' } },
        { lastName: { contains: query as string, mode: 'insensitive' } },
        { email: { contains: query as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where: whereClause,
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          skills: true,
          interests: true,
          educationLevel: true,
          currentInstitution: true,
          department: true,
          municipality: true,
          createdAt: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.profile.count({ where: whereClause })
    ]);

    // Verificar si ya existe una solicitud de contacto
    const contactStatuses = await Promise.all(
      users.map(async (profile) => {
        const contact = await prisma.contact.findFirst({
          where: {
            OR: [
              { userId: user.id, contactId: profile.userId },
              { userId: profile.userId, contactId: user.id }
            ]
          }
        });
        return {
          userId: profile.userId,
          contactStatus: contact?.status || null,
          contactId: contact?.id || null
        };
      })
    );

    const usersWithContactStatus = users.map((user, index) => ({
      ...user,
      contactStatus: contactStatuses[index].contactStatus,
      contactId: contactStatuses[index].contactId
    }));

    return res.json({
      users: usersWithContactStatus,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error("Error searching youth users:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Enviar solicitud de contacto
export async function sendContactRequest(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { contactId, requestMessage } = req.body;

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    // Verificar que el usuario objetivo existe y es joven
    const targetUser = await prisma.profile.findUnique({
      where: { userId: contactId },
      select: { role: true }
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.role !== "YOUTH") {
      return res.status(400).json({ message: "Can only send contact requests to youth users" });
    }

    // Verificar que no se envíe solicitud a sí mismo
    if (user.id === contactId) {
      return res.status(400).json({ message: "Cannot send contact request to yourself" });
    }

    // Verificar si ya existe una solicitud
    const existingContact = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: user.id, contactId },
          { userId: contactId, contactId: user.id }
        ]
      }
    });

    if (existingContact) {
      return res.status(400).json({ 
        message: "Contact request already exists",
        status: existingContact.status
      });
    }

    // Crear la solicitud de contacto
    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        contactId,
        requestMessage: requestMessage || null
      },
      include: {
        contact: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    return res.status(201).json({
      message: "Contact request sent successfully",
      contact
    });
  } catch (error: any) {
    console.error("Error sending contact request:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Obtener solicitudes de contacto recibidas
export async function getReceivedContactRequests(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [requests, total] = await Promise.all([
      prisma.contact.findMany({
        where: {
          contactId: user.id,
          status: "PENDING"
        },
        include: {
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              skills: true,
              interests: true,
              educationLevel: true,
              currentInstitution: true,
              department: true,
              municipality: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contact.count({
        where: {
          contactId: user.id,
          status: "PENDING"
        }
      })
    ]);

    return res.json({
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error("Error getting received contact requests:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Aceptar solicitud de contacto
export async function acceptContactRequest(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { contactId } = req.params;

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    // Verificar que la solicitud existe y es para este usuario
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        contactId: user.id,
        status: "PENDING"
      }
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    // Actualizar el estado a aceptado
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { status: "ACCEPTED" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.json({
      message: "Contact request accepted successfully",
      contact: updatedContact
    });
  } catch (error: any) {
    console.error("Error accepting contact request:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Rechazar solicitud de contacto
export async function rejectContactRequest(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { contactId } = req.params;

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    // Verificar que la solicitud existe y es para este usuario
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        contactId: user.id,
        status: "PENDING"
      }
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    // Actualizar el estado a rechazado
    await prisma.contact.update({
      where: { id: contactId },
      data: { status: "REJECTED" }
    });

    return res.json({
      message: "Contact request rejected successfully"
    });
  } catch (error: any) {
    console.error("Error rejecting contact request:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Obtener lista de contactos (conexiones aceptadas)
export async function getContacts(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Obtener contactos donde el usuario es el remitente
    const sentContacts = await prisma.contact.findMany({
      where: {
        userId: user.id,
        status: "ACCEPTED"
      },
      include: {
        contact: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            skills: true,
            interests: true,
            educationLevel: true,
            currentInstitution: true,
            department: true,
            municipality: true,
            createdAt: true
          }
        }
      }
    });

    // Obtener contactos donde el usuario es el destinatario
    const receivedContacts = await prisma.contact.findMany({
      where: {
        contactId: user.id,
        status: "ACCEPTED"
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            skills: true,
            interests: true,
            educationLevel: true,
            currentInstitution: true,
            department: true,
            municipality: true,
            createdAt: true
          }
        }
      }
    });

    // Combinar y formatear los contactos
    const allContacts = [
      ...sentContacts.map(c => ({ ...c.contact, connectionDate: c.createdAt })),
      ...receivedContacts.map(c => ({ ...c.user, connectionDate: c.createdAt }))
    ];

    // Ordenar por fecha de conexión
    allContacts.sort((a, b) => new Date(b.connectionDate).getTime() - new Date(a.connectionDate).getTime());

    // Aplicar paginación
    const total = allContacts.length;
    const contacts = allContacts.slice(skip, skip + Number(limit));

    return res.json({
      contacts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error("Error getting contacts:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Eliminar contacto
export async function removeContact(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { contactId } = req.params;

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    // Buscar la conexión (puede ser en cualquier dirección)
    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: user.id, contactId },
          { userId: contactId, contactId: user.id }
        ],
        status: "ACCEPTED"
      }
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Eliminar la conexión
    await prisma.contact.delete({
      where: { id: contact.id }
    });

    return res.json({
      message: "Contact removed successfully"
    });
  } catch (error: any) {
    console.error("Error removing contact:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Obtener estadísticas de la red
export async function getNetworkStats(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [contactsCount, pendingRequestsCount, sentRequestsCount] = await Promise.all([
      // Contactos aceptados
      prisma.contact.count({
        where: {
          OR: [
            { userId: user.id, status: "ACCEPTED" },
            { contactId: user.id, status: "ACCEPTED" }
          ]
        }
      }),
      // Solicitudes pendientes recibidas
      prisma.contact.count({
        where: {
          contactId: user.id,
          status: "PENDING"
        }
      }),
      // Solicitudes enviadas pendientes
      prisma.contact.count({
        where: {
          userId: user.id,
          status: "PENDING"
        }
      })
    ]);

    return res.json({
      stats: {
        totalContacts: contactsCount,
        pendingRequests: pendingRequestsCount,
        sentRequests: sentRequestsCount
      }
    });
  } catch (error: any) {
    console.error("Error getting network stats:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
