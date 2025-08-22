# 🎉 Sistema de Eventos - Documentación Frontend

## 📋 Resumen Ejecutivo

Se ha implementado un **sistema completo de gestión de eventos** que permite a super usuarios y municipios crear eventos, y a jóvenes verlos y asistir. El sistema incluye todas las funcionalidades mostradas en las imágenes de referencia.

---

## 🗄️ Base de Datos

### **Modelos Creados:**

1. **`Event`** - Eventos principales
2. **`EventAttendee`** - Asistentes a eventos

### **Enums:**

- `EventType`: `IN_PERSON`, `VIRTUAL`, `HYBRID`
- `EventCategory`: `NETWORKING`, `WORKSHOP`, `CONFERENCE`, `SEMINAR`, `TRAINING`, `FAIR`, `COMPETITION`, `HACKATHON`, `MEETUP`, `OTHER`
- `EventStatus`: `DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`
- `AttendeeStatus`: `REGISTERED`, `CONFIRMED`, `ATTENDED`, `NO_SHOW`, `CANCELLED`

---

## 🔌 API Endpoints

### **Base URL:** `http://localhost:3001/api/events`

### **1. 📋 Gestión de Eventos**

#### **1.1 Listar Eventos**
```http
GET /api/events
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `search` - Buscar por título u organizador
- `type` - Filtrar por tipo (IN_PERSON, VIRTUAL, HYBRID)
- `category` - Filtrar por categoría
- `status` - Filtrar por estado
- `featured` - Filtrar eventos destacados
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 10)

**Response:**
```json
{
  "events": [
    {
      "id": "event123",
      "title": "Startup Pitch Night Cochabamba",
      "organizer": "Startup Hub Bolivia",
      "description": "Una noche increíble...",
      "date": "2024-03-14T19:00:00.000Z",
      "time": "19:00 - 22:00",
      "type": "IN_PERSON",
      "category": "NETWORKING",
      "location": "Centro de Convenciones Cochabamba",
      "maxCapacity": 100,
      "price": 0,
      "status": "PUBLISHED",
      "imageUrl": "https://example.com/image.jpg",
      "tags": ["startup", "pitch", "networking"],
      "requirements": ["Interés en emprendimiento"],
      "agenda": ["19:00 - Registro y bienvenida"],
      "speakers": ["Dr. Roberto Silva - Inversionista"],
      "featured": true,
      "viewsCount": 45,
      "attendeesCount": 67,
      "attendanceRate": 67,
      "createdAt": "2024-03-01T10:00:00.000Z",
      "updatedAt": "2024-03-01T10:00:00.000Z",
      "publishedAt": "2024-03-01T10:00:00.000Z",
      "createdBy": "user123",
      "creator": {
        "id": "user123",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com",
        "role": "SUPERADMIN"
      },
      "attendees": [...]
    }
  ],
  "total": 3,
  "page": 1,
  "totalPages": 1,
  "statistics": {
    "totalEvents": 3,
    "upcomingEvents": 2,
    "totalAttendees": 290,
    "attendanceRate": 64,
    "publishedEvents": 3,
    "featuredEvents": 2
  }
}
```

#### **1.2 Obtener Evento Específico**
```http
GET /api/events/{id}
Authorization: Bearer YOUR_TOKEN
```

#### **1.3 Crear Evento**
```http
POST /api/events
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Permisos:** Solo SuperAdmin, Municipios y Organizaciones

**Request Body:**
```json
{
  "title": "Título del evento",
  "organizer": "Nombre del organizador",
  "description": "Descripción detallada del evento",
  "date": "2024-03-14T19:00:00.000Z",
  "time": "19:00 - 22:00",
  "registrationDeadline": "2024-03-13T23:59:59.000Z",
  "type": "IN_PERSON",
  "category": "NETWORKING",
  "location": "Dirección física o link de videoconferencia",
  "maxCapacity": 100,
  "price": 0,
  "status": "DRAFT",
  "imageUrl": "https://example.com/image.jpg",
  "tags": ["etiqueta1", "etiqueta2"],
  "requirements": ["Requisito 1", "Requisito 2"],
  "agenda": ["09:00 - Registro", "10:00 - Presentación"],
  "speakers": ["Nombre - Cargo", "Otro - Rol"],
  "featured": false
}
```

