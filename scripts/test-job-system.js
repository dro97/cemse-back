const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrbDAwMDAyZjRnc3BzYTNpOXoiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NTUwOTU0MzAsImV4cCI6MTc1NTA5NjMzMH0.0-cey0YMDQJKZzAoB9yvjbBIJ_MvHPmn3FgG-JwdZ3o';

// Función para hacer requests HTTP
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Variables para almacenar IDs creados
let createdJobOfferId = null;
let createdApplicationId = null;

// 1. Probar creación de puesto de trabajo
async function testCreateJobOffer() {
  try {
    console.log('🏢 Probando creación de puesto de trabajo...');
    
    const jobOfferData = {
      title: "Desarrollador Frontend Junior",
      description: "Buscamos un desarrollador frontend junior para unirse a nuestro equipo",
      requirements: "Conocimientos en HTML, CSS, JavaScript, React",
      salaryMin: 3000,
      salaryMax: 5000,
      location: "Cochabamba",
      contractType: "FULL_TIME",
      workSchedule: "Lunes a Viernes, 8:00 AM - 6:00 PM",
      workModality: "HYBRID",
      experienceLevel: "ENTRY_LEVEL",
      companyId: "cme8tvypp0000acygt8d4kc80", // ID de una empresa existente
      municipality: "Cochabamba",
      department: "Cochabamba",
      skillsRequired: ["HTML", "CSS", "JavaScript"],
      desiredSkills: ["React", "TypeScript", "Git"],
      benefits: "Seguro médico, bonos de productividad, capacitación"
    };
    
    const response = await makeRequest(`${API_BASE_URL}/job-offer`, 'POST', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }, jobOfferData);
    
    if (response.statusCode === 201) {
      console.log('✅ Puesto de trabajo creado exitosamente');
      console.log(`📋 ID del puesto: ${response.data.id}`);
      console.log(`📋 Título: ${response.data.title}`);
      console.log(`📋 Empresa: ${response.data.companyId}`);
      createdJobOfferId = response.data.id;
      return response.data;
    } else {
      console.log('❌ Error creando puesto de trabajo:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error en creación de puesto:', error.message);
    throw error;
  }
}

