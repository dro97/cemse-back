const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test data
const testData = {
  title: '7867768',
  description: '345345',
  youthProfileId: 'cme7crnpe0000y4jzy59dorf0',
  isPublic: 'true'
};

// Create form data
const form = new FormData();

// Add text fields
form.append('title', testData.title);
form.append('description', testData.description);
form.append('youthProfileId', testData.youthProfileId);
form.append('isPublic', testData.isPublic);

// Add files (if they exist)
const cvPath = path.join(__dirname, 'test-data.json');
const coverLetterPath = path.join(__dirname, 'test-data.json');

if (fs.existsSync(cvPath)) {
  form.append('cvFile', fs.createReadStream(cvPath), {
    filename: 'test-cv.pdf',
    contentType: 'application/pdf'
  });
}

if (fs.existsSync(coverLetterPath)) {
  form.append('coverLetterFile', fs.createReadStream(coverLetterPath), {
    filename: 'test-cover-letter.pdf',
    contentType: 'application/pdf'
  });
}

console.log('Form data created successfully');
console.log('Fields:', Object.keys(testData));
console.log('Files:', form.getLengthSync(), 'bytes');

// This script can be used to test the endpoint manually
// You would need to add authentication headers and make the actual HTTP request
