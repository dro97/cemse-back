// Componente de Video Player para YouTube
// Este archivo contiene funciones para manejar videos de YouTube en el frontend

/**
 * Extrae el ID del video de YouTube de una URL
 * @param {string} url - URL del video de YouTube
 * @returns {string|null} - ID del video o null si no es válida
 */
function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Genera la URL de embed de YouTube
 * @param {string} videoId - ID del video de YouTube
 * @param {Object} options - Opciones adicionales
 * @returns {string} - URL de embed
 */
function generateEmbedUrl(videoId, options = {}) {
  const {
    autoplay = 0,
    controls = 1,
    modestbranding = 1,
    rel = 0,
    showinfo = 0,
    width = 560,
    height = 315
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

/**
 * Genera la URL de thumbnail de YouTube
 * @param {string} videoId - ID del video de YouTube
 * @param {string} quality - Calidad del thumbnail (default, hq, mq, sd, maxres)
 * @returns {string} - URL del thumbnail
 */
function generateThumbnailUrl(videoId, quality = 'maxresdefault') {
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

/**
 * Componente React para reproducir videos de YouTube
 * @param {Object} props - Propiedades del componente
 * @param {string} props.videoUrl - URL del video de YouTube
 * @param {string} props.title - Título del video
 * @param {Function} props.onProgress - Callback para el progreso
 * @param {Object} props.options - Opciones adicionales
 * @returns {JSX.Element} - Componente de video
 */
function YouTubeVideoPlayer({ videoUrl, title, onProgress, options = {} }) {
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
  const thumbnailUrl = generateThumbnailUrl(videoId);

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
      <div className="video-info">
        <p><strong>Video ID:</strong> {videoId}</p>
        <p><strong>Thumbnail:</strong> <a href={thumbnailUrl} target="_blank" rel="noopener noreferrer">Ver thumbnail</a></p>
      </div>
    </div>
  );
}

/**
 * Componente React para mostrar el preview del curso
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.course - Datos del curso
 * @returns {JSX.Element} - Componente de preview
 */
function CoursePreview({ course }) {
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
}

/**
 * Componente React para mostrar una lección con video de YouTube
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.lesson - Datos de la lección
 * @param {Function} props.onProgress - Callback para el progreso
 * @returns {JSX.Element} - Componente de lección
 */
function YouTubeLesson({ lesson, onProgress }) {
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
}

/**
 * Componente React para mostrar un curso completo con lecciones
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.course - Datos del curso completo
 * @param {Function} props.onLessonProgress - Callback para el progreso de lecciones
 * @returns {JSX.Element} - Componente de curso completo
 */
function FullCourse({ course, onLessonProgress }) {
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
}

// Exportar funciones y componentes
module.exports = {
  extractYouTubeId,
  generateEmbedUrl,
  generateThumbnailUrl,
  YouTubeVideoPlayer,
  CoursePreview,
  YouTubeLesson,
  FullCourse
};

// Si se está usando en un entorno de módulos ES6
if (typeof exports !== 'undefined') {
  exports.YouTubeVideoPlayer = YouTubeVideoPlayer;
  exports.CoursePreview = CoursePreview;
  exports.YouTubeLesson = YouTubeLesson;
  exports.FullCourse = FullCourse;
  exports.extractYouTubeId = extractYouTubeId;
  exports.generateEmbedUrl = generateEmbedUrl;
  exports.generateThumbnailUrl = generateThumbnailUrl;
}
