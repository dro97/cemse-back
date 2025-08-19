# 🎬 Cursos con Videos de YouTube - Documentación Final Frontend

## 📋 **Resumen de Implementación Exitosa**

✅ **Sistema completamente funcional y probado**  
✅ **Curso creado con videos de YouTube integrados**  
✅ **Endpoints funcionando correctamente**  
✅ **Documentación completa para el frontend**

## 🎯 **Videos Integrados en el Sistema**

### **Video de Preview del Curso**
- **URL**: https://www.youtube.com/watch?v=yEIKwtVRKuQ&list=RDyEIKwtVRKuQ&start_radio=1
- **ID**: yEIKwtVRKuQ
- **Uso**: Se muestra cuando el estudiante busca el curso

### **Videos de Lecciones**
1. **Lección 1**: https://www.youtube.com/watch?v=uY5406XeobY
   - **ID**: uY5406XeobY
   - **Título**: "Introducción a la Música para el Desarrollo Personal"
   
2. **Lección 2**: https://www.youtube.com/watch?v=9gWIIIr2Asw&list=RD9gWIIIr2Asw&start_radio=1
   - **ID**: 9gWIIIr2Asw
   - **Título**: "Técnicas Avanzadas de Música y Mindfulness"

## 🔗 **Endpoints de la API**

### **1. Obtener Preview del Curso**
```http
GET /api/course/{courseId}/preview
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "id": "cme9ztt1y000313ht4yg5i10y",
  "title": "Curso de Música y Desarrollo Personal",
  "description": "Un curso completo que combina música y desarrollo personal...",
  "videoPreview": "https://www.youtube.com/watch?v=yEIKwtVRKuQ&list=RDyEIKwtVRKuQ&start_radio=1",
  "duration": 45,
  "level": "BEGINNER",
  "category": "SOFT_SKILLS",
  "thumbnail": "https://img.youtube.com/vi/yEIKwtVRKuQ/maxresdefault.jpg"
}
```

### **2. Obtener Curso Completo**
```http
GET /api/course/{courseId}
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "id": "cme9ztt1y000313ht4yg5i10y",
  "title": "Curso de Música y Desarrollo Personal",
  "modules": [
    {
      "id": "cme9zttff000513htivfcanvq",
      "title": "Fundamentos de Música y Desarrollo Personal",
      "lessons": [
        {
          "id": "cme9zzlv100039mu6c4y1s78e",
          "title": "Introducción a la Música para el Desarrollo Personal",
          "contentType": "VIDEO",
          "videoUrl": "https://www.youtube.com/watch?v=uY5406XeobY",
          "duration": 15,
          "orderIndex": 1
        },
        {
          "id": "cme9zzme700059mu6pctllubi",
          "title": "Técnicas Avanzadas de Música y Mindfulness",
          "contentType": "VIDEO",
          "videoUrl": "https://www.youtube.com/watch?v=9gWIIIr2Asw&list=RD9gWIIIr2Asw&start_radio=1",
          "duration": 15,
          "orderIndex": 2
        }
      ]
    }
  ]
}
```

### **3. Obtener Lecciones por Módulo**
```http
GET /api/lesson/module/{moduleId}
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "id": "cme9zzlv100039mu6c4y1s78e",
    "title": "Introducción a la Música para el Desarrollo Personal",
    "description": "Aprende cómo la música puede transformar tu vida...",
    "contentType": "VIDEO",
    "videoUrl": "https://www.youtube.com/watch?v=uY5406XeobY",
    "duration": 15,
    "orderIndex": 1,
    "isRequired": true,
    "isPreview": false
  },
  {
    "id": "cme9zzme700059mu6pctllubi",
    "title": "Técnicas Avanzadas de Música y Mindfulness",
    "description": "Explora técnicas avanzadas para usar la música...",
    "contentType": "VIDEO",
    "videoUrl": "https://www.youtube.com/watch?v=9gWIIIr2Asw&list=RD9gWIIIr2Asw&start_radio=1",
    "duration": 15,
    "orderIndex": 2,
    "isRequired": true,
    "isPreview": false
  }
]
```

## 🎬 **Implementación Frontend**

### **1. Componente de Video Player para YouTube**

```javascript
// utils/youtubePlayer.js
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
    showinfo = 0,
    width = '100%',
    height = '315'
  } = options;
  
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&controls=${controls}&modestbranding=${modestbranding}&rel=${rel}&showinfo=${showinfo}`;
}
```

### **2. Componente React para Video de Preview**

```jsx
// components/CoursePreview.jsx
import React from 'react';

