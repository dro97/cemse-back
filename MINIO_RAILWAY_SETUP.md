# Configuración de MinIO en Railway

## Resumen

Tu aplicación ahora usa **MinIO** para almacenar todos los archivos (imágenes, videos, documentos) en lugar de almacenamiento local. Esto es mucho mejor para producción porque:

- ✅ **Persistencia**: Los archivos no se pierden cuando el contenedor se reinicia
- ✅ **Escalabilidad**: Puedes almacenar grandes cantidades de archivos
- ✅ **Rendimiento**: Acceso rápido a los archivos desde cualquier lugar
- ✅ **Seguridad**: Control de acceso y políticas de bucket

## Configuración en Railway

### 1. Agregar servicio MinIO

1. Ve a tu proyecto en Railway
2. Haz clic en "New Service"
3. Selecciona "MinIO" del marketplace
4. Dale un nombre como "minio-storage"

### 2. Configurar variables de entorno

Una vez que tengas el servicio MinIO, Railway te proporcionará las siguientes variables de entorno. Agrégalas a tu servicio principal:

```bash
# Variables de MinIO (Railway las proporciona automáticamente)
MINIO_ENDPOINT=bucket-production-1a58.up.railway.app
MINIO_PORT=443
MINIO_ACCESS_KEY=tu-access-key
MINIO_SECRET_KEY=tu-secret-key
MINIO_USE_SSL=true

# URL pública para acceder a los archivos
MINIO_PUBLIC_ENDPOINT=https://bucket-production-1a58.up.railway.app:443
```

### 3. Configurar buckets

Los buckets se crean automáticamente cuando la aplicación inicia. Los buckets disponibles son:

#### 📁 Todos los Buckets son Públicos:
- `images` - Para imágenes (eventos, noticias, perfiles, job offers, etc.)
- `videos` - Para videos de lecciones y cursos
- `documents` - Para PDFs, CVs, cartas de presentación
- `resources` - Para archivos generales y recursos de lecciones
- `courses` - Para archivos específicos de cursos
- `lessons` - Para recursos de lecciones
- `audio` - Para archivos de audio

### 4. Configurar políticas de acceso

**TODOS los buckets tienen políticas públicas** para que los archivos sean accesibles desde el frontend:
- ✅ `images` - Acceso público
- ✅ `videos` - Acceso público  
- ✅ `resources` - Acceso público
- ✅ `audio` - Acceso público
- ✅ `documents` - Acceso público
- ✅ `courses` - Acceso público
- ✅ `lessons` - Acceso público

## Estructura de archivos

### Antes (almacenamiento local)
```
/uploads/
  /images/
  /videos/
  /documents/
  /job-offers/
  /profiles/
```

### Ahora (MinIO)
```
MinIO Buckets:
  images/
    event-image-1234567890-123456789.jpg
    news-image-1234567890-123456789.png
    profile-avatar-1234567890-123456789.jpg
    job-logo-1234567890-123456789.png
    job-image-1234567890-123456789.jpg
  
  videos/
    lesson-video-1234567890-123456789.mp4
    course-videoPreview-1234567890-123456789.webm
  
  documents/
    cv-1234567890-123456789.pdf
    cover-letter-1234567890-123456789.pdf
  
  resources/
    lesson-resource-1234567890-123456789.pdf
    general-resource-1234567890-123456789.zip
  
  audio/
    lesson-audio-1234567890-123456789.mp3
    course-audio-1234567890-123456789.wav
  
  courses/
    course-thumbnail-1234567890-123456789.jpg
    course-file-1234567890-123456789.pdf
  
  lessons/
    lesson-attachment-1234567890-123456789.pdf
    lesson-video-1234567890-123456789.mp4
```

## URLs de archivos

### Antes
```
http://localhost:3001/uploads/job-offers/job-image-1234567890-123456789.jpg
```

