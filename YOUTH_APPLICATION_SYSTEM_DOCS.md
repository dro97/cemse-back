# Sistema de Postulaciones de Jóvenes - Documentación API

## 📋 Resumen del Sistema

El sistema de postulaciones de jóvenes permite a los jóvenes crear postulaciones independientes que pueden ser vistas por múltiples empresas. Las empresas pueden expresar interés y chatear directamente con los jóvenes.

### 🎯 Características Principales

1. **Postulaciones Independientes** - Los jóvenes crean postulaciones con título, descripción, CV y carta de presentación
2. **Chat en Tiempo Real** - Sistema de mensajería entre jóvenes y empresas
3. **Interés de Empresas** - Las empresas pueden expresar diferentes niveles de interés
4. **Visibilidad Controlada** - Los jóvenes pueden hacer sus postulaciones públicas o privadas
5. **Seguimiento de Estadísticas** - Contador de vistas y aplicaciones

---

## 🔐 Autenticación

**Todas las rutas requieren autenticación:**
```http
Authorization: Bearer [TOKEN]
Content-Type: application/json
```

**Tipos de usuario:**
- **Jóvenes:** `type: 'user'` - Pueden crear y gestionar sus postulaciones
- **Empresas:** `type: 'company'` - Pueden ver postulaciones y expresar interés

---

## 🚀 PARTE 0: REGISTRO DE PERFIL DE JOVEN

### 0.1 📝 Registrar Perfil de Joven

```http
POST /api/youth-profile/register
```

**Datos requeridos:**
```json
{
  "username": "juan_perez",
  "password": "miContraseña123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@email.com",
  "birthDate": "2005-06-15",
  "educationLevel": "SECONDARY"
}
```

**Datos opcionales:**
```json
{
  "phone": "+591 70012345",
  "address": "Calle Principal 123",
  "municipality": "Cochabamba",
  "department": "Cochabamba",
  "country": "Bolivia",
  "gender": "Masculino",
  "documentType": "CI",
  "documentNumber": "12345678",
  "currentInstitution": "Colegio San José",
  "graduationYear": 2023,
  "isStudying": true,
  "currentDegree": "Ingeniería en Sistemas",
  "universityName": "Universidad de Cochabamba",
  "skills": ["JavaScript", "React", "HTML", "CSS"],
  "interests": ["Programación", "Tecnología", "Diseño Web"],
  "parentalConsent": true,
  "parentEmail": "padres.perez@email.com"
}
```

**Respuesta exitosa (201):**
```json
{
  "user": {
    "id": "user123",
    "username": "juan_perez",
    "role": "YOUTH"
  },
  "profile": {
    "id": "profile123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@email.com",
    "userId": "user123",
    "educationLevel": "SECONDARY",
    "skills": ["JavaScript", "React", "HTML", "CSS"],
    "interests": ["Programación", "Tecnología", "Diseño Web"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "uuid-refresh-token"
}
```

### 0.2 👤 Obtener Perfil de Joven

```http
GET /api/youth-profile/{userId}
```

**Respuesta (200):**
```json
{
  "id": "profile123",
  "userId": "user123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "+591 70012345",
  "address": "Calle Principal 123",
  "municipality": "Cochabamba",
  "department": "Cochabamba",
  "country": "Bolivia",
  "birthDate": "2005-06-15T00:00:00.000Z",
  "gender": "Masculino",
  "documentType": "CI",
  "documentNumber": "12345678",
  "educationLevel": "SECONDARY",
  "currentInstitution": "Colegio San José",
  "graduationYear": 2023,
  "isStudying": true,
  "currentDegree": "Ingeniería en Sistemas",
  "universityName": "Universidad de Cochabamba",
  "skills": ["JavaScript", "React", "HTML", "CSS"],
  "interests": ["Programación", "Tecnología", "Diseño Web"],
  "role": "YOUTH",
  "status": "ACTIVE",
  "active": true,
  "profileCompletion": 75,
  "parentalConsent": true,
  "parentEmail": "padres.perez@email.com",
  "consentDate": "2024-01-15T14:30:00Z",
  "user": {
    "id": "user123",
    "username": "juan_perez",
    "role": "YOUTH",
    "isActive": true
  }
}
```

### 0.3 ✏️ Actualizar Perfil de Joven

```http
PUT /api/youth-profile/{userId}
```

