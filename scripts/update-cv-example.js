const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCVExample() {
  try {
    // Buscar el usuario joven
    const user = await prisma.user.findUnique({
      where: { username: 'joven_test' }
    });

    if (!user) {
      console.log('Usuario joven_test no encontrado');
      return;
    }

    // Datos de ejemplo para el CV Builder
    const cvData = {
      jobTitle: "Desarrollador Frontend Junior",
      addressLine: "Calle Principal 123, Zona Centro",
      cityState: "Cochabamba, Cochabamba",
      languages: [
        { language: "Español", level: "Nativo" },
        { language: "Inglés", level: "Intermedio" },
        { language: "Portugués", level: "Básico" }
      ],
      websites: [
        { type: "linkedin", url: "https://linkedin.com/in/juanperez", label: "LinkedIn" },
        { type: "github", url: "https://github.com/juanperez", label: "GitHub" },
        { type: "portfolio", url: "https://juanperez.dev", label: "Portfolio" }
      ],
      skillsWithLevel: [
        { skill: "JavaScript", level: "Intermedio", years: 2 },
        { skill: "React", level: "Intermedio", years: 1.5 },
        { skill: "HTML/CSS", level: "Avanzado", years: 3 },
        { skill: "Node.js", level: "Básico", years: 1 },
        { skill: "Git", level: "Intermedio", years: 2 }
      ],
      extracurricularActivities: [
        {
          title: "Voluntario en ONG Tech",
          organization: "Fundación Tecnológica",
          period: "2023 - Presente",
          description: "Enseño programación básica a jóvenes de bajos recursos"
        },
        {
          title: "Organizador de Meetup",
          organization: "JavaScript Bolivia",
          period: "2023 - Presente", 
          description: "Organizo eventos mensuales sobre desarrollo web"
        },
        {
          title: "Mentor de Programación",
          organization: "Code Club Bolivia",
          period: "2022 - 2023",
          description: "Mentoreo a estudiantes de secundaria en programación"
        }
      ],
      projects: [
        {
          title: "E-commerce Platform",
          description: "Plataforma de comercio electrónico desarrollada con React y Node.js",
          technologies: ["React", "Node.js", "MongoDB", "Stripe"],
          url: "https://github.com/juanperez/ecommerce",
          period: "2023",
          highlights: [
            "Implementé sistema de pagos con Stripe",
            "Desarrollé panel de administración completo",
            "Optimicé rendimiento con lazy loading"
          ]
        },
        {
          title: "Task Management App",
          description: "Aplicación web para gestión de tareas con drag & drop",
          technologies: ["React", "TypeScript", "Firebase"],
          url: "https://github.com/juanperez/taskapp",
          period: "2023",
          highlights: [
            "Interfaz drag & drop intuitiva",
            "Sincronización en tiempo real",
            "Sistema de notificaciones"
          ]
        },
        {
          title: "Weather Dashboard",
          description: "Dashboard meteorológico con gráficos interactivos",
          technologies: ["React", "Chart.js", "OpenWeather API"],
          url: "https://github.com/juanperez/weather-dashboard",
          period: "2022",
          highlights: [
            "Gráficos interactivos con Chart.js",
            "API de OpenWeather integrada",
            "Diseño responsive"
          ]
        }
      ],
      achievements: [
        {
          title: "Primer lugar en Hackathon 2023",
          date: "2023",
          description: "Gané el primer lugar en el hackathon de desarrollo web organizado por la universidad"
        },
        {
          title: "Certificación en React",
          date: "2023",
          description: "Completé exitosamente el curso de React en Meta"
        },
        {
          title: "Beca de Desarrollo Web",
          date: "2022",
          description: "Obtuve una beca completa para el bootcamp de desarrollo web"
        }
      ]
    };

    // Actualizar el perfil con todos los datos del CV
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        jobTitle: cvData.jobTitle,
        addressLine: cvData.addressLine,
        cityState: cvData.cityState,
        languages: cvData.languages,
        websites: cvData.websites,
        skillsWithLevel: cvData.skillsWithLevel,
        extracurricularActivities: cvData.extracurricularActivities,
        projects: cvData.projects,
        achievements: cvData.achievements
      }
    });

    console.log('✅ CV actualizado exitosamente con todos los campos del CV Builder');
    console.log('📋 Datos agregados:');
    console.log(`   - Job Title: ${cvData.jobTitle}`);
    console.log(`   - Languages: ${cvData.languages.length} idiomas`);
    console.log(`   - Websites: ${cvData.websites.length} enlaces`);
    console.log(`   - Skills with Level: ${cvData.skillsWithLevel.length} habilidades`);
    console.log(`   - Extracurricular Activities: ${cvData.extracurricularActivities.length} actividades`);
    console.log(`   - Projects: ${cvData.projects.length} proyectos`);
    console.log(`   - Achievements: ${cvData.achievements.length} logros`);

  } catch (error) {
    console.error('❌ Error actualizando CV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCVExample();
