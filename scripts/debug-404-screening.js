// Comprehensive debugging script for the 404 error
// This will help us identify the exact cause of the screening endpoint 404

async function debugScreeningEndpoint() {
  console.log('🔍 Starting Comprehensive Screening Endpoint Debug...');
  console.log('================================================');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  // Step 1: Test if the application exists
  console.log('\n1. Testing if application exists...');
  try {
    const response = await fetch(`/api/applications?search=${applicationId}`);
    console.log('Application search status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Application search result:', data);
      console.log('Applications found:', data.applications?.length || 0);
      
      if (data.applications?.length > 0) {
        console.log('✅ Application exists:', data.applications[0]);
        await testScreeningEndpoint(applicationId);
      } else {
        console.log('❌ Application not found');
        await createTestApplication(applicationId);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Application search failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Application search error:', error);
  }
}

async function testScreeningEndpoint(applicationId) {
  console.log('\n2. Testing screening endpoint...');
  
  try {
    // Test GET request
    console.log('Testing GET request...');
    const getResponse = await fetch(`/api/applications/${applicationId}/screen`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('GET screening status:', getResponse.status);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET screening success:', data);
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET screening failed:', getResponse.status, errorText);
      
      // Test POST request
      console.log('Testing POST request...');
      const postResponse = await fetch(`/api/applications/${applicationId}/screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('POST screening status:', postResponse.status);
      
      if (postResponse.ok) {
        const data = await postResponse.json();
        console.log('✅ POST screening success:', data);
      } else {
        const postErrorText = await postResponse.text();
        console.log('❌ POST screening failed:', postResponse.status, postErrorText);
        
        // Analyze the error
        analyzeScreeningError(postResponse.status, postErrorText);
      }
    }
  } catch (error) {
    console.error('❌ Screening endpoint error:', error);
  }
}

async function createTestApplication(applicationId) {
  console.log('\n3. Creating test application...');
  
  try {
    // First, check if we have any jobs to reference
    const jobsResponse = await fetch('/api/jobs');
    let jobId = 'test-job-id';
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      if (jobsData.jobs?.length > 0) {
        jobId = jobsData.jobs[0].id;
        console.log('Using existing job:', jobId);
      }
    }
    
    // Create test application
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: applicationId, // Use the specific ID we're testing
        job_id: jobId,
        user_id: 'user_364WebGvJNOCngdeyz4qTP7wXXA',
        organization_id: 'org_35yQtFg3zHUHOYvunaXt5bxdzxb',
        applicant_name: 'Test User',
        applicant_email: 'test@example.com',
        platform: 'direct',
        application_source: 'direct',
        metadata: { test: true, created_for_debugging: true }
      }),
    });
    
    console.log('Create application status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test application created:', data);
      
      // Now test the screening endpoint
      await testScreeningEndpoint(applicationId);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to create test application:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error creating test application:', error);
  }
}

function analyzeScreeningError(status, errorText) {
  console.log('\n4. Analyzing screening error...');
  
  console.log('Error Status:', status);
  console.log('Error Text:', errorText);
  
  switch (status) {
    case 404:
      console.log('🔍 404 Analysis:');
      console.log('- Route file may not exist');
      console.log('- Application ID may not exist');
      console.log('- Route structure may be incorrect');
      console.log('- Next.js may need restart');
      break;
    case 500:
      console.log('🔍 500 Analysis:');
      console.log('- Server error in route handler');
      console.log('- Database connection issue');
      console.log('- Missing environment variables');
      break;
    case 401:
      console.log('🔍 401 Analysis:');
      console.log('- Authentication issue');
      console.log('- Missing user session');
      break;
    default:
      console.log('🔍 Other Error Analysis:');
      console.log('- Unexpected error occurred');
      console.log('- Check server logs');
  }
  
  console.log('\n🔧 Suggested fixes:');
  console.log('1. Run the SQL debug script to check database');
  console.log('2. Restart the Next.js server');
  console.log('3. Check route file exists and is correct');
  console.log('4. Verify environment variables');
  console.log('5. Check browser console for JavaScript errors');
}

async function testRouteStructure() {
  console.log('\n5. Testing route structure...');
  
  const testRoutes = [
    '/api/applications',
    '/api/applications/test-id',
    '/api/applications/test-id/screen',
    '/api/applications/candidate/test-candidate-id'
  ];
  
  for (const route of testRoutes) {
    try {
      const response = await fetch(route);
      console.log(`Route ${route}:`, response.status);
    } catch (error) {
      console.log(`Route ${route}:`, 'ERROR', error.message);
    }
  }
}

// Main debug function
async function runCompleteDebug() {
  console.log('🚀 Starting Complete 404 Debug...');
  console.log('=====================================');
  
  await debugScreeningEndpoint();
  await testRouteStructure();
  
  console.log('\n✅ Debug Complete!');
  console.log('=====================================');
  console.log('Next steps:');
  console.log('1. Run the SQL debug script');
  console.log('2. Check the application exists in database');
  console.log('3. Verify route files exist');
  console.log('4. Restart Next.js server if needed');
  console.log('5. Check environment variables');
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.debugScreeningEndpoint = debugScreeningEndpoint;
  window.testScreeningEndpoint = testScreeningEndpoint;
  window.createTestApplication = createTestApplication;
  window.analyzeScreeningError = analyzeScreeningError;
  window.testRouteStructure = testRouteStructure;
  window.runCompleteDebug = runCompleteDebug;
  
  console.log('🔧 Complete 404 debugging functions loaded!');
  console.log('Run window.runCompleteDebug() to debug the screening endpoint');
}
