const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZThjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiWU9VVEgiLCJ0eXBlIjoidXNlciIsImlhdCI6MTc1NTU0MzQzNSwiZXhwIjoxNzU1NjI5ODM1fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Reemplaza con un token válido

// Función para obtener certificados del usuario
async function getMyCertificates() {
  try {
    console.log('🎓 Obteniendo certificados del usuario...');
    
    const response = await axios.get(`${API_BASE_URL}/certificate`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ Certificados obtenidos exitosamente');
    console.log('📊 Status:', response.status);
    console.log('📋 Total de certificados:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\n📜 Certificados encontrados:');
      response.data.forEach((cert, index) => {
        console.log(`\n${index + 1}. Certificado ID: ${cert.id}`);
        console.log(`   📚 Curso: ${cert.course?.title || 'N/A'}`);
        console.log(`   👤 Estudiante: ${cert.user?.firstName} ${cert.user?.lastName}`);
        console.log(`   📅 Emitido: ${new Date(cert.issuedAt).toLocaleDateString()}`);
        console.log(`   🔗 URL: ${cert.url || 'N/A'}`);
        console.log(`   🔐 Código: ${cert.verificationCode || 'N/A'}`);
      });
    } else {
      console.log('📭 No se encontraron certificados para este usuario');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener certificados:');
    if (error.response) {
      console.error('   📊 Status:', error.response.status);
      console.error('   📋 Datos:', error.response.data);
    } else {
      console.error('   🌐 Error de red:', error.message);
    }
    throw error;
  }
}

// Función para obtener un certificado específico
async function getCertificateById(certificateId) {
  try {
    console.log(`🎓 Obteniendo certificado ID: ${certificateId}...`);
    
    const response = await axios.get(`${API_BASE_URL}/certificate/${certificateId}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ Certificado obtenido exitosamente');
    console.log('📊 Status:', response.status);
    console.log('📋 Datos del certificado:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener certificado:');
    if (error.response) {
      console.error('   📊 Status:', error.response.status);
      console.error('   📋 Datos:', error.response.data);
    } else {
      console.error('   🌐 Error de red:', error.message);
    }
    throw error;
  }
}

// Función para obtener certificados de módulos
async function getModuleCertificates() {
  try {
    console.log('🎓 Obteniendo certificados de módulos...');
    
    const response = await axios.get(`${API_BASE_URL}/modulecertificate`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ Certificados de módulos obtenidos exitosamente');
    console.log('📊 Status:', response.status);
    console.log('📋 Total de certificados de módulos:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\n📜 Certificados de módulos encontrados:');
      response.data.forEach((cert, index) => {
        console.log(`\n${index + 1}. Certificado ID: ${cert.id}`);
        console.log(`   📚 Módulo: ${cert.module?.title || 'N/A'}`);
        console.log(`   🎓 Curso: ${cert.module?.course?.title || 'N/A'}`);
        console.log(`   👤 Estudiante: ${cert.student?.firstName} ${cert.student?.lastName}`);
        console.log(`   📅 Emitido: ${new Date(cert.issuedAt).toLocaleDateString()}`);
        console.log(`   📊 Calificación: ${cert.grade || 'N/A'}%`);
        console.log(`   🔗 URL: ${cert.certificateUrl || 'N/A'}`);
      });
    } else {
      console.log('📭 No se encontraron certificados de módulos para este usuario');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener certificados de módulos:');
    if (error.response) {
      console.error('   📊 Status:', error.response.status);
      console.error('   📋 Datos:', error.response.data);
    } else {
      console.error('   🌐 Error de red:', error.message);
    }
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 === PRUEBA DE CERTIFICADOS ===\n');
    
    // 1. Obtener certificados de cursos completos
    console.log('📚 === CERTIFICADOS DE CURSOS COMPLETOS ===');
    const courseCertificates = await getMyCertificates();
    
    // 2. Obtener certificados de módulos
    console.log('\n📚 === CERTIFICADOS DE MÓDULOS ===');
    const moduleCertificates = await getModuleCertificates();
    
    // 3. Si hay certificados, obtener uno específico como ejemplo
    if (courseCertificates.length > 0) {
      console.log('\n📚 === OBTENER CERTIFICADO ESPECÍFICO ===');
      await getCertificateById(courseCertificates[0].id);
    }
    
    console.log('\n🎉 === PRUEBA COMPLETADA EXITOSAMENTE ===');
    console.log('📋 Resumen:');
    console.log(`   📚 Certificados de cursos: ${courseCertificates.length}`);
    console.log(`   📜 Certificados de módulos: ${moduleCertificates.length}`);
    
  } catch (error) {
    console.error('\n💥 === ERROR EN LA PRUEBA ===');
    console.error(error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}
