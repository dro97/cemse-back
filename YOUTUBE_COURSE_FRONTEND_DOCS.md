# 🎬 Cursos con Videos de YouTube - Documentación Frontend

## 📋 **Descripción General**

Esta documentación explica cómo integrar cursos con videos de YouTube en el frontend. El sistema permite:

- ✅ **Videos de preview** para mostrar información del curso
- ✅ **Videos de lecciones** para contenido educativo
- ✅ **Reproducción nativa** usando el iframe de YouTube
- ✅ **Seguimiento de progreso** de los estudiantes
- ✅ **Responsive design** para todos los dispositivos

## 🎯 **Videos de Ejemplo**

### **Video de Preview del Curso**
- **URL**: https://www.youtube.com/watch?v=yEIKwtVRKuQ&list=RDyEIKwtVRKuQ&start_radio=1
- **Uso**: Se muestra cuando el estudiante busca el curso

### **Videos de Lecciones**
1. **Lección 1**: https://www.youtube.com/watch?v=uY5406XeobY
2. **Lección 2**: https://www.youtube.com/watch?v=9gWIIIr2Asw&list=RD9gWIIIr2Asw&start_radio=1
- **Uso**: Se muestran cuando el estudiante entra al curso

## 📡 **Endpoints de la API**

### **1. Obtener Preview del Curso**
```http
GET /api/course/{courseId}/preview
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "id": "course_123",
  "title": "Curso de Música y Desarrollo Personal",
  "description": "Un curso completo que combina música y desarrollo personal...",
  "videoPreview": "https://www.youtube.com/watch?v=yEIKwtVRKuQ&list=RDyEIKwtVRKuQ&start_radio=1",
  "thumbnail": "https://img.youtube.com/vi/yEIKwtVRKuQ/maxresdefault.jpg",
  "duration": 45,
  "level": "BEGINNER",
  "category": "SOFT_SKILLS",
  "totalLessons": 2,
  "instructor": {
    "id": "instructor_123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com"
  }
}
```

### **2. Obtener Curso Completo con Lecciones**
```http
GET /api/course/{courseId}
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "id": "course_123",
  "title": "Curso de Música y Desarrollo Personal",
  "description": "Un curso completo que combina música y desarrollo personal...",
  "videoPreview": "https://www.youtube.com/watch?v=yEIKwtVRKuQ&list=RDyEIKwtVRKuQ&start_radio=1",
  "modules": [
    {
      "id": "module_123",
      "title": "Fundamentos de Música y Desarrollo Personal",
      "description": "En este módulo aprenderás los fundamentos básicos...",
      "lessons": [
        {
          "id": "lesson_123",
          "title": "Introducción a la Música para el Desarrollo Personal",
          "description": "Aprende cómo la música puede transformar tu vida...",
          "content": "En esta lección aprenderás a través del video de YouTube...",
          "contentType": "VIDEO",
          "videoUrl": "https://www.youtube.com/watch?v=uY5406XeobY",
          "duration": 15,
          "orderIndex": 1,
          "isRequired": true,
          "isPreview": false
        },
        {
          "id": "lesson_124",
          "title": "Técnicas Avanzadas de Música y Mindfulness",
          "description": "Explora técnicas avanzadas para usar la música...",
          "content": "En esta lección aprenderás técnicas avanzadas...",
          "contentType": "VIDEO",
          "videoUrl": "https://www.youtube.com/watch?v=9gWIIIr2Asw&list=RD9gWIIIr2Asw&start_radio=1",
          "duration": 15,
          "orderIndex": 2,
          "isRequired": true,
          "isPreview": false
        }
      ]
    }
  ]
}
```

## 💻 **Implementación en React**

### **1. Utilidades para YouTube**

```javascript
// utils/youtube.js
export function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function generateEmbedUrl(videoId, options = {}) {
  const {
    autoplay = 0,
    controls = 1,
    modestbranding = 1,
    rel = 0,
    showinfo = 0
  } = options;

  const params = new URLSearchParams({
    autoplay,
    controls,
    modestbranding,
    rel,
    showinfo
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function generateThumbnailUrl(videoId, quality = 'maxresdefault') {
  const qualities = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault'
  };

  const selectedQuality = qualities[quality] || 'maxresdefault';
  return `https://img.youtube.com/vi/${videoId}/${selectedQuality}.jpg`;
}
```

### **2. Componente de Video Player**

```jsx
// components/YouTubeVideoPlayer.jsx
import React from 'react';
import { extractYouTubeId, generateEmbedUrl } from '../utils/youtube';

