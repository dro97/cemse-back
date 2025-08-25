import { Request, Response } from 'express';
import { PrismaClient, EventType, EventCategory, EventStatus, AttendeeStatus, UserRole } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - organizer
 *         - description
 *         - date
 *         - time
 *         - type
 *         - category
 *         - location
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         organizer:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         time:
 *           type: string
 *         registrationDeadline:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           enum: [IN_PERSON, VIRTUAL, HYBRID]
 *         category:
 *           type: string
 *           enum: [NETWORKING, WORKSHOP, CONFERENCE, SEMINAR, TRAINING, FAIR, COMPETITION, HACKATHON, MEETUP, OTHER]
 *         location:
 *           type: string
 *         maxCapacity:
 *           type: integer
 *         price:
 *           type: number
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *         imageUrl:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         agenda:
 *           type: array
 *           items:
 *             type: string
 *         speakers:
 *           type: array
 *           items:
 *             type: string
 *         featured:
 *           type: boolean
 *         viewsCount:
 *           type: integer
 *         attendeesCount:
 *           type: integer
 *         attendanceRate:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *         creator:
 *           $ref: '#/components/schemas/Profile'
 *         attendees:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventAttendee'
 *     EventAttendee:
 *       type: object
 *       required:
 *         - eventId
 *         - attendeeId
 *       properties:
 *         id:
 *           type: string
 *         eventId:
 *           type: string
 *         attendeeId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [REGISTERED, CONFIRMED, ATTENDED, NO_SHOW, CANCELLED]
 *         registeredAt:
 *           type: string
 *           format: date-time
 *         attendedAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         event:
 *           $ref: '#/components/schemas/Event'
 *         attendee:
 *           $ref: '#/components/schemas/Profile'
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with filters
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search events by title or organizer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IN_PERSON, VIRTUAL, HYBRID]
 *         description: Filter by event type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [NETWORKING, WORKSHOP, CONFERENCE, SEMINAR, TRAINING, FAIR, COMPETITION, HACKATHON, MEETUP, OTHER]
 *         description: Filter by event category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *         description: Filter by event status
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured events
 *       - in: query
 *         name: municipality
 *         schema:
 *           type: string
 *         description: Filter events by municipality
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
export async function getEvents(req: Request, res: Response): Promise<Response> {
  try {
    const {
      search,
      type,
      category,
      status,
      featured,
      municipality,
      page = 1,
      limit = 10
    } = req.query;

    const user = (req as any).user;
    const isAdmin = user?.role === UserRole.SUPERADMIN;
    const isMunicipality = user?.type === 'municipality';
    const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user?.role);

    // Construir filtros
    const where: any = {};

    // Solo mostrar eventos publicados a usuarios no admin
    if (!isAdmin && !isMunicipality && !isOrganization) {
      where.status = 'PUBLISHED';
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { organizer: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === 'true';
    
    // Filtrar por municipio si se especifica
    if (municipality) {
      where.creator = {
        municipality: municipality as string
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
                 include: {
           creator: {
             select: {
               id: true,
               firstName: true,
               lastName: true,
               email: true,
               role: true
             }
           },

           attendees: {
            include: {
              attendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { date: 'asc' },
        skip,
        take: Number(limit)
      }),
      prisma.event.count({ where })
    ]);

    // Calcular estadísticas globales (sin filtros para super admin)
    let statsWhere = {};
    
    // Si es super admin, mostrar stats de todos los eventos
    if (isAdmin) {
      statsWhere = {};
    } else {
      // Para otros usuarios, aplicar los mismos filtros que a los eventos
      statsWhere = where;
    }

    const totalEvents = await prisma.event.count({ 
      where: { 
        ...statsWhere,
        status: 'PUBLISHED' 
      } 
    });
    
    const upcomingEvents = await prisma.event.count({
      where: {
        ...statsWhere,
        status: 'PUBLISHED',
        date: { gt: new Date() }
      }
    });
    
    // Calcular total de asistentes basado en los eventos filtrados
    const eventIds = events.map(event => event.id);
    const totalAttendees = eventIds.length > 0 ? await prisma.eventAttendee.count({
      where: { 
        eventId: { in: eventIds },
        status: { in: ['REGISTERED', 'CONFIRMED', 'ATTENDED'] } 
      }
    }) : 0;
    
    const publishedEvents = await prisma.event.count({ 
      where: { 
        ...statsWhere,
        status: 'PUBLISHED' 
      } 
    });
    
    const featuredEvents = await prisma.event.count({ 
      where: { 
        ...statsWhere,
        featured: true, 
        status: 'PUBLISHED' 
      } 
    });

    // Calcular porcentaje de asistencia promedio
    const eventsWithAttendance = await prisma.event.findMany({
      where: { 
        ...statsWhere,
        maxCapacity: { not: null } 
      },
      select: { maxCapacity: true, attendeesCount: true }
    });

    const totalCapacity = eventsWithAttendance.reduce((sum, event) => sum + (event.maxCapacity || 0), 0);
    const totalAttendeesCount = eventsWithAttendance.reduce((sum, event) => sum + event.attendeesCount, 0);
    const averageAttendanceRate = totalCapacity > 0 ? (totalAttendeesCount / totalCapacity) * 100 : 0;

    // Calcular attendanceRate para cada evento
    const eventsWithCalculatedStats = events.map(event => {
      const attendanceRate = event.maxCapacity && event.maxCapacity > 0 
        ? Math.round((event.attendeesCount / event.maxCapacity) * 100)
        : 0;
      
      return {
        ...event,
        attendanceRate
      };
    });

    // Debug logs
    console.log('🔍 DEBUG STATS:', {
      isAdmin,
      totalEvents,
      upcomingEvents,
      totalAttendees,
      publishedEvents,
      featuredEvents,
      eventsCount: events.length,
      totalEventsInDB: await prisma.event.count(),
      publishedEventsInDB: await prisma.event.count({ where: { status: 'PUBLISHED' } })
    });

    return res.json({
      events: eventsWithCalculatedStats,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      statistics: {
        totalEvents,
        upcomingEvents,
        totalAttendees,
        attendanceRate: Math.round(averageAttendanceRate),
        publishedEvents,
        featuredEvents
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
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
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
export async function getEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        attendees: {
          include: {
            attendee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(200).json({ 
        message: 'No hay eventos disponibles',
        event: null,
        statistics: {
          totalAttendees: 0,
          registeredCount: 0,
          confirmedCount: 0,
          attendedCount: 0,
          noShowCount: 0,
          cancelledCount: 0,
          attendanceRate: 0,
          availableSpots: 0,
          isFull: false
        }
      });
    }

    // Verificar permisos de visualización
    const isAdmin = user?.role === UserRole.SUPERADMIN;
    const isMunicipality = user?.type === 'municipality';
    const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user?.role);
    const isCreator = event.createdBy === user?.id;

    if (event.status !== 'PUBLISHED' && !isAdmin && !isMunicipality && !isOrganization && !isCreator) {
      return res.status(403).json({ message: 'No tienes permisos para ver este evento' });
    }

    // Incrementar contador de vistas
    await prisma.event.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    });

    // Calcular estadísticas específicas del evento
    const eventStats = await prisma.eventAttendee.groupBy({
      by: ['status'],
      where: { eventId: id },
      _count: { status: true }
    });

    const registeredCount = eventStats.find(s => s.status === 'REGISTERED')?._count.status || 0;
    const confirmedCount = eventStats.find(s => s.status === 'CONFIRMED')?._count.status || 0;
    const attendedCount = eventStats.find(s => s.status === 'ATTENDED')?._count.status || 0;
    const noShowCount = eventStats.find(s => s.status === 'NO_SHOW')?._count.status || 0;
    const cancelledCount = eventStats.find(s => s.status === 'CANCELLED')?._count.status || 0;

    const totalAttendees = registeredCount + confirmedCount + attendedCount;
    const attendanceRate = event.maxCapacity && event.maxCapacity > 0 ? (totalAttendees / event.maxCapacity) * 100 : 0;

    // Agregar estadísticas al evento
    const eventWithStats = {
      ...event,
      statistics: {
        totalAttendees,
        registeredCount,
        confirmedCount,
        attendedCount,
        noShowCount,
        cancelledCount,
        attendanceRate: Math.round(attendanceRate),
        availableSpots: Math.max(0, (event.maxCapacity || 0) - totalAttendees),
        isFull: totalAttendees >= (event.maxCapacity || 0)
      }
    };

    return res.json(eventWithStats);
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event (SuperAdmin, Municipalities, and Organizations only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - organizer
 *               - description
 *               - date
 *               - time
 *               - type
 *               - category
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               organizer:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *               registrationDeadline:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum: [IN_PERSON, VIRTUAL, HYBRID]
 *               category:
 *                 type: string
 *                 enum: [NETWORKING, WORKSHOP, CONFERENCE, SEMINAR, TRAINING, FAIR, COMPETITION, HACKATHON, MEETUP, OTHER]
 *               location:
 *                 type: string
 *               maxCapacity:
 *                 type: integer
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED]
 *               imageUrl:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               agenda:
 *                 type: array
 *                 items:
 *                   type: string
 *               speakers:
 *                 type: array
 *                 items:
 *                   type: string
 *               featured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid input data
 */
export async function createEvent(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    // Verificar permisos
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;
    const isMunicipality = user.type === 'municipality';
    const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role);

    if (!isSuperAdmin && !isMunicipality && !isOrganization) {
      return res.status(403).json({ message: 'Solo SuperAdmin, Municipios y Organizaciones pueden crear eventos' });
    }

    // Procesar imagen si se subió
    let imageUrl = req.body.imageUrl;
    if ((req as any).uploadedImages && (req as any).uploadedImages.image) {
      // Usar la URL de MinIO si se subió una imagen
      imageUrl = (req as any).uploadedImages.image.url;
    } else if (req.files && (req.files as any).image && (req.files as any).image[0]) {
      // Fallback para archivos locales si no hay MinIO
      const uploadedFile = (req.files as any).image[0];
      imageUrl = `/uploads/${uploadedFile.filename}`;
    }

    const {
      title,
      organizer,
      description,
      date,
      time,
      registrationDeadline,
      type,
      category,
      location,
      maxCapacity,
      price,
      status = 'DRAFT',
      tags = [],
      requirements = [],
      agenda = [],
      speakers = [],
      featured
    } = req.body;

    // El middleware ya convierte featured de string a boolean

    // Validaciones
    if (!title || !organizer || !description || !date || !time || !type || !category || !location) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos' });
    }

    // Determinar el tipo de creador y el ID
    let creatorId = user.id;
    
    if (user.type === 'municipality') {
      // Buscar si ya existe un perfil para este municipio
      let municipalityProfile = await prisma.profile.findFirst({
        where: { 
          role: 'MUNICIPAL_GOVERNMENTS',
          municipality: user.id
        }
      });
      
      if (!municipalityProfile) {
        // Crear un nuevo perfil para el municipio usando el municipalityId como userId
        municipalityProfile = await prisma.profile.create({
          data: {
            userId: user.id, // Usar el municipalityId como userId
            role: 'MUNICIPAL_GOVERNMENTS',
            municipality: user.id,
            firstName: user.username || 'Municipio',
            email: user.username + '@municipality.local'
          }
        });
      }
      
      creatorId = municipalityProfile.userId; // Esto será el municipalityId
    }

    const eventData: any = {
      title,
      organizer,
      description,
      date: new Date(date),
      time,
      type,
      category,
      location,
      status,
      featured,
      createdBy: creatorId,
      tags,
      requirements,
      agenda,
      speakers
    };

    if (registrationDeadline) {
      eventData.registrationDeadline = new Date(registrationDeadline);
    }
    if (maxCapacity) eventData.maxCapacity = maxCapacity;
    if (price !== undefined) eventData.price = price;
    if (imageUrl) eventData.imageUrl = imageUrl;

    // Si el evento se publica, establecer publishedAt
    if (status === 'PUBLISHED') {
      eventData.publishedAt = new Date();
    }

    const event = await prisma.event.create({
      data: eventData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event (Creator, SuperAdmin, Municipalities, and Organizations only)
 *     tags: [Events]
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
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
export async function updateEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

         // Verificar si el evento existe
     const existingEvent = await prisma.event.findUnique({
       where: { id },
       include: { 
         creator: true
       }
     });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificar permisos
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;
    const isMunicipality = user.type === 'municipality';
    const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role);
    const isCreator = existingEvent.createdBy === user.id;

    if (!isSuperAdmin && !isMunicipality && !isOrganization && !isCreator) {
      return res.status(403).json({ message: 'No tienes permisos para editar este evento' });
    }

    // Procesar imagen si se subió
    let imageUrl = req.body.imageUrl;
    if ((req as any).uploadedImages && (req as any).uploadedImages.image) {
      // Usar la URL de MinIO si se subió una imagen
      imageUrl = (req as any).uploadedImages.image.url;
    } else if (req.files && (req.files as any).image && (req.files as any).image[0]) {
      // Fallback para archivos locales si no hay MinIO
      const uploadedFile = (req.files as any).image[0];
      imageUrl = `/uploads/${uploadedFile.filename}`;
    }

    const {
      title,
      organizer,
      description,
      date,
      time,
      registrationDeadline,
      type,
      category,
      location,
      maxCapacity,
      price,
      status,
      tags,
      requirements,
      agenda,
      speakers,
      featured
    } = req.body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (organizer !== undefined) updateData.organizer = organizer;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (time !== undefined) updateData.time = time;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (location !== undefined) updateData.location = location;
    if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity;
    if (price !== undefined) updateData.price = price;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (tags !== undefined) updateData.tags = tags;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (agenda !== undefined) updateData.agenda = agenda;
    if (speakers !== undefined) updateData.speakers = speakers;
    if (featured !== undefined) {
      // El middleware ya convierte featured de string a boolean
      updateData.featured = featured;
    }

    if (registrationDeadline !== undefined) {
      updateData.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    }

    // Manejar cambio de estado
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'PUBLISHED' && existingEvent.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        attendees: {
          include: {
            attendee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event (Creator or SuperAdmin only)
 *     tags: [Events]
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
 *         description: Event deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
export async function deleteEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { creator: true }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificar permisos
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;
    const isCreator = existingEvent.createdBy === user.id;

    if (!isSuperAdmin && !isCreator) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este evento' });
    }

    await prisma.event.delete({
      where: { id }
    });

    return res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/{id}/attend:
 *   post:
 *     summary: Register attendance to an event (Youth and Adolescents only)
 *     tags: [Events]
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
 *         description: Successfully registered for event
 *       400:
 *         description: Event is full or registration closed
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
export async function attendEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    // Verificar que el usuario sea joven o adolescente
    if (!['YOUTH', 'ADOLESCENTS'].includes(user.role)) {
      return res.status(403).json({ message: 'Solo jóvenes y adolescentes pueden registrarse a eventos' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendees: true
      }
    });

    if (!event) {
      return res.status(200).json({ 
        message: 'No hay eventos disponibles',
        attendance: null
      });
    }

    if (event.status !== 'PUBLISHED') {
      return res.status(400).json({ message: 'Este evento no está disponible para registro' });
    }

    // Verificar fecha límite de registro
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'La fecha límite de registro ha expirado' });
    }

    // Verificar capacidad
    if (event.maxCapacity && event.attendeesCount >= event.maxCapacity) {
      return res.status(400).json({ message: 'El evento ha alcanzado su capacidad máxima' });
    }

    // Verificar si ya está registrado
    const existingAttendance = await prisma.eventAttendee.findUnique({
      where: {
        eventId_attendeeId: {
          eventId: id,
          attendeeId: user.id
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Ya estás registrado en este evento' });
    }

    // Registrar asistencia
    const attendance = await prisma.eventAttendee.create({
      data: {
        eventId: id,
        attendeeId: user.id,
        status: 'REGISTERED'
      },
      include: {
        event: true,
        attendee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Actualizar contador de asistentes
    await prisma.event.update({
      where: { id },
      data: { attendeesCount: { increment: 1 } }
    });

    return res.json({
      message: 'Registro exitoso',
      attendance
    });
  } catch (error) {
    console.error('Error attending event:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/{id}/unattend:
 *   delete:
 *     summary: Cancel attendance to an event
 *     tags: [Events]
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
 *         description: Successfully cancelled attendance
 *       404:
 *         description: Attendance not found
 */
export async function unattendEvent(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const attendance = await prisma.eventAttendee.findUnique({
      where: {
        eventId_attendeeId: {
          eventId: id,
          attendeeId: user.id
        }
      }
    });

    if (!attendance) {
      return res.status(200).json({ 
        message: 'No estás registrado en este evento',
        attendance: null
      });
    }

    await prisma.eventAttendee.delete({
      where: {
        eventId_attendeeId: {
          eventId: id,
          attendeeId: user.id
        }
      }
    });

    // Actualizar contador de asistentes
    await prisma.event.update({
      where: { id },
      data: { attendeesCount: { decrement: 1 } }
    });

    return res.json({ message: 'Registro cancelado exitosamente' });
  } catch (error) {
    console.error('Error cancelling attendance:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/{id}/attendees:
 *   get:
 *     summary: Get event attendees (Creator, SuperAdmin, Municipalities, and Organizations only)
 *     tags: [Events]
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
 *         description: List of attendees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventAttendee'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
export async function getEventAttendees(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: { creator: true }
    });

    if (!event) {
      return res.status(200).json({ 
        message: 'No hay eventos disponibles',
        attendees: []
      });
    }

    // Verificar permisos
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;
    const isMunicipality = user.type === 'municipality';
    const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role);
    const isCreator = event.createdBy === user.id;

    if (!isSuperAdmin && !isMunicipality && !isOrganization && !isCreator) {
      return res.status(403).json({ message: 'No tienes permisos para ver los asistentes' });
    }

    const attendees = await prisma.eventAttendee.findMany({
      where: { eventId: id },
      include: {
        attendee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true
          }
        }
      },
      orderBy: { registeredAt: 'asc' }
    });

    return res.json(attendees);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/{id}/attendees/{attendeeId}:
 *   put:
 *     summary: Update attendee status (Creator, SuperAdmin, Municipalities, and Organizations only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: attendeeId
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
 *               status:
 *                 type: string
 *                 enum: [REGISTERED, CONFIRMED, ATTENDED, NO_SHOW, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendee status updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event or attendee not found
 */
export async function updateAttendeeStatus(req: Request, res: Response): Promise<Response> {
  try {
    const { id, attendeeId } = req.params;
    const { status, notes } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: { creator: true }
    });

    if (!event) {
      return res.status(200).json({ 
        message: 'No hay eventos disponibles',
        attendance: null
      });
    }

    // Verificar permisos
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;
    const isMunicipality = user.type === 'municipality';
    const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role);
    const isCreator = event.createdBy === user.id;

    if (!isSuperAdmin && !isMunicipality && !isOrganization && !isCreator) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar el estado de asistentes' });
    }

    const attendance = await prisma.eventAttendee.findUnique({
      where: {
        eventId_attendeeId: {
          eventId: id,
          attendeeId
        }
      }
    });

    if (!attendance) {
      return res.status(200).json({ 
        message: 'No hay asistentes registrados',
        attendance: null
      });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Si el estado es ATTENDED, establecer attendedAt
    if (status === 'ATTENDED' && attendance.status !== 'ATTENDED') {
      updateData.attendedAt = new Date();
    }

    const updatedAttendance = await prisma.eventAttendee.update({
      where: {
        eventId_attendeeId: {
          eventId: id,
          attendeeId
        }
      },
      data: updateData,
      include: {
        attendee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true
          }
        }
      }
    });

    return res.json(updatedAttendance);
  } catch (error) {
    console.error('Error updating attendee status:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/my-events:
 *   get:
 *     summary: Get events created by the current user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
export async function getMyEvents(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const events = await prisma.event.findMany({
      where: { createdBy: user.id },
      include: {
        attendees: {
          include: {
            attendee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/my-municipality:
 *   get:
 *     summary: Get all events from the current user's municipality
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of events from user's municipality
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
export async function getEventsByMunicipality(req: Request, res: Response): Promise<Response> {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    // Obtener el municipalityId del token del usuario
    let municipalityId = user.id;
    
    // Si el usuario es un municipio, usar su ID directamente
    if (user.type === 'municipality') {
      municipalityId = user.id;
    } else {
      // Si es un usuario normal, obtener su municipio del perfil
      const userProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { municipality: true }
      });
      
      if (!userProfile?.municipality) {
        return res.status(400).json({ message: 'Usuario no tiene municipio asignado' });
      }
      
      municipalityId = userProfile.municipality;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: {
          creator: {
            municipality: municipalityId
          },
          // Solo mostrar eventos publicados a usuarios no admin
          ...(user?.role !== UserRole.SUPERADMIN && {
            status: 'PUBLISHED'
          })
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              municipality: true
            }
          },
          attendees: {
            include: {
              attendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { date: 'asc' },
        skip,
        take: Number(limit)
      }),
      prisma.event.count({
        where: {
          creator: {
            municipality: municipalityId
          },
          ...(user?.role !== UserRole.SUPERADMIN && {
            status: 'PUBLISHED'
          })
        }
      })
    ]);

    return res.json({
      events,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      municipalityId
    });
  } catch (error) {
    console.error('Error fetching events by municipality:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * @swagger
 * /api/events/my-attendances:
 *   get:
 *     summary: Get events the current user is attending
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events user is attending
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventAttendee'
 */
export async function getMyAttendances(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const attendances = await prisma.eventAttendee.findMany({
      where: { attendeeId: user.id },
      include: {
        event: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    return res.json(attendances);
  } catch (error) {
    console.error('Error fetching user attendances:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
