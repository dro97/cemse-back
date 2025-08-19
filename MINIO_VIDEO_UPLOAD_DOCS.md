# 🎬 Sistema de Videos con MinIO - Documentación Completa

## 📋 **Descripción General**

Este sistema permite subir videos de lecciones directamente a **MinIO** (Object Storage) y obtener URLs públicas para reproducirlos en el frontend. MinIO es una alternativa open-source a Amazon S3 que proporciona almacenamiento escalable y confiable.

## 🚀 **Características Principales**

- ✅ **Subida directa a MinIO** - Los videos se almacenan en buckets organizados
- ✅ **URLs públicas** - Acceso directo desde el frontend sin autenticación
- ✅ **Múltiples formatos** - Soporte para MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV
- ✅ **Límites configurables** - Hasta 500MB por video
- ✅ **Archivos múltiples** - Video, thumbnail y attachments en una sola petición
- ✅ **Integración completa** - Con el sistema de lecciones existente

## 🏗️ **Arquitectura del Sistema**

```
Frontend → API → MinIO Middleware → MinIO Storage
                ↓
            Database (URLs)
```

### **Flujo de Subida:**
1. **Frontend** envía archivo via `multipart/form-data`
2. **API** recibe archivo con multer (almacenamiento en memoria)
3. **MinIO Middleware** sube archivo a MinIO y obtiene URL pública
4. **Database** almacena URL del video en la lección
5. **Frontend** puede reproducir video directamente desde URL

## 📁 **Estructura de Buckets**

```
MinIO Storage:
├── videos/          # Videos de lecciones
│   ├── lesson-video-1234567890-123456789.mp4
│   ├── lesson-video-1234567890-987654321.webm
│   └── ...
├── images/          # Thumbnails e imágenes
│   ├── lesson-thumbnail-1234567890-123456789.jpg
│   └── ...
├── documents/       # PDFs y documentos
│   ├── lesson-attachment-1234567890-123456789.pdf
│   └── ...
├── courses/         # Archivos de cursos
└── lessons/         # Archivos específicos de lecciones
```

## 🔧 **Configuración**

### **Variables de Entorno**

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BASE_URL=http://localhost:9000
```

### **Docker Compose (Desarrollo)**

```yaml
# MinIO Object Storage
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"    # API
    - "9001:9001"    # Console
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  command: server /data --console-address ":9001"
  volumes:
    - minio_data:/data
```

## 📡 **Endpoints de la API**

### **1. Crear Lección con Video (MinIO)**

```http
POST /api/lesson/with-video
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- title: "Título de la lección"
- description: "Descripción de la lección"
- content: "Contenido de la lección"
- moduleId: "module-id"
- contentType: "VIDEO"
- duration: "120"
- orderIndex: "1"
- isRequired: "true"
- isPreview: "false"
- video: [archivo de video]
```

**Respuesta:**
```json
{
  "id": "lesson-id",
  "title": "Título de la lección",
  "videoUrl": "http://localhost:9000/videos/lesson-video-1234567890-123456789.mp4",
  "uploadedFiles": {
    "video": {
      "url": "http://localhost:9000/videos/lesson-video-1234567890-123456789.mp4",
      "filename": "lesson-video-1234567890-123456789.mp4",
      "originalName": "mi-video.mp4",
      "size": 52428800,
      "mimetype": "video/mp4",
      "bucket": "videos"
    }
  }
}
```

### **2. Crear Lección con Múltiples Archivos**

```http
POST /api/lesson/with-files
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- title: "Lección Completa"
- description: "Descripción"
- content: "Contenido"
- moduleId: "module-id"
- contentType: "VIDEO"
- duration: "180"
- orderIndex: "1"
- isRequired: "true"
- isPreview: "false"
- video: [archivo de video]
- thumbnail: [archivo de imagen]
- attachments: [archivo 1]
- attachments: [archivo 2]
```

**Respuesta:**
```json
{
  "id": "lesson-id",
  "title": "Lección Completa",
  "videoUrl": "http://localhost:9000/videos/lesson-video-1234567890-123456789.mp4",
  "uploadedFiles": {
    "video": {
      "url": "http://localhost:9000/videos/lesson-video-1234567890-123456789.mp4",
      "filename": "lesson-video-1234567890-123456789.mp4",
      "originalName": "mi-video.mp4",
      "size": 52428800,
      "mimetype": "video/mp4",
      "bucket": "videos"
    },
    "thumbnail": {
      "url": "http://localhost:9000/images/lesson-thumbnail-1234567890-123456789.jpg",
      "filename": "lesson-thumbnail-1234567890-123456789.jpg",
      "originalName": "thumbnail.jpg",
      "size": 102400,
      "mimetype": "image/jpeg",
      "bucket": "images"
    },
    "attachments": [
      {
        "url": "http://localhost:9000/documents/lesson-attachment-1234567890-123456789.pdf",
        "filename": "lesson-attachment-1234567890-123456789.pdf",
        "originalName": "documento.pdf",
        "size": 204800,
        "mimetype": "application/pdf",
        "bucket": "documents"
      }
    ]
  }
}
```

## 🎥 **Reproducción en el Frontend**

### **HTML5 Video Player**

```html
<video 
  controls 
  width="100%" 
  height="400"
  poster="http://localhost:9000/images/lesson-thumbnail-1234567890-123456789.jpg"
