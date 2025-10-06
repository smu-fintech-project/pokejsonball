/**
 * Test PSA API with forced fresh call (bypass cache)
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PSA_API_KEY = process.env.PSA_API_KEY;
const testCert = process.argv[2] || '116230496';

console.log('🔍 Testing fresh PSA API call (no cache)\n');

const client = axios.create({
  baseURL: 'https://api.psacard.com/publicapi',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${PSA_API_KEY}`,
  },
});

try {
  // Fetch metadata
  const metadataResponse = await client.get(`/cert/GetByCertNumber/${testCert}`);
  const rawData = metadataResponse.data;
  const metadata = rawData.PSACert || rawData;
  
  console.log('✅ Raw PSA Metadata:');
  console.log(JSON.stringify(metadata, null, 2));
  console.log('\n---\n');
  
  // Fetch images
  const imageResponse = await client.get(`/cert/GetImagesByCertNumber/${testCert}`);
  const images = imageResponse.data;
  
  console.log('✅ PSA Images:');
  console.log(JSON.stringify(images, null, 2));
  console.log('\n---\n');
  
  // Show what will be extracted
  const cardName = metadata.Subject || metadata.Brand || 'Unknown';
  const grade = metadata.CardGrade || metadata.Grade;
  
  console.log('📊 Extracted Data:');
  console.log(`  Card Name: ${cardName}`);
  console.log(`  Grade: ${grade}`);
  console.log(`  Brand: ${metadata.Brand}`);
  console.log(`  Category: ${metadata.Category}`);
  console.log(`  Year: ${metadata.Year}`);
  console.log(`  Population: ${metadata.TotalPopulation}`);
  console.log(`  Pop Higher: ${metadata.PopulationHigher}`);
  console.log(`  Label Type: ${metadata.LabelType}`);
  
  process.exit(0);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

