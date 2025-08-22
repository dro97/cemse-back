"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = getEvents;
exports.getEvent = getEvent;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.attendEvent = attendEvent;
exports.unattendEvent = unattendEvent;
exports.getEventAttendees = getEventAttendees;
exports.updateAttendeeStatus = updateAttendeeStatus;
exports.getMyEvents = getMyEvents;
exports.getEventsByMunicipality = getEventsByMunicipality;
exports.getMyAttendances = getMyAttendances;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getEvents(req, res) {
    try {
        const { search, type, category, status, featured, municipality, page = 1, limit = 10 } = req.query;
        const user = req.user;
        const isAdmin = user?.role === client_1.UserRole.SUPERADMIN;
        const isMunicipality = user?.type === 'municipality';
        const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user?.role);
        const where = {};
        if (!isAdmin && !isMunicipality && !isOrganization) {
            where.status = 'PUBLISHED';
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { organizer: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (type)
            where.type = type;
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        if (featured !== undefined)
            where.featured = featured === 'true';
        if (municipality) {
            where.creator = {
                municipality: municipality
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
        let statsWhere = {};
        if (isAdmin) {
            statsWhere = {};
        }
        else {
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
        const eventsWithCalculatedStats = events.map(event => {
            const attendanceRate = event.maxCapacity && event.maxCapacity > 0
                ? Math.round((event.attendeesCount / event.maxCapacity) * 100)
                : 0;
            return {
                ...event,
                attendanceRate
            };
        });
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
    }
    catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function getEvent(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
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
        const isAdmin = user?.role === client_1.UserRole.SUPERADMIN;
        const isMunicipality = user?.type === 'municipality';
        const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user?.role);
        const isCreator = event.createdBy === user?.id;
        if (event.status !== 'PUBLISHED' && !isAdmin && !isMunicipality && !isOrganization && !isCreator) {
            return res.status(403).json({ message: 'No tienes permisos para ver este evento' });
        }
        await prisma.event.update({
            where: { id },
            data: { viewsCount: { increment: 1 } }
        });
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
    }
    catch (error) {
        console.error('Error fetching event:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function createEvent(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Autenticación requerida' });
        }
        const isSuperAdmin = user.role === client_1.UserRole.SUPERADMIN;
        const isMunicipality = user.type === 'municipality';
        const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role);
        if (!isSuperAdmin && !isMunicipality && !isOrganization) {
            return res.status(403).json({ message: 'Solo SuperAdmin, Municipios y Organizaciones pueden crear eventos' });
        }
        let imageUrl = req.body.imageUrl;
        if (req.files && req.files.image && req.files.image[0]) {
            const uploadedFile = req.files.image[0];
            imageUrl = `/uploads/${uploadedFile.filename}`;
        }
        const { title, organizer, description, date, time, registrationDeadline, type, category, location, maxCapacity, price, status = 'DRAFT', tags = [], requirements = [], agenda = [], speakers = [], featured } = req.body;
        if (!title || !organizer || !description || !date || !time || !type || !category || !location) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos' });
        }
        let creatorId = user.id;
        if (user.type === 'municipality') {
            let municipalityProfile = await prisma.profile.findFirst({
                where: {
                    role: 'MUNICIPAL_GOVERNMENTS',
                    municipality: user.id
                }
            });
            if (!municipalityProfile) {
                municipalityProfile = await prisma.profile.create({
                    data: {
                        userId: user.id,
                        role: 'MUNICIPAL_GOVERNMENTS',
                        municipality: user.id,
                        firstName: user.username || 'Municipio',
                        email: user.username + '@municipality.local'
                    }
                });
            }
            creatorId = municipalityProfile.userId;
        }
        const eventData = {
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
        if (maxCapacity)
            eventData.maxCapacity = maxCapacity;
        if (price !== undefined)
            eventData.price = price;
        if (imageUrl)
            eventData.imageUrl = imageUrl;
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
    }
    catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function updateEvent(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Autenticación requerida' });
        }
        const existingEvent = await prisma.event.findUnique({
            where: { id },
            include: {
                creator: true
            }
        });
        if (!existingEvent) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        const isSuperAdmin = user.role === client_1.UserRole.SUPERADMIN;
        const isMunicipality = user.type === 'municipality';
        const isOrganization = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role);
        const isCreator = existingEvent.createdBy === user.id;
        if (!isSuperAdmin && !isMunicipality && !isOrganization && !isCreator) {
            return res.status(403).json({ message: 'No tienes permisos para editar este evento' });
        }
        let imageUrl = req.body.imageUrl;
        if (req.files && req.files.image && req.files.image[0]) {
            const uploadedFile = req.files.image[0];
            imageUrl = `/uploads/${uploadedFile.filename}`;
        }
        const { title, organizer, description, date, time, registrationDeadline, type, category, location, maxCapacity, price, status, tags, requirements, agenda, speakers, featured } = req.body;
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (organizer !== undefined)
            updateData.organizer = organizer;
        if (description !== undefined)
            updateData.description = description;
        if (date !== undefined)
            updateData.date = new Date(date);
        if (time !== undefined)
            updateData.time = time;
        if (type !== undefined)
            updateData.type = type;
        if (category !== undefined)
            updateData.category = category;
        if (location !== undefined)
            updateData.location = location;
        if (maxCapacity !== undefined)
            updateData.maxCapacity = maxCapacity;
        if (price !== undefined)
            updateData.price = price;
        if (imageUrl !== undefined)
            updateData.imageUrl = imageUrl;
        if (tags !== undefined)
            updateData.tags = tags;
        if (requirements !== undefined)
            updateData.requirements = requirements;
        if (agenda !== undefined)
            updateData.agenda = agenda;
        if (speakers !== undefined)
            updateData.speakers = speakers;
        if (featured !== undefined)
            updateData.featured = featured;
        if (registrationDeadline !== undefined) {
            updateData.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
        }
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
    }
    catch (error) {
        console.error('Error updating event:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function deleteEvent(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
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
        const isSuperAdmin = user.role === client_1.UserRole.SUPERADMIN;
        const isCreator = existingEvent.createdBy === user.id;
        if (!isSuperAdmin && !isCreator) {
            return res.status(403).json({ message: 'No tienes permisos para eliminar este evento' });
        }
        await prisma.event.delete({
            where: { id }
        });
        return res.json({ message: 'Evento eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function attendEvent(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Autenticación requerida' });
        }
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
        if (event.registrationDeadline && new Date() > event.registrationDeadline) {
            return res.status(400).json({ message: 'La fecha límite de registro ha expirado' });
        }
        if (event.maxCapacity && event.attendeesCount >= event.maxCapacity) {
            return res.status(400).json({ message: 'El evento ha alcanzado su capacidad máxima' });
        }
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
        await prisma.event.update({
            where: { id },
            data: { attendeesCount: { increment: 1 } }
        });
        return res.json({
            message: 'Registro exitoso',
            attendance
        });
    }
    catch (error) {
        console.error('Error attending event:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function unattendEvent(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
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
        await prisma.event.update({
            where: { id },
            data: { attendeesCount: { decrement: 1 } }
        });
        return res.json({ message: 'Registro cancelado exitosamente' });
    }
    catch (error) {
        console.error('Error cancelling attendance:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function getEventAttendees(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
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
        const isSuperAdmin = user.role === client_1.UserRole.SUPERADMIN;
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
    }
    catch (error) {
        console.error('Error fetching attendees:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function updateAttendeeStatus(req, res) {
    try {
        const { id, attendeeId } = req.params;
        const { status, notes } = req.body;
        const user = req.user;
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
        const isSuperAdmin = user.role === client_1.UserRole.SUPERADMIN;
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
        const updateData = {};
        if (status)
            updateData.status = status;
        if (notes !== undefined)
            updateData.notes = notes;
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
    }
    catch (error) {
        console.error('Error updating attendee status:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function getMyEvents(req, res) {
    try {
        const user = req.user;
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
    }
    catch (error) {
        console.error('Error fetching user events:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function getEventsByMunicipality(req, res) {
    try {
        const { page = 1, limit = 10 } = req.query;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Autenticación requerida' });
        }
        let municipalityId = user.id;
        if (user.type === 'municipality') {
            municipalityId = user.id;
        }
        else {
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
                    ...(user?.role !== client_1.UserRole.SUPERADMIN && {
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
                    ...(user?.role !== client_1.UserRole.SUPERADMIN && {
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
    }
    catch (error) {
        console.error('Error fetching events by municipality:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function getMyAttendances(req, res) {
    try {
        const user = req.user;
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
    }
    catch (error) {
        console.error('Error fetching user attendances:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
//# sourceMappingURL=EventController.js.map