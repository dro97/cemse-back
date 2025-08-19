# Sistema Completo de Puestos de Trabajo - Documentación API

## 📋 Resumen del Sistema

El sistema de puestos de trabajo incluye **4 controladores principales** que manejan todo el flujo desde la creación de puestos hasta la contratación de candidatos:

1. **JobOfferController** - Gestión de puestos de trabajo
2. **JobQuestionController** - Preguntas personalizadas para puestos
3. **JobApplicationController** - Aplicaciones de candidatos
4. **JobQuestionAnswerController** - Respuestas a preguntas personalizadas

---

## 🏢 PARTE 1: DOCUMENTACIÓN PARA EMPRESAS

### 🔐 Autenticación para Empresas
```http
Authorization: Bearer [TOKEN_EMPRESA]
Content-Type: application/json
```

**Nota:** Las empresas deben tener `type: 'company'` en su token de autenticación.

**⚠️ IMPORTANTE:** Todas las rutas usan nombres sin guiones:
- ✅ `/api/joboffer` (correcto)
- ❌ `/api/job-offer` (incorrecto)
- ✅ `/api/jobapplication` (correcto)  
- ❌ `/api/job-application` (incorrecto)

### 1. 🏢 Gestión de Puestos de Trabajo (Solo Empresas)

#### 1.1 Crear Puesto de Trabajo
```http
POST /api/joboffer
```

**Datos requeridos:**
```json
{
  "title": "Desarrollador Frontend Senior",
  "description": "Buscamos un desarrollador frontend senior...",
  "requirements": "Mínimo 3 años de experiencia en React...",
  "location": "Cochabamba",
  "contractType": "FULL_TIME",
  "workSchedule": "Lunes a Viernes, 9:00 AM - 6:00 PM",
  "workModality": "HYBRID",
  "experienceLevel": "SENIOR_LEVEL",
  "companyId": "ID_DE_LA_EMPRESA",
  "municipality": "Cochabamba"
}
```

