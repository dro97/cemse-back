const os = require('os');

function getNetworkInfo() {
  console.log('🌐 Información de Red de tu Máquina\n');
  
  // Obtener todas las interfaces de red
  const networkInterfaces = os.networkInterfaces();
  
  console.log('📡 Interfaces de Red Disponibles:');
  console.log('================================\n');
  
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const interfaces = networkInterfaces[interfaceName];
    
    interfaces.forEach((interface) => {
      // Solo mostrar IPv4
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`🔗 ${interfaceName}:`);
        console.log(`   IP: ${interface.address}`);
        console.log(`   Máscara: ${interface.netmask}`);
        console.log(`   MAC: ${interface.mac}`);
        console.log('');
      }
    });
  });
  
  console.log('🚀 URLs para acceder desde la red:');
  console.log('==================================\n');
  
  // Obtener la IP principal
  const mainIP = getMainIP();
  if (mainIP) {
    console.log(`📍 IP Principal: ${mainIP}`);
    console.log(`🌐 API Base URL: http://${mainIP}:3001/api`);
    console.log(`📚 Swagger Docs: http://${mainIP}:3001/api/docs`);
    console.log(`🔌 Socket.IO: http://${mainIP}:3001`);
    console.log(`📊 Analytics: http://${mainIP}:3001/api/analytics`);
    console.log(`💚 Health Check: http://${mainIP}:3001/health`);
  }
  
  console.log('\n📋 Endpoints Públicos Disponibles:');
  console.log('==================================\n');
  console.log('🔓 Sin Autenticación:');
  console.log(`   • GET http://${mainIP}:3001/api/municipality/public`);
  console.log(`   • GET http://${mainIP}:3001/api/institution/public`);
  console.log(`   • GET http://${mainIP}:3001/api/entrepreneurship/public`);
  console.log(`   • GET http://${mainIP}:3001/api/newsarticle/public`);
  console.log(`   • GET http://${mainIP}:3001/health`);
  console.log('');
  console.log('🔐 Con Autenticación:');
  console.log(`   • POST http://${mainIP}:3001/api/auth/login`);
  console.log(`   • GET http://${mainIP}:3001/api/entrepreneurship`);
  console.log(`   • GET http://${mainIP}:3001/api/newsarticle`);
  console.log(`   • POST http://${mainIP}:3001/api/newsarticle`);
  console.log('');
  
  console.log('⚠️  Notas Importantes:');
  console.log('=====================\n');
  console.log('1. Asegúrate de que el firewall permita conexiones al puerto 3001');
  console.log('2. Otros dispositivos en la red pueden acceder usando tu IP');
  console.log('3. Para desarrollo local, sigue usando localhost:3001');
  console.log('4. El servidor ahora escucha en 0.0.0.0:3001 (todas las interfaces)');
}

function getMainIP() {
  const networkInterfaces = os.networkInterfaces();
  
  // Buscar la primera IP IPv4 que no sea interna
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    
    for (const interface of interfaces) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return null;
}

// Ejecutar el script
getNetworkInfo();
