const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicatePlans() {
  console.log('🧹 Limpiando planes de negocio duplicados...\n');

  try {
    // Get all users with business plans
    const usersWithPlans = await prisma.businessPlan.findMany({
      include: {
        entrepreneurship: {
          include: {
            owner: {
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

    // Group by user
    const userGroups = {};
    usersWithPlans.forEach(plan => {
      const userId = plan.entrepreneurship.owner.id;
      if (!userGroups[userId]) {
        userGroups[userId] = {
          user: plan.entrepreneurship.owner,
          plans: []
        };
      }
      userGroups[userId].plans.push(plan);
    });

    console.log(`📊 Encontrados ${Object.keys(userGroups).length} usuarios con planes de negocio\n`);

    let totalDeleted = 0;

    for (const [userId, userData] of Object.entries(userGroups)) {
      const { user, plans } = userData;
      
      if (plans.length > 1) {
        const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
        console.log(`👤 Usuario: ${userName} (${user.id})`);
        console.log(`   📋 Tiene ${plans.length} planes de negocio`);
        
        // Sort by creation date (keep the oldest one)
        plans.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        const planToKeep = plans[0];
        const plansToDelete = plans.slice(1);
        
        console.log(`   ✅ Manteniendo: ${planToKeep.id} (creado: ${planToKeep.createdAt})`);
        console.log(`   🗑️  Eliminando: ${plansToDelete.length} planes duplicados`);
        
        // Delete duplicate plans
        for (const plan of plansToDelete) {
          await prisma.businessPlan.delete({
            where: { id: plan.id }
          });
          totalDeleted++;
        }
        
        // Delete duplicate entrepreneurships (keep only the one associated with the kept plan)
        const entrepreneurshipIdsToDelete = plansToDelete.map(p => p.entrepreneurshipId);
        
        for (const entrepreneurshipId of entrepreneurshipIdsToDelete) {
          await prisma.entrepreneurship.delete({
            where: { id: entrepreneurshipId }
          });
        }
        
        console.log(`   🗑️  Eliminados ${entrepreneurshipIdsToDelete.length} emprendimientos duplicados\n`);
      }
    }

    console.log(`✅ Limpieza completada!`);
    console.log(`📊 Total de planes eliminados: ${totalDeleted}`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicatePlans();
