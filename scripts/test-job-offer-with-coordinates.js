const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testJobOfferWithCoordinates() {
  try {
    console.log('🚀 Probando creación de JobOffer con coordenadas...\n');

    // Ejemplo de payload con coordenadas
    const jobOfferData = {
      title: "Desarrollador Full Stack",
      description: "Buscamos un desarrollador full stack con experiencia en React y Node.js para trabajar en proyectos innovadores.",
      requirements: "Experiencia mínima de 2 años en desarrollo web, conocimiento sólido de React, Node.js, y bases de datos relacionales.",
      benefits: "Salario competitivo, horario flexible, trabajo híbrido, beneficios de salud, desarrollo profesional.",
      salaryMin: 5000,
      salaryMax: 8000,
      salaryCurrency: "BOB",
      contractType: "FULL_TIME",
      workSchedule: "Lunes a Viernes, 8:00 AM - 6:00 PM",
      workModality: "HYBRID",
      location: "Cochabamba, Bolivia",
      latitude: -17.3895,  // Coordenadas de Cochabamba
      longitude: -66.1568,
      municipality: "Cochabamba",
      department: "Cochabamba",
      experienceLevel: "MID_LEVEL",
      educationRequired: "UNIVERSITY",
      skillsRequired: ["JavaScript", "React", "Node.js", "PostgreSQL", "Git"],
      desiredSkills: ["TypeScript", "Docker", "AWS", "MongoDB", "GraphQL"],
      applicationDeadline: "2024-02-15T23:59:59.000Z",
      companyId: "company_id_here" // Reemplazar con un ID real de empresa
    };

    console.log('📋 Payload completo:');
    console.log(JSON.stringify(jobOfferData, null, 2));
    console.log('\n📍 Coordenadas incluidas:');
    console.log(`   Latitud: ${jobOfferData.latitude}`);
    console.log(`   Longitud: ${jobOfferData.longitude}`);

    // Nota: Para probar realmente, necesitarías un companyId válido
    console.log('\n⚠️  Nota: Para probar la creación real, necesitas:');
    console.log('   1. Un companyId válido de la base de datos');
    console.log('   2. El servidor corriendo en localhost:3001');
    console.log('   3. Autenticación apropiada');

    // Ejemplo de cómo sería la llamada real:
    /*
    const response = await axios.post(`${BASE_URL}/job-offers`, jobOfferData, {
      headers: {
        'Content-Type': 'application/json',
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
  console.log('\n📤 Respuesta esperada del endpoint GET /job-offers:');
  const expectedResponse = {
    id: "job_offer_id",
    title: "Desarrollador Full Stack",
    description: "Buscamos un desarrollador full stack...",
    requirements: "Experiencia mínima de 2 años...",
    benefits: "Salario competitivo...",
    salaryMin: 5000,
    salaryMax: 8000,
    salaryCurrency: "BOB",
    contractType: "FULL_TIME",
    workSchedule: "Lunes a Viernes, 8:00 AM - 6:00 PM",
    workModality: "HYBRID",
    location: "Cochabamba, Bolivia",
    latitude: -17.3895,  // ✅ Nuevo campo
    longitude: -66.1568, // ✅ Nuevo campo
    municipality: "Cochabamba",
    department: "Cochabamba",
    experienceLevel: "MID_LEVEL",
    educationRequired: "UNIVERSITY",
    skillsRequired: ["JavaScript", "React", "Node.js", "PostgreSQL", "Git"],
    desiredSkills: ["TypeScript", "Docker", "AWS", "MongoDB", "GraphQL"],
    applicationDeadline: "2024-02-15T23:59:59.000Z",
    isActive: true,
    status: "ACTIVE",
    viewsCount: 0,
    applicationsCount: 0,
    featured: false,
    expiresAt: null,
    publishedAt: "2024-01-15T10:30:00.000Z",
    companyId: "company_id_here",
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z",
    company: {
      id: "company_id_here",
      name: "Tech Solutions S.A.",
      description: "Empresa de desarrollo de software",
      website: "https://techsolutions.com",
      email: "contacto@techsolutions.com",
      phone: "+591 4 1234567",
      address: "Av. Principal 123, Cochabamba",
      businessSector: "Tecnología",
      companySize: "MEDIUM"
    }
  };

  console.log(JSON.stringify(expectedResponse, null, 2));
}

// Ejecutar las funciones
testJobOfferWithCoordinates();
showExpectedResponse();
