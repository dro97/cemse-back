const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCompleteCourse() {
  try {
    console.log('🎓 Creando curso completo de ejemplo...\n');

    // 2. Crear el curso principal (sin instructor por ahora)
    console.log('📚 Creando curso: "Desarrollo Web con React"');
    const course = await prisma.course.create({
      data: {
        title: "Desarrollo Web con React",
        slug: "desarrollo-web-react-completo",
        description: "Aprende a crear aplicaciones web modernas y responsivas usando React, el framework más popular de JavaScript. Este curso te llevará desde los fundamentos hasta la creación de aplicaciones complejas.",
        shortDescription: "Curso completo de React para principiantes e intermedios",
        objectives: [
          "Entender los fundamentos de React y JSX",
          "Crear componentes reutilizables y funcionales",
          "Manejar estado y props efectivamente",
          "Implementar hooks personalizados",
          "Crear aplicaciones con routing y gestión de estado",
          "Desplegar aplicaciones React en producción"
        ],
        prerequisites: [
          "Conocimientos básicos de JavaScript (ES6+)",
          "HTML y CSS fundamentales",
          "Conceptos básicos de programación"
        ],
        duration: 40, // horas
        level: "INTERMEDIATE",
        category: "TECHNICAL_SKILLS",
        isMandatory: false,
        isActive: true,
        price: 0,
        rating: 4.8,
        studentsCount: 0,
        completionRate: 0,
        totalLessons: 0,
        totalQuizzes: 0,
        totalResources: 0,
        tags: ["react", "javascript", "web", "frontend", "ui"],
        certification: true,
        includedMaterials: [
          "Código fuente completo",
          "Presentaciones en PDF",
          "Ejercicios prácticos",
          "Proyecto final",
          "Certificado de finalización"
        ],
        institutionName: "Academia de Desarrollo Web"
      }
    });

    console.log(`✅ Curso creado: ${course.title} (ID: ${course.id})`);

    // 3. Crear módulos
    const modules = [
      {
        title: "Fundamentos de React",
        description: "Introducción a React, JSX y los conceptos básicos del framework",
        orderIndex: 1,
        estimatedDuration: 8,
        isLocked: false,
        prerequisites: []
      },
      {
        title: "Componentes y Props",
        description: "Aprende a crear y reutilizar componentes, y a pasar datos entre ellos",
        orderIndex: 2,
        estimatedDuration: 6,
        isLocked: false,
        prerequisites: []
      },
      {
        title: "Estado y Ciclo de Vida",
        description: "Manejo del estado de los componentes y el ciclo de vida de React",
        orderIndex: 3,
        estimatedDuration: 8,
        isLocked: false,
        prerequisites: []
      },
      {
        title: "Hooks de React",
        description: "Usar hooks para manejar estado y efectos secundarios en componentes funcionales",
        orderIndex: 4,
        estimatedDuration: 10,
        isLocked: false,
        prerequisites: []
      },
      {
        title: "Routing y Navegación",
        description: "Implementar navegación entre páginas usando React Router",
        orderIndex: 5,
        estimatedDuration: 6,
        isLocked: false,
        prerequisites: []
      },
      {
        title: "Proyecto Final",
        description: "Aplicar todos los conocimientos en un proyecto real",
        orderIndex: 6,
        estimatedDuration: 12,
        isLocked: false,
        prerequisites: []
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

    // 4. Crear lecciones para cada módulo
    const lessonsData = [
      // Módulo 1: Fundamentos de React
      {
        moduleIndex: 0,
        lessons: [
          {
            title: "¿Qué es React?",
            description: "Introducción al framework React y sus ventajas",
            content: "React es una biblioteca de JavaScript desarrollada por Facebook para crear interfaces de usuario interactivas. En esta lección aprenderás qué es React, por qué es tan popular y cuáles son sus principales características.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/react-intro.mp4",
            duration: 15,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Configuración del Entorno",
            description: "Instalar y configurar React en tu máquina",
            content: "Aprende a configurar tu entorno de desarrollo para React. Instalaremos Node.js, npm, y crearemos tu primera aplicación React usando Create React App.",
            contentType: "TEXT",
            duration: 20,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "JSX: JavaScript XML",
            description: "Entender JSX y cómo escribir componentes",
            content: "JSX es una extensión de sintaxis para JavaScript que te permite escribir HTML dentro de JavaScript. Es fundamental para React y aprenderás a usarlo correctamente.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/jsx-basics.mp4",
            duration: 18,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Tu Primer Componente",
            description: "Crear tu primer componente React",
            content: "Crea tu primer componente React desde cero. Aprenderás la estructura básica de un componente y cómo renderizarlo en la aplicación.",
            contentType: "EXERCISE",
            duration: 25,
            orderIndex: 4,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 2: Componentes y Props
      {
        moduleIndex: 1,
        lessons: [
          {
            title: "Componentes Funcionales",
            description: "Crear componentes usando funciones",
            content: "Los componentes funcionales son la forma moderna de crear componentes en React. Aprende a crear componentes simples y reutilizables.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/functional-components.mp4",
            duration: 12,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Props: Pasando Datos",
            description: "Pasar datos entre componentes usando props",
            content: "Props son la forma de pasar datos de un componente padre a un componente hijo. Aprende a usar props efectivamente.",
            contentType: "TEXT",
            duration: 15,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Composición de Componentes",
            description: "Combinar componentes para crear interfaces complejas",
            content: "Aprende a combinar múltiples componentes para crear interfaces más complejas y reutilizables.",
            contentType: "EXERCISE",
            duration: 30,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 3: Estado y Ciclo de Vida
      {
        moduleIndex: 2,
        lessons: [
          {
            title: "Estado en React",
            description: "Entender el concepto de estado en React",
            content: "El estado es la información que puede cambiar en un componente. Aprende a manejar el estado local de tus componentes.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/state-basics.mp4",
            duration: 20,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "useState Hook",
            description: "Usar el hook useState para manejar estado",
            content: "useState es el hook más importante para manejar estado en componentes funcionales. Aprende a usarlo correctamente.",
            contentType: "TEXT",
            duration: 18,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Actualizando Estado",
            description: "Actualizar estado de forma segura y eficiente",
            content: "Aprende las mejores prácticas para actualizar el estado en React y evitar errores comunes.",
            contentType: "EXERCISE",
            duration: 25,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 4: Hooks de React
      {
        moduleIndex: 3,
        lessons: [
          {
            title: "Introducción a Hooks",
            description: "¿Qué son los hooks y por qué los necesitamos?",
            content: "Los hooks son funciones que te permiten usar estado y otras características de React en componentes funcionales.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/hooks-intro.mp4",
            duration: 15,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "useEffect Hook",
            description: "Manejar efectos secundarios con useEffect",
            content: "useEffect te permite ejecutar código cuando el componente se monta, actualiza o desmonta.",
            contentType: "TEXT",
            duration: 20,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Hooks Personalizados",
            description: "Crear tus propios hooks reutilizables",
            content: "Aprende a crear hooks personalizados para reutilizar lógica entre componentes.",
            contentType: "EXERCISE",
            duration: 35,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 5: Routing y Navegación
      {
        moduleIndex: 4,
        lessons: [
          {
            title: "React Router",
            description: "Configurar React Router para navegación",
            content: "React Router es la biblioteca estándar para manejar navegación en aplicaciones React.",
            contentType: "VIDEO",
            videoUrl: "https://example.com/videos/react-router.mp4",
            duration: 18,
            orderIndex: 1,
            isRequired: true,
            isPreview: true
          },
          {
            title: "Rutas y Navegación",
            description: "Crear rutas y navegar entre páginas",
            content: "Aprende a crear rutas y navegar entre diferentes páginas de tu aplicación.",
            contentType: "TEXT",
            duration: 20,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          }
        ]
      },
      // Módulo 6: Proyecto Final
      {
        moduleIndex: 5,
        lessons: [
          {
            title: "Planificación del Proyecto",
            description: "Planificar y estructurar tu aplicación final",
            content: "Planifica tu aplicación final, define las funcionalidades y estructura el código.",
            contentType: "TEXT",
            duration: 30,
            orderIndex: 1,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Implementación",
            description: "Implementar todas las funcionalidades",
            content: "Implementa todas las funcionalidades de tu aplicación usando los conocimientos adquiridos.",
            contentType: "EXERCISE",
            duration: 120,
            orderIndex: 2,
            isRequired: true,
            isPreview: false
          },
          {
            title: "Despliegue",
            description: "Desplegar tu aplicación en producción",
            content: "Aprende a desplegar tu aplicación React en servicios como Netlify, Vercel o GitHub Pages.",
            contentType: "TEXT",
            duration: 25,
            orderIndex: 3,
            isRequired: true,
            isPreview: false
          }
        ]
      }
    ];

    // Crear lecciones
    for (const moduleData of lessonsData) {
      const module = createdModules[moduleData.moduleIndex];
      for (const lessonData of moduleData.lessons) {
        const lesson = await prisma.lesson.create({
          data: {
            ...lessonData,
            moduleId: module.id
          }
        });
        console.log(`✅ Lección creada: ${lesson.title} (Módulo: ${module.title})`);
      }
    }

    // 5. Crear quizzes
    const quizzes = [
      {
        title: "Quiz: Fundamentos de React",
        description: "Evalúa tu conocimiento de los conceptos básicos de React",
        timeLimit: 1800, // 30 minutos
        passingScore: 70,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      },
      {
        title: "Quiz: Componentes y Props",
        description: "Evalúa tu comprensión de componentes y props",
        timeLimit: 1200, // 20 minutos
        passingScore: 75,
        showCorrectAnswers: true,
        isActive: true,
        courseId: course.id
      },
      {
        title: "Quiz: Hooks de React",
        description: "Evalúa tu conocimiento de hooks",
        timeLimit: 1500, // 25 minutos
        passingScore: 80,
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

    // 6. Crear preguntas para los quizzes
    const quizQuestions = [
      // Quiz 1: Fundamentos de React
      {
        quizIndex: 0,
        questions: [
          {
            question: "¿Qué es React?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Un lenguaje de programación",
              "Una biblioteca de JavaScript para crear interfaces de usuario",
              "Un framework de CSS",
              "Una base de datos"
            ],
            correctAnswer: "Una biblioteca de JavaScript para crear interfaces de usuario",
            explanation: "React es una biblioteca de JavaScript desarrollada por Facebook para crear interfaces de usuario interactivas.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Qué significa JSX?",
            type: "MULTIPLE_CHOICE",
            options: [
              "JavaScript XML",
              "JavaScript Extension",
              "Java Syntax XML",
              "JavaScript Syntax"
            ],
            correctAnswer: "JavaScript XML",
            explanation: "JSX es una extensión de sintaxis para JavaScript que permite escribir HTML en JavaScript.",
            points: 10,
            orderIndex: 2
          },
          {
            question: "¿Cuál es la función principal de React?",
            type: "SHORT_ANSWER",
            correctAnswer: "Crear interfaces de usuario interactivas",
            explanation: "React se enfoca en crear interfaces de usuario interactivas y eficientes.",
            points: 15,
            orderIndex: 3
          }
        ]
      },
      // Quiz 2: Componentes y Props
      {
        quizIndex: 1,
        questions: [
          {
            question: "¿Qué son los props en React?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Propiedades CSS",
              "Datos que se pasan de un componente padre a un hijo",
              "Funciones de JavaScript",
              "Variables globales"
            ],
            correctAnswer: "Datos que se pasan de un componente padre a un hijo",
            explanation: "Props son propiedades que permiten pasar datos de un componente padre a un componente hijo.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Los props son mutables?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Sí, siempre",
              "No, son inmutables",
              "Depende del tipo de dato",
              "Solo en componentes de clase"
            ],
            correctAnswer: "No, son inmutables",
            explanation: "Los props son inmutables y no deben ser modificados por el componente hijo.",
            points: 10,
            orderIndex: 2
          }
        ]
      },
      // Quiz 3: Hooks de React
      {
        quizIndex: 2,
        questions: [
          {
            question: "¿Cuál es el hook más común para manejar estado?",
            type: "MULTIPLE_CHOICE",
            options: [
              "useEffect",
              "useState",
              "useContext",
              "useReducer"
            ],
            correctAnswer: "useState",
            explanation: "useState es el hook más común y fundamental para manejar estado en componentes funcionales.",
            points: 10,
            orderIndex: 1
          },
          {
            question: "¿Para qué se usa useEffect?",
            type: "SHORT_ANSWER",
            correctAnswer: "Para manejar efectos secundarios",
            explanation: "useEffect se usa para manejar efectos secundarios como llamadas a APIs, suscripciones, etc.",
            points: 15,
            orderIndex: 2
          }
        ]
      }
    ];

    // Crear preguntas
    for (const quizData of quizQuestions) {
      const quiz = createdQuizzes[quizData.quizIndex];
      for (const questionData of quizData.questions) {
        const question = await prisma.quizQuestion.create({
          data: {
            ...questionData,
            quizId: quiz.id
          }
        });
        console.log(`✅ Pregunta creada: ${question.question.substring(0, 30)}...`);
      }
    }

    // 7. Actualizar estadísticas del curso
    const totalLessons = await prisma.lesson.count({
      where: { module: { courseId: course.id } }
    });

    const totalQuizzes = createdQuizzes.length;

    await prisma.course.update({
      where: { id: course.id },
      data: {
        totalLessons,
        totalQuizzes
      }
    });

    console.log('\n🎉 ¡Curso completo creado exitosamente!');
    console.log(`📊 Estadísticas:`);
    console.log(`   - Módulos: ${createdModules.length}`);
    console.log(`   - Lecciones: ${totalLessons}`);
    console.log(`   - Quizzes: ${totalQuizzes}`);
    console.log(`\n🔗 URL para acceder al curso:`);
    console.log(`   GET http://localhost:3001/api/course/${course.id}`);

  } catch (error) {
    console.error('❌ Error creando curso:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCompleteCourse();