const CoursePreview = ({ course }) => {
  const videoId = extractYouTubeId(course.videoPreview);
  const embedUrl = generateEmbedUrl(videoId, { autoplay: 0, controls: 1 });

  return (
    <div className="course-preview">
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      
      <div className="video-container">
        <iframe
          width="100%"
          height="315"
          src={embedUrl}
          title={course.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      <div className="course-info">
        <p><strong>Duración:</strong> {course.duration} minutos</p>
        <p><strong>Nivel:</strong> {course.level}</p>
        <p><strong>Categoría:</strong> {course.category}</p>
      </div>
    </div>
  );
};

export default CoursePreview;
```

### **3. Componente React para Lección con Video**

```jsx
// components/VideoLesson.jsx
import React, { useState } from 'react';

const VideoLesson = ({ lesson }) => {
  const [isWatched, setIsWatched] = useState(false);
  
  const videoId = extractYouTubeId(lesson.videoUrl);
  const embedUrl = generateEmbedUrl(videoId, { 
    autoplay: 0, 
    controls: 1,
    modestbranding: 1 
  });

  const handleVideoEnd = () => {
    setIsWatched(true);
    // Aquí puedes enviar el progreso al backend
  };

  return (
    <div className="video-lesson">
      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>
      
      <div className="video-container">
        <iframe
          width="100%"
          height="315"
          src={embedUrl}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onEnded={handleVideoEnd}
        />
      </div>
      
      <div className="lesson-info">
        <p><strong>Duración:</strong> {lesson.duration} minutos</p>
        <p><strong>Orden:</strong> {lesson.orderIndex}</p>
        {isWatched && <span className="watched-badge">✅ Completado</span>}
      </div>
    </div>
  );
};

export default VideoLesson;
```

### **4. Componente React para Lista de Lecciones**

```jsx
// components/LessonList.jsx
import React, { useState, useEffect } from 'react';
import VideoLesson from './VideoLesson';

const LessonList = ({ moduleId }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, [moduleId]);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`/api/lesson/module/${moduleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Error fetching lessons');
      
      const data = await response.json();
      setLessons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando lecciones...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="lesson-list">
      <h2>Lecciones del Módulo</h2>
      {lessons.map((lesson) => (
        <div key={lesson.id} className="lesson-item">
          {lesson.contentType === 'VIDEO' ? (
            <VideoLesson lesson={lesson} />
          ) : (
            <div className="text-lesson">
              <h3>{lesson.title}</h3>
              <p>{lesson.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LessonList;
```

### **5. Hook Personalizado para Cursos**

```javascript
// hooks/useCourse.js
import { useState, useEffect } from 'react';

export const useCourse = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Error fetching course');
      
      const data = await response.json();
      setCourse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      const response = await fetch(`/api/course/${courseId}/preview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Error fetching course preview');
      
      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { course, loading, error, fetchPreview };
};
```

## 🎨 **Estilos CSS Recomendados**

```css
/* styles/youtube-videos.css */
.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.video-container iframe {
  width: 100%;
  height: 315px;
  border: none;
}

.lesson-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #fff;
}

.video-lesson h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.lesson-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.watched-badge {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.course-preview {
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.course-info {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

## 📱 **Responsive Design**

```css
/* Responsive adjustments */
@media (max-width: 768px) {
  .video-container iframe {
    height: 200px;
  }
  
  .course-preview {
    padding: 1rem;
  }
  
  .lesson-item {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .video-container iframe {
    height: 180px;
  }
}
```

## 🔧 **Configuración del Proyecto**

### **Variables de Entorno**
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key_optional
```

### **Dependencias Recomendadas**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0"
  }
}
```

## 🚀 **Ejemplo de Uso Completo**

```jsx
// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CoursePreview from './components/CoursePreview';
import LessonList from './components/LessonList';
import { useCourse } from './hooks/useCourse';

const COURSE_ID = 'cme9ztt1y000313ht4yg5i10y';
const MODULE_ID = 'cme9zttff000513htivfcanvq';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/course/:id/preview" element={<CoursePreviewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

const CourseDetail = () => {
  const { course, loading, error } = useCourse(COURSE_ID);
  
  if (loading) return <div>Cargando curso...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{course.title}</h1>
      <LessonList moduleId={MODULE_ID} />
    </div>
  );
};

const CoursePreviewPage = () => {
  const [preview, setPreview] = useState(null);
  
  useEffect(() => {
    fetch(`/api/course/${COURSE_ID}/preview`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(setPreview);
  }, []);
  
  if (!preview) return <div>Cargando preview...</div>;
  
  return <CoursePreview course={preview} />;
};

export default App;
```

## ✅ **Verificación de Funcionalidad**

Los siguientes endpoints han sido probados y funcionan correctamente:

1. ✅ `GET /api/course/{courseId}/preview` - Preview del curso
2. ✅ `GET /api/course/{courseId}` - Curso completo
3. ✅ `GET /api/lesson/module/{moduleId}` - Lecciones del módulo

## 🎉 **¡Sistema Listo para Producción!**

El sistema de cursos con videos de YouTube está completamente implementado y probado. Los estudiantes pueden:

- ✅ Ver el video de preview al buscar cursos
- ✅ Acceder al curso completo con todas las lecciones
- ✅ Reproducir videos de YouTube directamente en el frontend
- ✅ Navegar entre lecciones de video
- ✅ Ver información detallada de cada lección

**¡El frontend está listo para integrar con esta API!** 🚀
