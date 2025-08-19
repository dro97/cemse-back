const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

async function testJobOfferUpdateWithFormData() {
  try {
    console.log('🚀 Probando actualización de JobOffer con FormData...\n');

    const jobOfferId = 'job_offer_id_here'; // Reemplazar con ID real

    // Crear FormData para actualización
    const formData = new FormData();

    // Solo enviar los campos que quieres actualizar
    formData.append('title', 'Desarrollador Full Stack Senior - Actualizado');
    formData.append('description', 'Descripción actualizada: Buscamos un desarrollador full stack senior con experiencia actualizada...');
    formData.append('salaryMin', '9000'); // Aumentar salario mínimo
    formData.append('salaryMax', '13000'); // Aumentar salario máximo
    formData.append('benefits', 'Beneficios actualizados: Salario competitivo, horario flexible, trabajo híbrido, beneficios de salud completos, desarrollo profesional, bonos por rendimiento, ambiente de trabajo dinámico y moderno, más beneficios...');

    // Actualizar arrays
    const updatedSkillsRequired = [
      "JavaScript",
      "TypeScript", 
      "React",
      "Node.js",
      "PostgreSQL",
      "Git",
      "Docker",
      "AWS",
      "Leadership",
      "Agile Methodologies",
      "MongoDB", // Nueva habilidad
      "GraphQL"  // Nueva habilidad
    ];
    formData.append('skillsRequired', JSON.stringify(updatedSkillsRequired));

    const updatedDesiredSkills = [
      "Kubernetes",
      "CI/CD",
      "Microservices",
      "System Design",
      "Machine Learning", // Nueva habilidad deseada
      "DevOps"            // Nueva habilidad deseada
    ];
    formData.append('desiredSkills', JSON.stringify(updatedDesiredSkills));

    // Ejemplo de cómo agregar nuevas imágenes (reemplazarán las existentes)
    /*
    const newImageFiles = [
      'updated-office.jpg',
      'new-team-photo.jpg',
      'modern-workspace.jpg'
    ];
    
    newImageFiles.forEach((filename, index) => {
      const imagePath = path.join(__dirname, 'sample-images', filename);
      if (fs.existsSync(imagePath)) {
        formData.append('images', fs.createReadStream(imagePath));
        console.log(`✅ Nueva imagen ${index + 1} agregada: ${filename}`);
      } else {
        console.log(`⚠️  Nueva imagen no encontrada: ${filename}`);
      }
    });

    // Agregar nuevo logo
    const newLogoPath = path.join(__dirname, 'sample-images', 'updated-logo.png');
    if (fs.existsSync(newLogoPath)) {
      formData.append('logo', fs.createReadStream(newLogoPath));
      console.log('✅ Nuevo logo agregado: updated-logo.png');
    } else {
      console.log('⚠️  Nuevo logo no encontrado: updated-logo.png');
    }
    */

    console.log('📋 FormData de actualización creado con los siguientes campos:');
    console.log('   - title: [actualizado]');
    console.log('   - description: [actualizada]');
    console.log('   - salaryMin: 9000 (aumentado)');
    console.log('   - salaryMax: 13000 (aumentado)');
    console.log('   - benefits: [actualizados]');
    console.log('   - skillsRequired: [array actualizado con nuevas habilidades]');
    console.log('   - desiredSkills: [array actualizado con nuevas habilidades]');
    console.log('   - images: [nuevas imágenes - opcional]');
    console.log('   - logo: [nuevo logo - opcional]');

    console.log('\n🔄 Comportamiento de actualización:');
    console.log('   - Solo se actualizan los campos enviados');
    console.log('   - Las imágenes nuevas reemplazan las existentes');
    console.log('   - Los arrays se actualizan completamente');
    console.log('   - Los campos no enviados mantienen sus valores originales');

    // Ejemplo de cómo sería la llamada real:
    /*
    const response = await axios.put(`${BASE_URL}/job-offers/${jobOfferId}`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ JobOffer actualizado exitosamente:');
    console.log(JSON.stringify(response.data, null, 2));
    */

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Ejemplo de respuesta esperada
function showExpectedResponse() {
  console.log('\n📤 Respuesta esperada del endpoint PUT /job-offers/:id:');
  const expectedResponse = {
    id: "job_offer_id_here",
    title: "Desarrollador Full Stack Senior - Actualizado",
    description: "Descripción actualizada: Buscamos un desarrollador full stack senior con experiencia actualizada...",
    requirements: "Experiencia mínima de 5 años...", // No se actualizó
    benefits: "Beneficios actualizados: Salario competitivo, horario flexible...",
    salaryMin: 9000,
    salaryMax: 13000,
    salaryCurrency: "BOB",
    contractType: "FULL_TIME", // No se actualizó
    workSchedule: "Lunes a Viernes, 9:00 AM - 6:00 PM", // No se actualizó
    workModality: "HYBRID", // No se actualizó
    location: "Cochabamba, Bolivia", // No se actualizó
    latitude: -17.3895, // No se actualizó
    longitude: -66.1568, // No se actualizó
    images: [
      "/uploads/job-offers/images-1705123456789-123456789.jpg", // Nuevas imágenes
      "/uploads/job-offers/images-1705123456790-987654321.jpg",
      "/uploads/job-offers/images-1705123456791-456789123.jpg"
    ],
    logo: "/uploads/job-offers/logo-1705123456793-321654987.png", // Nuevo logo
    municipality: "Cochabamba", // No se actualizó
    department: "Cochabamba", // No se actualizó
    experienceLevel: "SENIOR_LEVEL", // No se actualizó
    educationRequired: "UNIVERSITY", // No se actualizó
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
      "Agile Methodologies",
      "MongoDB", // Nueva habilidad
      "GraphQL"  // Nueva habilidad
    ],
    desiredSkills: [
      "Kubernetes",
      "CI/CD",
      "Microservices",
      "System Design",
      "Machine Learning", // Nueva habilidad deseada
      "DevOps"            // Nueva habilidad deseada
    ],
    applicationDeadline: "2024-02-28T23:59:59.000Z", // No se actualizó
    isActive: true, // No se actualizó
    status: "ACTIVE", // No se actualizó
    viewsCount: 0, // No se actualizó
    applicationsCount: 0, // No se actualizó
    featured: false, // No se actualizó
    expiresAt: null, // No se actualizó
    publishedAt: "2024-01-15T10:30:00.000Z", // No se actualizó
    companyId: "company_id_here", // No se actualizó
    createdAt: "2024-01-15T10:30:00.000Z", // No se actualizó
    updatedAt: "2024-01-15T11:30:00.000Z" // Se actualiza automáticamente
  };

  console.log(JSON.stringify(expectedResponse, null, 2));
}

// Ejemplo de cómo usar en el frontend
function showFrontendUpdateExample() {
  console.log('\n💻 Ejemplo de actualización en el frontend (JavaScript):');
  const frontendCode = `
// Función para actualizar JobOffer
async function updateJobOffer(jobOfferId, updateData) {
  const formData = new FormData();
  
  // Solo agregar campos que se quieren actualizar
  if (updateData.title) formData.append('title', updateData.title);
  if (updateData.description) formData.append('description', updateData.description);
  if (updateData.salaryMin) formData.append('salaryMin', updateData.salaryMin);
  if (updateData.salaryMax) formData.append('salaryMax', updateData.salaryMax);
  if (updateData.benefits) formData.append('benefits', updateData.benefits);
  
  // Arrays como JSON
  if (updateData.skillsRequired) {
    formData.append('skillsRequired', JSON.stringify(updateData.skillsRequired));
  }
  if (updateData.desiredSkills) {
    formData.append('desiredSkills', JSON.stringify(updateData.desiredSkills));
  }
  
  // Nuevas imágenes (reemplazarán las existentes)
  if (updateData.newImages) {
    for (let i = 0; i < updateData.newImages.length; i++) {
      formData.append('images', updateData.newImages[i]);
    }
  }
  
  // Nuevo logo
  if (updateData.newLogo) {
    formData.append('logo', updateData.newLogo);
  }
  
  // Enviar request
  try {
    const response = await fetch(\`/job-offers/\${jobOfferId}\`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: formData
    });
    
    const data = await response.json();
    console.log('JobOffer actualizado:', data);
    return data;
  } catch (error) {
    console.error('Error actualizando JobOffer:', error);
    throw error;
  }
}

// Ejemplo de uso
const updateData = {
  title: 'Desarrollador Full Stack Senior - Actualizado',
  description: 'Nueva descripción...',
  salaryMin: 9000,
  salaryMax: 13000,
  benefits: 'Nuevos beneficios...',
  skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  desiredSkills: ['TypeScript', 'Docker', 'AWS'],
  newImages: document.getElementById('newImages').files,
  newLogo: document.getElementById('newLogo').files[0]
};

updateJobOffer('job_offer_id_here', updateData);
`;

  console.log(frontendCode);
}

// Ejemplo de actualización parcial
function showPartialUpdateExample() {
  console.log('\n🎯 Ejemplo de actualización parcial (solo algunos campos):');
  const partialUpdateCode = `
// Actualizar solo el título y salario
const formData = new FormData();
formData.append('title', 'Nuevo título de la oferta');
formData.append('salaryMin', '10000');
formData.append('salaryMax', '15000');

// Solo estos campos se actualizarán, el resto mantiene sus valores originales
fetch('/job-offers/job_offer_id_here', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Actualización parcial:', data));
`;

  console.log(partialUpdateCode);
}

// Ejemplo de actualización solo de imágenes
function showImageOnlyUpdateExample() {
  console.log('\n🖼️  Ejemplo de actualización solo de imágenes:');
  const imageUpdateCode = `
// Actualizar solo las imágenes
const formData = new FormData();

// Nuevas imágenes (reemplazarán las existentes)
const imageFiles = document.getElementById('newImages').files;
for (let i = 0; i < imageFiles.length; i++) {
  formData.append('images', imageFiles[i]);
}

// Nuevo logo
const logoFile = document.getElementById('newLogo').files[0];
if (logoFile) {
  formData.append('logo', logoFile);
}

// Solo las imágenes se actualizarán
fetch('/job-offers/job_offer_id_here', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Imágenes actualizadas:', data));
`;

  console.log(imageUpdateCode);
}

// Ejecutar las funciones
testJobOfferUpdateWithFormData();
showExpectedResponse();
showFrontendUpdateExample();
showPartialUpdateExample();
showImageOnlyUpdateExample();
