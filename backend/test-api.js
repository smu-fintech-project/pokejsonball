#!/usr/bin/env node
/**
 * API Test Script
 * Tests all endpoints and logs detailed information
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function testEndpoint(name, method, url, data = null) {
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, `🧪 Testing: ${name}`);
  log(colors.blue, `   ${method} ${url}`);
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: 15000,
    };
    
    if (data) {
      config.data = data;
      log(colors.yellow, '   Request Body:', JSON.stringify(data, null, 2));
    }
    
    const startTime = Date.now();
    const response = await axios(config);
    const duration = Date.now() - startTime;
    
    log(colors.green, ` Success (${duration}ms)`);
    log(colors.blue, `   Status: ${response.status}`);
    log(colors.blue, `   Response:`, JSON.stringify(response.data, null, 2).substring(0, 500));
    
    return { success: true, data: response.data, duration };
  } catch (error) {
    const duration = Date.now() - Date.now();
    log(colors.red, ` Failed (${duration}ms)`);
    
    if (error.response) {
      log(colors.red, `   Status: ${error.response.status}`);
      log(colors.red, `   Error:`, JSON.stringify(error.response.data, null, 2));
    } else {
      log(colors.red, `   Error: ${error.message}`);
    }
    
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, ' Starting API Tests');
  log(colors.cyan, `   Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  const results = [];
  
  // Test 1: Root endpoint
  results.push(await testEndpoint(
    'Root Endpoint',
    'GET',
    '/'
  ));
  
  // Test 2: Health check (V2)
  results.push(await testEndpoint(
    'Health Check (V2)',
    'GET',
    '/api/v2/health'
  ));
  
  // Test 3: List all cards (V1)
  results.push(await testEndpoint(
    'List All Cards (V1)',
    'GET',
    '/api/cards'
  ));
  
  // Test 4: List all cards (V2)
  results.push(await testEndpoint(
    'List All Cards (V2)',
    'GET',
    '/api/v2/cards?limit=5'
  ));
  
  // Test 5: Get specific card (V1)
  results.push(await testEndpoint(
    'Get Card Details (V1) - Real Cert',
    'GET',
    '/api/cards/116230496'
  ));
  
  // Test 6: Get specific card (V2)
  results.push(await testEndpoint(
    'Get Card Details (V2) - Real Cert',
    'GET',
    '/api/v2/cards/116230496'
  ));
  
  // Test 7: Price comparison
  results.push(await testEndpoint(
    'Price Comparison',
    'GET',
    '/api/v2/cards/116230496/price-comparison'
  ));
  
  // Test 8: Batch fetch
  results.push(await testEndpoint(
    'Batch Fetch Cards',
    'POST',
    '/api/v2/cards/batch',
    { certNumbers: ['116230496', '110761155', '114363745'] }
  ));
  
  // Test 9: Non-existent card
  results.push(await testEndpoint(
    'Non-Existent Card (Should 404)',
    'GET',
    '/api/v2/cards/99999999'
  ));
  
  // Test 10: Image proxy
  results.push(await testEndpoint(
    'Image Proxy',
    'GET',
    '/api/proxy-image?url=https://images.pokemontcg.io/base1/4_hires.png'
  ));
  
  // Summary
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, ' Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(colors.green, ` Passed: ${passed}`);
  log(colors.red, ` Failed: ${failed}`);
  log(colors.blue, `📈 Total: ${results.length}`);
  
  if (passed === results.length) {
    log(colors.green, '\n All tests passed!');
  } else {
    log(colors.yellow, '\n  Some tests failed. Check logs above.');
  }
  
  console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(error => {
  log(colors.red, '\n Test suite failed:', error.message);
  process.exit(1);
});
