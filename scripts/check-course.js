const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourse() {
  try {
    console.log('🔍 Verificando curso en la base de datos...\n');

    const courseId = 'cme8k0818000913qzgablcors';

    // Verificar si el curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true
          }
        },
        enrollments: true
      }
    });

    if (course) {
      console.log('✅ Curso encontrado:');
      console.log(`   ID: ${course.id}`);
      console.log(`   Título: ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   Estado: ${course.isActive ? 'Activo' : 'Inactivo'}`);
      console.log(`   Módulos: ${course.modules.length}`);
      console.log(`   Inscripciones: ${course.enrollments.length}`);
      
      if (course.modules.length > 0) {
        console.log('\n📚 Módulos:');
        course.modules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.title} (${module.lessons.length} lecciones)`);
        });
      }
    } else {
      console.log('❌ Curso no encontrado');
      
      // Listar algunos cursos disponibles
      console.log('\n📋 Cursos disponibles:');
      const courses = await prisma.course.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          isActive: true
        }
      });
      
      courses.forEach((c, index) => {
        console.log(`   ${index + 1}. ${c.title} (ID: ${c.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error verificando curso:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourse();
