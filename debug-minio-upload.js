const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001';
const MINIO_BASE_URL = 'https://bucket-production-1a58.up.railway.app:443';

// Token de autenticación (reemplaza con un token válido)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrYzAwMDAyZjRnc3BzYTNpOSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0eXBlIjp1bmRlZmluZWQsInJvbGUiOiJTVVBFUkFETUlOIiwiaWF0IjoxNzM1MTI5NjQ1LCJleHAiOjE3MzUyMTYwNDV9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Reemplaza con tu token

async function debugMinIOUpload() {
  try {
    console.log('🔍 DEBUG: Iniciando diagnóstico de MinIO...');
    
    // Crear FormData con imagen
    const form = new FormData();
    
    // Agregar campos de texto
    form.append('title', 'Debug MinIO Test');
    form.append('content', 'Esta es una prueba de debug para MinIO.');
    form.append('summary', 'Debug MinIO');
    form.append('category', 'Tecnología');
    form.append('priority', 'MEDIUM');
    form.append('status', 'PUBLISHED');
    form.append('featured', 'false');
    form.append('targetAudience', 'YOUTH');
    form.append('region', 'Nacional');
    
    // Crear una imagen de prueba simple (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    console.log('📸 DEBUG: Agregando imagen de prueba...');
    console.log('📊 DEBUG: Tamaño de la imagen:', testImageBuffer.length, 'bytes');
    
    form.append('image', testImageBuffer, {
      filename: 'test-debug.png',
      contentType: 'image/png'
    });
    
    console.log('📤 DEBUG: Enviando solicitud POST a /api/newsarticle...');
    console.log('🔗 DEBUG: URL:', `${API_BASE_URL}/api/newsarticle`);
    console.log('🔑 DEBUG: Token:', AUTH_TOKEN.substring(0, 20) + '...');
    
    // Realizar la solicitud
    const response = await fetch(`${API_BASE_URL}/api/newsarticle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    console.log(`📊 DEBUG: Respuesta del servidor: ${response.status} ${response.statusText}`);
    console.log('📋 DEBUG: Headers de respuesta:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 DEBUG: Respuesta completa:', responseText);
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ DEBUG: Noticia creada exitosamente!');
        console.log('📋 DEBUG: Datos de la noticia:');
        console.log(`   ID: ${result.id}`);
        console.log(`   Título: ${result.title}`);
        console.log(`   URL de imagen: ${result.imageUrl}`);
        console.log(`   ¿Es null?: ${result.imageUrl === null}`);
        
        // Verificar si la URL de la imagen es de MinIO
        if (result.imageUrl && result.imageUrl.startsWith(MINIO_BASE_URL)) {
          console.log('✅ DEBUG: La imagen se subió correctamente a MinIO!');
          console.log(`🔗 DEBUG: URL de MinIO: ${result.imageUrl}`);
          
          // Probar acceso a la imagen
          console.log('🔍 DEBUG: Probando acceso a la imagen...');
          const imageResponse = await fetch(result.imageUrl);
          console.log(`📊 DEBUG: Respuesta de la imagen: ${imageResponse.status} ${imageResponse.statusText}`);
          
          if (imageResponse.ok) {
            console.log('✅ DEBUG: La imagen es accesible públicamente desde MinIO!');
          } else {
            console.log('❌ DEBUG: La imagen no es accesible:', imageResponse.status);
          }
        } else {
          console.log('❌ DEBUG: La imagen no se subió a MinIO');
          console.log(`🔗 DEBUG: URL actual: ${result.imageUrl}`);
          console.log(`🔍 DEBUG: ¿Es null?: ${result.imageUrl === null}`);
          console.log(`🔍 DEBUG: ¿Es undefined?: ${result.imageUrl === undefined}`);
        }
      } catch (parseError) {
        console.log('❌ DEBUG: Error parseando JSON:', parseError.message);
        console.log('📄 DEBUG: Respuesta raw:', responseText);
      }
    } else {
      console.log('❌ DEBUG: Error al crear la noticia:');
      console.log('📄 DEBUG: Respuesta de error:', responseText);
    }
    
  } catch (error) {
    console.error('❌ DEBUG: Error durante la prueba:', error.message);
    console.error('📋 DEBUG: Stack trace:', error.stack);
  }
}

// Ejecutar el debug
debugMinIOUpload();
