# Documentación de Endpoints de la API

---

## Usuarios (`/user`)
### 1. Listar usuarios
- **GET** `/user`
- **Descripción:** Devuelve todos los usuarios.
- **Respuesta:**
```json
[
  {
    "id": "string",
    "username": "string",
    "password": "string",
    "role": "string",
    "isActive": true,
    "createdAt": "2024-05-01T12:00:00.000Z",
    "updatedAt": "2024-05-01T12:00:00.000Z"
  }
]
```

### 2. Obtener usuario por ID
- **GET** `/user/:id`
- **Descripción:** Devuelve un usuario específico.
- **Respuesta:** Igual que arriba, pero solo un objeto.

### 3. Crear usuario
- **POST** `/user`
- **Body:**
```json
{
  "username": "usuario1",
  "password": "123456",
  "role": "ADMIN",
  "isActive": true
}
```
- **Respuesta:** Usuario creado (igual que arriba).

### 4. Actualizar usuario
- **PUT** `/user/:id`
- **Body:**
```json
{
  "username": "nuevo_usuario",
  "role": "USER",
  "isActive": false
}
```
- **Respuesta:** Usuario actualizado.

### 5. Eliminar usuario
- **DELETE** `/user/:id`
- **Respuesta:** `204 No Content`

---

## Cursos (`/course`)
### 1. Listar cursos
- **GET** `/course`
- **Descripción:** Devuelve todos los cursos.

### 2. Obtener curso por ID
- **GET** `/course/:id`
- **Descripción:** Devuelve un curso específico.

### 3. Crear curso
- **POST** `/course`
- **Body:**
```json
{
  "title": "Curso de Node.js",
  "slug": "curso-nodejs",
  "description": "Aprende Node.js desde cero",
  "duration": 40,
  "level": "BEGINNER",
  "category": "TECHNICAL_SKILLS",
  "isMandatory": false,
  "isActive": true
}
```
- **Respuesta:** Curso creado.

### 4. Actualizar curso
- **PUT** `/course/:id`
- **Body:**
```json
{
  "title": "Curso avanzado de Node.js",
  "duration": 60
}
```
- **Respuesta:** Curso actualizado.

### 5. Eliminar curso
- **DELETE** `/course/:id`

---

## Lecciones (`/lesson`)
### 1. Listar lecciones
- **GET** `/lesson`
- **Descripción:** Devuelve todas las lecciones.

### 2. Obtener lección por ID
- **GET** `/lesson/:id`
- **Descripción:** Devuelve una lección específica.

### 3. Crear lección
- **POST** `/lesson`
- **Body:**
```json
{
  "title": "Introducción a Node.js",
  "content": "Contenido de la lección...",
  "order": 1,
  "moduleId": "mod123",
  "duration": 30
}
```
- **Respuesta:** Lección creada.

### 4. Actualizar lección
- **PUT** `/lesson/:id`
- **Body:**
```json
{
  "title": "Node.js básico",
  "duration": 45
}
```
- **Respuesta:** Lección actualizada.

### 5. Eliminar lección
- **DELETE** `/lesson/:id`

---

## Certificados (`/certificate`)
### 1. Listar certificados
- **GET** `/certificate`
- **Descripción:** Devuelve todos los certificados.

### 2. Obtener certificado por ID
- **GET** `/certificate/:id`
- **Descripción:** Devuelve un certificado específico.

### 3. Crear certificado
- **POST** `/certificate`
- **Body:**
```json
{
  "studentId": "user123",
  "courseId": "course456",
  "certificateUrl": "https://ejemplo.com/certificado.pdf"
}
```
- **Respuesta:** Certificado creado.

### 4. Actualizar certificado
- **PUT** `/certificate/:id`
- **Body:**
```json
{
  "certificateUrl": "https://ejemplo.com/nuevo-certificado.pdf"
}
```
- **Respuesta:** Certificado actualizado.

### 5. Eliminar certificado
- **DELETE** `/certificate/:id`

---

## Artículos de Noticias (`/newsarticle`)
### 1. Listar artículos
- **GET** `/newsarticle`
- **Descripción:** Devuelve todos los artículos.

### 2. Obtener artículo por ID
- **GET** `/newsarticle/:id`
- **Descripción:** Devuelve un artículo específico.

### 3. Crear artículo
- **POST** `/newsarticle`
- **Body:**
```json
{
  "title": "Nueva funcionalidad",
  "content": "Detalles de la nueva funcionalidad...",
  "author": "admin",
  "isPublished": true
}
```
- **Respuesta:** Artículo creado.

### 4. Actualizar artículo
- **PUT** `/newsarticle/:id`
- **Body:**
```json
{
  "title": "Funcionalidad mejorada"
}
```
- **Respuesta:** Artículo actualizado.

### 5. Eliminar artículo
- **DELETE** `/newsarticle/:id`

---

## Recursos (`/resource`)
### 1. Listar recursos
- **GET** `/resource`
- **Descripción:** Devuelve todos los recursos.

### 2. Obtener recurso por ID
- **GET** `/resource/:id`
- **Descripción:** Devuelve un recurso específico.

