const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'YOUR_TOKEN_HERE'; // Reemplaza con tu token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testPlatziSystem() {
  try {
    console.log('🚀 Probando sistema de cursos tipo Platzi...\n');

    // 1. Crear un curso
    console.log('1. Creando curso...');
    const courseData = {
      title: "Curso de Programación Web Completo",
      slug: "programacion-web-completo",
      description: "Aprende HTML, CSS, JavaScript y más desde cero hasta avanzado",
      shortDescription: "Curso completo de desarrollo web",
      level: "BEGINNER",
      category: "TECHNICAL_SKILLS",
      duration: 480, // 8 horas
      objectives: [
        "Crear páginas web responsivas",
        "Programar en JavaScript",
        "Entender CSS avanzado",
        "Trabajar con frameworks modernos"
      ],
      prerequisites: [
        "Conocimientos básicos de computación",
        "Ganas de aprender"
      ],
      isMandatory: false,
      isActive: true,
      price: 0,
      certification: true,
      includedMaterials: [
        "PDFs de teoría",
        "Videos explicativos",
        "Ejercicios prácticos",
        "Proyectos reales"
      ],
      tags: ["programación", "web", "frontend", "javascript"]
    };

    const course = await api.post('/course', courseData);
    console.log('✅ Curso creado:', course.data.title);
    const courseId = course.data.id;

    // 2. Crear módulos para el curso
    console.log('\n2. Creando módulos...');
    const modules = [
      {
        title: "Fundamentos de HTML",
        description: "Aprende los conceptos básicos de HTML5",
        orderIndex: 1,
        estimatedDuration: 120,
        prerequisites: [],
        hasCertificate: true
      },
      {
        title: "CSS y Diseño Web",
        description: "Domina CSS3 y crea diseños modernos",
        orderIndex: 2,
        estimatedDuration: 180,
        prerequisites: ["Fundamentos de HTML"],
        hasCertificate: true
      },
      {
        title: "JavaScript Básico",
        description: "Introducción a la programación con JavaScript",
        orderIndex: 3,
        estimatedDuration: 180,
        prerequisites: ["CSS y Diseño Web"],
        hasCertificate: true
      }
    ];

    const createdModules = [];
    for (const moduleData of modules) {
      const module = await api.post('/coursemodule', {
        ...moduleData,
        courseId
      });
      createdModules.push(module.data);
      console.log('✅ Módulo creado:', module.data.title);
    }

    // 3. Crear lecciones para cada módulo
    console.log('\n3. Creando lecciones...');
    const lessons = [
      // Módulo 1: HTML
      {
        title: "Introducción a HTML",
        description: "¿Qué es HTML y por qué es importante?",
        content: "HTML es el lenguaje de marcado estándar para crear páginas web...",
        contentType: "VIDEO",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 15,
        orderIndex: 1,
        moduleId: createdModules[0].id
      },
      {
        title: "Estructura básica de HTML",
        description: "Aprende las etiquetas fundamentales",
        content: "Toda página HTML tiene una estructura básica...",
        contentType: "VIDEO",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 20,
        orderIndex: 2,
        moduleId: createdModules[0].id
      },
      // Módulo 2: CSS
      {
        title: "Introducción a CSS",
        description: "¿Qué es CSS y cómo funciona?",
        content: "CSS es el lenguaje de estilos para HTML...",
        contentType: "VIDEO",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 18,
        orderIndex: 1,
        moduleId: createdModules[1].id
      },
      {
        title: "Selectores CSS",
        description: "Aprende a seleccionar elementos",
        content: "Los selectores CSS te permiten aplicar estilos...",
        contentType: "VIDEO",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 25,
        orderIndex: 2,
        moduleId: createdModules[1].id
      },
      // Módulo 3: JavaScript
      {
        title: "Introducción a JavaScript",
        description: "¿Qué es JavaScript?",
        content: "JavaScript es un lenguaje de programación...",
        contentType: "VIDEO",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 20,
        orderIndex: 1,
        moduleId: createdModules[2].id
      },
      {
        title: "Variables y tipos de datos",
        description: "Aprende sobre variables en JavaScript",
        content: "Las variables son contenedores para almacenar datos...",
        contentType: "VIDEO",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 22,
        orderIndex: 2,
        moduleId: createdModules[2].id
      }
    ];

    const createdLessons = [];
    for (const lessonData of lessons) {
      const lesson = await api.post('/lesson', lessonData);
      createdLessons.push(lesson.data);
      console.log('✅ Lección creada:', lesson.data.title);
    }

    // 4. Agregar recursos a las lecciones
    console.log('\n4. Agregando recursos a las lecciones...');
    const resources = [
      {
        lessonId: createdLessons[0].id,
        title: "Guía de HTML",
        description: "PDF con todos los conceptos de HTML",
        type: "PDF",
        url: "https://example.com/html-guide.pdf",
        orderIndex: 1,
        isDownloadable: true
      },
      {
        lessonId: createdLessons[0].id,
        title: "Ejercicios prácticos",
        description: "Archivo ZIP con ejercicios",
        type: "ZIP",
        url: "https://example.com/html-exercises.zip",
        orderIndex: 2,
        isDownloadable: true
      },
      {
        lessonId: createdLessons[2].id,
        title: "Referencia CSS",
        description: "Documento con propiedades CSS",
        type: "DOCUMENT",
        url: "https://example.com/css-reference.pdf",
        orderIndex: 1,
        isDownloadable: true
      }
    ];

    for (const resourceData of resources) {
      const resource = await api.post('/lessonresource', resourceData);
      console.log('✅ Recurso agregado:', resource.data.title);
    }

    // 5. Simular inscripción de un estudiante
    console.log('\n5. Simulando inscripción de estudiante...');
    const enrollment = await api.post('/course-enrollments', {
      studentId: "STUDENT_ID_HERE", // Reemplaza con ID real
      courseId
    });
    console.log('✅ Estudiante inscrito en el curso');

    // 6. Simular progreso del estudiante
    console.log('\n6. Simulando progreso del estudiante...');
    const progressData = [
      {
        enrollmentId: enrollment.data.id,
        lessonId: createdLessons[0].id,
        isCompleted: true,
        timeSpent: 900, // 15 minutos
        videoProgress: 1.0
      },
      {
        enrollmentId: enrollment.data.id,
        lessonId: createdLessons[1].id,
        isCompleted: false,
        timeSpent: 600, // 10 minutos
        videoProgress: 0.5
      },
      {
        enrollmentId: enrollment.data.id,
        lessonId: createdLessons[2].id,
        isCompleted: true,
        timeSpent: 1080, // 18 minutos
        videoProgress: 1.0
      }
    ];

    for (const progress of progressData) {
      await api.post('/lessonprogress', progress);
      console.log(`✅ Progreso registrado para lección: ${progress.lessonId}`);
    }

    // 7. Obtener progreso del curso
    console.log('\n7. Obteniendo progreso del curso...');
    const courseProgress = await api.get(`/lessonprogress/course/${courseId}`);
    console.log('📊 Progreso del curso:', {
      overallProgress: `${courseProgress.data.overallProgress}%`,
      completedLessons: courseProgress.data.completedLessons,
      totalLessons: courseProgress.data.totalLessons
    });

    // 8. Simular certificado de módulo completado
    console.log('\n8. Generando certificado de módulo...');
    const moduleCertificate = await api.post('/modulecertificate', {
      moduleId: createdModules[0].id,
      studentId: "STUDENT_ID_HERE", // Reemplaza con ID real
      certificateUrl: "https://example.com/certificates/html-module.pdf",
      grade: 95
    });
    console.log('🎓 Certificado generado para módulo:', createdModules[0].title);

    // 9. Listar recursos de una lección
    console.log('\n9. Listando recursos de una lección...');
    const lessonResources = await api.get(`/lessonresource?lessonId=${createdLessons[0].id}`);
    console.log('📚 Recursos de la lección:', lessonResources.data.map(r => r.title));

    // 10. Obtener detalles completos del curso
    console.log('\n10. Obteniendo detalles del curso...');
    const courseDetails = await api.get(`/course/${courseId}`);
    console.log('📖 Detalles del curso:', {
      title: courseDetails.data.title,
      modules: courseDetails.data.modules?.length || 0,
      totalLessons: courseDetails.data.totalLessons,
      duration: courseDetails.data.duration
    });

    console.log('\n🎉 ¡Sistema de cursos tipo Platzi probado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`- Curso creado: ${course.data.title}`);
    console.log(`- Módulos creados: ${createdModules.length}`);
    console.log(`- Lecciones creadas: ${createdLessons.length}`);
    console.log(`- Recursos agregados: ${resources.length}`);
    console.log(`- Progreso simulado para estudiante`);
    console.log(`- Certificado generado para primer módulo`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Ejecutar el test
testPlatziSystem();
