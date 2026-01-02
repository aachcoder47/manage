// Debug the 404 error for interview application
// This will help identify why the screening endpoint is still returning 404

async function debugInterview404Error() {
  console.log('🔍 Starting Interview 404 Error Debug...');
  console.log('==========================================');
  
  const applicationId = 'd5167e49-7215-4cea-8bd9-8e24293b6dab';
  
  // Step 1: Check if the application exists in database
  console.log('\n1. Checking if application exists in database...');
  await checkApplicationInDatabase(applicationId);
  
  // Step 2: Test the base applications endpoint
  console.log('\n2. Testing base applications endpoint...');
  await testBaseApplicationsEndpoint();
  
  // Step 3: Test the specific application endpoint
  console.log('\n3. Testing specific application endpoint...');
  await testSpecificApplicationEndpoint(applicationId);
  
  // Step 4: Test the screening endpoint directly
  console.log('\n4. Testing screening endpoint directly...');
  await testScreeningEndpoint(applicationId);
  
  // Step 5: Check route structure
  console.log('\n5. Checking route structure...');
  await checkRouteStructure();
}

async function checkApplicationInDatabase(applicationId) {
  try {
    const response = await fetch('/api/applications');
    console.log('Base applications endpoint status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Total applications:', data.applications?.length || 0);
      
      // Look for our specific application
      const targetApp = data.applications?.find(app => app.id === applicationId);
      
      if (targetApp) {
        console.log('✅ Application found in database:', targetApp);
        console.log('Applicant name:', targetApp.applicant_name);
        console.log('Platform:', targetApp.platform);
        console.log('Organization:', targetApp.job?.organization?.name);
        return true;
      } else {
        console.log('❌ Application not found in database');
        console.log('Available application IDs:');
        data.applications?.forEach(app => {
          console.log(`- ${app.id}: ${app.applicant_name}`);
        });
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get applications:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking database:', error);
    return false;
  }
}

async function testBaseApplicationsEndpoint() {
  try {
    const response = await fetch('/api/applications');
    console.log('Base endpoint test:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Base endpoint working');
      console.log('Applications count:', data.applications?.length || 0);
    } else {
      const errorText = await response.text();
      console.log('❌ Base endpoint failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Base endpoint error:', error);
  }
}

async function testSpecificApplicationEndpoint(applicationId) {
  try {
    const response = await fetch(`/api/applications/${applicationId}`);
    console.log('Specific application endpoint status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Specific application endpoint working');
      console.log('Application data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Specific application endpoint failed:', response.status, errorText);
      
      if (response.status === 404) {
        console.log('🔍 This suggests the application doesn\'t exist or the route isn\'t working');
      }
    }
  } catch (error) {
    console.error('❌ Specific application endpoint error:', error);
  }
}

async function testScreeningEndpoint(applicationId) {
  try {
    // Test GET request
    console.log('Testing GET screening endpoint...');
    const getResponse = await fetch(`/api/applications/${applicationId}/screen`);
    console.log('GET screening endpoint status:', getResponse.status);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET screening endpoint working:', data);
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET screening endpoint failed:', getResponse.status, errorText);
      
      // Test POST request
      console.log('Testing POST screening endpoint...');
      const postResponse = await fetch(`/api/applications/${applicationId}/screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('POST screening endpoint status:', postResponse.status);
      
      if (postResponse.ok) {
        const data = await postResponse.json();
        console.log('✅ POST screening endpoint working:', data);
      } else {
        const postErrorText = await postResponse.text();
        console.log('❌ POST screening endpoint failed:', postResponse.status, postErrorText);
      }
    }
  } catch (error) {
    console.error('❌ Screening endpoint error:', error);
  }
}

async function checkRouteStructure() {
  console.log('Checking route structure...');
  
  // Test various route patterns to understand what's working
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
      
      if (response.status === 404) {
        console.log(`  -> Route not found (404)`);
      } else if (response.status === 500) {
        console.log(`  -> Route exists but has server error (500)`);
      } else if (response.ok) {
        console.log(`  -> Route working (${response.status})`);
      } else {
        console.log(`  -> Route exists but returned ${response.status}`);
      }
    } catch (error) {
      console.log(`Route ${route}:`, 'ERROR', error.message);
    }
  }
}

// Create the application if it doesn't exist
async function createInterviewApplicationIfMissing() {
  console.log('\n🔧 Creating interview application if missing...');
  
  const applicationId = 'd5167e49-7215-4cea-8bd9-8e24293b6dab';
  
  try {
    // Get a job to reference
    const jobsResponse = await fetch('/api/jobs');
    let jobId = 'test-job-id';
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      if (jobsData.jobs?.length > 0) {
        jobId = jobsData.jobs[0].id;
        console.log('Using existing job:', jobId);
      }
    }
    
    // Create the interview application
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: applicationId,
        job_id: jobId,
        user_id: 'user_364WebGvJNOCngdeyz4qTP7wXXA',
        organization_id: 'org_364aEa8oLmqpjqZhuWm7sdaqSQz',
        applicant_name: 'Interview Candidate',
        applicant_email: 'interview.candidate@example.com',
        platform: 'direct',
        application_source: 'direct',
        metadata: { 
          test: true, 
          created_for_interview: true,
          debugging_purpose: 'interview_screening_404_error'
        }
      }),
    });
    
    console.log('Create application status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Interview application created:', data);
      
      // Now test the screening endpoint
      setTimeout(async () => {
        await testScreeningEndpoint(applicationId);
      }, 1000);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to create interview application:', response.status, errorText);
      
      if (errorText.includes('already exists')) {
        console.log('✅ Application already exists, proceeding with tests...');
        setTimeout(async () => {
          await testScreeningEndpoint(applicationId);
        }, 1000);
      }
    }
  } catch (error) {
    console.error('❌ Error creating interview application:', error);
  }
}

// Main debug function
async function runComplete404Debug() {
  console.log('🚀 Starting Complete 404 Debug...');
  console.log('==========================================');
  
  await debugInterview404Error();
  
  // Check if we need to create the application
  const exists = await checkApplicationInDatabase('d5167e49-7215-4cea-8bd9-8e24293b6dab');
  
  if (!exists) {
    console.log('\n🔧 Application doesn\'t exist, creating it...');
    await createInterviewApplicationIfMissing();
  }
  
  console.log('\n✅ 404 Debug Complete!');
  console.log('==========================================');
  console.log('Next steps:');
  console.log('1. Check if application exists in database');
  console.log('2. Verify route files exist and are correct');
  console.log('3. Test screening endpoint functionality');
  console.log('4. Check Next.js route structure');
  console.log('5. Verify async params are working correctly');
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.debugInterview404Error = debugInterview404Error;
  window.checkApplicationInDatabase = checkApplicationInDatabase;
  window.testBaseApplicationsEndpoint = testBaseApplicationsEndpoint;
  window.testSpecificApplicationEndpoint = testSpecificApplicationEndpoint;
  window.testScreeningEndpoint = testScreeningEndpoint;
  window.checkRouteStructure = checkRouteStructure;
  window.createInterviewApplicationIfMissing = createInterviewApplicationIfMissing;
  window.runComplete404Debug = runComplete404Debug;
  
  console.log('🔧 404 debugging functions loaded!');
  console.log('Run window.runComplete404Debug() to debug the 404 error');
}
