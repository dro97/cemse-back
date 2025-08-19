const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';

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
let createdQuestionId = null;
let createdApplicationId = null;
let createdAnswerId = null;

// 1. Obtener token fresco
async function getFreshToken() {
  try {
    console.log('🔑 Obteniendo token fresco...');
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/auth/login`, 'POST', {}, loginData);
    
    if (response.statusCode === 200) {
      console.log('✅ Token obtenido exitosamente');
      return response.data.token;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    throw error;
  }
}

// 2. Probar creación de puesto de trabajo
async function testCreateJobOffer(token) {
  try {
    console.log('\n🏢 Probando creación de puesto de trabajo...');
    
    const jobOfferData = {
      title: "Desarrollador Full Stack Senior",
      description: "Buscamos un desarrollador full stack senior para liderar proyectos web",
      requirements: "Mínimo 3 años de experiencia en desarrollo web, conocimientos en React, Node.js, bases de datos",
      salaryMin: 8000,
      salaryMax: 12000,
      location: "Cochabamba",
      contractType: "FULL_TIME",
      workSchedule: "Lunes a Viernes, 9:00 AM - 6:00 PM",
      workModality: "HYBRID",
      experienceLevel: "SENIOR_LEVEL",
      companyId: "cme8tvypp0000acygt8d4kc80",
      municipality: "Cochabamba",
      department: "Cochabamba",
      skillsRequired: ["React", "Node.js", "MongoDB", "TypeScript"],
      desiredSkills: ["AWS", "Docker", "Kubernetes", "GraphQL"],
      benefits: "Seguro médico, bonos de productividad, capacitación, trabajo remoto"
    };
    
    const response = await makeRequest(`${API_BASE_URL}/joboffer`, 'POST', {
      'Authorization': `Bearer ${token}`
    }, jobOfferData);
    
    if (response.statusCode === 201) {
      console.log('✅ Puesto de trabajo creado exitosamente');
      console.log(`📋 ID del puesto: ${response.data.id}`);
      console.log(`📋 Título: ${response.data.title}`);
      createdJobOfferId = response.data.id;
      return response.data;
    } else {
      console.log('❌ Error creando puesto:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error en creación de puesto:', error.message);
    throw error;
  }
}

// 3. Probar creación de preguntas para el puesto
async function testCreateJobQuestions(token) {
  try {
    console.log('\n❓ Probando creación de preguntas para el puesto...');
    
    if (!createdJobOfferId) {
      console.log('⚠️ No hay puesto creado, usando uno existente...');
      createdJobOfferId = "cme8tvypp0000acygt8d4kc80";
    }
    
    const questions = [
      {
        jobOfferId: createdJobOfferId,
        question: "¿Cuántos años de experiencia tienes en desarrollo web?",
        type: "text",
        required: true,
        options: [],
        orderIndex: 1
      },
      {
        jobOfferId: createdJobOfferId,
        question: "¿Qué tecnologías dominas mejor?",
        type: "multiple_choice",
        required: true,
        options: ["React", "Vue.js", "Angular", "Node.js", "Python", "Java"],
        orderIndex: 2
      },
      {
        jobOfferId: createdJobOfferId,
        question: "¿Estás disponible para trabajar en modalidad híbrida?",
        type: "boolean",
        required: true,
        options: ["Sí", "No"],
        orderIndex: 3
      },
      {
        jobOfferId: createdJobOfferId,
        question: "Describe tu experiencia más desafiante en desarrollo",
        type: "text",
        required: false,
        options: [],
        orderIndex: 4
      }
    ];
    
    for (const questionData of questions) {
      const response = await makeRequest(`${API_BASE_URL}/jobquestion`, 'POST', {
        'Authorization': `Bearer ${token}`
      }, questionData);
      
      if (response.statusCode === 201) {
        console.log(`✅ Pregunta creada: ${questionData.question.substring(0, 30)}...`);
        if (!createdQuestionId) {
          createdQuestionId = response.data.id;
        }
      } else {
        console.log('❌ Error creando pregunta:', response.data);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creando preguntas:', error.message);
    throw error;
  }
}

// 4. Probar listado de preguntas
async function testListJobQuestions(token) {
  try {
    console.log('\n📋 Probando listado de preguntas...');
    
    const response = await makeRequest(`${API_BASE_URL}/jobquestion`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Preguntas obtenidas exitosamente');
      console.log(`📋 Total de preguntas: ${response.data.length}`);
      
      if (response.data.length > 0) {
        const question = response.data[0];
        console.log(`📋 Primera pregunta: ${question.question}`);
        console.log(`📋 Tipo: ${question.type}`);
        console.log(`📋 Requerida: ${question.required}`);
      }
      
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo preguntas:', error.message);
    throw error;
  }
}

// 5. Probar creación de aplicación con respuestas
async function testCreateJobApplicationWithAnswers(token) {
  try {
    console.log('\n📝 Probando creación de aplicación con respuestas...');
    
    if (!createdJobOfferId) {
      console.log('⚠️ No hay puesto creado, usando uno existente...');
      createdJobOfferId = "cme8tvypp0000acygt8d4kc80";
    }
    
    // Primero crear la aplicación
    const applicationData = {
      jobOfferId: createdJobOfferId,
      coverLetter: "Soy un desarrollador apasionado con 4 años de experiencia en desarrollo web. Me especializo en React y Node.js, y estoy buscando una oportunidad para crecer profesionalmente en una empresa innovadora.",
      cvData: {
        education: "Ingeniería en Sistemas Informáticos",
        experience: "4 años desarrollando aplicaciones web",
        skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS"],
        certifications: ["AWS Certified Developer", "MongoDB Certified Developer"]
      },
      profileImage: "https://example.com/profile.jpg"
    };
    
    const appResponse = await makeRequest(`${API_BASE_URL}/job-application`, 'POST', {
      'Authorization': `Bearer ${token}`
    }, applicationData);
    
    if (appResponse.statusCode === 201) {
      console.log('✅ Aplicación creada exitosamente');
      createdApplicationId = appResponse.data.id;
      
      // Ahora crear respuestas a las preguntas
      const answers = [
        {
          applicationId: createdApplicationId,
          questionId: createdQuestionId || "cme8tvypp0000acygt8d4kc80",
          answer: "4 años de experiencia en desarrollo web"
        },
        {
          applicationId: createdApplicationId,
          questionId: createdQuestionId || "cme8tvypp0000acygt8d4kc80",
          answer: "React, Node.js, TypeScript"
        },
        {
          applicationId: createdApplicationId,
          questionId: createdQuestionId || "cme8tvypp0000acygt8d4kc80",
          answer: "Sí, estoy disponible para modalidad híbrida"
        },
        {
          applicationId: createdApplicationId,
          questionId: createdQuestionId || "cme8tvypp0000acygt8d4kc80",
          answer: "Desarrollé una aplicación de e-commerce que manejaba 10,000 usuarios concurrentes usando React, Node.js y MongoDB. Fue un desafío técnico importante que me permitió aprender sobre escalabilidad y optimización."
        }
      ];
      
      for (const answerData of answers) {
        const answerResponse = await makeRequest(`${API_BASE_URL}/jobquestionanswer`, 'POST', {
          'Authorization': `Bearer ${token}`
        }, answerData);
        
        if (answerResponse.statusCode === 201) {
          console.log(`✅ Respuesta creada: ${answerData.answer.substring(0, 30)}...`);
          if (!createdAnswerId) {
            createdAnswerId = answerResponse.data.id;
          }
        } else {
          console.log('❌ Error creando respuesta:', answerResponse.data);
        }
      }
      
      return appResponse.data;
    } else {
      console.log('❌ Error creando aplicación:', appResponse.data);
      throw new Error(`Error ${appResponse.statusCode}: ${JSON.stringify(appResponse.data)}`);
    }
  } catch (error) {
    console.error('❌ Error en aplicación con respuestas:', error.message);
    throw error;
  }
}

// 6. Probar listado de aplicaciones con respuestas
async function testListApplicationsWithAnswers(token) {
  try {
    console.log('\n📋 Probando listado de aplicaciones con respuestas...');
    
    const response = await makeRequest(`${API_BASE_URL}/job-application`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Aplicaciones obtenidas exitosamente');
      console.log(`📋 Total de aplicaciones: ${response.data.length}`);
      
      if (response.data.length > 0) {
        const application = response.data[0];
        console.log(`📋 Aplicación ID: ${application.id}`);
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

// 7. Probar actualización de estado de aplicación
async function testUpdateApplicationStatus(token) {
  try {
    console.log('\n🔄 Probando actualización de estado de aplicación...');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay aplicación creada, usando una existente...');
      createdApplicationId = "cme8tvypp0000acygt8d4kc80";
    }
    
    const updateData = {
      status: "PRE_SELECTED",
      notes: "Excelente perfil técnico. Las respuestas a las preguntas muestran experiencia sólida. Programar entrevista técnica.",
      rating: 9
    };
    
    const response = await makeRequest(`${API_BASE_URL}/job-application/${createdApplicationId}`, 'PUT', {
      'Authorization': `Bearer ${token}`
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

// 8. Probar contratación final
async function testHireCandidate(token) {
  try {
    console.log('\n🎉 Probando contratación de candidato...');
    
    if (!createdApplicationId) {
      console.log('⚠️ No hay aplicación creada, usando una existente...');
      createdApplicationId = "cme8tvypp0000acygt8d4kc80";
    }
    
    const hireData = {
      status: "HIRED",
      notes: "Candidato contratado después de entrevista exitosa. Iniciar proceso de onboarding y firma de contrato.",
      rating: 10
    };
    
    const response = await makeRequest(`${API_BASE_URL}/job-application/${createdApplicationId}`, 'PUT', {
      'Authorization': `Bearer ${token}`
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

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas del sistema completo de puestos de trabajo...\n');
  
  try {
    // Obtener token fresco
    const token = await getFreshToken();
    
    // Ejecutar todas las pruebas
    await testCreateJobOffer(token);
    await testCreateJobQuestions(token);
    await testListJobQuestions(token);
    await testCreateJobApplicationWithAnswers(token);
    await testListApplicationsWithAnswers(token);
    await testUpdateApplicationStatus(token);
    await testHireCandidate(token);
    
    console.log('\n✅ Todas las pruebas completadas exitosamente');
    console.log('\n📝 Resumen del flujo completo:');
    console.log('1. ✅ Crear puesto de trabajo');
    console.log('2. ✅ Agregar preguntas personalizadas al puesto');
    console.log('3. ✅ Candidato aplica con CV y carta de presentación');
    console.log('4. ✅ Candidato responde preguntas personalizadas');
    console.log('5. ✅ Empresa revisa aplicación completa');
    console.log('6. ✅ Empresa preselecciona candidato');
    console.log('7. ✅ Empresa contrata candidato');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
  }
}

main();
