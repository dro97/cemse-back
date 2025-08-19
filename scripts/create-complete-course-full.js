const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCompleteCourseFull() {
  try {
    console.log('🎓 Creando curso completo con todos los campos...\n');

    // 1. Crear el curso principal con todos los campos
    console.log('📚 Creando curso: "Desarrollo Web Full Stack"');
    const course = await prisma.course.create({
      data: {
        title: "Desarrollo Web Full Stack",
        slug: "desarrollo-web-fullstack-completo",
        description: "Aprende a crear aplicaciones web completas desde cero. Este curso te llevará desde los fundamentos del desarrollo web hasta la creación de aplicaciones full stack modernas y escalables. Cubriremos HTML, CSS, JavaScript, React, Node.js, Express, bases de datos y despliegue en producción.",
        shortDescription: "Curso completo de desarrollo web full stack para principiantes e intermedios",
        thumbnail: "https://example.com/images/fullstack-course.jpg",
        videoPreview: "https://example.com/videos/fullstack-preview.mp4",
        objectives: [
          "Dominar HTML5, CSS3 y JavaScript moderno",
          "Crear aplicaciones React responsivas y escalables",
          "Desarrollar APIs RESTful con Node.js y Express",
          "Trabajar con bases de datos SQL y NoSQL",
          "Implementar autenticación y autorización",
          "Desplegar aplicaciones en servicios cloud",
          "Aplicar mejores prácticas de desarrollo",
          "Trabajar con control de versiones Git"
        ],
        prerequisites: [
          "Conocimientos básicos de informática",
          "Comprensión de conceptos básicos de programación",
          "Disposición para aprender y practicar",
          "Computadora con acceso a internet"
        ],
        duration: 80, // horas
        level: "INTERMEDIATE",
        category: "TECHNICAL_SKILLS",
        isMandatory: false,
        isActive: true,
        price: 0,
        rating: 4.9,
        studentsCount: 0,
        completionRate: 0,
        totalLessons: 0,
        totalQuizzes: 0,
        totalResources: 0,
        tags: ["fullstack", "web", "javascript", "react", "nodejs", "express", "database", "api"],
        certification: true,
        includedMaterials: [
          "Código fuente completo de todos los proyectos",
          "Presentaciones en PDF de cada módulo",
          "Ejercicios prácticos con soluciones",
          "Proyecto final completo",
          "Certificado de finalización",
          "Acceso a comunidad de estudiantes",
          "Soporte técnico durante 6 meses",
          "Recursos adicionales y bibliografía"
        ],
        institutionName: "Academia de Desarrollo Web Full Stack",
        publishedAt: new Date()
      }
    });

    console.log(`✅ Curso creado: ${course.title} (ID: ${course.id})`);

    // 2. Crear módulos completos
    const modules = [
      {
        title: "Fundamentos del Desarrollo Web",
        description: "Introducción a los conceptos básicos del desarrollo web, HTML5, CSS3 y JavaScript moderno",
        orderIndex: 1,
        estimatedDuration: 12,
        isLocked: false,
        prerequisites: []
      },
      {
        title: "JavaScript Avanzado y ES6+",
        description: "Profundiza en JavaScript moderno, incluyendo ES6+, async/await, módulos y programación funcional",
        orderIndex: 2,
        estimatedDuration: 15,
        isLocked: false,
        prerequisites: ["Fundamentos del Desarrollo Web"]
      },
      {
        title: "React.js - Frontend Moderno",
        description: "Aprende React desde cero: componentes, hooks, estado, routing y gestión de estado global",
        orderIndex: 3,
        estimatedDuration: 20,
        isLocked: false,
        prerequisites: ["JavaScript Avanzado y ES6+"]
      },
      {
        title: "Node.js y Express.js",
        description: "Desarrollo backend con Node.js, Express.js, middleware, routing y APIs RESTful",
        orderIndex: 4,
        estimatedDuration: 18,
        isLocked: false,
        prerequisites: ["JavaScript Avanzado y ES6+"]
      },
      {
        title: "Bases de Datos y ORM",
        description: "Trabajo con bases de datos SQL y NoSQL, Prisma ORM, y gestión de datos",
        orderIndex: 5,
        estimatedDuration: 10,
        isLocked: false,
        prerequisites: ["Node.js y Express.js"]
      },
      {
        title: "Autenticación y Seguridad",
        description: "Implementación de autenticación JWT, autorización, validación y seguridad web",
        orderIndex: 6,
        estimatedDuration: 8,
        isLocked: false,
        prerequisites: ["Bases de Datos y ORM"]
      },
      {
        title: "Despliegue y DevOps",
        description: "Despliegue de aplicaciones en producción, CI/CD, Docker y servicios cloud",
        orderIndex: 7,
        estimatedDuration: 7,
        isLocked: false,
        prerequisites: ["Autenticación y Seguridad"]
      },
      {
        title: "Proyecto Final Integrador",
        description: "Aplicación completa full stack que integra todos los conocimientos adquiridos",
        orderIndex: 8,
        estimatedDuration: 25,
        isLocked: false,
        prerequisites: ["Despliegue y DevOps"]
      }
    ];

    const createdModules = [];
    for (const moduleData of modules) {
      const module = await prisma.courseModule.create({
        data: {
          ...moduleData,
          courseId: course.id
        }
      });
      createdModules.push(module);
      console.log(`✅ Módulo creado: ${module.title}`);
    }

    // 3. Crear lecciones detalladas para cada módulo
    const lessonsData = [
      // Módulo 1: Fundamentos del Desarrollo Web
      {
        moduleIndex: 0,
        lessons: [
          {
            title: "Introducción al Desarrollo Web",
            description: "Panorama general del desarrollo web y tecnologías modernas",
            content: "En esta lección aprenderás sobre la evolución del desarrollo web, las tecnologías actuales y las tendencias futuras. Exploraremos el ecosistema completo de herramientas y frameworks disponibles.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/intro-web-dev.mp4",
            duration: 25,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "HTML5 - Estructura Semántica",
            description: "Crear páginas web con HTML5 semántico y accesible",
            content: "Aprende a estructurar contenido web usando las nuevas etiquetas semánticas de HTML5. Veremos cómo crear páginas accesibles y bien estructuradas.",
            contentType: "TEXT",
            duration: 30,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "CSS3 - Estilos Modernos",
            description: "Aplicar estilos modernos con CSS3, Flexbox y Grid",
            content: "Domina CSS3 con técnicas modernas como Flexbox, Grid, animaciones y responsive design. Crearemos diseños profesionales y adaptables.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/css3-modern.mp4",
            duration: 35,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          },
          {
            title: "JavaScript Básico",
            description: "Fundamentos de JavaScript: variables, funciones y control de flujo",
            content: "Introducción a JavaScript: sintaxis básica, tipos de datos, funciones, condicionales y bucles. Base fundamental para el desarrollo web moderno.",
            contentType: "EXERCISE",
            duration: 40,
            orderIndex: 4,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 2: JavaScript Avanzado
      {
        moduleIndex: 1,
        lessons: [
          {
            title: "ES6+ Features",
            description: "Características modernas de JavaScript: arrow functions, destructuring, spread operator",
            content: "Explora las características modernas de ES6+: arrow functions, destructuring, spread/rest operators, template literals y más.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/es6-features.mp4",
            duration: 30,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Async/Await y Promesas",
            description: "Programación asíncrona moderna con promesas y async/await",
            content: "Aprende a manejar operaciones asíncronas de forma elegante con promesas y async/await. Fundamental para trabajar con APIs.",
            contentType: "TEXT",
            duration: 35,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Módulos ES6",
            description: "Organización de código con módulos ES6 e import/export",
            content: "Organiza tu código JavaScript usando módulos ES6. Aprende import/export, módulos dinámicos y mejores prácticas.",
            contentType: "EXERCISE",
            duration: 25,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 3: React.js
      {
        moduleIndex: 2,
        lessons: [
          {
            title: "Introducción a React",
            description: "Conceptos fundamentales de React y JSX",
            content: "Introducción a React: componentes, JSX, props y el modelo de datos unidireccional. Crearemos tu primera aplicación React.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/react-intro.mp4",
            duration: 30,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Hooks de React",
            description: "useState, useEffect y hooks personalizados",
            content: "Domina los hooks de React: useState para estado, useEffect para efectos secundarios y creación de hooks personalizados.",
            contentType: "TEXT",
            duration: 40,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Routing con React Router",
            description: "Navegación entre páginas con React Router v6",
            content: "Implementa navegación en tu aplicación React usando React Router. Rutas dinámicas, parámetros y navegación programática.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/react-router.mp4",
            duration: 35,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Gestión de Estado Global",
            description: "Context API y Redux Toolkit para estado global",
            content: "Gestiona estado global en aplicaciones React complejas usando Context API y Redux Toolkit.",
            contentType: "EXERCISE",
            duration: 45,
            orderIndex: 4,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 4: Node.js y Express
      {
        moduleIndex: 3,
        lessons: [
          {
            title: "Introducción a Node.js",
            description: "Fundamentos de Node.js y el ecosistema npm",
            content: "Introducción a Node.js: event loop, módulos nativos, npm y el ecosistema de paquetes.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/nodejs-intro.mp4",
            duration: 25,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Express.js Framework",
            description: "Crear APIs RESTful con Express.js",
            content: "Desarrolla APIs RESTful completas con Express.js: routing, middleware, validación y manejo de errores.",
            contentType: "TEXT",
            duration: 40,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Middleware y Validación",
            description: "Middleware personalizado y validación de datos",
            content: "Crea middleware personalizado y implementa validación robusta de datos con bibliotecas como Joi o express-validator.",
            contentType: "EXERCISE",
            duration: 35,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 5: Bases de Datos
      {
        moduleIndex: 4,
        lessons: [
          {
            title: "Introducción a Bases de Datos",
            description: "Conceptos fundamentales de bases de datos relacionales y NoSQL",
            content: "Fundamentos de bases de datos: SQL vs NoSQL, normalización, relaciones y consultas básicas.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/databases-intro.mp4",
            duration: 30,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Prisma ORM",
            description: "Trabajar con bases de datos usando Prisma ORM",
            content: "Usa Prisma ORM para interactuar con bases de datos de forma segura y eficiente. Schema, migraciones y consultas.",
            contentType: "TEXT",
            duration: 35,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Consultas Avanzadas",
            description: "Consultas complejas, relaciones y optimización",
            content: "Realiza consultas complejas, maneja relaciones entre tablas y optimiza el rendimiento de tu base de datos.",
            contentType: "EXERCISE",
            duration: 40,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 6: Autenticación
      {
        moduleIndex: 5,
        lessons: [
          {
            title: "Autenticación JWT",
            description: "Implementar autenticación segura con JWT",
            content: "Implementa autenticación JWT completa: registro, login, refresh tokens y manejo de sesiones.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/jwt-auth.mp4",
            duration: 35,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Autorización y Roles",
            description: "Sistema de roles y permisos",
            content: "Implementa un sistema de autorización basado en roles y permisos para proteger rutas y recursos.",
            contentType: "TEXT",
            duration: 30,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Seguridad Web",
            description: "Mejores prácticas de seguridad web",
            content: "Aprende sobre vulnerabilidades comunes, CORS, rate limiting, sanitización de datos y otras medidas de seguridad.",
            contentType: "EXERCISE",
            duration: 25,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 7: Despliegue
      {
        moduleIndex: 6,
        lessons: [
          {
            title: "Docker y Contenedores",
            description: "Containerización de aplicaciones con Docker",
            content: "Aprende a containerizar tu aplicación con Docker. Dockerfiles, docker-compose y mejores prácticas.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/docker-intro.mp4",
            duration: 30,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Despliegue en Cloud",
            description: "Desplegar aplicaciones en servicios cloud",
            content: "Despliega tu aplicación en servicios cloud como Heroku, Railway, Vercel o AWS. Configuración y monitoreo.",
            contentType: "TEXT",
            duration: 35,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "CI/CD Pipeline",
            description: "Automatización de despliegue con GitHub Actions",
            content: "Configura un pipeline de CI/CD con GitHub Actions para automatizar testing y despliegue.",
            contentType: "EXERCISE",
            duration: 40,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 8: Proyecto Final
      {
        moduleIndex: 7,
        lessons: [
          {
            title: "Planificación del Proyecto",
            description: "Diseño y arquitectura de la aplicación final",
            content: "Planifica tu aplicación full stack: arquitectura, tecnologías, base de datos y funcionalidades principales.",
            contentType: "TEXT",
            duration: 45,
            orderIndex: 1,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Desarrollo Frontend",
            description: "Implementación del frontend con React",
            content: "Desarrolla el frontend completo de tu aplicación: componentes, routing, estado y integración con APIs.",
            contentType: "EXERCISE",
            duration: 120,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Desarrollo Backend",
            description: "Implementación del backend con Node.js",
            content: "Desarrolla el backend completo: APIs, autenticación, base de datos y lógica de negocio.",
            contentType: "EXERCISE",
            duration: 150,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Integración y Despliegue",
            description: "Integración completa y despliegue en producción",
            content: "Integra frontend y backend, realiza testing completo y despliega tu aplicación en producción.",
            contentType: "EXERCISE",
            duration: 90,
            orderIndex: 4,
            isRequired: true,
            isPreview: false
          }
        ]
      }
    ];

    // Crear lecciones
    let totalLessons = 0;
    for (const moduleData of lessonsData) {
      const module = createdModules[moduleData.moduleIndex];
      for (const lessonData of moduleData.lessons) {
        const lesson = await prisma.lesson.create({
          data: {
            ...lessonData,
            moduleId: module.id
          }
        });
        totalLessons++;
        console.log(`✅ Lección creada: ${lesson.title} (Módulo: ${module.title})`);
      }
    }

    // 4. Crear quizzes completos
    const quizzes = [
      {
        title: "Quiz: Fundamentos del Desarrollo Web",
        description: "Evalúa tu conocimiento de HTML5, CSS3 y JavaScript básico",
        timeLimit: 1800, // 30 minutos
        passingScore: 70,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      },
      {
        title: "Quiz: JavaScript Avanzado",
        description: "Evalúa tu comprensión de ES6+, async/await y módulos",
        timeLimit: 1500, // 25 minutos
        passingScore: 75,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      },
      {
        title: "Quiz: React.js",
        description: "Evalúa tu conocimiento de React, hooks y routing",
        timeLimit: 2000, // 33 minutos
        passingScore: 80,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      },
      {
        title: "Quiz: Node.js y Express",
        description: "Evalúa tu comprensión de backend con Node.js y Express",
        timeLimit: 1600, // 27 minutos
        passingScore: 75,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      },
      {
        title: "Quiz: Bases de Datos",
        description: "Evalúa tu conocimiento de bases de datos y Prisma ORM",
        timeLimit: 1200, // 20 minutos
        passingScore: 70,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      },
      {
        title: "Quiz: Autenticación y Seguridad",
        description: "Evalúa tu comprensión de JWT, autorización y seguridad web",
        timeLimit: 1400, // 23 minutos
        passingScore: 80,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      },
      {
        title: "Quiz Final Integrador",
        description: "Evaluación final que integra todos los conocimientos del curso",
        timeLimit: 3600, // 60 minutos
        passingScore: 85,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      }
    ];

    const createdQuizzes = [];
    for (const quizData of quizzes) {
      const quiz = await prisma.quiz.create({
        data: quizData
      });
      createdQuizzes.push(quiz);
      console.log(`✅ Quiz creado: ${quiz.title}`);
    }

    // 5. Crear preguntas detalladas para los quizzes
    const quizQuestions = [
      // Quiz 1: Fundamentos del Desarrollo Web
      {
        quizIndex: 0,
        questions: [
          {
            question: "¿Cuál es la etiqueta HTML5 semántica para el contenido principal de una página?",
            type: "MULTIPLE_CHOICE",
            options: ["<div>", "<main>", "<section>", "<article>"],
            correctAnswer: "<main>",
            explanation: "La etiqueta <main> es la etiqueta semántica HTML5 que representa el contenido principal de la página.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Qué propiedad CSS se usa para crear un diseño flexible?",
            type: "MULTIPLE_CHOICE",
            options: ["display: flex", "position: relative", "float: left", "margin: auto"],
            correctAnswer: "display: flex",
            explanation: "display: flex activa el modelo de caja flexible (Flexbox) en CSS.",
            points: 10,
            orderIndex: 2
          },
          {
            question: "¿Cuál es la diferencia entre let y var en JavaScript?",
            type: "SHORT_ANSWER",
            correctAnswer: "let tiene scope de bloque, var tiene scope de función",
            explanation: "let tiene scope de bloque (block scope) mientras que var tiene scope de función (function scope).",
            points: 15,
            orderIndex: 3
          },
          {
            question: "¿Qué método se usa para agregar un elemento al final de un array en JavaScript?",
            type: "MULTIPLE_CHOICE",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correctAnswer: "push()",
            explanation: "El método push() agrega uno o más elementos al final de un array.",
            points: 10,
            orderIndex: 4
          }
        ]
      },
      // Quiz 2: JavaScript Avanzado
      {
        quizIndex: 1,
        questions: [
          {
            question: "¿Qué es una arrow function en JavaScript?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Una función que usa flechas como parámetros",
              "Una sintaxis más corta para escribir funciones",
              "Una función que solo puede ser llamada una vez",
              "Una función que siempre retorna una promesa"
            ],
            correctAnswer: "Una sintaxis más corta para escribir funciones",
            explanation: "Las arrow functions son una sintaxis más concisa para escribir funciones en ES6+.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Para qué se usa async/await?",
            type: "SHORT_ANSWER",
            correctAnswer: "Para manejar operaciones asíncronas de forma más legible",
            explanation: "async/await permite escribir código asíncrono de forma más legible y fácil de entender.",
            points: 15,
            orderIndex: 2
          },
          {
            question: "¿Cuál es la diferencia entre const y let?",
            type: "MULTIPLE_CHOICE",
            options: [
              "const no existe en JavaScript",
              "const no permite reasignación, let sí",
              "let es más rápido que const",
              "const solo funciona con objetos"
            ],
            correctAnswer: "const no permite reasignación, let sí",
            explanation: "const declara una variable que no puede ser reasignada, mientras que let permite reasignación.",
            points: 10,
            orderIndex: 3
          }
        ]
      },
      // Quiz 3: React.js
      {
        quizIndex: 2,
        questions: [
          {
            question: "¿Qué es un hook en React?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Una función que conecta componentes",
              "Una función que permite usar estado y efectos en componentes funcionales",
              "Un evento que se dispara automáticamente",
              "Una biblioteca externa de React"
            ],
            correctAnswer: "Una función que permite usar estado y efectos en componentes funcionales",
            explanation: "Los hooks son funciones que permiten usar estado y otras características de React en componentes funcionales.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Cuál es el hook más común para manejar estado en React?",
            type: "MULTIPLE_CHOICE",
            options: ["useEffect", "useState", "useContext", "useReducer"],
            correctAnswer: "useState",
            explanation: "useState es el hook más común y fundamental para manejar estado en componentes funcionales.",
            points: 10,
            orderIndex: 2
          },
          {
            question: "¿Para qué se usa useEffect?",
            type: "SHORT_ANSWER",
            correctAnswer: "Para manejar efectos secundarios como llamadas a APIs",
            explanation: "useEffect se usa para manejar efectos secundarios como llamadas a APIs, suscripciones, etc.",
            points: 15,
            orderIndex: 3
          }
        ]
      },
      // Quiz 4: Node.js y Express
      {
        quizIndex: 3,
        questions: [
          {
            question: "¿Qué es Node.js?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Un framework de JavaScript",
              "Un runtime de JavaScript para el servidor",
              "Una base de datos",
              "Un editor de código"
            ],
            correctAnswer: "Un runtime de JavaScript para el servidor",
            explanation: "Node.js es un runtime de JavaScript que permite ejecutar JavaScript en el servidor.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Qué es Express.js?",
            type: "SHORT_ANSWER",
            correctAnswer: "Un framework web minimalista para Node.js",
            explanation: "Express.js es un framework web minimalista y flexible para Node.js que facilita la creación de APIs y aplicaciones web.",
            points: 15,
            orderIndex: 2
          },
          {
            question: "¿Qué es middleware en Express?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Un tipo de base de datos",
              "Funciones que se ejecutan entre la petición y la respuesta",
              "Un framework de testing",
              "Un sistema de autenticación"
            ],
            correctAnswer: "Funciones que se ejecutan entre la petición y la respuesta",
            explanation: "Middleware son funciones que se ejecutan entre la petición HTTP y la respuesta final.",
            points: 10,
            orderIndex: 3
          }
        ]
      },
      // Quiz 5: Bases de Datos
      {
        quizIndex: 4,
        questions: [
          {
            question: "¿Qué es un ORM?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Un sistema operativo",
              "Una herramienta que mapea objetos a bases de datos",
              "Un protocolo de red",
              "Un lenguaje de programación"
            ],
            correctAnswer: "Una herramienta que mapea objetos a bases de datos",
            explanation: "ORM (Object-Relational Mapping) es una técnica que mapea objetos de programación a tablas de base de datos.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Cuál es la ventaja principal de usar Prisma ORM?",
            type: "SHORT_ANSWER",
            correctAnswer: "Proporciona type safety y una API intuitiva para bases de datos",
            explanation: "Prisma proporciona type safety, una API intuitiva y herramientas de desarrollo para trabajar con bases de datos.",
            points: 15,
            orderIndex: 2
          }
        ]
      },
      // Quiz 6: Autenticación y Seguridad
      {
        quizIndex: 5,
        questions: [
          {
            question: "¿Qué significa JWT?",
            type: "MULTIPLE_CHOICE",
            options: [
              "JavaScript Web Token",
              "JSON Web Token",
              "Java Web Token",
              "JavaScript Window Token"
            ],
            correctAnswer: "JSON Web Token",
            explanation: "JWT significa JSON Web Token, un estándar para crear tokens de acceso.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Cuál es la diferencia entre autenticación y autorización?",
            type: "SHORT_ANSWER",
            correctAnswer: "Autenticación verifica identidad, autorización verifica permisos",
            explanation: "Autenticación verifica quién eres, autorización verifica qué puedes hacer.",
            points: 15,
            orderIndex: 2
          }
        ]
      },
      // Quiz 7: Final Integrador
      {
        quizIndex: 6,
        questions: [
          {
            question: "¿Cuáles son los componentes principales de una aplicación full stack?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Frontend, Backend y Base de Datos",
              "Solo Frontend y Backend",
              "Solo Base de Datos",
              "Solo Frontend"
            ],
            correctAnswer: "Frontend, Backend y Base de Datos",
            explanation: "Una aplicación full stack típicamente incluye frontend, backend y base de datos.",
            points: 15,
            orderIndex: 1
          },
          {
            question: "¿Qué tecnologías usarías para crear una API RESTful moderna?",
            type: "SHORT_ANSWER",
            correctAnswer: "Node.js, Express, Prisma y una base de datos como PostgreSQL",
            explanation: "Para una API RESTful moderna se recomienda Node.js, Express, Prisma ORM y una base de datos robusta como PostgreSQL.",
            points: 20,
            orderIndex: 2
          },
          {
            question: "¿Cuál es el flujo típico de autenticación en una aplicación web?",
            type: "SHORT_ANSWER",
            correctAnswer: "Registro → Login → JWT Token → Autorización en rutas protegidas",
            explanation: "El flujo típico incluye registro, login, generación de JWT y uso del token para autorizar rutas protegidas.",
            points: 20,
            orderIndex: 3
          }
        ]
      }
    ];

    // Crear preguntas
    let totalQuestions = 0;
    for (const quizData of quizQuestions) {
      const quiz = createdQuizzes[quizData.quizIndex];
      for (const questionData of quizData.questions) {
        const question = await prisma.quizQuestion.create({
          data: {
            ...questionData,
            quizId: quiz.id
          }
        });
        totalQuestions++;
        console.log(`✅ Pregunta creada: ${question.question.substring(0, 30)}...`);
      }
    }

    // 6. Actualizar estadísticas del curso
    const totalQuizzes = createdQuizzes.length;

    await prisma.course.update({
      where: { id: course.id },
      data: {
        totalLessons,
        totalQuizzes,
        totalResources: 25 // Recursos adicionales como PDFs, videos, etc.
      }
    });

    console.log('\n🎉 ¡Curso completo creado exitosamente!');
    console.log(`📊 Estadísticas finales:`);
    console.log(`   - Módulos: ${createdModules.length}`);
    console.log(`   - Lecciones: ${totalLessons}`);
    console.log(`   - Quizzes: ${totalQuizzes}`);
    console.log(`   - Preguntas: ${totalQuestions}`);
    console.log(`   - Recursos: 25`);
    console.log(`\n🔗 URL para acceder al curso:`);
    console.log(`   GET http://localhost:3001/api/course/${course.id}`);
    console.log(`\n📋 Información del curso:`);
    console.log(`   ID: ${course.id}`);
    console.log(`   Título: ${course.title}`);
    console.log(`   Slug: ${course.slug}`);
    console.log(`   Duración: ${course.duration} horas`);
    console.log(`   Nivel: ${course.level}`);
    console.log(`   Categoría: ${course.category}`);
    console.log(`   Precio: $${course.price}`);
    console.log(`   Certificación: ${course.certification ? 'Sí' : 'No'}`);
    console.log(`   Activo: ${course.isActive ? 'Sí' : 'No'}`);

  } catch (error) {
    console.error('❌ Error creando curso:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCompleteCourseFull();
