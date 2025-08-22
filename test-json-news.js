const axios = require('axios');

async function testJsonNewsArticle() {
  try {
    const newsData = {
      title: "Test JSON Article",
      summary: "This is a test article sent via JSON",
      content: "This is the content of the test article sent via JSON format.",
      category: "Test",
      tags: ["test", "json"],
      priority: "LOW",
      status: "DRAFT",
      featured: false,
      targetAudience: ["YOUTH"],
      region: "Test Region"
    };

    console.log('Testing JSON news article creation...');
    console.log('URL: http://192.168.10.91:3001/api/newsarticle');
    console.log('Data:', JSON.stringify(newsData, null, 2));

    const response = await axios.post('http://192.168.10.91:3001/api/newsarticle', newsData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });

    console.log('✅ Success! Status:', response.status);
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.status);
    console.error('Error message:', error.response?.data?.message);
    console.error('Debug info:', error.response?.data?.debug);
  }
}

testJsonNewsArticle();
