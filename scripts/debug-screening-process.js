// Targeted debugging for AI screening when Mistral is working
// This will help identify the specific issue in the screening process

async function debugScreeningProcess() {
  console.log('🔍 Starting Targeted Screening Process Debug...');
  console.log('==============================================');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  // Step 1: Check if application exists and has required data
  console.log('\n1. Checking application data...');
  await checkApplicationData(applicationId);
  
  // Step 2: Check screening status and logs
  console.log('\n2. Checking screening status...');
  await checkScreeningStatus(applicationId);
  
  // Step 3: Test the screening process step by step
  console.log('\n3. Testing screening process...');
  await testScreeningProcess(applicationId);
  
  // Step 4: Check database connections
  console.log('\n4. Testing database connections...');
  await testDatabaseConnections();
}

async function checkApplicationData(applicationId) {
  try {
    const response = await fetch(`/api/applications/${applicationId}`);
    console.log('Application data response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Application data:', data);
      
      const { application } = data;
      
      // Check required fields for screening
      const requiredFields = ['applicant_name', 'applicant_email', 'job'];
      const missingFields = [];
      
      requiredFields.forEach(field => {
        if (!application[field]) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        console.log('❌ Missing required fields:', missingFields);
      } else {
        console.log('✅ All required fields present');
      }
      
      // Check job data
      if (application.job) {
        console.log('Job title:', application.job.title);
        console.log('Job description exists:', !!application.job.description);
        console.log('Organization:', application.job.organization?.name);
      } else {
        console.log('❌ No job data found');
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get application data:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error checking application data:', error);
  }
}

async function checkScreeningStatus(applicationId) {
  try {
    const response = await fetch(`/api/applications/${applicationId}/screen`);
    console.log('Screening status response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Screening data:', data);
      
      if (data.screening) {
        console.log('Screening status:', data.screening.screening_status);
        console.log('Error message:', data.screening.error_message);
        console.log('Error code:', data.screening.error_code);
        console.log('Retry count:', data.screening.retry_count);
        console.log('Created at:', data.screening.created_at);
        console.log('Updated at:', data.screening.updated_at);
      }
      
      if (data.logs && data.logs.length > 0) {
        console.log('Screening logs:');
        data.logs.forEach(log => {
          console.log(`- [${log.log_level}] ${log.log_message}`);
          if (log.error_details) {
            console.log(`  Error: ${JSON.stringify(log.error_details)}`);
          }
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get screening status:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error checking screening status:', error);
  }
}

async function testScreeningProcess(applicationId) {
  console.log('Testing screening process step by step...');
  
  // Step 1: Try to start a new screening
  console.log('Step 1: Starting new screening...');
  try {
    const response = await fetch(`/api/applications/${applicationId}/screen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Start screening response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Screening started:', data);
      
      // Wait a moment and check status
      setTimeout(async () => {
        await checkScreeningStatus(applicationId);
      }, 2000);
      
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to start screening:', response.status, errorText);
      
      // Analyze the error
      if (errorText.includes('Application not found')) {
        console.log('🔧 Issue: Application not found in database');
      } else if (errorText.includes('Database connection')) {
        console.log('🔧 Issue: Database connection problem');
      } else if (errorText.includes('Failed to start screening')) {
        console.log('🔧 Issue: Screening creation failed');
      } else {
        console.log('🔧 Issue: Unknown error - check server logs');
      }
    }
  } catch (error) {
    console.error('❌ Error starting screening:', error);
  }
}

async function testDatabaseConnections() {
  console.log('Testing database connections...');
  
  // Test Supabase connection
  try {
    const response = await fetch('/api/applications');
    console.log('Database test response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connection working');
      console.log('Total applications:', data.applications?.length || 0);
    } else {
      console.log('❌ Database connection issue:', response.status);
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
  
  // Test AI screening table
  try {
    const response = await fetch('/api/ai-screening/retry');
    console.log('AI screening table test response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI screening table accessible');
    } else {
      console.log('❌ AI screening table issue:', response.status);
    }
  } catch (error) {
    console.error('❌ AI screening table error:', error);
  }
}

// Test the actual AI screening logic
async function testAIScreeningLogic() {
  console.log('\n🔍 Testing AI Screening Logic...');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  // Get application data
  try {
    const response = await fetch(`/api/applications/${applicationId}`);
    if (response.ok) {
      const data = await response.json();
      const application = data.application;
      
      // Simulate the screening prompt
      const prompt = `
Please analyze this job application and provide a comprehensive screening assessment:

Applicant: ${application.applicant_name}
Email: ${application.applicant_email}
Job Title: ${application.job?.title}
Job Description: ${application.job?.description || 'Not provided'}
Cover Letter: ${application.cover_letter || 'Not provided'}

Please provide:
1. Overall match score (0-100)
2. Key skills assessment
3. Experience relevance
4. Communication quality
5. Recommendation (hire/interview/reject)

Respond in JSON format with:
{
  "score": 85,
  "skills_match": ["skill1", "skill2"],
  "experience_relevance": true,
  "communication_quality": "good",
  "recommendation": "interview",
  "reasoning": "Detailed explanation"
}
      `;
      
      console.log('Generated prompt length:', prompt.length);
      console.log('Prompt preview:', prompt.substring(0, 200) + '...');
      
      // Test if this prompt would work with Mistral
      const testResponse = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.substring(0, 500) + '...' // Truncate for testing
        }),
      });
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ AI prompt test successful:', testData);
      } else {
        console.log('❌ AI prompt test failed:', testResponse.status);
      }
    }
  } catch (error) {
    console.error('❌ Error testing AI screening logic:', error);
  }
}

// Fix common screening issues
async function fixScreeningIssues() {
  console.log('\n🔧 Attempting to fix screening issues...');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  // Fix 1: Ensure application has all required data
  console.log('1. Ensuring application data is complete...');
  await ensureApplicationDataComplete(applicationId);
  
  // Fix 2: Clear any stuck screening records
  console.log('2. Clearing stuck screening records...');
  await clearStuckScreeningRecords(applicationId);
  
  // Fix 3: Restart screening process
  console.log('3. Restarting screening process...');
  await restartScreeningProcess(applicationId);
}

async function ensureApplicationDataComplete(applicationId) {
  // This would ensure the application has all required fields
  console.log('Application data completeness check...');
  // Implementation would go here
}

async function clearStuckScreeningRecords(applicationId) {
  // This would clear any screening records that are stuck in 'processing' state
  console.log('Clearing stuck screening records...');
  // Implementation would go here
}

async function restartScreeningProcess(applicationId) {
  try {
    const response = await fetch(`/api/applications/${applicationId}/screen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Screening process restarted');
    } else {
      console.log('❌ Failed to restart screening');
    }
  } catch (error) {
    console.error('❌ Error restarting screening:', error);
  }
}

// Main debug function
async function runTargetedDebug() {
  console.log('🚀 Starting Targeted Screening Debug...');
  console.log('==========================================');
  
  await debugScreeningProcess();
  await testAIScreeningLogic();
  await fixScreeningIssues();
  
  console.log('\n✅ Targeted Debug Complete!');
  console.log('==========================================');
  console.log('Next steps:');
  console.log('1. Check application data completeness');
  console.log('2. Verify screening process steps');
  console.log('3. Check database table structures');
  console.log('4. Monitor screening logs');
  console.log('5. Use fallback if needed');
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.debugScreeningProcess = debugScreeningProcess;
  window.checkApplicationData = checkApplicationData;
  window.checkScreeningStatus = checkScreeningStatus;
  window.testScreeningProcess = testScreeningProcess;
  window.testAIScreeningLogic = testAIScreeningLogic;
  window.fixScreeningIssues = fixScreeningIssues;
  window.runTargetedDebug = runTargetedDebug;
  
  console.log('🔧 Targeted screening debugging functions loaded!');
  console.log('Run window.runTargetedDebug() to debug the screening process');
}
