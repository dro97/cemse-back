const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'tu-token-aqui'; // Reemplaza con tu token real

// Función para probar creación de aplicación con URLs
async function testJobApplicationWithUrls() {
  try {
    console.log('🚀 === PRUEBA DE CREACIÓN DE APLICACIÓN CON URLs ===\n');

    // Payload que envía el frontend
    const applicationData = {
      jobOfferId: "cmed764ks0003tpmex1try4w3",
      cvUrl: "/uploads/documents/cvFile-1755291995969-5882367.pdf",
      coverLetterUrl: "/uploads/cover-letters/coverLetterFile-1755292000167-522442548.pdf",
      message: "123123123312321",
      questionAnswers: [],
      status: "SENT"
    };

    console.log('📤 Enviando aplicación con URLs:');
    console.log('   - JobOffer ID:', applicationData.jobOfferId);
    console.log('   - CV URL:', applicationData.cvUrl);
    console.log('   - Cover Letter URL:', applicationData.coverLetterUrl);
    console.log('   - Message:', applicationData.message);
    console.log('   - Status:', applicationData.status);

    const response = await axios.post(`${API_BASE_URL}/jobapplication`, applicationData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Aplicación creada exitosamente:');
    console.log('   - ID:', response.data.id);
    console.log('   - CV File:', response.data.cvFile);
    console.log('   - Cover Letter File:', response.data.coverLetterFile);
    console.log('   - Cover Letter:', response.data.coverLetter);
    console.log('   - Status:', response.data.status);
    console.log('   - Applied At:', response.data.appliedAt);

    // Verificar que los archivos se guardaron correctamente
    if (response.data.cvFile === applicationData.cvUrl) {
      console.log('✅ CV URL guardada correctamente');
    } else {
      console.log('❌ Error: CV URL no se guardó correctamente');
    }

    if (response.data.coverLetterFile === applicationData.coverLetterUrl) {
      console.log('✅ Cover Letter URL guardada correctamente');
    } else {
      console.log('❌ Error: Cover Letter URL no se guardó correctamente');
    }

    if (response.data.coverLetter === applicationData.message) {
      console.log('✅ Message guardado correctamente');
    } else {
      console.log('❌ Error: Message no se guardó correctamente');
    }

    if (response.data.status === applicationData.status) {
      console.log('✅ Status guardado correctamente');
    } else {
      console.log('❌ Error: Status no se guardó correctamente');
    }

    console.log('\n🎉 === PRUEBA COMPLETADA EXITOSAMENTE ===');

  } catch (error) {
    console.error('\n❌ Error en la prueba:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Función para probar creación de aplicación con archivos (comparación)
async function testJobApplicationWithFiles() {
  try {
    console.log('\n🚀 === PRUEBA DE CREACIÓN DE APLICACIÓN CON ARCHIVOS ===\n');

    // Simular FormData con archivos
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('jobOfferId', 'cmed764ks0003tpmex1try4w3');
    formData.append('message', 'Prueba con archivos');
    formData.append('status', 'SENT');

    // Crear archivos de prueba
    const fs = require('fs');
    const path = require('path');

    // Crear CV de prueba
    const cvContent = 'CV de prueba';
    const cvPath = path.join(__dirname, 'test-cv.pdf');
    fs.writeFileSync(cvPath, cvContent);
    formData.append('cvFile', fs.createReadStream(cvPath));

    // Crear cover letter de prueba
    const coverLetterContent = 'Cover letter de prueba';
    const coverLetterPath = path.join(__dirname, 'test-cover-letter.pdf');
    fs.writeFileSync(coverLetterPath, coverLetterContent);
    formData.append('coverLetterFile', fs.createReadStream(coverLetterPath));

    console.log('📤 Enviando aplicación con archivos...');

    const response = await axios.post(`${API_BASE_URL}/jobapplication`, formData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Aplicación con archivos creada exitosamente:');
    console.log('   - ID:', response.data.id);
    console.log('   - CV File:', response.data.cvFile);
    console.log('   - Cover Letter File:', response.data.coverLetterFile);

    // Limpiar archivos de prueba
    fs.unlinkSync(cvPath);
    fs.unlinkSync(coverLetterPath);

  } catch (error) {
    console.error('\n❌ Error en la prueba con archivos:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Ejecutar pruebas
async function runTests() {
  await testJobApplicationWithUrls();
  await testJobApplicationWithFiles();
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  runTests();
}

module.exports = { testJobApplicationWithUrls, testJobApplicationWithFiles };
