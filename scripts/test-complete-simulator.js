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

async function testCompleteSimulator() {
  console.log('🧪 Probando Simulador Completo de Plan de Negocios...\n');

  // First, get a valid token
  console.log('🔐 Obteniendo token de autenticación...');
  const token = await loginAndGetToken();
  
  if (!token) {
    console.log('❌ No se pudo obtener el token. Verifica que el servidor esté corriendo y las credenciales sean correctas.');
    return;
  }

  console.log('✅ Token obtenido correctamente\n');

  // Complete test data matching frontend specification
  const completeSimulatorData = {
    // Triple Impact Assessment (Paso 1)
    "tripleImpactAssessment": {
      "problemSolved": "Crear empleos sostenibles en la comunidad",
      "beneficiaries": "Familias locales y jóvenes desempleados",
      "resourcesUsed": "Recursos locales y materiales reciclados",
      "communityInvolvement": "Participación activa de la comunidad",
      "longTermImpact": "Desarrollo económico sostenible"
    },

    // Secciones del Plan
    "executiveSummary": "Resumen ejecutivo del plan de negocios",
    "businessDescription": "Descripción detallada del negocio",
    "marketAnalysis": "Análisis completo del mercado",
    "competitiveAnalysis": "Análisis de la competencia",
    "marketingPlan": "Plan de marketing integral",
    "operationalPlan": "Plan operativo detallado",
    "managementTeam": "Equipo de gestión",
    "financialProjections": {
      "startupCosts": 10000,
      "monthlyRevenue": 5000,
      "monthlyExpenses": 3000,
      "breakEvenMonth": 5,
      "revenueStreams": ["Ventas directas", "Servicios", "Consultoría"]
    },
    "riskAnalysis": "Análisis de riesgos del proyecto",

    // Herramientas Avanzadas
    "businessModelCanvas": {
      "keyPartners": "Proveedores locales",
      "keyActivities": "Producción y venta",
      "valuePropositions": "Productos sostenibles",
      "customerRelationships": "Relaciones personales",
      "customerSegments": "Comunidad local",
      "keyResources": "Materia prima local",
      "channels": "Venta directa",
      "costStructure": "Costos operativos",
      "revenueStreams": "Ventas de productos"
    },

    "financialCalculator": {
      "initialInvestment": 10000,
      "monthlyRevenue": 5000,
      "fixedCosts": 2000,
      "variableCosts": 1000,
      "projectionMonths": 12,
      "cashFlowProjection": [
        {
          "month": 1,
          "revenue": 5000,
          "expenses": 3000,
          "profit": 2000,
          "cumulative": 2000
        }
      ]
    },

    // Metadatos del Simulador
    "currentStep": 0,
    "completionPercentage": 17,
    "isCompleted": false
  };

  try {
    console.log('📤 Enviando datos completos del simulador...');
    console.log('   - tripleImpactAssessment: ✅');
    console.log('   - businessDescription: ✅');
    console.log('   - marketingPlan: ✅');
    console.log('   - financialProjections: ✅');
    console.log('   - businessModelCanvas: ✅');
    console.log('   - financialCalculator: ✅');

    const response = await fetch('http://localhost:3001/api/businessplan/simulator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(completeSimulatorData)
    });

    console.log('📥 Status:', response.status);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Éxito! Simulador funcionando correctamente');
      console.log('📊 Respuesta completa:', JSON.stringify(result, null, 2));
      
      // Verify the response structure matches frontend specification
      console.log('\n🔍 Verificando estructura de respuesta...');
      
      if (result.success && result.data) {
        console.log('   ✅ success: true');
        console.log('   ✅ data object present');
        
        const data = result.data;
        if (data.businessPlanId) console.log('   ✅ businessPlanId:', data.businessPlanId);
        if (data.entrepreneurshipId) console.log('   ✅ entrepreneurshipId:', data.entrepreneurshipId);
        if (data.message) console.log('   ✅ message:', data.message);
        if (data.completionPercentage !== undefined) console.log('   ✅ completionPercentage:', data.completionPercentage);
        if (data.nextRecommendedStep !== undefined) console.log('   ✅ nextRecommendedStep:', data.nextRecommendedStep);
        
        if (data.impactAnalysis) {
          console.log('   ✅ impactAnalysis:');
          console.log('     - economic:', data.impactAnalysis.economic);
          console.log('     - social:', data.impactAnalysis.social);
          console.log('     - environmental:', data.impactAnalysis.environmental);
          console.log('     - impactScore:', data.impactAnalysis.impactScore);
          console.log('     - recommendations:', data.impactAnalysis.recommendations);
        }
      } else {
        console.log('❌ Estructura de respuesta incorrecta');
      }
    } else {
      console.log('❌ Error:', result);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testCompleteSimulator();
