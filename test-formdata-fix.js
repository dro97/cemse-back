const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testFormDataFix() {
  try {
    // Create form data
    const form = new FormData();
    
    // Add text fields
    form.append('title', '213123');
    form.append('summary', '12312');
    form.append('content', '123123');
    form.append('category', 'Ofertas de Empleo');
    form.append('tags', '123123123,1232131,12312');
    form.append('priority', 'LOW');
    form.append('status', 'PUBLISHED');
    form.append('featured', 'true');
    form.append('targetAudience', 'YOUTH');
    form.append('region', 'Cochabamba');
    
    // Create a dummy image file
    const imagePath = './test-image.jpg';
    const dummyImage = Buffer.from('fake image data');
    fs.writeFileSync(imagePath, dummyImage);
    form.append('image', fs.createReadStream(imagePath));
    
    // Get headers from form
    const headers = form.getHeaders();
    
    // Add authorization header (you'll need to replace with a valid token)
    headers['Authorization'] = 'Bearer YOUR_TOKEN_HERE';
    
    console.log('Testing form-data endpoint...');
    console.log('URL: http://192.168.10.91:3001/api/newsarticle');
    console.log('Content-Type:', headers['content-type']);
    
    const response = await axios.post('http://192.168.10.91:3001/api/newsarticle', form, {
      headers: headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('✅ Success! Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status);
    console.error('Error message:', error.response?.data?.message);
    console.error('Debug info:', error.response?.data?.debug);
  }
}

testFormDataFix();
