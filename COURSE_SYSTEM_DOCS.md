# 📚 Sistema de Cursos - Documentación Completa

## 🎯 **Descripción General**

El **Sistema de Cursos** es una plataforma completa de aprendizaje que permite:

- **Crear y gestionar cursos** con módulos y lecciones
- **Inscribir estudiantes** a cursos
- **Seguir el progreso** de cada estudiante
- **Evaluar con quizzes** y exámenes
- **Emitir certificados** al completar cursos
- **Gestionar contenido multimedia** (videos, documentos, etc.)

## 🏗️ **Arquitectura del Sistema**

### **📋 Modelos de Datos**

#### **1. Course (Curso)**
```typescript
{
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  videoPreview?: string;
  objectives: string[];
  prerequisites: string[];
  duration: number;
  level: CourseLevel; // BEGINNER, INTERMEDIATE, ADVANCED
  category: CourseCategory; // SOFT_SKILLS, TECHNICAL_SKILLS, etc.
  isMandatory: boolean;
  isActive: boolean;
  price: number;
  rating: number;
  studentsCount: number;
  completionRate: number;
  totalLessons: number;
  totalQuizzes: number;
  totalResources: number;
  tags: string[];
  certification: boolean;
  includedMaterials: string[];
  instructorId?: string;
  institutionName?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

#### **2. CourseModule (Módulo del Curso)**
```typescript
{
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedDuration: number;
  isLocked: boolean;
  prerequisites: string[];
}
```

#### **3. Lesson (Lección)**
```typescript
{
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  content: string;
  contentType: LessonType; // VIDEO, TEXT, QUIZ, EXERCISE, DOCUMENT, INTERACTIVE
  videoUrl?: string;
  duration?: number;
  orderIndex: number;
  isRequired: boolean;
  isPreview: boolean;
  attachments?: Json;
}
```

#### **4. CourseEnrollment (Inscripción al Curso)**
```typescript
{
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: EnrollmentStatus; // ENROLLED, IN_PROGRESS, COMPLETED, DROPPED, SUSPENDED
  progress: number; // 0-100%
  currentModuleId?: string;
  currentLessonId?: string;
  certificateUrl?: string;
  timeSpent: number;
  certificateIssued: boolean;
  finalGrade?: number;
  moduleProgress?: Json;
  quizResults?: Json;
}
```

#### **5. LessonProgress (Progreso de Lección)**
```typescript
{
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent: number;
}
```

#### **6. Quiz (Examen)**
```typescript
{
  id: string;
  courseId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  showCorrectAnswers: boolean;
  isActive: boolean;
}
```

#### **7. QuizAttempt (Intento de Examen)**
```typescript
{
  id: string;
  enrollmentId?: string;
  quizId: string;
  studentId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  passed?: boolean;
  timeSpent: number;
}
```

## 🚀 **Flujo Completo del Sistema**

### **1. 🎓 Creación de Cursos**

#### **Quién puede crear cursos:**
- ✅ **SuperAdmin**
- ✅ **Organizaciones** (COMPANIES, MUNICIPAL_GOVERNMENTS, TRAINING_CENTERS, NGOS_AND_FOUNDATIONS)
- ✅ **Municipios** (type 'municipality')

#### **Endpoint para crear curso:**
```bash
POST /api/courses
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Desarrollo Web con React",
  "slug": "desarrollo-web-react",
  "description": "Aprende a crear aplicaciones web modernas con React",
  "shortDescription": "Curso completo de React",
  "objectives": [
    "Entender los fundamentos de React",
    "Crear componentes reutilizables",
    "Manejar estado y props"
  ],
  "prerequisites": [
    "Conocimientos básicos de JavaScript",
    "HTML y CSS"
  ],
  "duration": 40, // horas
  "level": "INTERMEDIATE",
  "category": "TECHNICAL_SKILLS",
  "isMandatory": false,
  "price": 0,
  "tags": ["react", "javascript", "web"],
  "certification": true,
  "includedMaterials": ["Código fuente", "Presentaciones", "Ejercicios"]
}
```

### **2. 📚 Gestión de Módulos y Lecciones**

#### **Crear módulo:**
```bash
POST /api/course-modules
{
  "courseId": "course123",
  "title": "Fundamentos de React",
  "description": "Introducción a React y sus conceptos básicos",
  "orderIndex": 1,
  "estimatedDuration": 8,
  "isLocked": false,
  "prerequisites": []
}
```

#### **Crear lección:**
```bash
POST /api/lessons
{
  "moduleId": "module123",
  "title": "¿Qué es React?",
  "description": "Introducción al framework React",
  "content": "React es una biblioteca de JavaScript...",
  "contentType": "VIDEO",
  "videoUrl": "https://example.com/video.mp4",
  "duration": 15,
  "orderIndex": 1,
  "isRequired": true,
  "isPreview": true
}
```

### **3. 🎯 Inscripción a Cursos**

#### **Quién puede inscribirse:**
- ✅ **Estudiantes** (YOUTH, ADOLESCENTS)
- ✅ **Cualquier usuario con perfil**

#### **Endpoint para inscribirse:**
```bash
POST /api/course-enrollments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "studentId": "user123",
  "courseId": "course123"
}
```

#### **Respuesta de inscripción:**
```json
{
  "id": "enrollment123",
  "studentId": "user123",
  "courseId": "course123",
  "enrolledAt": "2024-01-15T10:30:00Z",
  "status": "ENROLLED",
  "progress": 0,
  "timeSpent": 0,
  "certificateIssued": false
}
```

### **4. 📖 Progreso de Aprendizaje**

#### **Marcar lección como completada:**
```bash
POST /api/lesson-progress
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "enrollmentId": "enrollment123",
  "lessonId": "lesson123",
  "isCompleted": true,
  "completedAt": "2024-01-15T11:30:00Z",
  "timeSpent": 900 // segundos
}
```

#### **Actualizar progreso del curso:**
```bash
PUT /api/course-enrollments/enrollment123
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "progress": 25, // 25% completado
  "currentModuleId": "module123",
  "currentLessonId": "lesson456",
  "status": "IN_PROGRESS"
}
```

### **5. 🧪 Sistema de Evaluación**

#### **Crear quiz:**
```bash
POST /api/quizzes
{
  "courseId": "course123",
  "title": "Quiz: Fundamentos de React",
  "description": "Evalúa tu conocimiento de React",
  "timeLimit": 1800, // 30 minutos
  "passingScore": 70,
  "showCorrectAnswers": true
}
```

#### **Crear pregunta:**
```bash
POST /api/quiz-questions
{
  "quizId": "quiz123",
  "question": "¿Qué es JSX en React?",
  "type": "MULTIPLE_CHOICE",
  "options": [
    "Un lenguaje de programación",
    "Una extensión de sintaxis para JavaScript",
    "Un framework de CSS",
    "Una base de datos"
  ],
  "correctAnswer": "Una extensión de sintaxis para JavaScript",
  "explanation": "JSX permite escribir HTML en JavaScript",
  "points": 10,
  "orderIndex": 1
}
```

#### **Realizar intento de quiz:**
```bash
POST /api/quiz-attempts
{
  "enrollmentId": "enrollment123",
  "quizId": "quiz123",
  "studentId": "user123",
  "startedAt": "2024-01-15T12:00:00Z"
}
```

#### **Enviar respuestas:**
```bash
POST /api/quiz-answers
{
  "attemptId": "attempt123",
  "questionId": "question123",
  "answer": "Una extensión de sintaxis para JavaScript"
}
```

#### **Finalizar intento:**
```bash
PUT /api/quiz-attempts/attempt123
{
  "completedAt": "2024-01-15T12:30:00Z",
  "score": 85,
  "passed": true,
  "timeSpent": 1800
}
```

### **6. 🏆 Certificación**

#### **Completar curso:**
```bash
PUT /api/course-enrollments/enrollment123
{
  "status": "COMPLETED",
  "completedAt": "2024-01-20T15:00:00Z",
  "progress": 100,
  "finalGrade": 92,
  "certificateIssued": true,
  "certificateUrl": "https://example.com/certificates/cert123.pdf"
}
```

## 📊 **Seguimiento y Estadísticas**

### **1. 📈 Progreso del Estudiante**

#### **Obtener progreso detallado:**
```bash
GET /api/course-enrollments/enrollment123
```

**Respuesta:**
```json
{
  "id": "enrollment123",
  "studentId": "user123",
  "courseId": "course123",
  "status": "IN_PROGRESS",
  "progress": 65,
  "currentModuleId": "module456",
  "currentLessonId": "lesson789",
  "timeSpent": 7200, // 2 horas
  "moduleProgress": {
    "module123": {
      "completed": true,
      "lessonsCompleted": 5,
      "totalLessons": 5
    },
    "module456": {
      "completed": false,
      "lessonsCompleted": 2,
      "totalLessons": 4
    }
  },
  "quizResults": {
    "quiz123": {
      "score": 85,
      "passed": true,
      "attempts": 1
    }
  }
}
```

### **2. 📊 Estadísticas del Curso**

#### **Obtener estadísticas:**
```bash
GET /api/courses/course123/stats
```

**Respuesta:**
```json
{
  "totalStudents": 150,
  "activeStudents": 120,
  "completedStudents": 45,
  "averageProgress": 67.5,
  "averageGrade": 82.3,
  "completionRate": 30,
  "averageTimeSpent": 14400, // 4 horas
  "moduleStats": [
    {
      "moduleId": "module123",
      "title": "Fundamentos de React",
      "completionRate": 85,
      "averageTime": 4800
    }
  ]
}
```

### **3. 👥 Seguimiento por Organizaciones**

#### **Ver todos los estudiantes:**
```bash
GET /api/course-enrollments?courseId=course123
```

#### **Ver progreso de un estudiante específico:**
```bash
GET /api/lesson-progress?enrollmentId=enrollment123
```

## 🔐 **Permisos y Roles**

### **📚 Creación y Gestión de Cursos**
- **SuperAdmin**: Acceso completo
- **Organizaciones**: Crear y gestionar sus propios cursos
- **Municipios**: Crear cursos para su jurisdicción
- **Estudiantes**: Solo ver cursos disponibles

### **🎓 Inscripciones**
- **Estudiantes**: Inscribirse a cursos
- **Organizaciones**: Ver todas las inscripciones
- **SuperAdmin**: Acceso completo

### **📖 Progreso**
- **Estudiantes**: Ver y actualizar su propio progreso
- **Organizaciones**: Ver progreso de todos los estudiantes
- **SuperAdmin**: Acceso completo

### **🧪 Evaluaciones**
- **Estudiantes**: Realizar quizzes
- **Organizaciones**: Crear y gestionar quizzes
- **SuperAdmin**: Acceso completo

## 📱 **Endpoints Principales**

### **🎓 Cursos**
```bash
GET    /api/courses                    # Listar todos los cursos
GET    /api/courses/:id               # Obtener curso específico
POST   /api/courses                   # Crear nuevo curso
PUT    /api/courses/:id               # Actualizar curso
DELETE /api/courses/:id               # Eliminar curso
```

### **📚 Módulos**
```bash
GET    /api/course-modules            # Listar módulos
GET    /api/course-modules/:id        # Obtener módulo específico
POST   /api/course-modules            # Crear módulo
PUT    /api/course-modules/:id        # Actualizar módulo
DELETE /api/course-modules/:id        # Eliminar módulo
```

### **📖 Lecciones**
```bash
GET    /api/lessons                   # Listar lecciones
GET    /api/lessons/:id               # Obtener lección específica
POST   /api/lessons                   # Crear lección
PUT    /api/lessons/:id               # Actualizar lección
DELETE /api/lessons/:id               # Eliminar lección
```

### **🎯 Inscripciones**
```bash
GET    /api/course-enrollments        # Listar inscripciones
GET    /api/course-enrollments/:id    # Obtener inscripción específica
POST   /api/course-enrollments        # Crear inscripción
PUT    /api/course-enrollments/:id    # Actualizar inscripción
DELETE /api/course-enrollments/:id    # Eliminar inscripción
```

### **📈 Progreso**
```bash
GET    /api/lesson-progress           # Listar progreso
GET    /api/lesson-progress/:id       # Obtener progreso específico
POST   /api/lesson-progress           # Crear progreso
PUT    /api/lesson-progress/:id       # Actualizar progreso
DELETE /api/lesson-progress/:id       # Eliminar progreso
```

### **🧪 Quizzes**
```bash
GET    /api/quizzes                   # Listar quizzes
GET    /api/quizzes/:id               # Obtener quiz específico
POST   /api/quizzes                   # Crear quiz
PUT    /api/quizzes/:id               # Actualizar quiz
DELETE /api/quizzes/:id               # Eliminar quiz
```

### **📝 Intentos de Quiz**
```bash
GET    /api/quiz-attempts             # Listar intentos
GET    /api/quiz-attempts/:id         # Obtener intento específico
POST   /api/quiz-attempts             # Crear intento
PUT    /api/quiz-attempts/:id         # Actualizar intento
DELETE /api/quiz-attempts/:id         # Eliminar intento
```

## 🎯 **Ejemplos de Uso Completo**

### **1. 🚀 Flujo Completo de un Estudiante**

#### **Paso 1: Explorar cursos disponibles**
```bash
GET /api/courses
```

#### **Paso 2: Ver detalles de un curso**
```bash
GET /api/courses/course123
```

#### **Paso 3: Inscribirse al curso**
```bash
POST /api/course-enrollments
{
  "studentId": "user123",
  "courseId": "course123"
}
```

#### **Paso 4: Comenzar el primer módulo**
```bash
PUT /api/course-enrollments/enrollment123
{
  "status": "IN_PROGRESS",
  "startedAt": "2024-01-15T10:00:00Z",
  "currentModuleId": "module123"
}
```

#### **Paso 5: Completar lecciones**
```bash
POST /api/lesson-progress
{
  "enrollmentId": "enrollment123",
  "lessonId": "lesson123",
  "isCompleted": true,
  "completedAt": "2024-01-15T11:00:00Z",
  "timeSpent": 3600
}
```

#### **Paso 6: Realizar quiz**
```bash
POST /api/quiz-attempts
{
  "enrollmentId": "enrollment123",
  "quizId": "quiz123",
  "studentId": "user123"
}
```

#### **Paso 7: Completar curso**
```bash
PUT /api/course-enrollments/enrollment123
{
  "status": "COMPLETED",
  "completedAt": "2024-01-20T15:00:00Z",
  "progress": 100,
  "certificateIssued": true
}
```

### **2. 🏢 Flujo para Organizaciones**

#### **Paso 1: Crear curso**
```bash
POST /api/courses
{
  "title": "Habilidades Blandas",
  "slug": "habilidades-blandas",
  "description": "Desarrollo de competencias interpersonales",
  "level": "BEGINNER",
  "category": "SOFT_SKILLS"
}
```

#### **Paso 2: Agregar módulos**
```bash
POST /api/course-modules
{
  "courseId": "course123",
  "title": "Comunicación Efectiva",
  "orderIndex": 1
}
```

#### **Paso 3: Agregar lecciones**
```bash
POST /api/lessons
{
  "moduleId": "module123",
  "title": "Técnicas de Escucha Activa",
  "contentType": "VIDEO",
  "orderIndex": 1
}
```

#### **Paso 4: Crear evaluación**
```bash
POST /api/quizzes
{
  "courseId": "course123",
  "title": "Evaluación: Comunicación",
  "passingScore": 70
}
```

#### **Paso 5: Monitorear progreso**
```bash
GET /api/course-enrollments?courseId=course123
```

## ✅ **Características Destacadas**

- **🎓 Gestión completa de cursos** con módulos y lecciones
- **📊 Seguimiento detallado** del progreso de cada estudiante
- **🧪 Sistema de evaluación** con quizzes y exámenes
- **🏆 Certificación automática** al completar cursos
- **📱 Contenido multimedia** (videos, documentos, interactivos)
- **🔐 Permisos granulares** según tipo de usuario
- **📈 Estadísticas avanzadas** para organizaciones
- **⏱️ Control de tiempo** y progreso
- **🎯 Prerrequisitos** y módulos bloqueados
- **📋 Notas de estudiantes** y discusiones

¡El sistema de cursos está completamente implementado y listo para usar! 🚀
