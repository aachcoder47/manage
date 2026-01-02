// Simple API test script to debug the 400 error
// Run this in your browser console to test the API endpoints

async function testApplicationsAPI() {
  console.log('🔍 Testing Applications API...');
  
  // Test 1: Check candidate-specific endpoint
  console.log('\n1. Testing candidate endpoint...');
  try {
    const candidateResponse = await fetch('/api/applications/candidate/user_364WebGvJNOCngdeyz4qTP7wXXA');
    console.log('Candidate endpoint status:', candidateResponse.status);
    
    if (candidateResponse.ok) {
      const data = await candidateResponse.json();
      console.log('✅ Candidate endpoint success:', data);
      console.log('Applications found:', data.applications?.length || 0);
    } else {
      const errorText = await candidateResponse.text();
      console.log('❌ Candidate endpoint error:', candidateResponse.status, errorText);
    }
  } catch (error) {
    console.log('❌ Candidate endpoint fetch error:', error);
  }
  
  // Test 2: Check general applications endpoint
  console.log('\n2. Testing general applications endpoint...');
  try {
    const generalResponse = await fetch('/api/applications?candidate_id=user_364WebGvJNOCngdeyz4qTP7wXXA');
    console.log('General endpoint status:', generalResponse.status);
    
    if (generalResponse.ok) {
      const data = await generalResponse.json();
      console.log('✅ General endpoint success:', data);
      console.log('Applications found:', data.applications?.length || 0);
    } else {
      const errorText = await generalResponse.text();
      console.log('❌ General endpoint error:', generalResponse.status, errorText);
    }
  } catch (error) {
    console.log('❌ General endpoint fetch error:', error);
  }
  
  // Test 3: Check if the route file exists
  console.log('\n3. Testing route existence...');
  try {
    const routeResponse = await fetch('/api/applications');
    console.log('Base applications endpoint status:', routeResponse.status);
    
    if (routeResponse.ok) {
      const data = await routeResponse.json();
      console.log('✅ Base endpoint success:', data);
    } else {
      const errorText = await routeResponse.text();
      console.log('❌ Base endpoint error:', routeResponse.status, errorText);
    }
  } catch (error) {
    console.log('❌ Base endpoint fetch error:', error);
  }
  
  // Test 4: Check with different user ID
  console.log('\n4. Testing with different user ID...');
  try {
    const testResponse = await fetch('/api/applications?candidate_id=test_user');
    console.log('Test user endpoint status:', testResponse.status);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Test user endpoint success:', data);
    } else {
      const errorText = await testResponse.text();
      console.log('❌ Test user endpoint error:', testResponse.status, errorText);
    }
  } catch (error) {
    console.log('❌ Test user endpoint fetch error:', error);
  }
  
  console.log('\n🔍 API Testing Complete!');
}

// Test database connection through API
async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  
  try {
    // Test if we can reach any API endpoint
    const response = await fetch('/api/admin/me');
    console.log('Admin endpoint status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connection working:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Database connection error:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Database connection fetch error:', error);
  }
}

// Check what's in the current page's network requests
function checkCurrentNetworkRequests() {
  console.log('🔍 Checking Current Network Requests...');
  
  // Look for any failed requests in the console
  console.log('Check the Network tab in browser dev tools for:');
  console.log('1. Failed API requests');
  console.log('2. Request URLs');
  console.log('3. Request payloads');
  console.log('4. Response headers');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Complete API Debugging...');
  console.log('=====================================');
  
  await testApplicationsAPI();
  await testDatabaseConnection();
  checkCurrentNetworkRequests();
  
  console.log('\n✅ Debugging Complete!');
  console.log('=====================================');
  console.log('Next steps:');
  console.log('1. Check the SQL script results');
  console.log('2. Verify API endpoint files exist');
  console.log('3. Check server logs for errors');
  console.log('4. Test with Postman or curl');
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.debugApplicationsAPI = testApplicationsAPI;
  window.debugDatabaseConnection = testDatabaseConnection;
  window.runAllTests = runAllTests;
  
  console.log('🔧 API debugging functions loaded!');
  console.log('Run window.debugApplicationsAPI() to test applications API');
  console.log('Run window.runAllTests() to run all debugging tests');
}