### 3. Crear recurso
- **POST** `/resource`
- **Body:**
```json
{
  "title": "Guía de Node.js",
  "description": "Guía completa de Node.js",
  "type": "DOCUMENT",
  "category": "PROGRAMMING",
  "format": "PDF",
  "thumbnail": "https://ejemplo.com/imagen.png",
  "author": "admin",
  "publishedDate": "2024-05-01T12:00:00.000Z"
}
```
- **Respuesta:** Recurso creado.

### 4. Actualizar recurso
- **PUT** `/resource/:id`
- **Body:**
```json
{
  "description": "Guía actualizada de Node.js"
}
```
- **Respuesta:** Recurso actualizado.

### 5. Eliminar recurso
- **DELETE** `/resource/:id`

---

## Planes de Negocio (`/businessplan`)
### 1. Listar planes
- **GET** `/businessplan`
- **Descripción:** Devuelve todos los planes de negocio.

### 2. Obtener plan por ID
- **GET** `/businessplan/:id`
- **Descripción:** Devuelve un plan específico.

### 3. Crear plan
- **POST** `/businessplan`
- **Body:**
```json
{
  "title": "Plan de negocio 2024",
  "description": "Descripción del plan...",
  "studentId": "user123"
}
```
- **Respuesta:** Plan creado.

### 4. Actualizar plan
- **PUT** `/businessplan/:id`
- **Body:**
```json
{
  "status": "APPROVED",
  "feedback": "Muy buen trabajo"
}
```
- **Respuesta:** Plan actualizado.

### 5. Eliminar plan
- **DELETE** `/businessplan/:id`

---

## Perfiles (`/profile`)
### 1. Listar perfiles
- **GET** `/profile`
- **Descripción:** Devuelve todos los perfiles (solo superadmin).

### 2. Obtener perfil por ID
- **GET** `/profile/:id`
- **Descripción:** Devuelve un perfil específico.

### 3. Crear perfil
- **POST** `/profile`
- **Body:**
```json
{
  "userId": "user123",
  "status": "ACTIVE",
  "role": "YOUTH",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@ejemplo.com"
}
```
- **Respuesta:** Perfil creado.

### 4. Actualizar perfil
- **PUT** `/profile/:id`
- **Body:**
```json
{
  "status": "SUSPENDED"
}
```
- **Respuesta:** Perfil actualizado.

### 5. Eliminar perfil
- **DELETE** `/profile/:id`

---

## Quizzes (`/quiz`)
### 1. Listar quizzes
- **GET** `/quiz`
- **Descripción:** Devuelve todos los quizzes.

### 2. Obtener quiz por ID
- **GET** `/quiz/:id`
- **Descripción:** Devuelve un quiz específico.

### 3. Crear quiz
- **POST** `/quiz`
- **Body:**
```json
{
  "title": "Quiz de Node.js",
  "moduleId": "mod123",
  "description": "Preguntas sobre Node.js",
  "timeLimit": 30,
  "isActive": true
}
```
- **Respuesta:** Quiz creado.

### 4. Actualizar quiz
- **PUT** `/quiz/:id`
- **Body:**
```json
{
  "title": "Quiz avanzado de Node.js"
}
```
- **Respuesta:** Quiz actualizado.

### 5. Eliminar quiz
- **DELETE** `/quiz/:id`

---

## Módulos de Curso (`/coursemodule`)
### 1. Listar módulos
- **GET** `/coursemodule`
- **Descripción:** Devuelve todos los módulos.

### 2. Obtener módulo por ID
- **GET** `/coursemodule/:id`
- **Descripción:** Devuelve un módulo específico.

### 3. Crear módulo
- **POST** `/coursemodule`
- **Body:**
```json
{
  "title": "Módulo 1",
  "description": "Descripción del módulo",
  "courseId": "course123"
}
```
- **Respuesta:** Módulo creado.

### 4. Actualizar módulo
- **PUT** `/coursemodule/:id`
- **Body:**
```json
{
  "title": "Módulo 1 actualizado"
}
```
- **Respuesta:** Módulo actualizado.

### 5. Eliminar módulo
- **DELETE** `/coursemodule/:id`

---

## Ofertas de Trabajo (`/joboffer`)
### 1. Listar ofertas
- **GET** `/joboffer`
- **Descripción:** Devuelve todas las ofertas de trabajo.

### 2. Obtener oferta por ID
- **GET** `/joboffer/:id`
- **Descripción:** Devuelve una oferta específica.

### 3. Crear oferta
- **POST** `/joboffer`
- **Body:**
```json
{
  "title": "Desarrollador Backend",
  "description": "Se busca desarrollador con experiencia en Node.js",
  "contractType": "FULL_TIME",
  "workModality": "REMOTE",
  "location": "Ciudad de Guatemala",
  "municipality": "Guatemala",
  "department": "Guatemala",
  "experienceLevel": "MID_LEVEL",
  "companyId": "empresa123"
}
```
- **Respuesta:** Oferta creada.

### 4. Actualizar oferta
- **PUT** `/joboffer/:id`
- **Body:**
```json
{
  "status": "CLOSED"
}
```
- **Respuesta:** Oferta actualizada.

### 5. Eliminar oferta
- **DELETE** `/joboffer/:id`

--- 