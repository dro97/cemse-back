const axios = require('axios');

async function checkServer() {
  try {
    console.log('🔍 Verificando si el servidor está ejecutándose...');
    
    // Verificar health endpoint
    const healthResponse = await axios.get('http://localhost:3001/health', {
      timeout: 5000
    });
    
    console.log('✅ Servidor está ejecutándose en puerto 3001');
    console.log('📋 Health response:', healthResponse.data);
    
    // Verificar si la API está disponible
    try {
      const apiResponse = await axios.get('http://localhost:3001/api/lesson', {
        timeout: 5000
      });
      console.log('✅ API está disponible');
    } catch (apiError) {
      if (apiError.response && apiError.response.status === 401) {
        console.log('✅ API está disponible (requiere autenticación)');
      } else {
        console.log('⚠️ API no está disponible:', apiError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Servidor no está ejecutándose:', error.message);
    console.log('\n💡 Para iniciar el servidor:');
    console.log('   npm run dev');
    console.log('   o');
    console.log('   node server.ts');
  }
}

checkServer();
