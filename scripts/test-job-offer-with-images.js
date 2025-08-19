const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testJobOfferWithImages() {
  try {
    console.log('🚀 Probando creación de JobOffer con imágenes...\n');

    // Ejemplo de payload completo con imágenes
    const jobOfferData = {
      title: "Desarrollador Full Stack Senior",
      description: "Buscamos un desarrollador full stack senior con experiencia en React, Node.js y bases de datos para liderar proyectos innovadores en una empresa tecnológica en crecimiento.",
      requirements: "Experiencia mínima de 5 años en desarrollo web, conocimiento sólido de React, Node.js, TypeScript, PostgreSQL, y experiencia en liderazgo de equipos. Conocimientos en Docker, AWS, y metodologías ágiles.",
      benefits: "Salario competitivo, horario flexible, trabajo híbrido, beneficios de salud completos, desarrollo profesional, bonos por rendimiento, ambiente de trabajo dinámico y moderno.",
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
        "https://example.com/images/office-building.jpg",
        "https://example.com/images/team-working.jpg",
        "https://example.com/images/tech-environment.jpg",
        "https://example.com/images/benefits-package.jpg"
      ],
      logo: "https://example.com/logos/tech-solutions-logo.png",
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
      companyId: "company_id_here" // Reemplazar con un ID real de empresa
    };

    console.log('📋 Payload completo con imágenes:');
    console.log(JSON.stringify(jobOfferData, null, 2));
    
    console.log('\n📍 Coordenadas incluidas:');
    console.log(`   Latitud: ${jobOfferData.latitude}`);
    console.log(`   Longitud: ${jobOfferData.longitude}`);
    
    console.log('\n🖼️  Imágenes incluidas:');
    console.log(`   Logo: ${jobOfferData.logo}`);
    console.log(`   Número de imágenes: ${jobOfferData.images.length}`);
    jobOfferData.images.forEach((img, index) => {
      console.log(`   Imagen ${index + 1}: ${img}`);
    });

    // Nota: Para probar realmente, necesitarías un companyId válido
    console.log('\n⚠️  Nota: Para probar la creación real, necesitas:');
    console.log('   1. Un companyId válido de la base de datos');
    console.log('   2. El servidor corriendo en localhost:3001');
    console.log('   3. Autenticación apropiada');
    console.log('   4. URLs de imágenes válidas');

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
      "https://example.com/images/office-building.jpg",
      "https://example.com/images/team-working.jpg", 
      "https://example.com/images/tech-environment.jpg",
      "https://example.com/images/benefits-package.jpg"
    ],
    logo: "https://example.com/logos/tech-solutions-logo.png",
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
    updatedAt: "2024-01-15T10:30:00.000Z",
    company: {
      id: "company_id_here",
      name: "Tech Solutions S.A.",
      description: "Empresa líder en desarrollo de software",
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

// Ejemplo de payload mínimo requerido
function showMinimalPayload() {
  console.log('\n📝 Payload mínimo requerido:');
  const minimalPayload = {
    title: "Desarrollador Frontend",
    description: "Buscamos desarrollador frontend",
    requirements: "Experiencia en React",
    location: "Cochabamba, Bolivia",
    contractType: "FULL_TIME",
    workSchedule: "Lunes a Viernes",
    workModality: "ON_SITE",
    experienceLevel: "MID_LEVEL",
    companyId: "company_id_here",
    municipality: "Cochabamba"
  };
  
  console.log(JSON.stringify(minimalPayload, null, 2));
}

// Ejecutar las funciones
testJobOfferWithImages();
showExpectedResponse();
showMinimalPayload();
