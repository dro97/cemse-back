const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCoverLetterExample() {
  try {
    // Buscar el usuario joven
    const user = await prisma.user.findUnique({
      where: { username: 'joven_test' }
    });

    if (!user) {
      console.log('Usuario joven_test no encontrado');
      return;
    }

    // Datos de ejemplo para la carta de presentación
    const coverLetterData = {
      recipient: {
        department: "Recursos Humanos",
        companyName: "TechCorp Bolivia",
        address: "Av. Principal 123, Zona Centro",
        city: "Cochabamba",
        country: "Bolivia"
      },
      subject: "Postulación para Desarrollador Frontend Junior",
      content: `Estimado equipo de Recursos Humanos,

Me dirijo a ustedes con gran interés para postularme a la posición de Desarrollador Frontend Junior que han publicado en su empresa.

Como joven profesional apasionado por la tecnología, he desarrollado habilidades sólidas en JavaScript, React, HTML y CSS a través de proyectos personales y actividades extracurriculares. Mi formación en desarrollo web me ha preparado para enfrentar los desafíos que presenta esta posición.

Durante mi tiempo como voluntario en organizaciones tecnológicas, he demostrado mi capacidad para trabajar en equipo, aprender rápidamente nuevas tecnologías y contribuir de manera efectiva a proyectos de desarrollo web.

Estoy comprometido con mi desarrollo profesional y creo que esta oportunidad en TechCorp Bolivia me permitiría crecer y contribuir significativamente a su organización, aplicando mis conocimientos técnicos y mi pasión por crear experiencias de usuario excepcionales.

Agradezco su consideración y quedo atento a sus comentarios.

Saludos cordiales,
Juan Pérez`,
      template: "professional"
    };

    // Actualizar el perfil con los datos de la carta de presentación
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        coverLetterRecipient: coverLetterData.recipient,
        coverLetterSubject: coverLetterData.subject,
        coverLetterContent: coverLetterData.content,
        coverLetterTemplate: coverLetterData.template
      }
    });

    console.log('✅ Carta de presentación actualizada exitosamente');
    console.log('📋 Datos agregados:');
    console.log(`   - Destinatario: ${coverLetterData.recipient.department} - ${coverLetterData.recipient.companyName}`);
    console.log(`   - Asunto: ${coverLetterData.subject}`);
    console.log(`   - Template: ${coverLetterData.template}`);
    console.log(`   - Contenido: ${coverLetterData.content.length} caracteres`);

  } catch (error) {
    console.error('❌ Error actualizando carta de presentación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCoverLetterExample();
