const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testUserActivities() {
  try {
    console.log('🚀 Probando sistema de actividades recientes...\n');

    // Primero necesitamos obtener un token de autenticación
    console.log('1️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'joven_test',
      password: 'joven123'
    });

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;

    console.log('✅ Login exitoso!');
    console.log('Usuario ID:', userId);
    console.log('Token:', token.substring(0, 50) + '...');
    console.log('\n');

    // Configurar headers con autenticación
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Obtener actividades recientes del dashboard
    console.log('2️⃣ Obteniendo actividades recientes del dashboard...');
    const activitiesResponse = await axios.get(
      `${API_BASE_URL}/user-activities/${userId}/dashboard`,
      { headers }
    );

    console.log('✅ Datos del dashboard obtenidos exitosamente!');
    
    // Mostrar estadísticas
    const stats = activitiesResponse.data.statistics;
    console.log('\n📊 ESTADÍSTICAS DEL SISTEMA:');
    console.log(`   📚 Total de cursos disponibles: ${stats.totalCourses}`);
    console.log(`   💼 Total de empleos activos: ${stats.totalJobs}`);
    console.log(`   💡 Total de emprendimientos: ${stats.totalEntrepreneurships}`);
    console.log(`   🏢 Total de instituciones: ${stats.totalInstitutions}`);
    console.log('\n👤 ESTADÍSTICAS DEL USUARIO:');
    console.log(`   📚 Cursos en los que está inscrito: ${stats.userCourses}`);
    console.log(`   💼 Postulaciones a empleos: ${stats.userJobApplications}`);
    console.log(`   💡 Emprendimientos creados: ${stats.userEntrepreneurships}`);
    
    console.log('\n📋 ACTIVIDADES RECIENTES:');
    if (activitiesResponse.data.recentActivities.length > 0) {
      activitiesResponse.data.recentActivities.forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.icon} ${activity.title}`);
        console.log(`   Descripción: ${activity.description || 'N/A'}`);
        console.log(`   Tiempo: ${activity.timestamp}`);
        console.log('');
      });
    } else {
      console.log('📭 No hay actividades recientes para mostrar.');
      console.log('💡 Esto es normal si el usuario no ha realizado ninguna actividad aún.');
    }

    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Sugerencia: Asegúrate de que el usuario "joven_test" existe en la base de datos.');
      console.log('   Puedes ejecutar: node scripts/create-youth-profile.js');
    }
  }
}

// Ejecutar la prueba
testUserActivities();
