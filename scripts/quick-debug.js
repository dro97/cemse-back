const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickDebug() {
  try {
    console.log('🔍 === DIAGNÓSTICO RÁPIDO ===\n');

    // 1. Obtener todos los JobOffers
    const jobOffers = await prisma.jobOffer.findMany({
      select: {
        id: true,
        title: true,
        applicationsCount: true
      }
    });

    console.log('📋 JobOffers:');
    jobOffers.forEach((jo, i) => {
      console.log(`   ${i + 1}. ${jo.title} (${jo.id}) - Count: ${jo.applicationsCount}`);
    });

    // 2. Obtener todas las aplicaciones
    const applications = await prisma.jobApplication.findMany({
      select: {
        id: true,
        applicantId: true,
        jobOfferId: true,
        status: true
      }
    });

    console.log('\n📋 Aplicaciones:');
    applications.forEach((app, i) => {
      console.log(`   ${i + 1}. App ${app.id} - JobOffer: ${app.jobOfferId} - Applicant: ${app.applicantId} - Status: ${app.status}`);
    });

    // 3. Verificar cada JobOffer individualmente
    console.log('\n📋 Verificación individual:');
    
    for (const jobOffer of jobOffers) {
      const apps = await prisma.jobApplication.findMany({
        where: { jobOfferId: jobOffer.id },
        select: {
          id: true,
          applicantId: true,
          status: true
        }
      });
      
      console.log(`\n   ${jobOffer.title} (${jobOffer.id}):`);
      console.log(`   - Count en BD: ${jobOffer.applicationsCount}`);
      console.log(`   - Apps reales: ${apps.length}`);
      
      if (apps.length > 0) {
        apps.forEach((app, i) => {
          console.log(`     ${i + 1}. App ${app.id} - Applicant: ${app.applicantId}`);
        });
      }
    }

    // 4. Probar la consulta que hace el frontend
    console.log('\n📋 Probando consulta del frontend:');
    
    if (jobOffers.length > 0) {
      const testJobOffer = jobOffers[0];
      console.log(`\n   Probando con: ${testJobOffer.title}`);
      
      const result = await prisma.jobOffer.findUnique({
        where: { id: testJobOffer.id },
        include: {
          applications: {
            include: {
              applicant: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });
      
      console.log(`   Aplicaciones retornadas: ${result.applications.length}`);
      result.applications.forEach((app, i) => {
        console.log(`     ${i + 1}. ${app.applicant.firstName} ${app.applicant.lastName} (${app.applicant.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickDebug();