const YouTubeVideoPlayer = ({ videoUrl, title, onProgress, options = {} }) => {
  const videoId = extractYouTubeId(videoUrl);
  
  if (!videoId) {
    return (
      <div className="youtube-error">
        <p>Error: URL de YouTube inválida</p>
        <p>URL proporcionada: {videoUrl}</p>
      </div>
    );
  }

  const embedUrl = generateEmbedUrl(videoId, options);

  return (
    <div className="youtube-video-player">
      <h3>{title}</h3>
      <div className="video-container">
        <iframe
          width="100%"
          height="315"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            console.log('Video de YouTube cargado:', videoId);
          }}
        />
      </div>
    </div>
  );
};

export default YouTubeVideoPlayer;
```

### **3. Componente de Preview del Curso**

```jsx
// components/CoursePreview.jsx
import React from 'react';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

const CoursePreview = ({ course }) => {
  if (!course.videoPreview) {
    return (
      <div className="course-preview">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <p>No hay video de preview disponible</p>
      </div>
    );
  }

  return (
    <div className="course-preview">
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      
      <YouTubeVideoPlayer
        videoUrl={course.videoPreview}
        title={`Preview: ${course.title}`}
        options={{
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0
        }}
      />
      
      <div className="course-info">
        <p><strong>Duración:</strong> {course.duration} minutos</p>
        <p><strong>Nivel:</strong> {course.level}</p>
        <p><strong>Categoría:</strong> {course.category}</p>
        <p><strong>Lecciones:</strong> {course.totalLessons}</p>
      </div>
    </div>
  );
};

export default CoursePreview;
```

### **4. Componente de Lección con Video**

```jsx
// components/YouTubeLesson.jsx
import React from 'react';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

const YouTubeLesson = ({ lesson, onProgress }) => {
  if (lesson.contentType !== 'VIDEO' || !lesson.videoUrl) {
    return (
      <div className="lesson-content">
        <h3>{lesson.title}</h3>
        <p>{lesson.description}</p>
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>
    );
  }

  return (
    <div className="youtube-lesson">
      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>
      
      <YouTubeVideoPlayer
        videoUrl={lesson.videoUrl}
        title={lesson.title}
        onProgress={onProgress}
        options={{
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0
        }}
      />
      
      <div className="lesson-content">
        <h4>Descripción de la Lección</h4>
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>
      
      <div className="lesson-info">
        <p><strong>Duración:</strong> {lesson.duration} minutos</p>
        <p><strong>Tipo:</strong> {lesson.contentType}</p>
        {lesson.isRequired && <p><strong>Lección Requerida</strong></p>}
      </div>
    </div>
  );
};

export default YouTubeLesson;
```

### **5. Componente de Curso Completo**

```jsx
// components/FullCourse.jsx
import React from 'react';
import YouTubeLesson from './YouTubeLesson';

