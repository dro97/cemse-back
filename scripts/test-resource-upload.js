const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001/api';

// Configuración de la API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

// Token de autenticación (reemplaza con un token válido)
const AUTH_TOKEN = 'your-auth-token-here';

async function testResourceUpload() {
  try {
    console.log('🚀 Iniciando prueba de subida de recursos generales...\n');

    // 1. Crear un recurso con archivo
    console.log('1. Creando recurso con archivo...');
    
    const formData = new FormData();
    
    // Campos de texto
    formData.append('title', 'Manual de Emprendimiento Digital');
    formData.append('description', 'Guía completa para emprendedores en el mundo digital');
    formData.append('type', 'MANUAL');
    formData.append('category', 'EMPRENDIMIENTO');
    formData.append('format', 'PDF');
    formData.append('author', 'Juan Pérez');
    formData.append('tags', JSON.stringify(['emprendimiento', 'digital', 'negocios']));
    
    // Archivo (simular un archivo PDF)
    const fileBuffer = Buffer.from('Contenido simulado de PDF');
    formData.append('file', fileBuffer, {
      filename: 'manual-emprendimiento.pdf',
      contentType: 'application/pdf'
    });

    const createResponse = await api.post('/resources', formData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Recurso creado exitosamente:');
    console.log('   ID:', createResponse.data.id);
    console.log('   Título:', createResponse.data.title);
    console.log('   URL de descarga:', createResponse.data.downloadUrl);
    console.log('   Tamaño del archivo:', createResponse.data.fileSize, 'bytes');

    // 2. Crear un recurso con enlace externo
    console.log('\n2. Creando recurso con enlace externo...');
    
    const externalResourceData = {
      title: 'Guía de Marketing Digital',
      description: 'Recurso externo sobre marketing digital',
      type: 'GUIA',
      category: 'MARKETING',
      format: 'LINK',
      author: 'María García',
      externalUrl: 'https://example.com/marketing-guide',
      tags: JSON.stringify(['marketing', 'digital', 'estrategia'])
    };

    const externalFormData = new FormData();
    Object.keys(externalResourceData).forEach(key => {
      externalFormData.append(key, externalResourceData[key]);
    });

    const externalResponse = await api.post('/resources', externalFormData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...externalFormData.getHeaders()
      }
    });

    console.log('✅ Recurso externo creado exitosamente:');
    console.log('   ID:', externalResponse.data.id);
    console.log('   Título:', externalResponse.data.title);
    console.log('   URL externa:', externalResponse.data.externalUrl);

    // 3. Listar todos los recursos
    console.log('\n3. Listando todos los recursos...');
    
    const listResponse = await api.get('/resources');
    
    console.log('✅ Recursos encontrados:', listResponse.data.length);
    listResponse.data.forEach((resource, index) => {
      console.log(`   ${index + 1}. ${resource.title} (${resource.type})`);
      console.log(`      Autor: ${resource.author}`);
      console.log(`      Categoría: ${resource.category}`);
      if (resource.downloadUrl) {
        console.log(`      Descarga: ${resource.downloadUrl}`);
      }
      if (resource.externalUrl) {
        console.log(`      Externo: ${resource.externalUrl}`);
      }
    });

    // 4. Obtener un recurso específico
    console.log('\n4. Obteniendo recurso específico...');
    
    const getResponse = await api.get(`/resources/${createResponse.data.id}`);
    
    console.log('✅ Recurso obtenido:');
    console.log('   Título:', getResponse.data.title);
    console.log('   Descripción:', getResponse.data.description);
    console.log('   Tags:', getResponse.data.tags);

    // 5. Actualizar un recurso
    console.log('\n5. Actualizando recurso...');
    
    const updateFormData = new FormData();
    updateFormData.append('title', 'Manual de Emprendimiento Digital - Actualizado');
    updateFormData.append('description', 'Guía completa actualizada para emprendedores');
    updateFormData.append('tags', JSON.stringify(['emprendimiento', 'digital', 'negocios', 'actualizado']));

    const updateResponse = await api.put(`/resources/${createResponse.data.id}`, updateFormData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...updateFormData.getHeaders()
      }
    });

    console.log('✅ Recurso actualizado exitosamente:');
    console.log('   Nuevo título:', updateResponse.data.title);
    console.log('   Nuevos tags:', updateResponse.data.tags);

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', error.response.headers);
    }
  }
}

// Función para probar sin autenticación (solo lectura)
async function testPublicAccess() {
  try {
    console.log('\n🔍 Probando acceso público a recursos...\n');

    // 1. Listar recursos (público)
    console.log('1. Listando recursos (acceso público)...');
    
    const listResponse = await api.get('/resources');
    console.log('✅ Recursos disponibles:', listResponse.data.length);

    // 2. Obtener recurso específico (público)
    if (listResponse.data.length > 0) {
      const resourceId = listResponse.data[0].id;
      console.log(`2. Obteniendo recurso ${resourceId} (acceso público)...`);
      
      const getResponse = await api.get(`/resources/${resourceId}`);
      console.log('✅ Recurso obtenido:', getResponse.data.title);
    }

    console.log('\n✅ Acceso público funcionando correctamente');

  } catch (error) {
    console.error('❌ Error en acceso público:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE RECURSOS GENERALES\n');
  
  // Primero probar acceso público
  await testPublicAccess();
  
  // Luego probar funcionalidades con autenticación
  if (AUTH_TOKEN !== 'your-auth-token-here') {
    await testResourceUpload();
  } else {
    console.log('\n⚠️  Para probar la creación de recursos, actualiza AUTH_TOKEN en el script');
  }
}

runTests();