### Ahora
```
https://bucket-production-1a58.up.railway.app:443/images/job-image-1234567890-123456789.jpg
https://bucket-production-1a58.up.railway.app:443/videos/lesson-video-1234567890-123456789.mp4
https://bucket-production-1a58.up.railway.app:443/documents/cv-1234567890-123456789.pdf
https://bucket-production-1a58.up.railway.app:443/resources/lesson-resource-1234567890-123456789.pdf
https://bucket-production-1a58.up.railway.app:443/audio/lesson-audio-1234567890-123456789.mp3
https://bucket-production-1a58.up.railway.app:443/courses/course-thumbnail-1234567890-123456789.jpg
https://bucket-production-1a58.up.railway.app:443/lessons/lesson-attachment-1234567890-123456789.pdf
```

## Middlewares actualizados

Los siguientes middlewares ahora usan MinIO:

- `uploadImageToMinIO` - Para imágenes simples (eventos, noticias, perfiles)
- `uploadMultipleImagesToMinIO` - Para múltiples imágenes (job offers)
- `uploadDocumentsToMinIO` - Para documentos PDF
- `uploadCourseFilesToMinIO` - Para archivos de cursos
- `uploadLessonResourceToMinIO` - Para recursos de lecciones

## Controladores actualizados

Los controladores ahora acceden a los archivos a través de:

- `req.uploadedImages` - Para imágenes simples
- `req.uploadedJobImages` - Para imágenes de job offers
- `req.uploadedDocuments` - Para documentos
- `req.uploadedCourseFiles` - Para archivos de cursos
- `req.uploadedResource` - Para recursos generales

## Ventajas de MinIO

1. **Persistencia**: Los archivos se mantienen aunque el contenedor se reinicie
2. **Escalabilidad**: Puedes almacenar terabytes de archivos
3. **Rendimiento**: Acceso rápido desde cualquier ubicación
4. **Seguridad**: Control granular de acceso
5. **Compatibilidad**: API compatible con AWS S3
6. **Costo**: Más económico que servicios como AWS S3

## Migración

Si tienes archivos existentes en el almacenamiento local, puedes migrarlos a MinIO usando el script de migración que se puede crear según sea necesario.

## Monitoreo

Puedes monitorear el uso de MinIO desde el dashboard de Railway, donde verás:
- Uso de almacenamiento
- Número de objetos
- Tráfico de red
- Errores de acceso

## Buckets Creados Automáticamente

### 📊 Resumen de Buckets:

| Bucket | Propósito | Acceso | Ejemplos de archivos |
|--------|-----------|--------|---------------------|
| `images` | Imágenes generales | Público | Eventos, noticias, perfiles, job offers |
| `videos` | Videos de lecciones y cursos | Público | Videos de lecciones, previews de cursos |
| `documents` | Documentos PDF | Público | CVs, cartas de presentación |
| `resources` | Recursos generales | Público | Archivos de lecciones, recursos educativos |
| `audio` | Archivos de audio | Público | Audios de lecciones, podcasts |
| `courses` | Archivos específicos de cursos | Público | Thumbnails, archivos de curso |
| `lessons` | Recursos de lecciones | Público | Adjuntos, videos de lección |

### 🔧 Configuración Automática:

- **Creación**: Los buckets se crean automáticamente al iniciar la aplicación
- **Políticas**: **TODOS los buckets tienen políticas públicas** para acceso desde el frontend
- **Región**: Todos los buckets se crean en la región `us-east-1`
- **URLs**: Todas las URLs usan el formato: `https://bucket-production-1a58.up.railway.app:443/{bucket}/{filename}`

### 🔓 Acceso Público:

**Todos los archivos son accesibles públicamente** desde cualquier lugar sin necesidad de autenticación. Esto incluye:
- Imágenes de eventos y noticias
- Videos de lecciones
- Documentos PDF (CVs, cartas de presentación)
- Recursos educativos
- Archivos de audio
- Archivos de cursos
- Recursos de lecciones
