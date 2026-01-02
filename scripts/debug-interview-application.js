// Debug the interview application 404 error
// This will help identify why the new application ID is not found

async function debugInterviewApplication() {
  console.log('🔍 Starting Interview Application Debug...');
  console.log('==========================================');
  
  const applicationId = 'd5167e49-7215-4cea-8bd9-8e24293b6dab';
  
  // Step 1: Check if this application exists
  console.log('\n1. Checking if interview application exists...');
  await checkInterviewApplicationExists(applicationId);
  
  // Step 2: Test the screening endpoint for this application
  console.log('\n2. Testing screening endpoint for interview application...');
  await testInterviewScreening(applicationId);
  
  // Step 3: Check what applications do exist
  console.log('\n3. Checking what applications exist...');
  await checkExistingApplications();
  
  // Step 4: Create the application if it doesn't exist
  console.log('\n4. Creating interview application if needed...');
  await createInterviewApplicationIfNeeded(applicationId);
}

async function checkInterviewApplicationExists(applicationId) {
  try {
    const response = await fetch(`/api/applications?search=${applicationId}`);
    console.log('Interview application search status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Search result:', data);
      console.log('Applications found:', data.applications?.length || 0);
      
      if (data.applications?.length > 0) {
        console.log('✅ Interview application exists:', data.applications[0]);
        return true;
      } else {
        console.log('❌ Interview application not found');
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Search failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Search error:', error);
    return false;
  }
}

async function testInterviewScreening(applicationId) {
  try {
    // Test GET request
    console.log('Testing GET screening endpoint...');
    const getResponse = await fetch(`/api/applications/${applicationId}/screen`);
    console.log('GET screening status:', getResponse.status);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET screening success:', data);
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET screening failed:', getResponse.status, errorText);
      
      // Test POST request
      console.log('Testing POST screening endpoint...');
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
      }
    }
  } catch (error) {
    console.error('❌ Screening test error:', error);
  }
}

async function checkExistingApplications() {
  try {
    const response = await fetch('/api/applications');
    console.log('All applications status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ All applications:', data);
      console.log('Total applications:', data.applications?.length || 0);
      
      if (data.applications?.length > 0) {
        console.log('Existing application IDs:');
        data.applications.forEach(app => {
          console.log(`- ${app.id}: ${app.applicant_name} (${app.platform})`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get applications:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error getting applications:', error);
  }
}

async function createInterviewApplicationIfNeeded(applicationId) {
  console.log('Checking if interview application needs to be created...');
  
  // First check if it exists
  const exists = await checkInterviewApplicationExists(applicationId);
  
  if (!exists) {
    console.log('Creating interview application...');
    
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
        await testInterviewScreening(applicationId);
      } else {
        const errorText = await response.text();
        console.log('❌ Failed to create interview application:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error creating interview application:', error);
    }
  } else {
    console.log('✅ Interview application already exists');
  }
}

// Test the interview flow
async function testInterviewFlow() {
  console.log('\n🔍 Testing Complete Interview Flow...');
  
  const applicationId = 'd5167e49-7215-4cea-8bd9-8e24293b6dab';
  
  // Step 1: Create application
  await createInterviewApplicationIfNeeded(applicationId);
  
  // Step 2: Start screening
  console.log('\nStarting screening for interview candidate...');
  try {
    const response = await fetch(`/api/applications/${applicationId}/screen`, {
      method: 'POST',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Screening started:', data);
    } else {
      console.log('❌ Screening failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Screening error:', error);
  }
  
  // Step 3: Check screening status after a delay
  setTimeout(async () => {
    console.log('\nChecking screening status...');
    try {
      const response = await fetch(`/api/applications/${applicationId}/screen`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Screening status:', data);
      } else {
        console.log('❌ Status check failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Status check error:', error);
    }
  }, 3000);
}

// Main debug function
async function runInterviewDebug() {
  console.log('🚀 Starting Interview Application Debug...');
  console.log('==========================================');
  
  await debugInterviewApplication();
  await testInterviewFlow();
  
  console.log('\n✅ Interview Debug Complete!');
  console.log('==========================================');
  console.log('Next steps:');
  console.log('1. Run the SQL script to create the application');
  console.log('2. Test the screening endpoint');
  console.log('3. Verify the interview flow works');
  console.log('4. Check for any remaining 404 errors');
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.debugInterviewApplication = debugInterviewApplication;
  window.checkInterviewApplicationExists = checkInterviewApplicationExists;
  window.testInterviewScreening = testInterviewScreening;
  window.checkExistingApplications = checkExistingApplications;
  window.createInterviewApplicationIfNeeded = createInterviewApplicationIfNeeded;
  window.testInterviewFlow = testInterviewFlow;
  window.runInterviewDebug = runInterviewDebug;
  
  console.log('🔧 Interview application debugging functions loaded!');
  console.log('Run window.runInterviewDebug() to debug the interview application');
}
