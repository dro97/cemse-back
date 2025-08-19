# 🎬 Sistema de Videos en Lecciones - Documentación Completa

## 📋 **Descripción General**

El sistema de videos en lecciones permite a los instructores agregar contenido multimedia a sus cursos, mejorando significativamente la experiencia de aprendizaje de los estudiantes.

## 🚀 **Características Principales**

- ✅ **Subida de videos** con soporte para múltiples formatos
- ✅ **Streaming de video** con soporte para range requests
- ✅ **Validación de archivos** y límites de tamaño
- ✅ **Integración completa** con el sistema de lecciones
- ✅ **Reproducción en el frontend** con controles nativos

## 📁 **Estructura de Archivos**

```
uploads/
├── images/          # Imágenes de perfil y thumbnails
└── videos/          # Videos de lecciones
    ├── video-1234567890-123456789.mp4
    ├── video-1234567890-987654321.webm
    └── ...
```

## 🔧 **Configuración del Sistema**

### **Formatos de Video Soportados**
- MP4 (recomendado)
- WebM
- OGG
- AVI
- MOV
- WMV
- FLV

### **Límites de Archivo**
- **Tamaño máximo**: 100MB por video
- **Resolución recomendada**: 720p o 1080p
- **Duración recomendada**: 5-30 minutos

## 📡 **Endpoints de la API**

### **1. Subir Video de Lección**
```http
POST /file-upload/upload/lesson-video
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- video: <archivo_video>
```

**Respuesta:**
```json
{
  "message": "Video uploaded successfully",
  "videoUrl": "/uploads/videos/video-1234567890-123456789.mp4",
  "filename": "video-1234567890-123456789.mp4",
  "originalName": "tutorial-javascript.mp4",
  "size": 52428800,
  "mimetype": "video/mp4"
}
```

### **2. Crear Lección con Video**
```http
POST /lessons
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Introducción a JavaScript",
  "description": "Aprende los fundamentos básicos de JavaScript",
  "content": "En esta lección aprenderás variables, funciones y control de flujo.",
  "moduleId": "module_id_here",
  "contentType": "VIDEO",
  "videoUrl": "/uploads/videos/video-1234567890-123456789.mp4",
  "duration": 15,
  "orderIndex": 1,
  "isRequired": true,
  "isPreview": false
}
```

### **3. Obtener Lecciones por Módulo**
```http
GET /lessons/module/{moduleId}
Authorization: Bearer <token>
```

### **4. Reproducir Video**
```http
GET /file-upload/videos/{filename}
```

## 💻 **Implementación en el Frontend**

### **Componente de Video Player (React)**

```jsx
import React, { useState, useRef } from 'react';

const VideoPlayer = ({ videoUrl, title, onProgress }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Notificar progreso al backend
      onProgress && onProgress(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="video-player">
      <h3>{title}</h3>
      <video
        ref={videoRef}
        controls
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ width: '100%', maxWidth: '800px' }}
      >
        <source src={videoUrl} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
      
      <div className="video-controls">
        <button onClick={togglePlay}>
          {isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
        </button>
        <span>
          {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / 
          {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default VideoPlayer;
```

### **Componente de Lección con Video**

```jsx
import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

const VideoLesson = ({ lessonId }) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoProgress = async (currentTime) => {
    // Enviar progreso al backend
    try {
      await fetch(`/api/lesson-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lessonId,
          timeSpent: currentTime,
          isCompleted: currentTime >= lesson.duration * 60 // Marcar como completado si vio todo el video
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) return <div>Cargando lección...</div>;
  if (!lesson) return <div>Lección no encontrada</div>;

  return (
    <div className="video-lesson">
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>
      
      {lesson.contentType === 'VIDEO' && lesson.videoUrl && (
        <VideoPlayer
          videoUrl={lesson.videoUrl}
          title={lesson.title}
          onProgress={handleVideoProgress}
        />
      )}
      
      <div className="lesson-content">
        <h3>Descripción de la Lección</h3>
        <p>{lesson.content}</p>
      </div>
      
      <div className="lesson-info">
        <p><strong>Duración:</strong> {lesson.duration} minutos</p>
        <p><strong>Tipo:</strong> {lesson.contentType}</p>
        {lesson.isRequired && <p><strong>Lección Requerida</strong></p>}
      </div>
    </div>
  );
};