#### **1.4 Actualizar Evento**
```http
PUT /api/events/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Permisos:** Creador del evento, SuperAdmin, Municipios y Organizaciones

#### **1.5 Eliminar Evento**
```http
DELETE /api/events/{id}
Authorization: Bearer YOUR_TOKEN
```

**Permisos:** Creador del evento o SuperAdmin

---

### **2. 👥 Gestión de Asistencia**

#### **2.1 Asistir a Evento**
```http
POST /api/events/{id}/attend
Authorization: Bearer YOUR_TOKEN
```

**Permisos:** Solo Jóvenes y Adolescentes

**Response:**
```json
{
  "message": "Registro exitoso",
  "attendance": {
    "id": "attendance123",
    "eventId": "event123",
    "attendeeId": "user456",
    "status": "REGISTERED",
    "registeredAt": "2024-03-01T10:00:00.000Z",
    "event": {...},
    "attendee": {...}
  }
}
```

#### **2.2 Cancelar Asistencia**
```http
DELETE /api/events/{id}/unattend
Authorization: Bearer YOUR_TOKEN
```

#### **2.3 Obtener Asistentes de Evento**
```http
GET /api/events/{id}/attendees
Authorization: Bearer YOUR_TOKEN
```

**Permisos:** Creador del evento, SuperAdmin, Municipios y Organizaciones

#### **2.4 Actualizar Estado de Asistente**
```http
PUT /api/events/{id}/attendees/{attendeeId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "notes": "Asistente confirmado"
}
```

---

### **3. 👤 Eventos Personales**

#### **3.1 Mis Eventos Creados**
```http
GET /api/events/my-events
Authorization: Bearer YOUR_TOKEN
```

#### **3.2 Mis Asistencias**
```http
GET /api/events/my-attendances
Authorization: Bearer YOUR_TOKEN
```

---

## 🔐 Permisos y Roles

### **🎯 Creación y Gestión de Eventos:**
- ✅ **SuperAdmin** - Acceso completo
- ✅ **Municipios** (`type: 'municipality'`) - Crear y gestionar eventos
- ✅ **Organizaciones** (COMPANIES, MUNICIPAL_GOVERNMENTS, TRAINING_CENTERS, NGOS_AND_FOUNDATIONS) - Crear y gestionar eventos

### **👀 Visualización de Eventos:**
- ✅ **Todos los usuarios autenticados** pueden ver eventos publicados
- ✅ **Creadores, SuperAdmin, Municipios y Organizaciones** pueden ver todos los eventos (incluyendo borradores)

### **📝 Registro de Asistencia:**
- ✅ **Jóvenes y Adolescentes** pueden registrarse a eventos
- ✅ **Creadores, SuperAdmin, Municipios y Organizaciones** pueden gestionar asistentes

---

## 📊 Estadísticas del Dashboard

El endpoint `/api/events` devuelve estadísticas en tiempo real:

```json
{
  "statistics": {
    "totalEvents": 3,        // Total de eventos publicados
    "upcomingEvents": 2,     // Eventos próximos (fecha futura)
    "totalAttendees": 290,   // Total de asistentes registrados
    "attendanceRate": 64,    // Porcentaje de asistencia promedio
    "publishedEvents": 3,    // Eventos publicados
    "featuredEvents": 2      // Eventos destacados
  }
}
```

---

## 🎨 Implementación Frontend

### **1. Dashboard Principal**

```typescript
// Componente de estadísticas
interface EventStatistics {
  totalEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
  attendanceRate: number;
  publishedEvents: number;
  featuredEvents: number;
}

// Componente de filtros
interface EventFilters {
  search?: string;
  type?: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  featured?: boolean;
  page?: number;
  limit?: number;
}
```

### **2. Formulario de Creación/Edición**

```typescript
interface EventFormData {
  title: string;
  organizer: string;
  description: string;
  date: string;
  time: string;
  registrationDeadline?: string;
  type: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  category: string;
  location: string;
  maxCapacity?: number;
  price?: number;
  status: 'DRAFT' | 'PUBLISHED';
  imageUrl?: string;
  tags: string[];
  requirements: string[];
  agenda: string[];
  speakers: string[];
  featured: boolean;
}
```

### **3. Tabla de Eventos**

```typescript
interface EventTableRow {
  id: string;
  title: string;
  organizer: string;
  type: string;
  date: string;
  time: string;
  attendeesCount: number;
  maxCapacity?: number;
  status: string;
  featured: boolean;
}
```

---

## 🚀 Ejemplos de Uso

### **1. Obtener Eventos con Filtros**
```typescript
const fetchEvents = async (filters: EventFilters) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.type) params.append('type', filters.type);
  if (filters.featured) params.append('featured', 'true');
  
  const response = await fetch(`/api/events?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### **2. Crear Evento**
```typescript
const createEvent = async (eventData: EventFormData) => {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });
  
  return response.json();
};
```

### **3. Asistir a Evento**
```typescript
const attendEvent = async (eventId: string) => {
  const response = await fetch(`/api/events/${eventId}/attend`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

## 📱 Componentes Sugeridos

### **1. EventDashboard**
- Estadísticas en tarjetas
- Filtros de búsqueda
- Tabla de eventos

### **2. EventForm**
- Formulario completo de creación/edición
- Validaciones en tiempo real
- Preview de imagen

### **3. EventCard**
- Tarjeta individual de evento
- Botón de asistir/cancelar
- Información detallada

### **4. EventDetails**
- Vista detallada del evento
- Lista de asistentes
- Gestión de estado

### **5. AttendanceManager**
- Tabla de asistentes
- Gestión de estados
- Notas y comentarios

---

## 🔧 Configuración

### **Variables de Entorno:**
```env
API_BASE_URL=http://localhost:3001/api
```

### **Headers Requeridos:**
```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

---

## ✅ Funcionalidades Implementadas

- ✅ **Dashboard con estadísticas** (como en las imágenes)
- ✅ **Creación de eventos** con todos los campos
- ✅ **Gestión de asistentes** y RSVP
- ✅ **Filtros y búsqueda** avanzada
- ✅ **Estados de eventos** (borrador, publicado, etc.)
- ✅ **Eventos destacados**
- ✅ **Tipos de eventos** (presencial, virtual, híbrido)
- ✅ **Categorías** completas
- ✅ **Agenda y ponentes**
- ✅ **Requisitos y etiquetas**
- ✅ **Control de capacidad**
- ✅ **Fechas límite de registro**
- ✅ **Permisos por roles**

---

## 🎯 Próximos Pasos

1. **Implementar el frontend** siguiendo esta documentación
2. **Agregar notificaciones** en tiempo real con Socket.IO
3. **Implementar reportes** de asistencia
4. **Agregar sistema de recordatorios** por email
5. **Integrar con calendario** externo

---

## 📞 Soporte

Para cualquier duda sobre la implementación, consultar:
- **API Documentation:** `/api-docs` (Swagger)
- **Test Script:** `test-events-system.js`
- **Database Schema:** `prisma/schema.prisma`
