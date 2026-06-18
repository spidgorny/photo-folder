const axios = require('axios');

const endpoint = 'https://dk1oxcru6a.execute-api.eu-central-1.amazonaws.com/handle-upload';
const filePath = 'asd/20230719_150105.jpg';

async function testUpload() {
  try {
    console.log(`Testing upload for: ${filePath}`);
    const response = await axios.post(endpoint, {
      file: filePath
    });
    console.log('Success!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testUpload();
