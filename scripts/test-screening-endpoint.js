// Test the application screening endpoint after fixing the route files
async function testScreeningEndpoint() {
  console.log('🔍 Testing Application Screening Endpoint...');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  try {
    // Test GET request first
    console.log('1. Testing GET request...');
    const getResponse = await fetch(`/api/applications/${applicationId}/screen`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('GET Screen endpoint status:', getResponse.status);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET Screen endpoint success:', data);
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET Screen endpoint error:', getResponse.status, errorText);
      
      // Try POST request if GET fails
      console.log('2. Testing POST request...');
      const postResponse = await fetch(`/api/applications/${applicationId}/screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('POST Screen endpoint status:', postResponse.status);
      
      if (postResponse.ok) {
        const data = await postResponse.json();
        console.log('✅ POST Screen endpoint success:', data);
      } else {
        const postErrorText = await postResponse.text();
        console.log('❌ POST Screen endpoint error:', postResponse.status, postErrorText);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test if the application exists
async function testApplicationExists() {
  console.log('🔍 Testing if Application Exists...');
  
  try {
    const response = await fetch('/api/applications?search=f4e3b35a-6df3-4a76-bbcc-135354800a8d');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Applications search result:', data);
      console.log('Applications found:', data.applications?.length || 0);
      
      if (data.applications?.length > 0) {
        console.log('✅ Application exists, details:', data.applications[0]);
      } else {
        console.log('❌ Application not found, creating test application...');
        await createTestApplication();
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Applications search error:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Create a test application if none exists
async function createTestApplication() {
  console.log('🔧 Creating Test Application...');
  
  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: 'test-job-id',
        user_id: 'user_364WebGvJNOCngdeyz4qTP7wXXA',
        organization_id: 'org_35yQtFg3zHUHOYvunaXt5bxdzxb',
        applicant_name: 'Test User',
        applicant_email: 'test@example.com',
        platform: 'direct',
        application_source: 'direct',
        metadata: { test: true }
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test application created:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to create test application:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error creating test application:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Complete Screening Endpoint Test...');
  console.log('=====================================');
  
  await testApplicationExists();
  await testScreeningEndpoint();
  
  console.log('\n✅ Testing Complete!');
  console.log('=====================================');
  console.log('Next steps:');
  console.log('1. Check if application exists in database');
  console.log('2. Verify screening endpoint is accessible');
  console.log('3. Test AI screening functionality');
  console.log('4. Check for any remaining 404 errors');
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testScreeningEndpoint = testScreeningEndpoint;
  window.testApplicationExists = testApplicationExists;
  window.createTestApplication = createTestApplication;
  window.runAllTests = runAllTests;
  
  console.log('🔧 Screening endpoint testing functions loaded!');
  console.log('Run window.runAllTests() to test the screening endpoint');
}
