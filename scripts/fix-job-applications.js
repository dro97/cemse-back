const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixJobApplications() {
  try {
    console.log('🔧 === LIMPIEZA Y VERIFICACIÓN DE JOB APPLICATIONS ===\n');

    // 1. Verificar el estado actual
    console.log('📋 1. Estado actual de la base de datos:');
    
    const jobOffers = await prisma.jobOffer.findMany({
      select: {
        id: true,
        title: true,
        applicationsCount: true
      }
    });

    const applications = await prisma.jobApplication.findMany({
      select: {
        id: true,
        applicantId: true,
        jobOfferId: true,
        status: true,
        appliedAt: true
      }
    });

    console.log(`   JobOffers: ${jobOffers.length}`);
    console.log(`   Aplicaciones: ${applications.length}`);

    // 2. Verificar aplicaciones con jobOfferId inválido
    console.log('\n📋 2. Verificando aplicaciones con jobOfferId inválido:');
    
    const validJobOfferIds = jobOffers.map(jo => jo.id);
    const invalidApplications = applications.filter(app => !validJobOfferIds.includes(app.jobOfferId));
    
    if (invalidApplications.length > 0) {
      console.log(`   ⚠️  Encontradas ${invalidApplications.length} aplicaciones con jobOfferId inválido:`);
      invalidApplications.forEach(app => {
        console.log(`     - Aplicación ${app.id}: jobOfferId ${app.jobOfferId} no existe`);
      });
      
      // Eliminar aplicaciones inválidas
      console.log('   🗑️  Eliminando aplicaciones inválidas...');
      for (const app of invalidApplications) {
        await prisma.jobApplication.delete({
          where: { id: app.id }
        });
        console.log(`     - Eliminada aplicación ${app.id}`);
      }
    } else {
      console.log('   ✅ No hay aplicaciones con jobOfferId inválido');
    }

    // 3. Verificar aplicaciones duplicadas
    console.log('\n📋 3. Verificando aplicaciones duplicadas:');
    
    const duplicateGroups = new Map();
    
    applications.forEach(app => {
      const key = `${app.applicantId}-${app.jobOfferId}`;
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key).push(app);
    });

    let duplicatesFound = 0;
    for (const [key, apps] of duplicateGroups) {
      if (apps.length > 1) {
        console.log(`   ⚠️  Duplicados para ${key}: ${apps.length} aplicaciones`);
        duplicatesFound += apps.length - 1;
        
        // Mantener solo la aplicación más reciente
        apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        const toDelete = apps.slice(1);
        
        for (const app of toDelete) {
          await prisma.jobApplication.delete({
            where: { id: app.id }
          });
          console.log(`     - Eliminada aplicación duplicada ${app.id}`);
        }
      }
    }

    if (duplicatesFound === 0) {
      console.log('   ✅ No hay aplicaciones duplicadas');
    }

    // 4. Recalcular applicationsCount
    console.log('\n📋 4. Recalculando applicationsCount:');
    
    for (const jobOffer of jobOffers) {
      const actualCount = await prisma.jobApplication.count({
        where: { jobOfferId: jobOffer.id }
      });
      
      if (actualCount !== jobOffer.applicationsCount) {
        console.log(`   🔄 JobOffer ${jobOffer.title}: ${jobOffer.applicationsCount} → ${actualCount}`);
        
        await prisma.jobOffer.update({
          where: { id: jobOffer.id },
          data: { applicationsCount: actualCount }
        });
      }
    }

    // 5. Verificar estado final
    console.log('\n📋 5. Estado final después de la limpieza:');
    
    const finalJobOffers = await prisma.jobOffer.findMany({
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

    finalJobOffers.forEach(jobOffer => {
      console.log(`\n   JobOffer: ${jobOffer.title} (${jobOffer.id})`);
      console.log(`   - Aplicaciones en BD: ${jobOffer.applicationsCount}`);
      console.log(`   - Aplicaciones reales: ${jobOffer.applications.length}`);
      
      if (jobOffer.applications.length > 0) {
        jobOffer.applications.forEach((app, index) => {
          console.log(`     ${index + 1}. ${app.applicant.firstName} ${app.applicant.lastName} (${app.applicant.id})`);
        });
      }
    });

    console.log('\n✅ === LIMPIEZA COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error en la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la limpieza
fixJobApplications();
