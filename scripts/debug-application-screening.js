// Test the application screening endpoint
// This will help debug the 404 error

async function testApplicationScreening() {
  console.log('🔍 Testing Application Screening Endpoint...');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  try {
    // Test the screening endpoint
    const response = await fetch(`/api/applications/${applicationId}/screen`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Screen endpoint status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Screen endpoint success:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Screen endpoint error:', response.status, errorText);
      
      // Try to understand the error
      if (response.status === 404) {
        console.log('🔍 Possible causes for 404:');
        console.log('1. Route file not found');
        console.log('2. Build error due to conflicting route names');
        console.log('3. Application ID not found');
        console.log('4. Route structure incorrect');
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test the main application endpoint
async function testApplicationEndpoint() {
  console.log('🔍 Testing Main Application Endpoint...');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  try {
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Application endpoint status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Application endpoint success:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Application endpoint error:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test if the application exists in database
async function testApplicationExists() {
  console.log('🔍 Testing if Application Exists in Database...');
  
  try {
    const response = await fetch('/api/applications?search=f4e3b35a-6df3-4a76-bbcc-135354800a8d');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Applications search result:', data);
      console.log('Applications found:', data.applications?.length || 0);
    } else {
      const errorText = await response.text();
      console.log('❌ Applications search error:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Application Screening Debugging...');
  console.log('=====================================');
  
  await testApplicationExists();
  await testApplicationEndpoint();
  await testApplicationScreening();
  
  console.log('\n✅ Debugging Complete!');
  console.log('=====================================');
  console.log('Next steps:');
  console.log('1. Check if application exists in database');
  console.log('2. Verify route files exist and are correct');
  console.log('3. Check build errors in Next.js');
  console.log('4. Test with a different application ID');
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testApplicationScreening = testApplicationScreening;
  window.testApplicationEndpoint = testApplicationEndpoint;
  window.testApplicationExists = testApplicationExists;
  window.runAllTests = runAllTests;
  
  console.log('🔧 Application screening debugging functions loaded!');
  console.log('Run window.runAllTests() to debug the screening endpoint');
}
