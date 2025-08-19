const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugJobOfferApplications() {
  try {
    console.log('🔍 === DIAGNÓSTICO DE JOB OFFER APPLICATIONS ===\n');

    // 1. Verificar todos los JobOffers
    console.log('📋 1. JobOffers en la base de datos:');
    const jobOffers = await prisma.jobOffer.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    jobOffers.forEach((jobOffer, index) => {
      console.log(`\n   JobOffer ${index + 1}:`);
      console.log(`   - ID: ${jobOffer.id}`);
      console.log(`   - Título: ${jobOffer.title}`);
      console.log(`   - Empresa: ${jobOffer.company.name} (${jobOffer.company.id})`);
      console.log(`   - Aplicaciones: ${jobOffer.applications.length}`);
      
      if (jobOffer.applications.length > 0) {
        jobOffer.applications.forEach((app, appIndex) => {
          console.log(`     Aplicación ${appIndex + 1}:`);
          console.log(`       - ID: ${app.id}`);
          console.log(`       - Solicitante: ${app.applicant.firstName} ${app.applicant.lastName} (${app.applicant.id})`);
          console.log(`       - Email: ${app.applicant.email}`);
          console.log(`       - Estado: ${app.status}`);
          console.log(`       - Fecha: ${app.appliedAt}`);
        });
      }
    });

    // 2. Verificar todos los JobApplications
    console.log('\n📋 2. Todas las JobApplications:');
    const applications = await prisma.jobApplication.findMany({
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    applications.forEach((app, index) => {
      console.log(`\n   Aplicación ${index + 1}:`);
      console.log(`   - ID: ${app.id}`);
      console.log(`   - Solicitante: ${app.applicant.firstName} ${app.applicant.lastName} (${app.applicant.id})`);
      console.log(`   - Email: ${app.applicant.email}`);
      console.log(`   - JobOffer: ${app.jobOffer.title} (${app.jobOffer.id})`);
      console.log(`   - Empresa: ${app.jobOffer.company.name} (${app.jobOffer.company.id})`);
      console.log(`   - Estado: ${app.status}`);
      console.log(`   - Fecha: ${app.appliedAt}`);
    });

    // 3. Verificar todos los Profiles (usuarios)
    console.log('\n📋 3. Todos los Profiles (usuarios):');
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    profiles.forEach((profile, index) => {
      console.log(`\n   Profile ${index + 1}:`);
      console.log(`   - ID: ${profile.id}`);
      console.log(`   - UserID: ${profile.userId}`);
      console.log(`   - Nombre: ${profile.firstName} ${profile.lastName}`);
      console.log(`   - Email: ${profile.email}`);
      console.log(`   - Rol: ${profile.role}`);
    });

    // 4. Verificar relaciones específicas
    console.log('\n📋 4. Verificando relaciones específicas:');
    
    // Buscar aplicaciones por JobOffer específico
    if (jobOffers.length > 0) {
      const firstJobOffer = jobOffers[0];
      console.log(`\n   Aplicaciones para JobOffer "${firstJobOffer.title}":`);
      
      const jobOfferApplications = await prisma.jobApplication.findMany({
        where: {
          jobOfferId: firstJobOffer.id
        },
        include: {
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      console.log(`   Total aplicaciones: ${jobOfferApplications.length}`);
      jobOfferApplications.forEach((app, index) => {
        console.log(`     ${index + 1}. ${app.applicant.firstName} ${app.applicant.lastName} (${app.applicant.id})`);
      });
    }

    console.log('\n✅ === DIAGNÓSTICO COMPLETADO ===');

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el diagnóstico
debugJobOfferApplications();
