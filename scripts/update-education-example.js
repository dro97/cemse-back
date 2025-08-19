const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEducationExample() {
  try {
    // Buscar el usuario joven
    const user = await prisma.user.findUnique({
      where: { username: 'joven_test' }
    });

    if (!user) {
      console.log('Usuario joven_test no encontrado');
      return;
    }

    // Datos de ejemplo para educación detallada
    const educationData = {
      educationLevel: "UNIVERSITY",
      currentInstitution: "Universidad Mayor de San Simón",
      graduationYear: 2025,
      isStudying: true,
      educationHistory: [
        {
          institution: "Colegio San Agustín",
          degree: "Bachiller en Humanidades",
          startDate: "2015-02-01",
          endDate: "2020-11-30",
          status: "graduado",
          gpa: 85.5,
          achievements: ["Primer lugar en Olimpiadas de Matemáticas", "Presidente del Consejo Estudiantil"]
        },
        {
          institution: "Universidad Mayor de San Simón",
          degree: "Ingeniería en Sistemas",
          startDate: "2021-02-01",
          endDate: null,
          status: "en_curso",
          gpa: 78.2,
          achievements: ["Beca de Excelencia Académica", "Participante en Hackathon Universitario"]
        }
      ],
      currentDegree: "Ingeniería en Sistemas",
      universityName: "Universidad Mayor de San Simón",
      universityStartDate: new Date("2021-02-01"),
      universityEndDate: null,
      universityStatus: "en_curso",
      gpa: 78.2,
      academicAchievements: [
        {
          title: "Beca de Excelencia Académica",
          date: "2022",
          description: "Beca otorgada por mantener un promedio superior a 75 puntos"
        },
        {
          title: "Participante en Hackathon Universitario",
          date: "2023",
          description: "Desarrollé una aplicación móvil para gestión de biblioteca"
        },
        {
          title: "Mentor en Programación",
          date: "2023",
          description: "Ayudé a estudiantes de primer año en programación básica"
        }
      ]
    };

    // Actualizar el perfil con los datos de educación
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        educationLevel: educationData.educationLevel,
        currentInstitution: educationData.currentInstitution,
        graduationYear: educationData.graduationYear,
        isStudying: educationData.isStudying,
        educationHistory: educationData.educationHistory,
        currentDegree: educationData.currentDegree,
        universityName: educationData.universityName,
        universityStartDate: educationData.universityStartDate,
        universityEndDate: educationData.universityEndDate,
        universityStatus: educationData.universityStatus,
        gpa: educationData.gpa,
        academicAchievements: educationData.academicAchievements
      }
    });

    console.log('✅ Educación detallada actualizada exitosamente');
    console.log('📚 Datos agregados:');
    console.log(`   - Nivel: ${educationData.educationLevel}`);
    console.log(`   - Institución actual: ${educationData.currentInstitution}`);
    console.log(`   - Grado actual: ${educationData.currentDegree}`);
    console.log(`   - Universidad: ${educationData.universityName}`);
    console.log(`   - Estado: ${educationData.universityStatus}`);
    console.log(`   - GPA: ${educationData.gpa}`);
    console.log(`   - Historial educativo: ${educationData.educationHistory.length} instituciones`);
    console.log(`   - Logros académicos: ${educationData.academicAchievements.length} logros`);

  } catch (error) {
    console.error('❌ Error actualizando educación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEducationExample();
