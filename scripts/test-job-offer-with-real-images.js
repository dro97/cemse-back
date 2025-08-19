const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

async function testJobOfferWithRealImages() {
  try {
    console.log('🚀 Probando creación de JobOffer con imágenes reales...\n');

    // Crear FormData
    const formData = new FormData();

    // Datos básicos de la oferta
    formData.append('title', 'Desarrollador Full Stack con Imágenes Reales');
    formData.append('description', 'Buscamos un desarrollador full stack con experiencia en React, Node.js y bases de datos. Esta oferta incluye imágenes reales para probar el sistema.');
    formData.append('requirements', 'Experiencia mínima de 2 años en desarrollo web, conocimiento de React, Node.js, y bases de datos');
    formData.append('benefits', 'Salario competitivo, horario flexible, trabajo remoto, beneficios de salud');
    formData.append('salaryMin', '6000');
    formData.append('salaryMax', '9000');
    formData.append('salaryCurrency', 'BOB');
    formData.append('contractType', 'FULL_TIME');
    formData.append('workSchedule', 'Lunes a Viernes, 8:00 AM - 6:00 PM');
    formData.append('workModality', 'HYBRID');
    formData.append('location', 'Cochabamba, Bolivia');
    formData.append('latitude', '-17.3895');
    formData.append('longitude', '-66.1568');
    formData.append('municipality', 'Cochabamba');
    formData.append('department', 'Cochabamba');
    formData.append('experienceLevel', 'MID_LEVEL');
    formData.append('educationRequired', 'UNIVERSITY');
    formData.append('applicationDeadline', '2024-02-15T23:59:59.000Z');
    formData.append('companyId', 'company_id_here'); // Reemplazar con ID real

    // Arrays como JSON strings
    const skillsRequired = ["JavaScript", "React", "Node.js", "PostgreSQL", "Git"];
    formData.append('skillsRequired', JSON.stringify(skillsRequired));

    const desiredSkills = ["TypeScript", "Docker", "AWS"];
    formData.append('desiredSkills', JSON.stringify(desiredSkills));

    // Crear imágenes de prueba si no existen
    const uploadsDir = path.join(__dirname, '../uploads/job-offers');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Crear imágenes de prueba simples
    const testImages = [
      { name: 'office-building.jpg', content: 'fake-image-data-1' },
      { name: 'team-working.jpg', content: 'fake-image-data-2' },
      { name: 'tech-environment.jpg', content: 'fake-image-data-3' }
    ];

    const testLogo = { name: 'company-logo.png', content: 'fake-logo-data' };

    console.log('📁 Creando imágenes de prueba...');

    // Crear archivos de imagen de prueba
    testImages.forEach((img, index) => {
      const imagePath = path.join(__dirname, 'test-images', img.name);
      const imageDir = path.dirname(imagePath);
      
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }
      
      // Crear un archivo de imagen simple (simulado)
      fs.writeFileSync(imagePath, img.content);
      console.log(`✅ Imagen de prueba ${index + 1} creada: ${img.name}`);
    });

    // Crear logo de prueba
    const logoPath = path.join(__dirname, 'test-images', testLogo.name);
    fs.writeFileSync(logoPath, testLogo.content);
    console.log(`✅ Logo de prueba creado: ${testLogo.name}`);

    // Agregar imágenes al FormData
    console.log('\n📤 Agregando imágenes al FormData...');
    testImages.forEach((img, index) => {
      const imagePath = path.join(__dirname, 'test-images', img.name);
      if (fs.existsSync(imagePath)) {
        formData.append('images', fs.createReadStream(imagePath));
        console.log(`✅ Imagen ${index + 1} agregada al FormData: ${img.name}`);
      } else {
        console.log(`❌ Imagen no encontrada: ${img.name}`);
      }
    });

    // Agregar logo al FormData
    if (fs.existsSync(logoPath)) {
      formData.append('logo', fs.createReadStream(logoPath));
      console.log(`✅ Logo agregado al FormData: ${testLogo.name}`);
    } else {
      console.log(`❌ Logo no encontrado: ${testLogo.name}`);
    }

    console.log('\n📋 Resumen del FormData creado:');
    console.log('   - title: Desarrollador Full Stack con Imágenes Reales');
    console.log('   - description: [descripción completa]');
    console.log('   - requirements: [requisitos completos]');
    console.log('   - benefits: [beneficios completos]');
    console.log('   - salaryMin: 6000');
    console.log('   - salaryMax: 9000');
    console.log('   - contractType: FULL_TIME');
    console.log('   - workModality: HYBRID');
    console.log('   - location: Cochabamba, Bolivia');
    console.log('   - latitude: -17.3895');
    console.log('   - longitude: -66.1568');
    console.log('   - municipality: Cochabamba');
    console.log('   - experienceLevel: MID_LEVEL');
    console.log('   - skillsRequired: ["JavaScript", "React", "Node.js", "PostgreSQL", "Git"]');
    console.log('   - desiredSkills: ["TypeScript", "Docker", "AWS"]');
    console.log('   - images: 3 archivos de imagen');
    console.log('   - logo: 1 archivo de logo');

    console.log('\n⚠️  Nota: Para probar realmente, necesitas:');
    console.log('   1. Un companyId válido de la base de datos');
    console.log('   2. El servidor corriendo en localhost:3001');
    console.log('   3. Autenticación apropiada');
    console.log('   4. Reemplazar "company_id_here" con un ID real');

    // Ejemplo de cómo sería la llamada real:
    /*
    console.log('\n🌐 Enviando request al servidor...');
    const response = await axios.post(`${BASE_URL}/job-offers`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ JobOffer creado exitosamente:');
    console.log('📊 Respuesta del servidor:');
    console.log(JSON.stringify(response.data, null, 2));
    */

    console.log('\n📝 Para ver los logs del servidor:');
    console.log('   1. Ejecuta el servidor con: npm run dev');
    console.log('   2. Descomenta las líneas de código de la llamada real');
    console.log('   3. Ejecuta este script: node scripts/test-job-offer-with-real-images.js');
    console.log('   4. Revisa la consola del servidor para ver los logs detallados');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Función para limpiar archivos de prueba
function cleanupTestFiles() {
  console.log('\n🧹 Limpiando archivos de prueba...');
  
  const testImagesDir = path.join(__dirname, 'test-images');
  if (fs.existsSync(testImagesDir)) {
    fs.rmSync(testImagesDir, { recursive: true, force: true });
    console.log('✅ Archivos de prueba eliminados');
  }
}

// Ejecutar las funciones
testJobOfferWithRealImages();

// Comentar la siguiente línea si quieres mantener los archivos de prueba
// cleanupTestFiles();