// 2. Probar listado de puestos de trabajo
async function testListJobOffers() {
  try {
    console.log('\n📋 Probando listado de puestos de trabajo...');
    
    const response = await makeRequest(`${API_BASE_URL}/job-offer`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Puestos de trabajo obtenidos exitosamente');
      console.log(`📋 Total de puestos: ${response.data.length}`);
      
      if (response.data.length > 0) {
        const jobOffer = response.data[0];
        console.log(`📋 Primer puesto: ${jobOffer.title}`);
        console.log(`📋 Estado: ${jobOffer.status}`);
        console.log(`📋 Aplicaciones: ${jobOffer.applicationsCount}`);
      }
      
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo puestos:', error.message);
    throw error;
  }
}

// 3. Probar creación de aplicación de trabajo
async function testCreateJobApplication() {
  try {
    console.log('\n📝 Probando creación de aplicación de trabajo...');
    
    if (!createdJobOfferId) {
      console.log('⚠️ No hay puesto de trabajo creado, usando uno existente...');
      // Usar un ID de puesto existente si no se creó uno nuevo
      createdJobOfferId = "cme8tvypp0000acygt8d4kc80";
    }
    
    const applicationData = {
      jobOfferId: createdJobOfferId,
      coverLetter: "Me interesa mucho esta oportunidad. Tengo experiencia en desarrollo frontend y estoy buscando crecer profesionalmente.",
      cvData: {
        education: "Ingeniería en Sistemas",
        experience: "1 año desarrollando aplicaciones web",
        skills: ["HTML", "CSS", "JavaScript", "React"]
      },
      profileImage: "https://example.com/profile.jpg"
    };
    
    const response = await makeRequest(`${API_BASE_URL}/job-application`, 'POST', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }, applicationData);
    
    if (response.statusCode === 201) {
      console.log('✅ Aplicación de trabajo creada exitosamente');
      console.log(`📋 ID de la aplicación: ${response.data.id}`);
      console.log(`📋 Estado: ${response.data.status}`);
      console.log(`📋 Fecha de aplicación: ${response.data.appliedAt}`);
      createdApplicationId = response.data.id;
      return response.data;
    } else {
      console.log('❌ Error creando aplicación:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error en creación de aplicación:', error.message);
    throw error;
  }
}

// 4. Probar listado de aplicaciones
async function testListJobApplications() {
  try {
    console.log('\n📋 Probando listado de aplicaciones de trabajo...');
    
    const response = await makeRequest(`${API_BASE_URL}/job-application`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Aplicaciones obtenidas exitosamente');
      console.log(`📋 Total de aplicaciones: ${response.data.length}`);
      
      if (response.data.length > 0) {
        const application = response.data[0];
        console.log(`📋 Primera aplicación: ${application.id}`);
        console.log(`📋 Estado: ${application.status}`);
        console.log(`📋 Puesto: ${application.jobOffer?.title}`);
        console.log(`📋 Aplicante: ${application.applicant?.firstName} ${application.applicant?.lastName}`);
      }
      
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo aplicaciones:', error.message);
    throw error;
  }
}

// 5. Probar actualización de estado de aplicación (selección de candidato)
async function testUpdateApplicationStatus() {
  try {
    console.log('\n🔄 Probando actualización de estado de aplicación...');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay aplicación creada, usando una existente...');
      // Usar un ID de aplicación existente si no se creó una nueva
      createdApplicationId = "cme8tvypp0000acygt8d4kc80";
    }
    
    const updateData = {
      status: "PRE_SELECTED",
      notes: "Candidato con buen perfil técnico. Programar entrevista.",
      rating: 8
    };
    
    const response = await makeRequest(`${API_BASE_URL}/job-application/${createdApplicationId}`, 'PUT', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }, updateData);
    
    if (response.statusCode === 200) {
      console.log('✅ Estado de aplicación actualizado exitosamente');
      console.log(`📋 Nuevo estado: ${response.data.status}`);
      console.log(`📋 Notas: ${response.data.notes}`);
      console.log(`📋 Calificación: ${response.data.rating}`);
      return response.data;
    } else {
      console.log('❌ Error actualizando aplicación:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error actualizando aplicación:', error.message);
    throw error;
  }
}

// 6. Probar contratación de candidato
async function testHireCandidate() {
  try {
    console.log('\n🎉 Probando contratación de candidato...');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay aplicación creada, usando una existente...');
      createdApplicationId = "cme8tvypp0000acygt8d4kc80";
    }
    
    const hireData = {
      status: "HIRED",
      notes: "Candidato contratado. Iniciar proceso de onboarding.",
      rating: 9
    };
    
    const response = await makeRequest(`${API_BASE_URL}/job-application/${createdApplicationId}`, 'PUT', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }, hireData);
    
    if (response.statusCode === 200) {
      console.log('✅ Candidato contratado exitosamente');
      console.log(`📋 Estado final: ${response.data.status}`);
      console.log(`📋 Notas: ${response.data.notes}`);
      console.log(`📋 Calificación final: ${response.data.rating}`);
      return response.data;
    } else {
      console.log('❌ Error contratando candidato:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error contratando candidato:', error.message);
    throw error;
  }
}

// 7. Probar cierre de puesto de trabajo
async function testCloseJobOffer() {
  try {
    console.log('\n🔒 Probando cierre de puesto de trabajo...');
    
    if (!createdJobOfferId) {
      console.log('⚠️ No hay puesto creado, usando uno existente...');
      createdJobOfferId = "cme8tvypp0000acygt8d4kc80";
    }
    
    const closeData = {
      status: "CLOSED",
      isActive: false
    };
    
    const response = await makeRequest(`${API_BASE_URL}/job-offer/${createdJobOfferId}`, 'PUT', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }, closeData);
    
    if (response.statusCode === 200) {
      console.log('✅ Puesto de trabajo cerrado exitosamente');
      console.log(`📋 Estado: ${response.data.status}`);
      console.log(`📋 Activo: ${response.data.isActive}`);
      return response.data;
    } else {
      console.log('❌ Error cerrando puesto:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error cerrando puesto:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas del sistema de puestos de trabajo...\n');
  
  try {
    // Ejecutar todas las pruebas
    await testCreateJobOffer();
    await testListJobOffers();
    await testCreateJobApplication();
    await testListJobApplications();
    await testUpdateApplicationStatus();
    await testHireCandidate();
    await testCloseJobOffer();
    
    console.log('\n✅ Todas las pruebas completadas exitosamente');
    console.log('\n📝 Resumen del flujo:');
    console.log('1. ✅ Crear puesto de trabajo');
    console.log('2. ✅ Listar puestos disponibles');
    console.log('3. ✅ Candidato aplica al puesto');
    console.log('4. ✅ Empresa revisa aplicaciones');
    console.log('5. ✅ Empresa preselecciona candidato');
    console.log('6. ✅ Empresa contrata candidato');
    console.log('7. ✅ Empresa cierra el puesto');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
  }
}

main();
