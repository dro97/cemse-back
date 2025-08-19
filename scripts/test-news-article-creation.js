const fetch = require('node-fetch');

async function loginAndGetToken(username, password) {
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      return loginResult.token;
    } else {
      console.log('❌ Error en login:', await loginResponse.json());
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión en login:', error.message);
    return null;
  }
}

async function testNewsArticleCreation() {
  console.log('🧪 Probando creación de artículos de noticias...\n');

  // Test data for news article
  const newsArticleData = {
    title: "Artículo de prueba",
    content: "Este es un artículo de prueba para verificar que las empresas y municipios pueden crear noticias.",
    summary: "Resumen del artículo de prueba",
    category: "General",
    priority: "MEDIUM",
    status: "DRAFT",
    tags: ["prueba", "test"],
    featured: false,
    targetAudience: ["YOUTH", "ADOLESCENTS"],
    region: "Cochabamba"
  };

  // Test with company user
  console.log('🏢 Probando con usuario de empresa...');
  const companyToken = await loginAndGetToken('empresa_test', 'password123');
  
  if (companyToken) {
    try {
      const response = await fetch('http://localhost:3001/api/newsarticle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${companyToken}`
        },
        body: JSON.stringify(newsArticleData)
      });

      console.log('📥 Status:', response.status);
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Éxito! Empresa puede crear artículo de noticias');
        console.log('📊 Respuesta:', JSON.stringify(result, null, 2));
      } else {
        console.log('❌ Error:', result);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error.message);
    }
  }

  console.log('\n🏛️ Probando con usuario de municipio...');
  const municipalityToken = await loginAndGetToken('municipio_test', 'password123');
  
  if (municipalityToken) {
    try {
      const response = await fetch('http://localhost:3001/api/newsarticle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${municipalityToken}`
        },
        body: JSON.stringify({
          ...newsArticleData,
          title: "Artículo de municipio",
          content: "Este es un artículo de prueba desde un municipio."
        })
      });

      console.log('📥 Status:', response.status);
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Éxito! Municipio puede crear artículo de noticias');
        console.log('📊 Respuesta:', JSON.stringify(result, null, 2));
      } else {
        console.log('❌ Error:', result);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error.message);
    }
  }

  console.log('\n🔍 Probando listado de artículos...');
  if (companyToken) {
    try {
      const response = await fetch('http://localhost:3001/api/newsarticle', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${companyToken}`
        }
      });

      console.log('📥 Status:', response.status);
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Éxito! Listado de artículos funciona');
        console.log('📊 Total de artículos:', result.length);
        if (result.length > 0) {
          console.log('📰 Primer artículo:', {
            id: result[0].id,
            title: result[0].title,
            authorName: result[0].authorName,
            authorType: result[0].authorType
          });
        }
      } else {
        console.log('❌ Error:', result);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error.message);
    }
  }
}

testNewsArticleCreation();
