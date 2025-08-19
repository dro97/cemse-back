# 🎓 Sistema de Cursos Tipo Platzi

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Sistema](#estructura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Endpoints](#endpoints)
5. [Flujo de Trabajo](#flujo-de-trabajo)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Características Especiales](#características-especiales)

## 🎯 Descripción General

El sistema de cursos tipo Platzi permite crear, gestionar y consumir cursos estructurados con módulos, lecciones, recursos y certificados. Incluye seguimiento de progreso en videos y certificados por módulo y curso completo.

### 🚀 Características Principales

- ✅ **Cursos estructurados** con módulos y lecciones
- ✅ **Recursos multimedia** (PDFs, videos, documentos, enlaces)
- ✅ **Seguimiento de progreso** en videos (0-100%)
- ✅ **Certificados por módulo** y curso completo
- ✅ **Sistema de inscripciones** y progreso
- ✅ **Gestión de contenido** tipo Platzi
- ✅ **Videos de YouTube** y archivos locales
- ✅ **Recursos descargables** y enlaces externos

## 🏗️ Estructura del Sistema

```
Curso
├── Módulos (CourseModule)
│   ├── Lecciones (Lesson)
│   │   ├── Videos (videoUrl)
│   │   ├── Recursos (LessonResource)
│   │   └── Progreso (LessonProgress)
│   └── Certificados (ModuleCertificate)
├── Inscripciones (CourseEnrollment)
└── Certificados (Certificate)
```

## 🗄️ Base de Datos

### Modelos Principales

#### Course (Curso)
```prisma
model Course {
  id                String             @id @default(cuid())
  title             String
  slug              String             @unique
  description       String
  shortDescription  String?
  thumbnail         String?
  videoPreview      String?
  objectives        String[]
  prerequisites     String[]
  duration          Int
  level             CourseLevel
  category          CourseCategory
  isMandatory       Boolean            @default(false)
  isActive          Boolean            @default(true)
  price             Decimal?           @default(0)
  rating            Decimal?           @default(0)
  studentsCount     Int                @default(0)
  completionRate    Decimal?           @default(0)
  totalLessons      Int                @default(0)
  totalQuizzes      Int                @default(0)
  totalResources    Int                @default(0)
  tags              String[]
  certification     Boolean            @default(true)
  includedMaterials String[]
  instructorId      String?
  institutionName   String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  publishedAt       DateTime?
  
  // Relaciones
  certificates      Certificate[]
  enrollments       CourseEnrollment[]
  modules           CourseModule[]
  instructor        Profile?           @relation("CourseInstructor")
  quizzes           Quiz[]
}
```

#### CourseModule (Módulo)
```prisma
model CourseModule {
  id                String   @id @default(cuid())
  courseId          String   @map("course_id")
  title             String
  description       String?
  orderIndex        Int      @map("order_index")
  estimatedDuration Int      @map("estimated_duration")
  isLocked          Boolean  @default(false) @map("is_locked")
  prerequisites     String[]
  hasCertificate    Boolean  @default(true) @map("has_certificate")
  certificateTemplate String? @map("certificate_template")
  
  // Relaciones
  course            Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons           Lesson[]
  moduleCertificates ModuleCertificate[]
}
```

#### Lesson (Lección)
```prisma
model Lesson {
  id          String           @id @default(cuid())
  moduleId    String           @map("module_id")
  title       String
  description String?
  content     String
  contentType LessonType       @map("content_type")
  videoUrl    String?          @map("video_url")
  duration    Int?
  orderIndex  Int              @map("order_index")
  isRequired  Boolean          @default(true) @map("is_required")
  isPreview   Boolean          @default(false) @map("is_preview")
  attachments Json?
  
  // Relaciones
  resources   LessonResource[]
  discussions Discussion[]
  progress    LessonProgress[]
  module      CourseModule     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  quizzes     Quiz[]
  notes       StudentNote[]
}
```

#### LessonResource (Recurso)
```prisma
model LessonResource {
  id          String   @id @default(cuid())
  lessonId    String   @map("lesson_id")
  title       String
  description String?
  type        ResourceType
  url         String
  filePath    String?  @map("file_path")
  fileSize    Int?     @map("file_size")
  orderIndex  Int      @map("order_index")
  isDownloadable Boolean @default(true) @map("is_downloadable")
  createdAt   DateTime @default(now()) @map("created_at")
  
  // Relaciones
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}
```

#### LessonProgress (Progreso)
```prisma
model LessonProgress {
  id           String           @id @default(cuid())
  enrollmentId String           @map("enrollment_id")
  lessonId     String           @map("lesson_id")
  isCompleted  Boolean          @default(false) @map("is_completed")
  completedAt  DateTime?        @map("completed_at")
  timeSpent    Int              @default(0) @map("time_spent")
  videoProgress Float            @default(0) @map("video_progress") // 0.0 to 1.0 (0% to 100%)
  lastWatchedAt DateTime?       @map("last_watched_at")
  
  // Relaciones
  enrollment   CourseEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  lesson       Lesson           @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}
```

#### ModuleCertificate (Certificado de Módulo)
```prisma
model ModuleCertificate {
  id           String   @id @default(cuid())
  moduleId     String   @map("module_id")
  studentId    String   @map("student_id")
  certificateUrl String @map("certificate_url")
  issuedAt     DateTime @default(now()) @map("issued_at")
  grade        Int?     // Calificación del módulo (0-100)
  completedAt  DateTime @map("completed_at")
  
  // Relaciones
  module       CourseModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  student      Profile      @relation("ModuleCertificateStudent", fields: [studentId], references: [userId], onDelete: Cascade)
}
```

### Enums

#### ResourceType
```prisma
enum ResourceType {
  PDF
  DOCUMENT
  VIDEO
  AUDIO
  IMAGE
  LINK
  ZIP
  OTHER
}
```

#### LessonType
```prisma
enum LessonType {
  VIDEO
  TEXT
  QUIZ
  ASSIGNMENT
  LIVE
}
```

## 🔌 Endpoints

### Cursos

#### Crear Curso
```http
POST /api/course
Content-Type: multipart/form-data

# Campos de texto
title: "Curso de Programación Web"
slug: "programacion-web"
description: "Aprende HTML, CSS y JavaScript"
shortDescription: "Fundamentos de desarrollo web"
level: "BEGINNER"
category: "TECHNICAL_SKILLS"
duration: "480"
price: "0"
isActive: "true"
certification: "true"

# Arrays como JSON strings
objectives: '["Crear páginas web", "Entender CSS", "Programar en JavaScript"]'
prerequisites: '["Conocimientos básicos de computación"]'
tags: '["programación", "web", "frontend"]'
includedMaterials: '["PDFs", "Videos", "Ejercicios prácticos"]'

# Archivos
thumbnail: [archivo de imagen - JPEG, PNG, GIF, WebP]
videoPreview: [archivo de video - MP4, WebM, OGG, AVI, MOV]
```

**📸 Tipos de archivos soportados:**
- **Thumbnail**: JPEG, PNG, GIF, WebP (máx. 100MB)
- **Video Preview**: MP4, WebM, OGG, AVI, MOV (máx. 100MB)

#### Obtener Curso
```http
GET /api/course/:id
```

#### Listar Cursos
```http
GET /api/course
```

### Módulos

#### Crear Módulo
```http
POST /api/coursemodule
Content-Type: application/json

{
  "courseId": "course_id",
  "title": "Fundamentos de HTML",
  "description": "Aprende los conceptos básicos de HTML5",
  "orderIndex": 1,
  "estimatedDuration": 120,
  "prerequisites": [],
  "hasCertificate": true
}
```

#### Obtener Módulo
```http
GET /api/coursemodule/:id
```

### Lecciones

#### Crear Lección
```http
POST /api/lesson
Content-Type: application/json

{
  "moduleId": "module_id",
  "title": "Introducción a HTML",
  "description": "¿Qué es HTML y por qué es importante?",
  "content": "HTML es el lenguaje de marcado estándar...",
  "contentType": "VIDEO",
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "duration": 15,
  "orderIndex": 1,
  "isRequired": true,
  "isPreview": false
}
```

#### Obtener Lección
```http
GET /api/lesson/:id
```

### Recursos de Lecciones

#### Crear Recurso
```http
POST /api/lessonresource
Content-Type: multipart/form-data

{
  "lessonId": "lesson_id",
  "title": "Guía de HTML",
  "description": "PDF con todos los conceptos de HTML",
  "type": "PDF",
  "orderIndex": 1,
  "isDownloadable": true,
  "file": [archivo]
}
```

#### Listar Recursos
```http
GET /api/lessonresource?lessonId=lesson_id
```

### Progreso de Lecciones

#### Crear/Actualizar Progreso
```http
POST /api/lessonprogress
Content-Type: application/json

{
  "enrollmentId": "enrollment_id",
  "lessonId": "lesson_id",
  "isCompleted": true,
  "timeSpent": 900,
  "videoProgress": 1.0
}
```

#### Obtener Progreso del Curso
```http
GET /api/lessonprogress/course/:courseId
```

### Certificados de Módulos

#### Crear Certificado
```http
POST /api/modulecertificate
Content-Type: application/json

{
  "moduleId": "module_id",
  "studentId": "student_id",
  "certificateUrl": "https://example.com/certificate.pdf",
  "grade": 95
}
```

#### Listar Certificados
```http
GET /api/modulecertificate?moduleId=module_id
```

## 🔄 Flujo de Trabajo

### 1. Creación de Curso (Instructor/Organización)

1. **Crear curso** con información básica
2. **Crear módulos** para estructurar el contenido
3. **Crear lecciones** dentro de cada módulo
4. **Agregar recursos** a las lecciones (PDFs, videos, etc.)
5. **Publicar curso** para que esté disponible

### 2. Consumo de Curso (Estudiante)

1. **Explorar cursos** disponibles
2. **Inscribirse** al curso deseado
3. **Acceder a módulos** y lecciones
4. **Ver videos** y descargar recursos
5. **Marcar progreso** automáticamente
6. **Completar módulos** y obtener certificados
7. **Finalizar curso** y obtener certificado final

### 3. Seguimiento de Progreso

1. **Progreso en video**: Se actualiza automáticamente (0-100%)
2. **Tiempo dedicado**: Se registra el tiempo de visualización
3. **Lecciones completadas**: Se marcan cuando se termina el video
4. **Progreso del módulo**: Se calcula basado en lecciones completadas
5. **Progreso del curso**: Se calcula basado en módulos completados

## 💡 Ejemplos de Uso

### Crear un Curso Completo

```javascript
// 1. Crear curso
const course = await api.post('/course', {
  title: "Curso de Programación Web",
  slug: "programacion-web",
  description: "Aprende HTML, CSS y JavaScript",
  level: "BEGINNER",
  category: "TECHNICAL_SKILLS",
  duration: 480,
  objectives: ["Crear páginas web", "Programar en JavaScript"],
  prerequisites: ["Conocimientos básicos"],
  certification: true
});

// 2. Crear módulos
const module1 = await api.post('/coursemodule', {
  courseId: course.data.id,
  title: "Fundamentos de HTML",
  orderIndex: 1,
  estimatedDuration: 120,
  hasCertificate: true
});

// 3. Crear lecciones
const lesson1 = await api.post('/lesson', {
  moduleId: module1.data.id,
  title: "Introducción a HTML",
  contentType: "VIDEO",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  duration: 15,
  orderIndex: 1
});

// 4. Agregar recursos
await api.post('/lessonresource', {
  lessonId: lesson1.data.id,
  title: "Guía de HTML",
  type: "PDF",
  url: "https://example.com/html-guide.pdf",
  orderIndex: 1
});
```

### Seguimiento de Progreso

```javascript
// Actualizar progreso de video
await api.post('/lessonprogress', {
  enrollmentId: "enrollment_id",
  lessonId: "lesson_id",
  isCompleted: false,
  timeSpent: 600, // 10 minutos
  videoProgress: 0.5 // 50% del video
});

// Marcar lección como completada
await api.post('/lessonprogress', {
  enrollmentId: "enrollment_id",
  lessonId: "lesson_id",
  isCompleted: true,
  timeSpent: 900, // 15 minutos
  videoProgress: 1.0 // 100% del video
});

// Obtener progreso del curso
const progress = await api.get(`/lessonprogress/course/${courseId}`);
console.log(`Progreso: ${progress.data.overallProgress}%`);
```

### Generar Certificado

```javascript
// Generar certificado de módulo
await api.post('/modulecertificate', {
  moduleId: "module_id",
  studentId: "student_id",
  certificateUrl: "https://example.com/certificate.pdf",
  grade: 95
});
```

## ⭐ Características Especiales

### 🎥 Seguimiento de Videos

- **Progreso automático**: Se actualiza la posición del video (0-100%)
- **Tiempo dedicado**: Se registra el tiempo total de visualización
- **Última vista**: Se guarda cuándo fue la última vez que se vio
- **Completado automático**: Se marca como completado al llegar al 100%

### 📸 Subida de Archivos de Cursos

- **Imagen de portada**: Subida directa de thumbnails (JPEG, PNG, GIF, WebP)
- **Video de presentación**: Subida de videos de preview (MP4, WebM, OGG, AVI, MOV)
- **Límite de tamaño**: 100MB por archivo
- **Almacenamiento**: Archivos guardados en `/uploads/courses/`
- **URLs automáticas**: Generación automática de URLs para acceso público
- **Actualización**: Posibilidad de reemplazar archivos existentes

### 📚 Recursos Multimedia

- **PDFs**: Documentos de teoría y ejercicios
- **Videos**: Contenido audiovisual
- **Enlaces**: Recursos externos
- **Archivos ZIP**: Paquetes de ejercicios
- **Documentos**: Word, Excel, etc.

### 🏆 Sistema de Certificados

- **Certificados por módulo**: Al completar cada módulo
- **Certificado final**: Al completar todo el curso
- **Calificaciones**: Sistema de notas (0-100)
- **URLs personalizadas**: Enlaces a certificados PDF

### 📊 Progreso Detallado

- **Progreso por lección**: Individual para cada lección
- **Progreso por módulo**: Agregado de lecciones del módulo
- **Progreso del curso**: Agregado de todos los módulos
- **Estadísticas**: Tiempo dedicado, lecciones completadas

### 🔐 Permisos y Acceso

- **Instructores**: Pueden crear y editar cursos
- **Estudiantes**: Pueden ver y progresar en cursos
- **Admins**: Acceso completo al sistema
- **Organizaciones**: Pueden crear cursos para sus estudiantes

## 🚀 Próximas Mejoras

- [ ] **Sistema de quizzes** integrado en lecciones
- [ ] **Foros de discusión** por módulo
- [ ] **Notas del estudiante** en cada lección
- [ ] **Descarga masiva** de recursos
- [ ] **Progreso offline** con sincronización
- [ ] **Gamificación** con badges y puntos
- [ ] **Analytics** detallados de progreso
- [ ] **Notificaciones** de progreso y certificados

---

**¡El sistema está listo para crear experiencias de aprendizaje tipo Platzi!** 🎓
