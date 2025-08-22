const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const YOUTH_TOKEN = 'tu-token-joven-aqui'; // Reemplaza con token de joven
const COMPANY_TOKEN = 'tu-token-empresa-aqui'; // Reemplaza con token de empresa

// Variables para almacenar IDs creados
let createdApplicationId = null;
let createdMessageId = null;
let createdInterestId = null;

// Función para hacer requests
async function makeRequest(url, method, headers, data = null) {
  try {
    const config = {
      method,
      url,
      headers,
      data
    };
    
    const response = await axios(config);
    return {
      statusCode: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      data: error.response?.data || { message: error.message }
    };
  }
}

// 1. Probar creación de postulación de joven
async function testCreateYouthApplication() {
  try {
    console.log('\n📝 === PRUEBA DE CREACIÓN DE POSTULACIÓN DE JOVEN ===');
    
    const applicationData = {
      title: "Desarrollador Frontend Junior",
      description: "Soy un desarrollador frontend con experiencia en React, JavaScript y HTML/CSS. Busco oportunidades para crecer profesionalmente en una empresa que valore la innovación y el aprendizaje continuo.",
      youthProfileId: "ID_DEL_PERFIL_JOVEN", // Reemplaza con ID real
      isPublic: true
    };
    
    console.log('📤 Enviando datos de postulación:');
    console.log('   - Título:', applicationData.title);
    console.log('   - Descripción:', applicationData.description.substring(0, 50) + '...');
    console.log('   - Perfil ID:', applicationData.youthProfileId);
    console.log('   - Público:', applicationData.isPublic);

    const response = await makeRequest(`${API_BASE_URL}/youthapplication`, 'POST', {
      'Authorization': `Bearer ${YOUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }, applicationData);

    if (response.statusCode === 201) {
      console.log('\n✅ Postulación creada exitosamente:');
      console.log('   - ID:', response.data.id);
      console.log('   - Título:', response.data.title);
      console.log('   - Estado:', response.data.status);
      console.log('   - Público:', response.data.isPublic);
      console.log('   - Vistas:', response.data.viewsCount);
      console.log('   - Aplicaciones:', response.data.applicationsCount);
      console.log('   - Creado:', response.data.createdAt);
      
      createdApplicationId = response.data.id;
      return response.data;
    } else {
      console.log('\n❌ Error creando postulación:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error en creación de postulación:', error.message);
    throw error;
  }
}

// 2. Probar listado de postulaciones
async function testListYouthApplications() {
  try {
    console.log('\n📋 === PRUEBA DE LISTADO DE POSTULACIONES ===');
    
    const response = await makeRequest(`${API_BASE_URL}/youthapplication`, 'GET', {
      'Authorization': `Bearer ${YOUTH_TOKEN}`
    });

    if (response.statusCode === 200) {
      console.log('✅ Postulaciones obtenidas exitosamente');
      console.log('   - Total de postulaciones:', response.data.length);
      
      if (response.data.length > 0) {
        const firstApp = response.data[0];
        console.log('   - Primera postulación:');
        console.log('     * ID:', firstApp.id);
        console.log('     * Título:', firstApp.title);
        console.log('     * Estado:', firstApp.status);
        console.log('     * Vistas:', firstApp.viewsCount);
        console.log('     * Aplicaciones:', firstApp.applicationsCount);
      }
      
      return response.data;
    } else {
      console.log('❌ Error obteniendo postulaciones:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error en listado de postulaciones:', error.message);
    throw error;
  }
}

// 3. Probar obtención de postulación específica
async function testGetYouthApplication() {
  try {
    console.log('\n👁️ === PRUEBA DE OBTENCIÓN DE POSTULACIÓN ESPECÍFICA ===');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay postulación creada, usando una existente...');
      createdApplicationId = "cmf1abc123def456"; // Reemplaza con ID real
    }
    
    const response = await makeRequest(`${API_BASE_URL}/youthapplication/${createdApplicationId}`, 'GET', {
      'Authorization': `Bearer ${YOUTH_TOKEN}`
    });

    if (response.statusCode === 200) {
      console.log('✅ Postulación obtenida exitosamente:');
      console.log('   - ID:', response.data.id);
      console.log('   - Título:', response.data.title);
      console.log('   - Descripción:', response.data.description.substring(0, 50) + '...');
      console.log('   - Estado:', response.data.status);
      console.log('   - Vistas:', response.data.viewsCount);
      console.log('   - Público:', response.data.isPublic);
      
      if (response.data.youthProfile) {
        console.log('   - Perfil del joven:');
        console.log('     * Nombre:', response.data.youthProfile.firstName, response.data.youthProfile.lastName);
        console.log('     * Email:', response.data.youthProfile.email);
        console.log('     * Habilidades:', response.data.youthProfile.skills?.join(', ') || 'No especificadas');
      }
      
      return response.data;
    } else {
      console.log('❌ Error obteniendo postulación:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo postulación específica:', error.message);
    throw error;
  }
}

// 4. Probar envío de mensaje (empresa a joven)
async function testSendMessage() {
  try {
    console.log('\n💬 === PRUEBA DE ENVÍO DE MENSAJE ===');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay postulación creada, usando una existente...');
      createdApplicationId = "cmf1abc123def456"; // Reemplaza con ID real
    }
    
    const messageData = {
      content: "Hola, me interesa mucho tu perfil. Veo que tienes experiencia en React y JavaScript. ¿Te gustaría agendar una entrevista para discutir oportunidades en nuestra empresa?"
    };
    
    console.log('📤 Enviando mensaje:');
    console.log('   - Contenido:', messageData.content.substring(0, 50) + '...');
    console.log('   - Postulación ID:', createdApplicationId);

    const response = await makeRequest(`${API_BASE_URL}/youthapplication/${createdApplicationId}/message`, 'POST', {
      'Authorization': `Bearer ${COMPANY_TOKEN}`,
      'Content-Type': 'application/json'
    }, messageData);

    if (response.statusCode === 201) {
      console.log('\n✅ Mensaje enviado exitosamente:');
      console.log('   - ID del mensaje:', response.data.id);
      console.log('   - Contenido:', response.data.content.substring(0, 50) + '...');
      console.log('   - Tipo de remitente:', response.data.senderType);
      console.log('   - Estado:', response.data.status);
      console.log('   - Enviado:', response.data.createdAt);
      
      createdMessageId = response.data.id;
      return response.data;
    } else {
      console.log('\n❌ Error enviando mensaje:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.message);
    throw error;
  }
}

// 5. Probar obtención de mensajes
async function testGetMessages() {
  try {
    console.log('\n📥 === PRUEBA DE OBTENCIÓN DE MENSAJES ===');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay postulación creada, usando una existente...');
      createdApplicationId = "cmf1abc123def456"; // Reemplaza con ID real
    }
    
    const response = await makeRequest(`${API_BASE_URL}/youthapplication/${createdApplicationId}/messages`, 'GET', {
      'Authorization': `Bearer ${YOUTH_TOKEN}`
    });

    if (response.statusCode === 200) {
      console.log('✅ Mensajes obtenidos exitosamente:');
      console.log('   - Total de mensajes:', response.data.length);
      
      if (response.data.length > 0) {
        response.data.forEach((message, index) => {
          console.log(`   - Mensaje ${index + 1}:`);
          console.log('     * ID:', message.id);
          console.log('     * Contenido:', message.content.substring(0, 30) + '...');
          console.log('     * Tipo de remitente:', message.senderType);
          console.log('     * Estado:', message.status);
          console.log('     * Enviado:', message.createdAt);
        });
      }
      
      return response.data;
    } else {
      console.log('❌ Error obteniendo mensajes:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo mensajes:', error.message);
    throw error;
  }
}

// 6. Probar expresión de interés de empresa
async function testExpressCompanyInterest() {
  try {
    console.log('\n🎯 === PRUEBA DE EXPRESIÓN DE INTERÉS DE EMPRESA ===');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay postulación creada, usando una existente...');
      createdApplicationId = "cmf1abc123def456"; // Reemplaza con ID real
    }
    
    const interestData = {
      companyId: "ID_DE_LA_EMPRESA", // Reemplaza con ID real
      status: "INTERESTED",
      message: "Perfil muy interesante. Nos gustaría contactarte para discutir oportunidades en nuestro equipo de desarrollo frontend."
    };
    
    console.log('📤 Expresando interés:');
    console.log('   - Empresa ID:', interestData.companyId);
    console.log('   - Estado:', interestData.status);
    console.log('   - Mensaje:', interestData.message.substring(0, 50) + '...');

    const response = await makeRequest(`${API_BASE_URL}/youthapplication/${createdApplicationId}/company-interest`, 'POST', {
      'Authorization': `Bearer ${COMPANY_TOKEN}`,
      'Content-Type': 'application/json'
    }, interestData);

    if (response.statusCode === 201) {
      console.log('\n✅ Interés expresado exitosamente:');
      console.log('   - ID del interés:', response.data.id);
      console.log('   - Estado:', response.data.status);
      console.log('   - Mensaje:', response.data.message);
      console.log('   - Empresa:', response.data.company?.name);
      console.log('   - Creado:', response.data.createdAt);
      
      createdInterestId = response.data.id;
      return response.data;
    } else {
      console.log('\n❌ Error expresando interés:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error expresando interés:', error.message);
    throw error;
  }
}

// 7. Probar obtención de intereses de empresas
async function testGetCompanyInterests() {
  try {
    console.log('\n📊 === PRUEBA DE OBTENCIÓN DE INTERESES DE EMPRESAS ===');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay postulación creada, usando una existente...');
      createdApplicationId = "cmf1abc123def456"; // Reemplaza con ID real
    }
    
    const response = await makeRequest(`${API_BASE_URL}/youthapplication/${createdApplicationId}/company-interests`, 'GET', {
      'Authorization': `Bearer ${YOUTH_TOKEN}`
    });

    if (response.statusCode === 200) {
      console.log('✅ Intereses de empresas obtenidos exitosamente:');
      console.log('   - Total de intereses:', response.data.length);
      
      if (response.data.length > 0) {
        response.data.forEach((interest, index) => {
          console.log(`   - Interés ${index + 1}:`);
          console.log('     * ID:', interest.id);
          console.log('     * Estado:', interest.status);
          console.log('     * Mensaje:', interest.message?.substring(0, 30) + '...' || 'Sin mensaje');
          console.log('     * Empresa:', interest.company?.name);
          console.log('     * Sector:', interest.company?.businessSector);
          console.log('     * Email:', interest.company?.email);
          console.log('     * Creado:', interest.createdAt);
        });
      }
      
      return response.data;
    } else {
      console.log('❌ Error obteniendo intereses:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo intereses:', error.message);
    throw error;
  }
}

// 8. Probar actualización de postulación
async function testUpdateYouthApplication() {
  try {
    console.log('\n✏️ === PRUEBA DE ACTUALIZACIÓN DE POSTULACIÓN ===');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay postulación creada, usando una existente...');
      createdApplicationId = "cmf1abc123def456"; // Reemplaza con ID real
    }
    
    const updateData = {
      title: "Desarrollador Frontend Senior (Actualizado)",
      description: "Descripción actualizada: Soy un desarrollador frontend con experiencia avanzada en React, TypeScript y Node.js. Busco oportunidades de liderazgo técnico.",
      status: "ACTIVE",
      isPublic: true
    };
    
    console.log('📤 Actualizando postulación:');
    console.log('   - Nuevo título:', updateData.title);
    console.log('   - Nueva descripción:', updateData.description.substring(0, 50) + '...');
    console.log('   - Estado:', updateData.status);

    const response = await makeRequest(`${API_BASE_URL}/youthapplication/${createdApplicationId}`, 'PUT', {
      'Authorization': `Bearer ${YOUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }, updateData);

    if (response.statusCode === 200) {
      console.log('\n✅ Postulación actualizada exitosamente:');
      console.log('   - ID:', response.data.id);
      console.log('   - Título actualizado:', response.data.title);
      console.log('   - Estado:', response.data.status);
      console.log('   - Público:', response.data.isPublic);
      console.log('   - Actualizado:', response.data.updatedAt);
      
      return response.data;
    } else {
      console.log('\n❌ Error actualizando postulación:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error actualizando postulación:', error.message);
    throw error;
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  try {
    console.log('🚀 === INICIANDO PRUEBAS DEL SISTEMA DE POSTULACIONES DE JÓVENES ===\n');
    
    // Ejecutar pruebas en secuencia
    await testCreateYouthApplication();
    await testListYouthApplications();
    await testGetYouthApplication();
    await testSendMessage();
    await testGetMessages();
    await testExpressCompanyInterest();
    await testGetCompanyInterests();
    await testUpdateYouthApplication();
    
    console.log('\n🎉 === TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===');
    console.log('\n📋 Resumen de lo creado:');
    console.log('   - Postulación ID:', createdApplicationId);
    console.log('   - Mensaje ID:', createdMessageId);
    console.log('   - Interés ID:', createdInterestId);
    
  } catch (error) {
    console.error('\n❌ === ERROR EN LAS PRUEBAS ===');
    console.error('Error:', error.message);
  }
}

// Ejecutar las pruebas si el script se ejecuta directamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testCreateYouthApplication,
  testListYouthApplications,
  testGetYouthApplication,
  testSendMessage,
  testGetMessages,
  testExpressCompanyInterest,
  testGetCompanyInterests,
  testUpdateYouthApplication,
  runAllTests
};
