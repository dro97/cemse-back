// Función para probar el simulador
async function testSimulator() {
  console.log('🧪 Probando Simulador de Plan de Negocios...\n');

  // Probar sin token primero
  console.log('1. Probando SIN token (debería dar 401)...');
  await testWithoutToken();

  console.log('\n2. Para probar CON token, necesitas:');
  console.log('   - Un usuario JOVEN o ADOLESCENTE en la base de datos');
  console.log('   - Hacer login para obtener un token válido');
  console.log('   - Usar el token en el header Authorization: Bearer <token>');
}

async function testWithoutToken() {
  const testData = {
    tripleImpactAssessment: {
      problemSolved: "Test",
      beneficiaries: "",
      resourcesUsed: "",
      communityInvolvement: "",
      longTermImpact: ""
    },
    executiveSummary: "Test summary",
    currentStep: 0,
    isCompleted: false
  };

  try {
    const response = await fetch('http://localhost:3001/api/businessplan/simulator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('Status:', response.status);
    const result = await response.json();
    console.log('Respuesta:', result);

    if (response.status === 401) {
      console.log('✅ Correcto: 401 sin token');
    } else {
      console.log('❌ Inesperado: debería ser 401');
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar la prueba
testSimulator();