>
  <source src="http://localhost:9000/videos/lesson-video-1234567890-123456789.mp4" type="video/mp4">
  Tu navegador no soporta el elemento video.
</video>
```

### **React Component**

```jsx
import React from 'react';

const VideoPlayer = ({ videoUrl, thumbnailUrl, title }) => {
  return (
    <div className="video-player">
      <h3>{title}</h3>
      <video 
        controls 
        width="100%" 
        height="400"
        poster={thumbnailUrl}
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Tu navegador no soporta el elemento video.
      </video>
    </div>
  );
};

export default VideoPlayer;
```

### **Vue.js Component**

```vue
<template>
  <div class="video-player">
    <h3>{{ title }}</h3>
    <video 
      ref="videoPlayer"
      controls 
      width="100%" 
      height="400"
      :poster="thumbnailUrl"
      preload="metadata"
    >
      <source :src="videoUrl" type="video/mp4" />
      Tu navegador no soporta el elemento video.
    </video>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    videoUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      default: null
    },
    title: {
      type: String,
      required: true
    }
  }
}
</script>
```

## 🧪 **Pruebas**

### **Ejecutar Script de Prueba**

```bash
# 1. Configurar token
# Editar scripts/test-minio-video-upload.js y cambiar AUTH_TOKEN

# 2. Ejecutar pruebas
node scripts/test-minio-video-upload.js
```

### **Pruebas Manuales con cURL**

```bash
# Crear lección con video
curl -X POST http://localhost:3001/api/lesson/with-video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Lección de Prueba" \
  -F "description=Descripción de prueba" \
  -F "content=Contenido de prueba" \
  -F "moduleId=test-module-id" \
  -F "contentType=VIDEO" \
  -F "duration=120" \
  -F "orderIndex=1" \
  -F "isRequired=true" \
  -F "isPreview=false" \
  -F "video=@/path/to/your/video.mp4"
```

## 🔐 **Seguridad y Permisos**

### **Permisos de Acceso**
- ✅ **SUPERADMIN** - Acceso completo
- ✅ **Organizaciones** - Pueden crear lecciones con videos
- ✅ **Instructores** - Pueden crear lecciones con videos

### **Validaciones**
- ✅ **Tipo de archivo** - Solo formatos de video permitidos
- ✅ **Tamaño máximo** - 500MB por archivo
- ✅ **Autenticación** - Token JWT requerido
- ✅ **Autorización** - Roles específicos requeridos

## 📊 **Monitoreo y Logs**

### **Logs de MinIO**
```bash
# Ver logs de MinIO
docker logs minio

# Acceder a la consola web
# http://localhost:9001
# Usuario: minioadmin
# Contraseña: minioadmin
```

### **Métricas de Uso**
- **Tamaño total de videos**: Monitorear uso de almacenamiento
- **Número de archivos**: Contar archivos por bucket
- **Ancho de banda**: Monitorear transferencia de datos

## 🚀 **Despliegue en Producción**

### **Configuración de Producción**

```env
# MinIO Production Configuration
MINIO_ENDPOINT=your-minio-server.com
MINIO_PORT=443
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_USE_SSL=true
MINIO_BASE_URL=https://your-minio-server.com
```

### **Consideraciones de Producción**
- ✅ **SSL/TLS** - Usar HTTPS para todas las conexiones
- ✅ **Backup** - Configurar respaldos automáticos
- ✅ **CDN** - Considerar CDN para distribución global
- ✅ **Monitoreo** - Implementar alertas de uso y errores
- ✅ **Escalabilidad** - Configurar múltiples instancias de MinIO

## 🔧 **Solución de Problemas**

### **Errores Comunes**

1. **"MinIO connection failed"**
   - Verificar que MinIO esté ejecutándose
   - Verificar configuración de endpoint y puerto
   - Verificar credenciales de acceso

2. **"File too large"**
   - Verificar límite de tamaño en middleware
   - Verificar configuración de nginx/apache
   - Verificar límites de MinIO

3. **"Invalid file type"**
   - Verificar tipos de archivo permitidos
   - Verificar extensión del archivo
   - Verificar MIME type

### **Comandos de Diagnóstico**

```bash
# Verificar estado de MinIO
curl -f http://localhost:9000/minio/health/live

# Listar buckets
mc ls local

# Ver contenido de bucket
mc ls local/videos

# Verificar permisos
mc policy get local/videos
```

## 📚 **Referencias**

- [MinIO Documentation](https://docs.min.io/)
- [MinIO JavaScript Client](https://docs.min.io/docs/javascript-client-api-reference.html)
- [HTML5 Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Multer Documentation](https://github.com/expressjs/multer)

---

## ✅ **Estado del Sistema**

| Componente | Estado | Descripción |
|------------|--------|-------------|
| **MinIO Integration** | ✅ Completado | Configuración completa de MinIO |
| **Video Upload** | ✅ Completado | Subida de videos a MinIO |
| **Multiple Files** | ✅ Completado | Subida de múltiples archivos |
| **URL Generation** | ✅ Completado | URLs públicas automáticas |
| **Frontend Integration** | ✅ Completado | Ejemplos de reproducción |
| **Testing** | ✅ Completado | Scripts de prueba |
| **Documentation** | ✅ Completado | Documentación completa |
| **Production Ready** | ✅ Completado | Configuración de producción |
