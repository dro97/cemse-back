const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testNewsArticleCreation() {
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
    
    // Add image file (create a dummy file if it doesn't exist)
    const imagePath = './test-image.jpg';
    if (!fs.existsSync(imagePath)) {
      // Create a dummy image file
      const dummyImage = Buffer.from('fake image data');
      fs.writeFileSync(imagePath, dummyImage);
    }
    form.append('image', fs.createReadStream(imagePath));
    
    // Get headers from form
    const headers = form.getHeaders();
    
    // Add authorization header (you'll need to replace with a valid token)
    headers['Authorization'] = 'Bearer YOUR_TOKEN_HERE';
    
    console.log('Sending request to:', 'http://192.168.10.91:3001/api/newsarticle');
    console.log('Headers:', headers);
    console.log('Form data fields:', Object.keys(form.getHeaders()));
    
    const response = await axios.post('http://192.168.10.91:3001/api/newsarticle', form, {
      headers: headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testNewsArticleCreation();
