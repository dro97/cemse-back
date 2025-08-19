const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSpecificJobOffer() {
  try {
    console.log('🔍 === DIAGNÓSTICO ESPECÍFICO DE JOB OFFER ===\n');

    // 1. Obtener todos los JobOffers
    console.log('📋 1. Listando todos los JobOffers:');
    const allJobOffers = await prisma.jobOffer.findMany({
      select: {
        id: true,
        title: true,
        companyId: true,
        applicationsCount: true
      }
    });

    allJobOffers.forEach((jobOffer, index) => {
      console.log(`   ${index + 1}. ${jobOffer.title} (ID: ${jobOffer.id}) - Aplicaciones: ${jobOffer.applicationsCount}`);
    });

    // 2. Obtener todas las aplicaciones
    console.log('\n📋 2. Listando todas las aplicaciones:');
    const allApplications = await prisma.jobApplication.findMany({
      select: {
        id: true,
        applicantId: true,
        jobOfferId: true,
        status: true,
        appliedAt: true
      }
    });

    allApplications.forEach((app, index) => {
      console.log(`   ${index + 1}. Aplicación ${app.id} - JobOffer: ${app.jobOfferId} - Solicitante: ${app.applicantId} - Estado: ${app.status}`);
    });

    // 3. Verificar cada JobOffer individualmente
    console.log('\n📋 3. Verificando cada JobOffer individualmente:');
    
    for (const jobOffer of allJobOffers) {
      console.log(`\n   🔍 JobOffer: ${jobOffer.title} (${jobOffer.id})`);
      
      // Obtener aplicaciones para este JobOffer específico
      const applications = await prisma.jobApplication.findMany({
        where: {
          jobOfferId: jobOffer.id
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

      console.log(`   📊 Total aplicaciones encontradas: ${applications.length}`);
      
      if (applications.length > 0) {
        applications.forEach((app, index) => {
          console.log(`     ${index + 1}. ${app.applicant.firstName} ${app.applicant.lastName} (${app.applicant.id}) - ${app.status}`);
        });
      } else {
        console.log('     ❌ No hay aplicaciones para este JobOffer');
      }
    }

    // 4. Verificar si hay aplicaciones con jobOfferId incorrecto
    console.log('\n📋 4. Verificando aplicaciones con jobOfferId incorrecto:');
    
    const jobOfferIds = allJobOffers.map(jo => jo.id);
    const applicationsWithInvalidJobOffer = allApplications.filter(app => !jobOfferIds.includes(app.jobOfferId));
    
    if (applicationsWithInvalidJobOffer.length > 0) {
      console.log('   ⚠️  Aplicaciones con jobOfferId inválido:');
      applicationsWithInvalidJobOffer.forEach(app => {
        console.log(`     - Aplicación ${app.id} tiene jobOfferId ${app.jobOfferId} que no existe`);
      });
    } else {
      console.log('   ✅ Todas las aplicaciones tienen jobOfferId válido');
    }

    // 5. Verificar si hay aplicaciones duplicadas
    console.log('\n📋 5. Verificando aplicaciones duplicadas:');
    
    const duplicateApplications = [];
    const seen = new Set();
    
    allApplications.forEach(app => {
      const key = `${app.applicantId}-${app.jobOfferId}`;
      if (seen.has(key)) {
        duplicateApplications.push(app);
      } else {
        seen.add(key);
      }
    });

    if (duplicateApplications.length > 0) {
      console.log('   ⚠️  Aplicaciones duplicadas encontradas:');
      duplicateApplications.forEach(app => {
        console.log(`     - Solicitante ${app.applicantId} aplicó múltiples veces a JobOffer ${app.jobOfferId}`);
      });
    } else {
      console.log('   ✅ No hay aplicaciones duplicadas');
    }

    // 6. Simular la consulta que hace el frontend
    console.log('\n📋 6. Simulando consulta del frontend (getJobOffer):');
    
    if (allJobOffers.length > 0) {
      const testJobOffer = allJobOffers[0];
      console.log(`\n   🔍 Probando con JobOffer: ${testJobOffer.title} (${testJobOffer.id})`);
      
      const jobOfferWithApplications = await prisma.jobOffer.findUnique({
        where: { id: testJobOffer.id },
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
            },
            orderBy: {
              appliedAt: 'desc'
            }
          }
        }
      });

      console.log(`   📊 Aplicaciones retornadas por la consulta: ${jobOfferWithApplications.applications.length}`);
      
      if (jobOfferWithApplications.applications.length > 0) {
        jobOfferWithApplications.applications.forEach((app, index) => {
          console.log(`     ${index + 1}. ${app.applicant.firstName} ${app.applicant.lastName} (${app.applicant.id})`);
        });
      }
    }

    console.log('\n✅ === DIAGNÓSTICO COMPLETADO ===');

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el diagnóstico
debugSpecificJobOffer();
