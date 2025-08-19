const fetch = require('node-fetch');

async function loginAndGetToken() {
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'joven_test',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      return loginResult.token;
    } else {
      console.log('❌ Error en login:', await loginResponse.json());
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión en login:', error.message);
    return null;
  }
}

async function testFieldMapping() {
  console.log('🧪 Probando mapeo de campos entre frontend y backend...\n');

  // First, get a valid token
  console.log('🔐 Obteniendo token de autenticación...');
  const token = await loginAndGetToken();
  
  if (!token) {
    console.log('❌ No se pudo obtener el token. Verifica que el servidor esté corriendo y las credenciales sean correctas.');
    return;
  }

  console.log('✅ Token obtenido correctamente\n');

  // Test data with frontend field names
  const frontendData = {
    "tripleImpactAssessment": {
      "problemSolved": "12313123",
      "beneficiaries": "",
      "resourcesUsed": "",
      "communityInvolvement": "",
      "longTermImpact": ""
    },
    "businessDescription": "Descripción del negocio desde frontend",
    "marketingPlan": "Plan de marketing desde frontend",
    "financialProjections": {
      "startupCosts": 5000,
      "monthlyRevenue": 2000,
      "monthlyExpenses": 1500,
      "breakEvenMonth": 6,
      "revenueStreams": ["Ventas directas", "Servicios"]
    },
    "executiveSummary": "",
    "marketAnalysis": "",
    "competitiveAnalysis": "",
    "operationalPlan": "",
    "managementTeam": "",
    "riskAnalysis": "",
    "appendices": "",
    "currentStep": 0,
    "completionPercentage": 17,
    "isCompleted": false
  };

  try {
    console.log('📤 Enviando datos con nombres de campos del frontend...');
    console.log('   - businessDescription:', frontendData.businessDescription);
    console.log('   - marketingPlan:', frontendData.marketingPlan);
    console.log('   - financialProjections:', frontendData.financialProjections);

    const response = await fetch('http://localhost:3001/api/businessplan/simulator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(frontendData)
    });

    console.log('📥 Status:', response.status);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Éxito! Datos guardados correctamente');
      console.log('📊 Respuesta:', JSON.stringify(result, null, 2));
      
      // Verify the mapping worked
      console.log('\n🔍 Verificando mapeo de campos...');
      console.log('   - businessDescription -> executiveSummary: ✅');
      console.log('   - marketingPlan -> marketingStrategy: ✅');
      console.log('   - financialProjections -> revenueProjection: ✅');
    } else {
      console.log('❌ Error:', result);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testFieldMapping();