**Datos opcionales:**
```json
{
  "salaryMin": 8000,
  "salaryMax": 12000,
  "benefits": "Seguro médico, bonos, capacitación",
  "skillsRequired": ["React", "TypeScript", "Node.js"],
  "desiredSkills": ["AWS", "Docker", "GraphQL"],
  "applicationDeadline": "2024-02-15T23:59:59Z"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "cme9ztt1y000313ht4yg5i10y",
  "title": "Desarrollador Frontend Senior",
  "status": "ACTIVE",
  "applicationsCount": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### 1.2 Listar Puestos de la Empresa
```http
GET /api/joboffer
```

**Respuesta (200):**
```json
[
  {
    "id": "cme9ztt1y000313ht4yg5i10y",
    "title": "Desarrollador Frontend Senior",
    "status": "ACTIVE",
    "applicationsCount": 5,
    "viewsCount": 120,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### 1.3 Obtener Puesto Específico
```http
GET /api/joboffer/{id}
```

#### 1.4 Actualizar Puesto
```http
PUT /api/joboffer/{id}
```

#### 1.5 Cerrar Puesto
```http
PUT /api/joboffer/{id}
```

**Datos para cerrar:**
```json
{
  "status": "CLOSED",
  "isActive": false
}
```

### 2. ❓ Gestión de Preguntas Personalizadas (Solo Empresas)

#### 2.1 Crear Preguntas para el Puesto
```http
POST /api/jobquestion
```

**Tipos de preguntas disponibles:**
- `text` - Respuesta de texto libre
- `multiple_choice` - Opción múltiple
- `boolean` - Sí/No

**Ejemplo de preguntas:**
```json
[
  {
    "jobOfferId": "ID_DEL_PUESTO",
    "question": "¿Cuántos años de experiencia tienes en React?",
    "type": "text",
    "required": true,
    "options": [],
    "orderIndex": 1
  },
  {
    "jobOfferId": "ID_DEL_PUESTO",
    "question": "¿Qué tecnologías dominas mejor?",
    "type": "multiple_choice",
    "required": true,
    "options": ["React", "Vue.js", "Angular", "Node.js"],
    "orderIndex": 2
  },
  {
    "jobOfferId": "ID_DEL_PUESTO",
    "question": "¿Estás disponible para trabajo remoto?",
    "type": "boolean",
    "required": true,
    "options": ["Sí", "No"],
    "orderIndex": 3
  }
]
```

#### 2.2 Listar Preguntas del Puesto
```http
GET /api/jobquestion
```

#### 2.3 Actualizar Pregunta
```http
PUT /api/jobquestion/{id}
```

#### 2.4 Eliminar Pregunta
```http
DELETE /api/jobquestion/{id}
```

### 3. 📋 Gestión de Aplicaciones (Solo Empresas)

#### 3.1 Ver Todas las Aplicaciones
```http
GET /api/jobapplication
```

**Respuesta (200):**
```json
[
  {
    "id": "cme9ztt1y000313ht4yg5i10y",
    "status": "SENT",
    "appliedAt": "2024-01-15T14:30:00Z",
    "coverLetter": "Me interesa mucho esta oportunidad...",
    "rating": null,
    "notes": null,
    "applicant": {
      "id": "cme8tvypp0000acygt8d4kc80",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@email.com"
    },
    "jobOffer": {
      "id": "cme9ztt1y000313ht4yg5i10y",
      "title": "Desarrollador Frontend Senior"
    }
  }
]
```

#### 3.2 Ver Aplicación Específica
```http
GET /api/job-application/{id}
```

**Incluye respuestas a preguntas personalizadas:**
```json
{
  "id": "cme9ztt1y000313ht4yg5i10y",
  "status": "SENT",
  "coverLetter": "Me interesa mucho esta oportunidad...",
  "cvData": {
    "education": "Ingeniería en Sistemas",
    "experience": "4 años desarrollando aplicaciones web",
    "skills": ["React", "Node.js", "TypeScript"]
  },
  "questionAnswers": [
    {
      "id": "cme9ztt1y000313ht4yg5i10y",
      "question": "¿Cuántos años de experiencia tienes en React?",
      "answer": "3 años de experiencia en React"
    }
  ]
}
```

#### 3.3 Actualizar Estado de Aplicación

**Estados disponibles:**
- `SENT` - Enviada
- `UNDER_REVIEW` - En revisión
- `PRE_SELECTED` - Preseleccionado
- `REJECTED` - Rechazado
- `HIRED` - Contratado

```http
PUT /api/jobapplication/{id}
```

**Ejemplo de actualización:**
```json
{
  "status": "PRE_SELECTED",
  "notes": "Excelente perfil técnico. Programar entrevista.",
  "rating": 8
}
```

#### 3.4 Contratar Candidato
```http
PUT /api/jobapplication/{id}
```

```json
{
  "status": "HIRED",
  "notes": "Candidato contratado. Iniciar onboarding.",
  "rating": 9
}
```

### 4. 📝 Ver Respuestas a Preguntas (Solo Empresas)

#### 4.1 Listar Todas las Respuestas
```http
GET /api/jobquestionanswer
```

#### 4.2 Ver Respuesta Específica
```http
GET /api/jobquestionanswer/{id}
```

---

## 👥 PARTE 2: DOCUMENTACIÓN PARA JÓVENES/CANDIDATOS

### 🔐 Autenticación para Jóvenes
```http
Authorization: Bearer [TOKEN_JOVEN]
Content-Type: application/json
```

**Nota:** Los jóvenes deben tener `role: 'YOUTH'` o `role: 'ADOLESCENTS'` en su token de autenticación.

**⚠️ IMPORTANTE:** Todas las rutas usan nombres sin guiones:
- ✅ `/api/joboffer` (correcto)
- ❌ `/api/job-offer` (incorrecto)
- ✅ `/api/jobapplication` (correcto)  
- ❌ `/api/job-application` (incorrecto)

### 1. 🔍 Explorar Puestos Disponibles (Solo Jóvenes)

#### 1.1 Ver Todos los Puestos
```http
GET /api/joboffer
```

**Filtros disponibles:**
- Solo puestos activos (`status: "ACTIVE"`)
- Ordenados por fecha de publicación

#### 1.2 Ver Puesto Específico
```http
GET /api/joboffer/{id}
```

**Incluye preguntas personalizadas:**
```json
{
  "id": "cme9ztt1y000313ht4yg5i10y",
  "title": "Desarrollador Frontend Senior",
  "description": "Buscamos un desarrollador...",
  "requirements": "Mínimo 3 años...",
  "salaryMin": 8000,
  "salaryMax": 12000,
  "company": {
    "id": "cme8tvypp0000acygt8d4kc80",
    "name": "TechCorp",
    "email": "hr@techcorp.com"
  },
  "jobQuestions": [
    {
      "id": "cme9ztt1y000313ht4yg5i10y",
      "question": "¿Cuántos años de experiencia tienes en React?",
      "type": "text",
      "required": true,
      "orderIndex": 1
    }
  ]
}
```

### 2. 📝 Aplicar a un Puesto (Solo Jóvenes)

#### 2.1 Crear Aplicación
```http
POST /api/jobapplication
```

**Datos requeridos:**
```json
{
  "jobOfferId": "ID_DEL_PUESTO",
  "studentId": "ID_DEL_ESTUDIANTE"
}
```

**Datos opcionales:**
```json
{
  "coverLetter": "Me interesa mucho esta oportunidad...",
  "cvData": {
    "education": "Ingeniería en Sistemas",
    "experience": "2 años desarrollando aplicaciones",
    "skills": ["React", "JavaScript", "HTML", "CSS"],
    "certifications": ["React Developer Certificate"]
  },
  "profileImage": "https://example.com/profile.jpg"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "cme9ztt1y000313ht4yg5i10y",
  "status": "SENT",
  "appliedAt": "2024-01-15T14:30:00Z",
  "jobOffer": {
    "id": "cme9ztt1y000313ht4yg5i10y",
    "title": "Desarrollador Frontend Senior"
  }
}
```

#### 2.2 Responder Preguntas Personalizadas
```http
POST /api/jobquestionanswer
```

**Ejemplo de respuestas:**
```json
[
  {
    "applicationId": "ID_DE_LA_APLICACION",
    "questionId": "ID_DE_LA_PREGUNTA",
    "answer": "3 años de experiencia en React"
  },
  {
    "applicationId": "ID_DE_LA_APLICACION",
    "questionId": "ID_DE_LA_PREGUNTA",
    "answer": "React, JavaScript, TypeScript"
  }
]
```

### 3. 📊 Seguimiento de Aplicaciones (Solo Jóvenes)

#### 3.1 Ver Mis Aplicaciones
```http
GET /api/jobapplication
```

**Respuesta (200):**
```json
[
  {
    "id": "cme9ztt1y000313ht4yg5i10y",
    "status": "PRE_SELECTED",
    "appliedAt": "2024-01-15T14:30:00Z",
    "reviewedAt": "2024-01-16T09:00:00Z",
    "notes": "Excelente perfil. Programar entrevista.",
    "rating": 8,
    "jobOffer": {
      "id": "cme9ztt1y000313ht4yg5i10y",
      "title": "Desarrollador Frontend Senior",
      "company": {
        "name": "TechCorp",
        "email": "hr@techcorp.com"
      }
    }
  }
]
```

#### 3.2 Ver Aplicación Específica
```http
GET /api/jobapplication/{id}
```

#### 3.3 Actualizar Mi Aplicación
```http
PUT /api/jobapplication/{id}
```

**Solo puede actualizar:**
- `coverLetter` - Carta de presentación
- `cvData` - Datos del CV

### 4. 📋 Ver Mis Respuestas (Solo Jóvenes)

#### 4.1 Listar Mis Respuestas
```http
GET /api/jobquestionanswer
```

---

## 📊 Estados del Sistema

### Estados de Puesto de Trabajo
- `ACTIVE` - Activo y recibiendo aplicaciones
- `PAUSED` - Pausado temporalmente
- `CLOSED` - Cerrado, no recibe más aplicaciones
- `DRAFT` - Borrador, no visible públicamente

### Estados de Aplicación
- `SENT` - Aplicación enviada
- `UNDER_REVIEW` - En revisión por la empresa
- `PRE_SELECTED` - Preseleccionado para entrevista
- `REJECTED` - Aplicación rechazada
- `HIRED` - Candidato contratado

### Tipos de Preguntas
- `text` - Respuesta de texto libre
- `multiple_choice` - Selección múltiple
- `boolean` - Sí/No

---

## 🔐 Permisos y Roles por Tipo de Usuario

### 🏢 EMPRESAS (type: 'company')
**Funcionalidades exclusivas para empresas:**

#### ✅ Gestión de Puestos
- Crear puestos de trabajo
- Editar puestos existentes
- Cerrar puestos de trabajo
- Ver estadísticas de sus puestos

#### ✅ Gestión de Aplicaciones
- Ver todas las aplicaciones a sus puestos
- Revisar CVs y cartas de presentación
- Actualizar estado de aplicaciones (SENT → UNDER_REVIEW → PRE_SELECTED → HIRED)
- Calificar candidatos (1-10)
- Contratar candidatos
- Rechazar aplicaciones

#### ✅ Preguntas Personalizadas
- Crear preguntas específicas para cada puesto
- Editar preguntas existentes
- Eliminar preguntas
- Ver respuestas de los candidatos

#### ✅ Análisis y Reportes
- Ver métricas de sus puestos
- Analizar perfiles de candidatos
- Generar reportes de contratación

---

### 👥 JÓVENES/ESTUDIANTES (role: 'YOUTH', 'ADOLESCENTS')
**Funcionalidades exclusivas para jóvenes:**

#### ✅ Exploración de Puestos
- Ver todos los puestos disponibles
- Filtrar puestos por categoría, ubicación, salario
- Ver detalles completos de cada puesto
- Ver preguntas personalizadas del puesto

#### ✅ Aplicación a Puestos
- Aplicar a puestos de trabajo
- Subir CV y carta de presentación
- Responder preguntas personalizadas
- Ver confirmación de aplicación

#### ✅ Seguimiento Personal
- Ver estado de sus aplicaciones
- Recibir notificaciones de cambios de estado
- Ver calificaciones recibidas
- Ver comentarios de las empresas

#### ✅ Gestión de Perfil
- Actualizar CV y carta de presentación
- Ver historial de aplicaciones
- Ver respuestas enviadas a preguntas

---

### 🔧 SuperAdmin (role: 'SUPERADMIN')
**Acceso completo al sistema:**
- ✅ Todas las funcionalidades de empresas
- ✅ Todas las funcionalidades de jóvenes
- ✅ Eliminar puestos y aplicaciones
- ✅ Gestionar usuarios y permisos
- ✅ Ver reportes globales del sistema

---

## 🚀 Flujo Completo del Sistema

```
🏢 EMPRESA                                    👥 JOVEN
     │                                           │
     │ 1. Crear puesto                          │
     │ POST /api/joboffer                       │
     │                                           │
     │ 2. Agregar preguntas                     │
     │ POST /api/jobquestion                    │
     │                                           │
     │                                           │ 3. Ver puesto
     │                                           │ GET /api/joboffer/{id}
     │                                           │
     │                                           │ 4. Aplicar al puesto
     │                                           │ POST /api/jobapplication
     │                                           │
     │                                           │ 5. Responder preguntas
     │                                           │ POST /api/jobquestionanswer
     │                                           │
     │ 6. Revisar aplicaciones                  │
     │ GET /api/jobapplication                  │
     │                                           │
     │ 7. Preseleccionar candidato              │
     │ PUT /api/jobapplication/{id}             │
     │                                           │
     │ 8. Contratar candidato                   │
     │ PUT /api/jobapplication/{id}             │
     │                                           │
     │ 9. Cerrar puesto                         │
     │ PUT /api/joboffer/{id}                   │
     │                                           │
```

## 📊 Resumen Visual de Funcionalidades

| Funcionalidad | 🏢 Empresa | 👥 Joven | 🔧 Admin |
|---------------|------------|----------|----------|
| **Crear puestos** | ✅ | ❌ | ✅ |
| **Ver puestos** | ✅ (solo suyos) | ✅ (todos) | ✅ |
| **Aplicar a puestos** | ❌ | ✅ | ✅ |
| **Ver aplicaciones** | ✅ (a sus puestos) | ✅ (solo suyas) | ✅ |
| **Crear preguntas** | ✅ | ❌ | ✅ |
| **Responder preguntas** | ❌ | ✅ | ✅ |
| **Actualizar estado** | ✅ | ❌ | ✅ |
| **Calificar candidatos** | ✅ | ❌ | ✅ |
| **Eliminar puestos** | ❌ | ❌ | ✅ |

---

## 📝 Notas Importantes

### 🔐 Autenticación y Permisos
1. **Autenticación requerida**: Todas las rutas requieren token válido
2. **Tipos de usuario**: El sistema distingue entre `type: 'company'` (empresas) y `role: 'YOUTH'/'ADOLESCENTS'` (jóvenes)
3. **Permisos estrictos**: Cada tipo de usuario solo puede acceder a sus funcionalidades específicas

### 🏢 Para Empresas
4. **Gestión completa**: Las empresas pueden crear, editar y cerrar sus propios puestos
5. **Revisión de candidatos**: Pueden ver todas las aplicaciones a sus puestos
6. **Proceso de selección**: Controlan el flujo SENT → UNDER_REVIEW → PRE_SELECTED → HIRED
7. **Calificaciones**: Pueden calificar candidatos del 1 al 10

### 👥 Para Jóvenes
8. **Exploración libre**: Pueden ver todos los puestos activos disponibles
9. **Aplicación única**: No pueden aplicar dos veces al mismo puesto
10. **Seguimiento personal**: Solo ven sus propias aplicaciones y estados
11. **Actualización limitada**: Solo pueden actualizar su CV y carta de presentación

### 🔧 Funcionalidades Técnicas
12. **Validaciones**: El sistema valida que no se aplique dos veces al mismo puesto
13. **Relaciones**: Las preguntas están vinculadas a puestos específicos
14. **Estados secuenciales**: El flujo de estados no se puede retroceder
15. **Datos flexibles**: El CV se almacena como JSON para adaptabilidad

---

## 🔧 Configuración del Frontend

### Headers requeridos
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Base URL
```
http://localhost:3001/api
```

### Manejo de errores
```javascript
if (response.status === 401) {
  // Token expirado, redirigir a login
}
if (response.status === 403) {
  // Permisos insuficientes
}
if (response.status === 400) {
  // Datos inválidos
}
```

---

## 📋 RESUMEN DE RUTAS ESPECÍFICAS

### 🏢 Rutas para Empresas
| Funcionalidad | Método | Ruta | Descripción |
|---------------|--------|------|-------------|
| **Crear puesto** | POST | `/api/joboffer` | Crear nuevo puesto de trabajo |
| **Listar puestos** | GET | `/api/joboffer` | Ver puestos de la empresa |
| **Ver puesto** | GET | `/api/joboffer/{id}` | Ver puesto específico |
| **Actualizar puesto** | PUT | `/api/joboffer/{id}` | Editar puesto existente |
| **Cerrar puesto** | PUT | `/api/joboffer/{id}` | Cerrar puesto (status: CLOSED) |
| **Crear preguntas** | POST | `/api/jobquestion` | Agregar preguntas al puesto |
| **Listar preguntas** | GET | `/api/jobquestion` | Ver preguntas del puesto |
| **Actualizar pregunta** | PUT | `/api/jobquestion/{id}` | Editar pregunta existente |
| **Eliminar pregunta** | DELETE | `/api/jobquestion/{id}` | Eliminar pregunta |
| **Ver aplicaciones** | GET | `/api/jobapplication` | Ver aplicaciones a sus puestos |
| **Ver aplicación** | GET | `/api/jobapplication/{id}` | Ver aplicación específica |
| **Actualizar aplicación** | PUT | `/api/jobapplication/{id}` | Cambiar estado/calificar |
| **Ver respuestas** | GET | `/api/jobquestionanswer` | Ver respuestas a preguntas |

### 👥 Rutas para Jóvenes
| Funcionalidad | Método | Ruta | Descripción |
|---------------|--------|------|-------------|
| **Ver puestos** | GET | `/api/joboffer` | Ver todos los puestos activos |
| **Ver puesto** | GET | `/api/joboffer/{id}` | Ver detalles de puesto específico |
| **Aplicar a puesto** | POST | `/api/jobapplication` | Crear aplicación |
| **Ver mis aplicaciones** | GET | `/api/jobapplication` | Ver mis aplicaciones |
| **Ver mi aplicación** | GET | `/api/jobapplication/{id}` | Ver aplicación específica |
| **Actualizar aplicación** | PUT | `/api/jobapplication/{id}` | Actualizar CV/carta |
| **Responder preguntas** | POST | `/api/jobquestionanswer` | Enviar respuestas |
| **Ver mis respuestas** | GET | `/api/jobquestionanswer` | Ver respuestas enviadas |

### 🔧 Rutas para Admin
| Funcionalidad | Método | Ruta | Descripción |
|---------------|--------|------|-------------|
| **Eliminar puesto** | DELETE | `/api/joboffer/{id}` | Eliminar puesto (solo admin) |
| **Todas las anteriores** | - | - | Acceso completo a todas las funcionalidades |
