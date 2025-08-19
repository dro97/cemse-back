const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

async function testJobOfferWithFormData() {
  try {
    console.log('🚀 Probando creación de JobOffer con FormData e imágenes...\n');

    // Crear FormData
    const formData = new FormData();

    // Datos básicos de la oferta
    formData.append('title', 'Desarrollador Full Stack Senior');
    formData.append('description', 'Buscamos un desarrollador full stack senior con experiencia en React, Node.js y bases de datos para liderar proyectos innovadores en una empresa tecnológica en crecimiento.');
    formData.append('requirements', 'Experiencia mínima de 5 años en desarrollo web, conocimiento sólido de React, Node.js, TypeScript, PostgreSQL, y experiencia en liderazgo de equipos. Conocimientos en Docker, AWS, y metodologías ágiles.');
    formData.append('benefits', 'Salario competitivo, horario flexible, trabajo híbrido, beneficios de salud completos, desarrollo profesional, bonos por rendimiento, ambiente de trabajo dinámico y moderno.');
    formData.append('salaryMin', '8000');
    formData.append('salaryMax', '12000');
    formData.append('salaryCurrency', 'BOB');
    formData.append('contractType', 'FULL_TIME');
    formData.append('workSchedule', 'Lunes a Viernes, 9:00 AM - 6:00 PM');
    formData.append('workModality', 'HYBRID');
    formData.append('location', 'Cochabamba, Bolivia');
    formData.append('latitude', '-17.3895');
    formData.append('longitude', '-66.1568');
    formData.append('municipality', 'Cochabamba');
    formData.append('department', 'Cochabamba');
    formData.append('experienceLevel', 'SENIOR_LEVEL');
    formData.append('educationRequired', 'UNIVERSITY');
    formData.append('applicationDeadline', '2024-02-28T23:59:59.000Z');
    formData.append('companyId', 'company_id_here'); // Reemplazar con ID real

    // Arrays como JSON strings
    const skillsRequired = [
      "JavaScript",
      "TypeScript", 
      "React",
      "Node.js",
      "PostgreSQL",
      "Git",
      "Docker",
      "AWS",
      "Leadership",
      "Agile Methodologies"
    ];
    formData.append('skillsRequired', JSON.stringify(skillsRequired));

    const desiredSkills = [
      "GraphQL",
      "MongoDB",
      "Kubernetes",
      "CI/CD",
      "Microservices",
      "System Design"
    ];
    formData.append('desiredSkills', JSON.stringify(desiredSkills));

    // Ejemplo de cómo agregar imágenes (comentado porque no existen los archivos)
    /*
    // Agregar múltiples imágenes
    const imageFiles = [
      'office-building.jpg',
      'team-working.jpg',
      'tech-environment.jpg',
      'benefits-package.jpg'
    ];
    
    imageFiles.forEach((filename, index) => {
      const imagePath = path.join(__dirname, 'sample-images', filename);
      if (fs.existsSync(imagePath)) {
        formData.append('images', fs.createReadStream(imagePath));
        console.log(`✅ Imagen ${index + 1} agregada: ${filename}`);
      } else {
        console.log(`⚠️  Imagen no encontrada: ${filename}`);
      }
    });

    // Agregar logo
    const logoPath = path.join(__dirname, 'sample-images', 'company-logo.png');
    if (fs.existsSync(logoPath)) {
      formData.append('logo', fs.createReadStream(logoPath));
      console.log('✅ Logo agregado: company-logo.png');
    } else {
      console.log('⚠️  Logo no encontrado: company-logo.png');
    }
    */

    console.log('📋 FormData creado con los siguientes campos:');
    console.log('   - title: Desarrollador Full Stack Senior');
    console.log('   - description: [descripción completa]');
    console.log('   - requirements: [requisitos completos]');
    console.log('   - benefits: [beneficios completos]');
    console.log('   - salaryMin: 8000');
    console.log('   - salaryMax: 12000');
    console.log('   - contractType: FULL_TIME');
    console.log('   - workModality: HYBRID');
    console.log('   - location: Cochabamba, Bolivia');
    console.log('   - latitude: -17.3895');
    console.log('   - longitude: -66.1568');
    console.log('   - municipality: Cochabamba');
    console.log('   - experienceLevel: SENIOR_LEVEL');
    console.log('   - skillsRequired: [array de habilidades]');
    console.log('   - desiredSkills: [array de habilidades deseadas]');
    console.log('   - images: [archivos de imagen]');
    console.log('   - logo: [archivo de logo]');

    console.log('\n🖼️  Para agregar imágenes reales:');
    console.log('   1. Descomenta las líneas de código de imágenes');
    console.log('   2. Crea una carpeta "sample-images" con archivos de imagen');
    console.log('   3. Asegúrate de que los archivos existan');

    // Ejemplo de cómo sería la llamada real:
    /*
    const response = await axios.post(`${BASE_URL}/job-offers`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ JobOffer creado exitosamente:');
    console.log(JSON.stringify(response.data, null, 2));
    */

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Ejemplo de respuesta esperada
function showExpectedResponse() {
  console.log('\n📤 Respuesta esperada del endpoint POST /job-offers:');
  const expectedResponse = {
    id: "job_offer_id",
    title: "Desarrollador Full Stack Senior",
    description: "Buscamos un desarrollador full stack senior...",
    requirements: "Experiencia mínima de 5 años...",
    benefits: "Salario competitivo...",
    salaryMin: 8000,
    salaryMax: 12000,
    salaryCurrency: "BOB",
    contractType: "FULL_TIME",
    workSchedule: "Lunes a Viernes, 9:00 AM - 6:00 PM",
    workModality: "HYBRID",
    location: "Cochabamba, Bolivia",
    latitude: -17.3895,
    longitude: -66.1568,
    images: [
      "/uploads/job-offers/images-1705123456789-123456789.jpg",
      "/uploads/job-offers/images-1705123456790-987654321.jpg",
      "/uploads/job-offers/images-1705123456791-456789123.jpg",
      "/uploads/job-offers/images-1705123456792-789123456.jpg"
    ],
    logo: "/uploads/job-offers/logo-1705123456793-321654987.png",
    municipality: "Cochabamba",
    department: "Cochabamba",
    experienceLevel: "SENIOR_LEVEL",
    educationRequired: "UNIVERSITY",
    skillsRequired: [
      "JavaScript",
      "TypeScript",
      "React", 
      "Node.js",
      "PostgreSQL",
      "Git",
      "Docker",
      "AWS",
      "Leadership",
      "Agile Methodologies"
    ],
    desiredSkills: [
      "GraphQL",
      "MongoDB",
      "Kubernetes",
      "CI/CD",
      "Microservices",
      "System Design"
    ],
    applicationDeadline: "2024-02-28T23:59:59.000Z",
    isActive: true,
    status: "ACTIVE",
    viewsCount: 0,
    applicationsCount: 0,
    featured: false,
    expiresAt: null,
    publishedAt: "2024-01-15T10:30:00.000Z",
    companyId: "company_id_here",
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z"
  };

  console.log(JSON.stringify(expectedResponse, null, 2));
}

// Ejemplo de cómo usar en el frontend
function showFrontendExample() {
  console.log('\n💻 Ejemplo de uso en el frontend (JavaScript):');
  const frontendCode = `
// Crear FormData
const formData = new FormData();

// Agregar datos básicos
formData.append('title', 'Desarrollador Full Stack');
formData.append('description', 'Buscamos desarrollador...');
formData.append('requirements', 'Experiencia en React...');
formData.append('location', 'Cochabamba, Bolivia');
formData.append('contractType', 'FULL_TIME');
formData.append('workSchedule', 'Lunes a Viernes');
formData.append('workModality', 'HYBRID');
formData.append('experienceLevel', 'MID_LEVEL');
formData.append('companyId', 'company_id_here');
formData.append('municipality', 'Cochabamba');

// Agregar arrays como JSON
formData.append('skillsRequired', JSON.stringify(['JavaScript', 'React', 'Node.js']));
formData.append('desiredSkills', JSON.stringify(['TypeScript', 'Docker']));

// Agregar imágenes
const imageFiles = document.getElementById('images').files;
for (let i = 0; i < imageFiles.length; i++) {
  formData.append('images', imageFiles[i]);
}

// Agregar logo
const logoFile = document.getElementById('logo').files[0];
if (logoFile) {
  formData.append('logo', logoFile);
}

// Enviar request
fetch('/job-offers', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('JobOffer creado:', data))
.catch(error => console.error('Error:', error));
`;

  console.log(frontendCode);
}

// Ejecutar las funciones
testJobOfferWithFormData();
showExpectedResponse();
showFrontendExample();
