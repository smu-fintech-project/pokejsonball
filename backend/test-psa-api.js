/**
 * Quick PSA API Test
 */

import { getCert } from './src/services/psaService.js';

const testCert = process.argv[2] || '114363745';

console.log('🔍 Testing PSA API with cert:', testCert);
console.log('');

getCert(testCert)
  .then(data => {
    console.log('✅ PSA API Response:');
    console.log('=====================================');
    console.log(JSON.stringify(data, null, 2));
    console.log('=====================================');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ PSA API Error:');
    console.error('  Code:', err.code || 'UNKNOWN');
    console.error('  Message:', err.message || err);
    console.error('  Status:', err.status || 'N/A');
    process.exit(1);
  });

