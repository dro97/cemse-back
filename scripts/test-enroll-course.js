const http = require('http');

// Función para hacer una petición HTTP
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function testEnrollCourse() {
  try {
    console.log('🎓 Probando inscripción en curso...\n');

    const courseId = 'cme8tvypp0000acygt8d4kc80';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJ1c2VybmFtZSI6ImpvdmVuX3Rlc3QiLCJyb2xlIjoiWU9VVEgiLCJpYXQiOjE3NTUwMjE3MDIsImV4cCI6MTc1NTAyMjYwMn0.ovjoW3kRUY7qDDi8EnGbNXK2V3dd27YnluE2d3j6Wtc';
    
    console.log('🔑 Usando token proporcionado...');
    console.log(`   Usuario: joven_test`);
    console.log(`   Role: YOUTH`);

    // 1. Verificar inscripciones actuales
    console.log('\n1️⃣ Verificando inscripciones actuales...');
    
    const currentEnrollmentsResponse = await makeRequest(`http://localhost:3001/api/course-enrollments?courseId=${courseId}`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`   Status: ${currentEnrollmentsResponse.statusCode}`);
    if (currentEnrollmentsResponse.statusCode === 200) {
      const enrollments = JSON.parse(currentEnrollmentsResponse.data);
      console.log(`   Inscripciones actuales: ${enrollments.length}`);
      if (enrollments.length > 0) {
        enrollments.forEach((enrollment, index) => {
          console.log(`   ${index + 1}. ID: ${enrollment.id}, Course: ${enrollment.courseId}, Status: ${enrollment.status}`);
        });
      }
    }

    // 2. Intentar inscribirse en el curso
    console.log('\n2️⃣ Intentando inscribirse en el curso...');
    
    const enrollmentData = {
      courseId: courseId,
      status: 'ENROLLED',
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessons: 0,
      completedQuizzes: 0,
      lastAccessedAt: new Date().toISOString()
    };
    
    console.log(`   Datos de inscripción:`, enrollmentData);
    
    const enrollResponse = await makeRequest('http://localhost:3001/api/course-enrollments', 'POST', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }, JSON.stringify(enrollmentData));
    
    console.log(`   Status: ${enrollResponse.statusCode}`);
    
    if (enrollResponse.statusCode === 201) {
      console.log('   ✅ Inscripción exitosa!');
      const newEnrollment = JSON.parse(enrollResponse.data);
      console.log(`   ID de inscripción: ${newEnrollment.id}`);
      console.log(`   Curso: ${newEnrollment.courseId}`);
      console.log(`   Estado: ${newEnrollment.status}`);
      console.log(`   Fecha: ${newEnrollment.enrolledAt}`);
    } else {
      console.log(`   ❌ Error en inscripción: ${enrollResponse.statusCode}`);
      console.log(`   Respuesta: ${enrollResponse.data}`);
    }

    // 3. Verificar inscripciones después del intento
    console.log('\n3️⃣ Verificando inscripciones después del intento...');
    
    const finalEnrollmentsResponse = await makeRequest(`http://localhost:3001/api/course-enrollments?courseId=${courseId}`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`   Status: ${finalEnrollmentsResponse.statusCode}`);
    if (finalEnrollmentsResponse.statusCode === 200) {
      const enrollments = JSON.parse(finalEnrollmentsResponse.data);
      console.log(`   Total de inscripciones: ${enrollments.length}`);
      if (enrollments.length > 0) {
        enrollments.forEach((enrollment, index) => {
          console.log(`   ${index + 1}. ID: ${enrollment.id}, Course: ${enrollment.courseId}, Status: ${enrollment.status}`);
        });
      }
    }

    // 4. Verificar en la base de datos directamente
    console.log('\n4️⃣ Verificando en la base de datos...');
    
    const allEnrollmentsResponse = await makeRequest('http://localhost:3001/api/course-enrollments', 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`   Status: ${allEnrollmentsResponse.statusCode}`);
    if (allEnrollmentsResponse.statusCode === 200) {
      const allEnrollments = JSON.parse(allEnrollmentsResponse.data);
      console.log(`   Total de inscripciones en BD: ${allEnrollments.length}`);
      
      const courseEnrollments = allEnrollments.filter(e => e.courseId === courseId);
      console.log(`   Inscripciones para este curso: ${courseEnrollments.length}`);
      
      if (courseEnrollments.length > 0) {
        courseEnrollments.forEach((enrollment, index) => {
          console.log(`   ${index + 1}. ID: ${enrollment.id}, Status: ${enrollment.status}, Progress: ${enrollment.progress}%`);
        });
      }
    }

    console.log('\n📋 Resumen:');
    console.log('   - Si la inscripción devuelve 201: Éxito');
    console.log('   - Si devuelve 400: Datos incorrectos');
    console.log('   - Si devuelve 401: Problema de autenticación');
    console.log('   - Si devuelve 403: No tienes permisos');
    console.log('   - Si devuelve 409: Ya estás inscrito');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testEnrollCourse();
