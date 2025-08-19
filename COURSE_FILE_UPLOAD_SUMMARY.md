# 📸 Implementación de Subida de Archivos para Cursos

## ✅ **Funcionalidad Implementada**

### 🎯 **Objetivo**
Permitir que los cursos puedan subir **imagen de portada** y **video de presentación** directamente al servidor, similar a como funciona en plataformas como Platzi.

### 📁 **Archivos Modificados**

#### 1. **`middleware/upload.ts`**
- ✅ Agregado `uploadCourseFiles` middleware
- ✅ Soporte para `thumbnail` (imágenes) y `videoPreview` (videos)
- ✅ Límite de 100MB por archivo
- ✅ Validación de tipos de archivo
- ✅ Almacenamiento en `/uploads/courses/`

#### 2. **`controllers/CourseController.ts`**
- ✅ Actualizada función `createCourse` para manejar archivos
- ✅ Actualizada función `updateCourse` para manejar archivos
- ✅ Procesamiento automático de `req.files`
- ✅ Generación de URLs automáticas
- ✅ Documentación Swagger actualizada

#### 3. **`routes/course.ts`**
- ✅ Agregado middleware `uploadCourseFiles` a rutas POST y PUT
- ✅ Mantenidos permisos existentes (SUPERADMIN + Organizaciones + Municipios)

#### 4. **`scripts/test-course-upload.js`**
- ✅ Script completo de prueba
- ✅ Creación automática de archivos de prueba
- ✅ Pruebas de creación y actualización de cursos
- ✅ Verificación de URLs de archivos

#### 5. **`PLATZI_SYSTEM_DOCS.md`**
- ✅ Documentación actualizada con ejemplos de `multipart/form-data`
- ✅ Especificación de tipos de archivo soportados
- ✅ Nueva sección sobre subida de archivos

---

## 🔧 **Configuración Técnica**

### **Tipos de Archivo Soportados**

#### 📸 **Thumbnail (Imagen de Portada)**
- **Formatos**: JPEG, PNG, GIF, WebP
- **Campo**: `thumbnail`
- **Límite**: 100MB
- **Ejemplo**: `thumbnail: [archivo de imagen]`

#### 🎥 **Video Preview (Video de Presentación)**
- **Formatos**: MP4, WebM, OGG, AVI, MOV
- **Campo**: `videoPreview`
- **Límite**: 100MB
- **Ejemplo**: `videoPreview: [archivo de video]`

### **Estructura de Almacenamiento**
```
uploads/
├── courses/
│   ├── thumbnail-1755617641072-381916032.jpg
│   ├── videoPreview-1755617641073-123456789.mp4
│   └── ...
├── resources/
└── ...
```

### **URLs Generadas**
- **Thumbnail**: `http://localhost:3001/uploads/courses/thumbnail-[timestamp]-[random].jpg`
- **Video**: `http://localhost:3001/uploads/courses/videoPreview-[timestamp]-[random].mp4`

---

## 📋 **Uso de la API**

### **Crear Curso con Archivos**
```http
POST /api/course
Content-Type: multipart/form-data

# Campos de texto
title: "Mi Curso"
slug: "mi-curso"
description: "Descripción del curso"
level: "BEGINNER"
category: "TECHNICAL_SKILLS"
duration: "480"

# Arrays como JSON strings
objectives: '["Objetivo 1", "Objetivo 2"]'
tags: '["tag1", "tag2"]'

# Archivos
thumbnail: [archivo de imagen]
videoPreview: [archivo de video]
```

### **Actualizar Curso con Archivos**
```http
PUT /api/course/:id
Content-Type: multipart/form-data

# Solo los campos que quieres actualizar
title: "Nuevo Título"
thumbnail: [nueva imagen]
videoPreview: [nuevo video]
```

---

## 🧪 **Pruebas**

### **Ejecutar Script de Prueba**
```bash
# 1. Instalar dependencias si no están instaladas
npm install axios form-data

# 2. Configurar token en el script
# Editar scripts/test-course-upload.js y cambiar TOKEN

# 3. Ejecutar prueba
node scripts/test-course-upload.js
```

### **Pruebas Manuales**
1. **Crear curso sin archivos** - ✅ Funciona
2. **Crear curso solo con thumbnail** - ✅ Funciona
3. **Crear curso solo con video** - ✅ Funciona
4. **Crear curso con ambos archivos** - ✅ Funciona
5. **Actualizar curso con nuevos archivos** - ✅ Funciona
6. **Acceder a archivos via URL** - ✅ Funciona

---

## 🔐 **Permisos**

### **Pueden Subir Archivos:**
- ✅ **SUPERADMIN**
- ✅ **COMPANIES**
- ✅ **MUNICIPAL_GOVERNMENTS**
- ✅ **TRAINING_CENTERS**
- ✅ **NGOS_AND_FOUNDATIONS**
- ✅ **Municipios** (`type: 'municipality'`)

### **Pueden Ver Archivos:**
- ✅ **Todos los usuarios autenticados** (vía URLs públicas)

---

## 🚀 **Características Avanzadas**

### **Validación Automática**
- ✅ Verificación de tipos MIME
- ✅ Límites de tamaño
- ✅ Nombres de archivo únicos
- ✅ Manejo de errores

### **Gestión de Archivos**
- ✅ Creación automática de directorios
- ✅ Nombres únicos con timestamps
- ✅ URLs automáticas para acceso público
- ✅ Reemplazo de archivos existentes

### **Integración con Sistema Existente**
- ✅ Compatible con permisos actuales
- ✅ Mantiene funcionalidad JSON existente
- ✅ No afecta otros endpoints
- ✅ Documentación Swagger actualizada

---

## 📊 **Resumen de Implementación**

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Middleware** | ✅ Completado | `uploadCourseFiles` configurado |
| **Controladores** | ✅ Completado | `createCourse` y `updateCourse` actualizados |
| **Rutas** | ✅ Completado | Middleware agregado a POST y PUT |
| **Validación** | ✅ Completado | Tipos de archivo y tamaños |
| **Almacenamiento** | ✅ Completado | `/uploads/courses/` |
| **URLs** | ✅ Completado | Generación automática |
| **Permisos** | ✅ Completado | Mantenidos existentes |
| **Documentación** | ✅ Completado | Swagger y docs actualizados |
| **Pruebas** | ✅ Completado | Script de prueba creado |

---

## 🎉 **¡Implementación Completada!**

El sistema ahora permite:

1. **📸 Subir imágenes de portada** para cursos
2. **🎥 Subir videos de presentación** para cursos
3. **🔄 Actualizar archivos** existentes
4. **🔗 Acceder a archivos** via URLs públicas
5. **✅ Validar tipos** y tamaños de archivo
6. **🔐 Mantener permisos** existentes

**¡Los cursos ahora tienen soporte completo para archivos multimedia como en Platzi!** 🚀
