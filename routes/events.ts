import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadEventImage } from '../middleware/upload';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  unattendEvent,
  getEventAttendees,
  updateAttendeeStatus,
  getMyEvents,
  getMyAttendances,
  getEventsByMunicipality
} from '../controllers/EventController';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas públicas (requieren autenticación pero no roles específicos)
router.get('/', getEvents);
router.get('/my-municipality', getEventsByMunicipality);
router.get('/:id', getEvent);
router.get('/my-events', getMyEvents);
router.get('/my-attendances', getMyAttendances);

// Rutas para jóvenes y adolescentes (registro a eventos)
router.post('/:id/attend', attendEvent);
router.delete('/:id/unattend', unattendEvent);

// Rutas para creadores, super admin, municipios y organizaciones
router.post('/', uploadEventImage, createEvent);
router.put('/:id', uploadEventImage, updateEvent);
router.delete('/:id', deleteEvent);

// Rutas para gestión de asistentes (solo creadores, super admin, municipios y organizaciones)
router.get('/:id/attendees', getEventAttendees);
router.put('/:id/attendees/:attendeeId', updateAttendeeStatus);

export default router;