**Datos que se pueden actualizar:**
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "phone": "+591 70054321",
  "address": "Nueva Dirección 456",
  "skills": ["JavaScript", "React", "HTML", "CSS", "Node.js"],
  "interests": ["Programación", "Tecnología", "Diseño Web", "Backend"],
  "currentDegree": "Ingeniería en Sistemas",
  "universityName": "Universidad Mayor de San Simón"
}
```

---

## 🚀 PARTE 1: GESTIÓN DE POSTULACIONES (JÓVENES)

### 1.1 📝 Crear Postulación

```http
POST /api/youthapplication
```

**Datos requeridos:**
```json
{
  "title": "Desarrollador Frontend Junior",
  "description": "Soy un desarrollador frontend con experiencia en React y JavaScript...",
  "youthProfileId": "ID_DEL_PERFIL_DEL_JOVEN"
}
```

**Datos opcionales:**
```json
{
  "cvUrl": "/uploads/cv/mi-cv.pdf",
  "coverLetterUrl": "/uploads/cover-letters/mi-carta.pdf",
  "isPublic": true
}
```

**Subir archivos (multipart/form-data):**
- `cvFile` - Archivo PDF del CV
- `coverLetterFile` - Archivo PDF de la carta de presentación

**Respuesta exitosa (201):**
```json
{
  "id": "cmf1abc123def456",
  "title": "Desarrollador Frontend Junior",
  "description": "Soy un desarrollador frontend...",
  "cvFile": "/uploads/youth-applications/cv/cv_123_1703123456789.pdf",
  "coverLetterFile": "/uploads/youth-applications/cover-letters/cover_123_1703123456790.pdf",
  "status": "ACTIVE",
  "isPublic": true,
  "viewsCount": 0,
  "applicationsCount": 0,
  "youthProfileId": "ID_DEL_PERFIL",
  "createdAt": "2024-01-15T14:30:00Z",
  "youthProfile": {
    "id": "ID_DEL_PERFIL",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### 1.2 📋 Listar Mis Postulaciones

```http
GET /api/youthapplication?youthProfileId=ID_DEL_PERFIL
```

**Filtros disponibles:**
- `status` - ACTIVE, PAUSED, CLOSED, HIRED
- `isPublic` - true/false
- `youthProfileId` - ID del perfil del joven

**Respuesta (200):**
```json
[
  {
    "id": "cmf1abc123def456",
    "title": "Desarrollador Frontend Junior",
    "description": "Soy un desarrollador frontend...",
    "status": "ACTIVE",
    "isPublic": true,
    "viewsCount": 15,
    "applicationsCount": 3,
    "createdAt": "2024-01-15T14:30:00Z",
    "youthProfile": {
      "id": "ID_DEL_PERFIL",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@email.com",
      "avatarUrl": "https://example.com/avatar.jpg",
      "skills": ["React", "JavaScript", "HTML", "CSS"],
      "educationLevel": "UNIVERSITY",
      "currentDegree": "Ingeniería en Sistemas",
      "universityName": "Universidad de Cochabamba"
    },
    "messages": [
      {
        "id": "msg123",
        "content": "Hola, me interesa tu perfil...",
        "senderType": "COMPANY",
        "createdAt": "2024-01-16T10:00:00Z"
      }
    ],
    "companyInterests": [
      {
        "id": "interest123",
        "status": "INTERESTED",
        "company": {
          "id": "company123",
          "name": "TechCorp",
          "businessSector": "Tecnología"
        }
      }
    ]
  }
]
```

### 1.3 👁️ Ver Postulación Específica

```http
GET /api/youthapplication/{id}
```

**Respuesta (200):**
```json
{
  "id": "cmf1abc123def456",
  "title": "Desarrollador Frontend Junior",
  "description": "Soy un desarrollador frontend...",
  "cvFile": "/uploads/youth-applications/cv/cv_123_1703123456789.pdf",
  "coverLetterFile": "/uploads/youth-applications/cover-letters/cover_123_1703123456790.pdf",
  "status": "ACTIVE",
  "isPublic": true,
  "viewsCount": 16,
  "applicationsCount": 3,
  "createdAt": "2024-01-15T14:30:00Z",
  "youthProfile": {
    "id": "ID_DEL_PERFIL",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "avatarUrl": "https://example.com/avatar.jpg",
    "skills": ["React", "JavaScript", "HTML", "CSS"],
    "educationLevel": "UNIVERSITY",
    "currentDegree": "Ingeniería en Sistemas",
    "universityName": "Universidad de Cochabamba",
    "workExperience": [
      {
        "company": "Startup XYZ",
        "position": "Desarrollador Frontend",
        "duration": "6 meses"
      }
    ],
    "languages": [
      {
        "language": "Español",
        "level": "Nativo"
      },
      {
        "language": "Inglés",
        "level": "Intermedio"
      }
    ],
    "projects": [
      {
        "name": "E-commerce App",
        "description": "Aplicación de comercio electrónico con React",
        "url": "https://github.com/juan/ecommerce"
      }
    ]
  },
  "messages": [
    {
      "id": "msg123",
      "senderId": "company123",
      "senderType": "COMPANY",
      "content": "Hola Juan, me interesa mucho tu perfil...",
      "messageType": "TEXT",
      "status": "SENT",
      "createdAt": "2024-01-16T10:00:00Z",
      "readAt": null
    },
    {
      "id": "msg124",
      "senderId": "youth123",
      "senderType": "YOUTH",
      "content": "Gracias por el interés, ¿podríamos agendar una entrevista?",
      "messageType": "TEXT",
      "status": "SENT",
      "createdAt": "2024-01-16T11:00:00Z",
      "readAt": "2024-01-16T11:30:00Z"
    }
  ],
  "companyInterests": [
    {
      "id": "interest123",
      "companyId": "company123",
      "status": "INTERESTED",
      "message": "Perfil muy interesante, nos gustaría contactarte",
      "createdAt": "2024-01-16T09:00:00Z",
      "company": {
        "id": "company123",
        "name": "TechCorp",
        "businessSector": "Tecnología",
        "email": "hr@techcorp.com",
        "website": "https://techcorp.com"
      }
    }
  ]
}
```

### 1.4 ✏️ Actualizar Postulación

```http
PUT /api/youthapplication/{id}
```

**Datos que se pueden actualizar:**
```json
{
  "title": "Desarrollador Frontend Senior",
  "description": "Actualizada descripción...",
  "status": "PAUSED",
  "isPublic": false,
  "cvUrl": "/uploads/cv/nuevo-cv.pdf",
  "coverLetterUrl": "/uploads/cover-letters/nueva-carta.pdf"
}
```

### 1.5 🗑️ Eliminar Postulación

```http
DELETE /api/youthapplication/{id}
```

---

## 💬 PARTE 2: SISTEMA DE MENSAJERÍA

### 2.1 📤 Enviar Mensaje

```http
POST /api/youthapplication/{id}/message
```

**Datos requeridos:**
```json
{
  "content": "Hola, me interesa mucho tu perfil. ¿Podríamos agendar una entrevista?"
}
```

**Respuesta (201):**
```json
{
  "id": "msg125",
  "applicationId": "cmf1abc123def456",
  "senderId": "company123",
  "senderType": "COMPANY",
  "content": "Hola, me interesa mucho tu perfil...",
  "messageType": "TEXT",
  "status": "SENT",
  "createdAt": "2024-01-16T12:00:00Z",
  "readAt": null,
  "application": {
    "youthProfile": {
      "firstName": "Juan",
      "lastName": "Pérez"
    }
  }
}
```

### 2.2 📥 Ver Mensajes

```http
GET /api/youthapplication/{id}/messages
```

**Respuesta (200):**
```json
[
  {
    "id": "msg123",
    "applicationId": "cmf1abc123def456",
    "senderId": "company123",
    "senderType": "COMPANY",
    "content": "Hola Juan, me interesa mucho tu perfil...",
    "messageType": "TEXT",
    "status": "SENT",
    "createdAt": "2024-01-16T10:00:00Z",
    "readAt": null
  },
  {
    "id": "msg124",
    "applicationId": "cmf1abc123def456",
    "senderId": "youth123",
    "senderType": "YOUTH",
    "content": "Gracias por el interés, ¿podríamos agendar una entrevista?",
    "messageType": "TEXT",
    "status": "SENT",
    "createdAt": "2024-01-16T11:00:00Z",
    "readAt": "2024-01-16T11:30:00Z"
  }
]
```

---

## 🏢 PARTE 3: INTERÉS DE EMPRESAS

### 3.1 🎯 Expresar Interés (Empresas)

```http
POST /api/youthapplication/{id}/company-interest
```

**Datos requeridos:**
```json
{
  "companyId": "company123",
  "status": "INTERESTED",
  "message": "Perfil muy interesante, nos gustaría contactarte para una entrevista"
}
```

**Estados disponibles:**
- `INTERESTED` - Interesado
- `CONTACTED` - Contactado
- `INTERVIEW_SCHEDULED` - Entrevista programada
- `HIRED` - Contratado
- `NOT_INTERESTED` - No interesado

**Respuesta (201):**
```json
{
  "id": "interest124",
  "applicationId": "cmf1abc123def456",
  "companyId": "company123",
  "status": "INTERESTED",
  "message": "Perfil muy interesante...",
  "createdAt": "2024-01-16T13:00:00Z",
  "updatedAt": "2024-01-16T13:00:00Z",
  "company": {
    "id": "company123",
    "name": "TechCorp",
    "businessSector": "Tecnología"
  }
}
```

### 3.2 📊 Ver Intereses de Empresas

```http
GET /api/youthapplication/{id}/company-interests
```

**Respuesta (200):**
```json
[
  {
    "id": "interest123",
    "applicationId": "cmf1abc123def456",
    "companyId": "company123",
    "status": "INTERESTED",
    "message": "Perfil muy interesante...",
    "createdAt": "2024-01-16T09:00:00Z",
    "updatedAt": "2024-01-16T09:00:00Z",
    "company": {
      "id": "company123",
      "name": "TechCorp",
      "businessSector": "Tecnología",
      "email": "hr@techcorp.com",
      "website": "https://techcorp.com"
    }
  },
  {
    "id": "interest124",
    "applicationId": "cmf1abc123def456",
    "companyId": "company456",
    "status": "CONTACTED",
    "message": "Ya te contactamos por email",
    "createdAt": "2024-01-16T14:00:00Z",
    "updatedAt": "2024-01-16T15:00:00Z",
    "company": {
      "id": "company456",
      "name": "StartupXYZ",
      "businessSector": "Fintech",
      "email": "jobs@startupxyz.com",
      "website": "https://startupxyz.com"
    }
  }
]
```

---

## 🔍 PARTE 4: EXPLORAR POSTULACIONES (EMPRESAS)

### 4.1 📋 Ver Todas las Postulaciones Públicas

```http
GET /api/youthapplication?isPublic=true
```

**Filtros disponibles:**
- `status` - ACTIVE, PAUSED, CLOSED, HIRED
- `isPublic` - true/false (solo ver públicas)

**Respuesta (200):**
```json
[
  {
    "id": "cmf1abc123def456",
    "title": "Desarrollador Frontend Junior",
    "description": "Soy un desarrollador frontend...",
    "status": "ACTIVE",
    "isPublic": true,
    "viewsCount": 15,
    "applicationsCount": 3,
    "createdAt": "2024-01-15T14:30:00Z",
    "youthProfile": {
      "id": "ID_DEL_PERFIL",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@email.com",
      "avatarUrl": "https://example.com/avatar.jpg",
      "skills": ["React", "JavaScript", "HTML", "CSS"],
      "educationLevel": "UNIVERSITY",
      "currentDegree": "Ingeniería en Sistemas",
      "universityName": "Universidad de Cochabamba"
    },
    "messages": [
      {
        "id": "msg123",
        "content": "Hola, me interesa tu perfil...",
        "senderType": "COMPANY",
        "createdAt": "2024-01-16T10:00:00Z"
      }
    ],
    "companyInterests": [
      {
        "id": "interest123",
        "status": "INTERESTED",
        "company": {
          "id": "company123",
          "name": "TechCorp",
          "businessSector": "Tecnología"
        }
      }
    ]
  }
]
```

---

## 📊 PARTE 5: ESTADÍSTICAS Y SEGUIMIENTO

### 5.1 📈 Métricas de Postulación

Cada postulación incluye:
- `viewsCount` - Número de veces que se ha visto
- `applicationsCount` - Número de empresas que han expresado interés
- `status` - Estado actual (ACTIVE, PAUSED, CLOSED, HIRED)
- `isPublic` - Si es visible públicamente

### 5.2 🔄 Estados de Postulación

- **ACTIVE** - Postulación activa y visible
- **PAUSED** - Postulación pausada temporalmente
- **CLOSED** - Postulación cerrada
- **HIRED** - Joven contratado

### 5.3 🏢 Estados de Interés de Empresa

- **INTERESTED** - Empresa interesada
- **CONTACTED** - Empresa ha contactado al joven
- **INTERVIEW_SCHEDULED** - Entrevista programada
- **HIRED** - Joven contratado por esta empresa
- **NOT_INTERESTED** - Empresa no está interesada

---

## 🎨 PARTE 6: EJEMPLOS DE USO PARA FRONTEND

### 6.1 🖥️ Dashboard del Joven

```javascript
// Registrar perfil de joven
const youthProfile = await fetch('/api/youth-profile/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'juan_perez',
    password: 'miContraseña123',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    birthDate: '2005-06-15',
    educationLevel: 'SECONDARY',
    skills: ['JavaScript', 'React', 'HTML', 'CSS'],
    interests: ['Programación', 'Tecnología', 'Diseño Web']
  })
});

// Obtener mi perfil
const myProfile = await fetch('/api/youth-profile/' + userId, {
  headers: { 'Authorization': 'Bearer ' + token }
});

// Obtener mis postulaciones
const myApplications = await fetch('/api/youthapplication?youthProfileId=' + userId, {
  headers: { 'Authorization': 'Bearer ' + token }
});

// Crear nueva postulación
const formData = new FormData();
formData.append('title', 'Desarrollador Frontend');
formData.append('description', 'Soy un desarrollador...');
formData.append('youthProfileId', userId);
formData.append('cvFile', cvFile);
formData.append('coverLetterFile', coverLetterFile);

const newApplication = await fetch('/api/youthapplication', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});
```

### 6.2 🏢 Dashboard de Empresa

```javascript
// Ver postulaciones públicas
const publicApplications = await fetch('/api/youthapplication?isPublic=true', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// Expresar interés
const interest = await fetch('/api/youthapplication/' + applicationId + '/company-interest', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    companyId: companyId,
    status: 'INTERESTED',
    message: 'Nos interesa tu perfil'
  })
});

// Enviar mensaje
const message = await fetch('/api/youthapplication/' + applicationId + '/message', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Hola, nos gustaría agendar una entrevista'
  })
});
```

### 6.3 💬 Chat en Tiempo Real

```javascript
// Obtener mensajes de una postulación
const messages = await fetch('/api/youthapplication/' + applicationId + '/messages', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// Enviar mensaje
const sendMessage = async (content) => {
  await fetch('/api/youthapplication/' + applicationId + '/message', {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });
};
```

---

## 🔧 PARTE 7: CONFIGURACIÓN Y DEPLOYMENT

### 7.1 📁 Estructura de Archivos

```
uploads/
├── youth-applications/
│   ├── cv/
│   │   └── cv_userId_timestamp.pdf
│   └── cover-letters/
│       └── cover_userId_timestamp.pdf
```

### 7.2 🔐 Permisos

- **Jóvenes:** Solo pueden gestionar sus propias postulaciones
- **Empresas:** Pueden ver postulaciones públicas y expresar interés
- **Autenticación:** Requerida en todas las rutas

### 7.3 📏 Límites

- **Tamaño de archivo:** Máximo 5MB por archivo
- **Tipos permitidos:** Solo archivos PDF
- **Archivos por postulación:** 1 CV + 1 carta de presentación

---

## 🚀 Resumen para Frontend

### Funcionalidades Principales:

1. **Para Jóvenes:**
   - ✅ Crear postulaciones con título, descripción, CV y carta
   - ✅ Subir archivos PDF o usar URLs
   - ✅ Gestionar visibilidad (pública/privada)
   - ✅ Ver estadísticas (vistas, intereses)
   - ✅ Chatear con empresas
   - ✅ Ver intereses de empresas

2. **Para Empresas:**
   - ✅ Explorar postulaciones públicas
   - ✅ Ver perfiles completos de jóvenes
   - ✅ Expresar diferentes niveles de interés
   - ✅ Chatear directamente con jóvenes
   - ✅ Seguimiento de candidatos

3. **Sistema de Mensajería:**
   - ✅ Chat bidireccional entre jóvenes y empresas
   - ✅ Mensajes en tiempo real
   - ✅ Estados de lectura

4. **Gestión de Intereses:**
   - ✅ Estados progresivos (INTERESTED → CONTACTED → INTERVIEW_SCHEDULED → HIRED)
   - ✅ Mensajes personalizados por empresa
   - ✅ Seguimiento de múltiples empresas por postulación

### Endpoints Principales:

- `POST /api/youth-profile/register` - Registrar perfil de joven
- `GET /api/youth-profile/{userId}` - Obtener perfil de joven
- `PUT /api/youth-profile/{userId}` - Actualizar perfil de joven
- `GET /api/youthapplication` - Listar postulaciones
- `POST /api/youthapplication` - Crear postulación
- `GET /api/youthapplication/{id}` - Ver postulación específica
- `POST /api/youthapplication/{id}/message` - Enviar mensaje
- `GET /api/youthapplication/{id}/messages` - Ver mensajes
- `POST /api/youthapplication/{id}/company-interest` - Expresar interés
- `GET /api/youthapplication/{id}/company-interests` - Ver intereses

¡El sistema está listo para implementar en el frontend! 🎉
