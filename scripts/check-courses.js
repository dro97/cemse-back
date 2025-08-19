const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourses() {
  try {
    console.log('🔍 Verificando cursos en la base de datos...\n');

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isActive: true,
        instructorId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📚 Total de cursos encontrados: ${courses.length}\n`);

    if (courses.length > 0) {
      console.log('📋 Lista de cursos:');
      courses.forEach((course, index) => {
        console.log(`   ${index + 1}. ID: ${course.id}`);
        console.log(`      Título: ${course.title}`);
        console.log(`      Slug: ${course.slug}`);
        console.log(`      Activo: ${course.isActive ? 'Sí' : 'No'}`);
        console.log(`      Instructor ID: ${course.instructorId || 'Sin instructor'}`);
        console.log(`      Creado: ${course.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron cursos en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error verificando cursos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourses();
