const fetch = require('node-fetch');

// Test CORS configuration
async function testCORS() {
  const baseURL = process.env.BACKEND_URL || 'https://workshop-backend-six.vercel.app';
  
  console.log('🧪 Testing CORS configuration...');
  console.log(`📍 Backend URL: ${baseURL}`);
  
  try {
    // Test 1: Basic GET request
    console.log('\n📡 Test 1: Basic GET request');
    const response1 = await fetch(`${baseURL}/api/cors-test`);
    console.log(`✅ Status: ${response1.status}`);
    console.log(`📋 CORS Headers:`, {
      'Access-Control-Allow-Origin': response1.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': response1.headers.get('access-control-allow-methods'),
      'Access-Control-Allow-Headers': response1.headers.get('access-control-allow-headers')
    });
    
    // Test 2: OPTIONS preflight request
    console.log('\n📡 Test 2: OPTIONS preflight request');
    const response2 = await fetch(`${baseURL}/api/cors-test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log(`✅ Status: ${response2.status}`);
    console.log(`📋 Preflight Headers:`, {
      'Access-Control-Allow-Origin': response2.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': response2.headers.get('access-control-allow-methods'),
      'Access-Control-Allow-Headers': response2.headers.get('access-control-allow-headers')
    });
    
    // Test 3: POST request with custom origin
    console.log('\n📡 Test 3: POST request with custom origin');
    const response3 = await fetch(`${baseURL}/api/health`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://postman.com'
      },
      body: JSON.stringify({ test: 'data' })
    });
    console.log(`✅ Status: ${response3.status}`);
    
    console.log('\n🎉 CORS tests completed successfully!');
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

// Run the test
testCORS(); 