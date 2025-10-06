/**
 * Direct PSA API Test (bypasses cache)
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PSA_API_KEY = process.env.PSA_API_KEY;
const testCert = process.argv[2] || '116230496';

console.log('🔍 Direct PSA API Test');
console.log('='.repeat(50));
console.log('Cert Number:', testCert);
console.log('API Key:', PSA_API_KEY ? `${PSA_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('='.repeat(50));
console.log('');

if (!PSA_API_KEY) {
  console.error('❌ PSA_API_KEY not set in .env file!');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://api.psacard.com/publicapi',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${PSA_API_KEY}`,
  },
});

console.log('📡 Calling PSA API...\n');

try {
  // Test 1: Get cert metadata
  console.log(`GET /cert/GetByCertNumber/${testCert}`);
  const metadataResponse = await client.get(`/cert/GetByCertNumber/${testCert}`);
  
  console.log('✅ Metadata Response:');
  console.log('Status:', metadataResponse.status);
  console.log('Data:', JSON.stringify(metadataResponse.data, null, 2));
  console.log('');
  
  // Test 2: Get images
  console.log(`GET /cert/GetImagesByCertNumber/${testCert}`);
  const imageResponse = await client.get(`/cert/GetImagesByCertNumber/${testCert}`);
  
  console.log('✅ Images Response:');
  console.log('Status:', imageResponse.status);
  console.log('Data:', JSON.stringify(imageResponse.data, null, 2));
  
} catch (error) {
  console.error('❌ PSA API Error:');
  console.error('Status:', error.response?.status);
  console.error('Status Text:', error.response?.statusText);
  console.error('Data:', JSON.stringify(error.response?.data, null, 2));
  console.error('Message:', error.message);
  
  if (error.response?.status === 401) {
    console.error('\n⚠️  API KEY AUTHENTICATION FAILED!');
    console.error('Please verify your PSA_API_KEY in backend/.env');
  }
  
  process.exit(1);
}

process.exit(0);