export default VideoLesson;
```

## 🧪 **Pruebas y Ejemplos**

### **Script de Prueba Automatizada**

```javascript
// Ejecutar: node scripts/test-video-lesson.js
const { uploadVideo, createVideoLesson, getModuleLessons } = require('./scripts/test-video-lesson');

async function testVideoFunctionality() {
  try {
    // 1. Subir video
    const videoUrl = await uploadVideo('./sample-video.mp4');
    
    // 2. Crear lección
    const lesson = await createVideoLesson('module-id', videoUrl);
    
    // 3. Verificar lecciones del módulo
    const lessons = await getModuleLessons('module-id');
    
    console.log('✅ Prueba exitosa');
  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}
```

### **Ejemplo de Uso con cURL**

```bash
# 1. Subir video
curl -X POST http://localhost:3001/file-upload/upload/lesson-video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@/path/to/video.mp4"

# 2. Crear lección con video
curl -X POST http://localhost:3001/lessons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tutorial JavaScript",
    "content": "Aprende JavaScript desde cero",
    "moduleId": "module_id",
    "contentType": "VIDEO",
    "videoUrl": "/uploads/videos/video-1234567890-123456789.mp4",
    "duration": 15,
    "orderIndex": 1
  }'

# 3. Obtener lecciones del módulo
curl -X GET http://localhost:3001/lessons/module/module_id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 **Seguridad y Permisos**

### **Permisos Requeridos**
- **Subir videos**: Solo organizaciones e instructores
- **Crear lecciones**: Solo organizaciones e instructores
- **Ver videos**: Todos los usuarios autenticados
- **Reproducir videos**: Todos los usuarios autenticados

### **Validaciones de Seguridad**
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño de archivo
- ✅ Autenticación requerida
- ✅ Sanitización de nombres de archivo
- ✅ Streaming seguro con range requests

## 📊 **Monitoreo y Métricas**

### **Métricas Disponibles**
- Tiempo de reproducción por usuario
- Progreso de completitud de lecciones
- Tasa de finalización de videos
- Análisis de engagement

### **Logs del Sistema**
```javascript
// Ejemplo de logs generados
{
  "timestamp": "2024-01-15T10:30:00Z",
  "action": "video_upload",
  "userId": "user_123",
  "lessonId": "lesson_456",
  "fileSize": 52428800,
  "duration": 900
}
```

## 🚨 **Solución de Problemas**

### **Errores Comunes**

1. **"File too large"**
   - Solución: Reducir tamaño del video o comprimir

2. **"Invalid file type"**
   - Solución: Usar formatos soportados (MP4, WebM, etc.)

3. **"Video not found"**
   - Solución: Verificar que el archivo existe en uploads/videos/

4. **"Streaming error"**
   - Solución: Verificar configuración de range requests

### **Optimización de Rendimiento**
- Usar CDN para videos grandes
- Implementar compresión automática
- Configurar cache headers apropiados
- Monitorear uso de ancho de banda

## 🔄 **Actualizaciones Futuras**

### **Próximas Características**
- [ ] Transcodificación automática de video
- [ ] Subtítulos y captions
- [ ] Calidad adaptativa (HLS/DASH)
- [ ] Análisis de engagement avanzado
- [ ] Integración con servicios de CDN
- [ ] Soporte para live streaming

---

## 📞 **Soporte**

Para soporte técnico o preguntas sobre la implementación de videos en lecciones, contacta al equipo de desarrollo.

**Documentación actualizada**: Enero 2024
**Versión**: 1.0.0