const FullCourse = ({ course, onLessonProgress }) => {
  return (
    <div className="full-course">
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      
      {course.modules && course.modules.map((module, moduleIndex) => (
        <div key={module.id} className="course-module">
          <h2>Módulo {moduleIndex + 1}: {module.title}</h2>
          <p>{module.description}</p>
          
          {module.lessons && module.lessons.map((lesson, lessonIndex) => (
            <div key={lesson.id} className="lesson-item">
              <h3>Lección {lessonIndex + 1}: {lesson.title}</h3>
              <YouTubeLesson
                lesson={lesson}
                onProgress={(progress) => {
                  onLessonProgress && onLessonProgress(lesson.id, progress);
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FullCourse;
```

### **6. Hook Personalizado para Cursos**

```jsx
// hooks/useCourse.js
import { useState, useEffect } from 'react';

export const useCourse = (courseId, includeLessons = false) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const endpoint = includeLessons 
          ? `/api/course/${courseId}`
          : `/api/course/${courseId}/preview`;
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar el curso');
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, includeLessons]);

  return { course, loading, error };
};
```

### **7. Página de Búsqueda de Cursos**

```jsx
// pages/CourseSearch.jsx
import React, { useState, useEffect } from 'react';
import CoursePreview from '../components/CoursePreview';

const CourseSearch = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Cargando cursos...</div>;

  return (
    <div className="course-search">
      <h1>Buscar Cursos</h1>
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <CoursePreview course={course} />
            <button onClick={() => window.location.href = `/course/${course.id}`}>
              Ver Curso Completo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSearch;
```

### **8. Página de Curso Completo**

```jsx
// pages/CourseDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../hooks/useCourse';
import FullCourse from '../components/FullCourse';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { course, loading, error } = useCourse(courseId, true);

  const handleLessonProgress = async (lessonId, progress) => {
    try {
      await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lessonId,
          timeSpent: progress,
          isCompleted: progress >= 0.9 // Marcar como completado si vio 90% del video
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) return <div>Cargando curso...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!course) return <div>Curso no encontrado</div>;

  return (
    <div className="course-detail">
      <FullCourse 
        course={course} 
        onLessonProgress={handleLessonProgress}
      />
    </div>
  );
};

export default CourseDetail;
```

## 🎨 **Estilos CSS**

```css
/* styles/youtube-video.css */
.youtube-video-player {
  margin: 20px 0;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.video-container iframe {
  width: 100%;
  height: 315px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.youtube-error {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 15px;
  margin: 10px 0;
  color: #c33;
}

.course-preview {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.youtube-lesson {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.lesson-content {
  margin-top: 20px;
}

.lesson-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9em;
}

.full-course {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.course-module {
  margin: 40px 0;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.lesson-item {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .video-container iframe {
    height: 200px;
  }
  
  .course-preview,
  .youtube-lesson,
  .course-module {
    padding: 15px;
  }
}
```

## 🔧 **Configuración de Rutas**

```jsx
// App.jsx o router configuration
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseSearch from './pages/CourseSearch';
import CourseDetail from './pages/CourseDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/courses" element={<CourseSearch />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
      </Routes>
    </Router>
  );
}
```

## 📱 **Ejemplo de Uso Completo**

```jsx
// Ejemplo de implementación completa
import React from 'react';
import CourseSearch from './pages/CourseSearch';
import CourseDetail from './pages/CourseDetail';

function App() {
  return (
    <div className="app">
      <header>
        <h1>Plataforma de Cursos</h1>
        <nav>
          <a href="/courses">Buscar Cursos</a>
        </nav>
      </header>
      
      <main>
        {/* Aquí irían las rutas */}
      </main>
    </div>
  );
}

export default App;
```

## 🚀 **Características Avanzadas**

### **1. Seguimiento de Progreso**
- El sistema registra automáticamente el progreso del estudiante
- Se marca como completado cuando ve el 90% del video
- Se puede personalizar el umbral de completitud

### **2. Responsive Design**
- Los videos se adaptan automáticamente al tamaño de pantalla
- Soporte completo para dispositivos móviles
- Thumbnails optimizados para diferentes resoluciones

### **3. Optimización de Rendimiento**
- Lazy loading de videos
- Carga diferida de contenido
- Cache de datos del curso

## 🔒 **Seguridad**

- ✅ Validación de URLs de YouTube
- ✅ Sanitización de contenido HTML
- ✅ Autenticación requerida para todos los endpoints
- ✅ Control de acceso basado en roles

## 📊 **Métricas y Analytics**

```javascript
// Ejemplo de tracking de eventos
const trackVideoEvent = (event, videoId, lessonId) => {
  // Enviar evento a analytics
  analytics.track('video_event', {
    event,
    videoId,
    lessonId,
    timestamp: new Date().toISOString()
  });
};

// Uso en componentes
<YouTubeVideoPlayer
  videoUrl={lesson.videoUrl}
  onLoad={() => trackVideoEvent('video_loaded', videoId, lesson.id)}
  onPlay={() => trackVideoEvent('video_play', videoId, lesson.id)}
  onPause={() => trackVideoEvent('video_pause', videoId, lesson.id)}
  onEnd={() => trackVideoEvent('video_end', videoId, lesson.id)}
/>
```

---

## 📞 **Soporte**

Para soporte técnico o preguntas sobre la implementación de cursos con YouTube, contacta al equipo de desarrollo.

**Documentación actualizada**: Enero 2024  
**Versión**: 1.0.0  
**Compatibilidad**: React 16+, YouTube API
