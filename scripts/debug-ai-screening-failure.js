// Debug AI screening failures
// This will help identify why the AI screening is failing and provide fixes

async function debugAIScreeningFailure() {
  console.log('🔍 Starting AI Screening Failure Debug...');
  console.log('==========================================');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  // Step 1: Check screening status
  console.log('\n1. Checking screening status...');
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
        
        // Analyze the failure
        analyzeScreeningFailure(data.screening);
      }
      
      if (data.logs) {
        console.log('Screening logs:', data.logs);
        analyzeScreeningLogs(data.logs);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get screening status:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error checking screening status:', error);
  }
  
  // Step 2: Test environment variables
  console.log('\n2. Testing environment variables...');
  await testEnvironmentVariables();
  
  // Step 3: Test AI service directly
  console.log('\n3. Testing AI service...');
  await testAIService();
  
  // Step 4: Try to restart screening
  console.log('\n4. Attempting to restart screening...');
  await restartScreening(applicationId);
}

function analyzeScreeningFailure(screening) {
  console.log('\n🔍 Analyzing screening failure...');
  
  const { error_message, error_code, screening_status } = screening;
  
  console.log('Failure Analysis:');
  console.log('- Status:', screening_status);
  console.log('- Error Code:', error_code);
  console.log('- Error Message:', error_message);
  
  // Common failure patterns
  if (error_message?.includes('API key')) {
    console.log('🔧 Issue: Mistral API key problem');
    console.log('Solution: Check MISTRAL_API_KEY environment variable');
  } else if (error_message?.includes('quota')) {
    console.log('🔧 Issue: API quota exceeded');
    console.log('Solution: Check Mistral API quota or upgrade plan');
  } else if (error_message?.includes('unavailable')) {
    console.log('🔧 Issue: Mistral service unavailable');
    console.log('Solution: Wait and retry, or check service status');
  } else if (error_message?.includes('timeout')) {
    console.log('🔧 Issue: Request timeout');
    console.log('Solution: Increase timeout or reduce prompt size');
  } else if (error_message?.includes('JSON')) {
    console.log('🔧 Issue: JSON parsing error');
    console.log('Solution: Check AI response format');
  } else {
    console.log('🔧 Issue: Unknown error');
    console.log('Solution: Check server logs for more details');
  }
}

function analyzeScreeningLogs(logs) {
  console.log('\n🔍 Analyzing screening logs...');
  
  const errorLogs = logs.filter(log => log.log_level === 'error');
  const infoLogs = logs.filter(log => log.log_level === 'info');
  
  console.log('Error Logs:', errorLogs.length);
  errorLogs.forEach(log => {
    console.log(`- ${log.log_message}: ${log.error_details?.error_type || 'Unknown'}`);
  });
  
  console.log('Info Logs:', infoLogs.length);
  infoLogs.forEach(log => {
    console.log(`- ${log.log_message}`);
  });
}

async function testEnvironmentVariables() {
  console.log('Testing environment configuration...');
  
  // Test if the API endpoint can reach environment variables
  try {
    const response = await fetch('/api/test-env');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Environment test:', data);
    } else {
      console.log('❌ Environment test failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Environment test error:', error);
  }
  
  // Manual check of common environment variables
  console.log('Environment Variables Check:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  console.log('- MISTRAL_API_KEY:', process.env.MISTRAL_API_KEY ? '✅ Set' : '❌ Missing');
}

async function testAIService() {
  console.log('Testing AI service directly...');
  
  try {
    const response = await fetch('/api/test-ai');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI service test:', data);
    } else {
      console.log('❌ AI service test failed:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ AI service test error:', error);
  }
}

async function restartScreening(applicationId) {
  console.log('Attempting to restart screening...');
  
  try {
    const response = await fetch(`/api/applications/${applicationId}/screen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Restart screening response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Screening restarted:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to restart screening:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error restarting screening:', error);
  }
}

// Create test endpoints for debugging
async function createTestEndpoints() {
  console.log('Creating test endpoints for debugging...');
  
  // This would create test endpoints if they don't exist
  console.log('Test endpoints needed:');
  console.log('- /api/test-env - Test environment variables');
  console.log('- /api/test-ai - Test AI service directly');
  console.log('- /api/applications/retry-all - Retry all failed screenings');
}

// Fix common AI screening issues
async function fixCommonIssues() {
  console.log('\n🔧 Attempting to fix common issues...');
  
  // Fix 1: Retry failed screenings
  console.log('1. Retrying failed screenings...');
  try {
    const response = await fetch('/api/ai-screening/retry', {
      method: 'POST',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Retry initiated:', data);
    } else {
      console.log('❌ Retry failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Retry error:', error);
  }
  
  // Fix 2: Check if we need to create a simpler screening process
  console.log('2. Creating fallback screening...');
  await createFallbackScreening();
}

async function createFallbackScreening() {
  console.log('Creating fallback screening process...');
  
  const applicationId = 'f4e3b35a-6df3-4a76-bbcc-135354800a8d';
  
  try {
    const response = await fetch(`/api/applications/${applicationId}/screen/fallback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Fallback screening created:', data);
    } else {
      console.log('❌ Fallback screening failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Fallback screening error:', error);
  }
}

// Main debug function
async function runCompleteAIDebug() {
  console.log('🚀 Starting Complete AI Screening Debug...');
  console.log('==========================================');
  
  await debugAIScreeningFailure();
  await fixCommonIssues();
  
  console.log('\n✅ AI Debug Complete!');
  console.log('==========================================');
  console.log('Next steps:');
  console.log('1. Check Mistral API key configuration');
  console.log('2. Verify API quota and limits');
  console.log('3. Check server logs for detailed errors');
  console.log('4. Consider using fallback screening');
  console.log('5. Test with a simpler AI model');
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.debugAIScreeningFailure = debugAIScreeningFailure;
  window.analyzeScreeningFailure = analyzeScreeningFailure;
  window.analyzeScreeningLogs = analyzeScreeningLogs;
  window.testEnvironmentVariables = testEnvironmentVariables;
  window.testAIService = testAIService;
  window.restartScreening = restartScreening;
  window.fixCommonIssues = fixCommonIssues;
  window.runCompleteAIDebug = runCompleteAIDebug;
  
  console.log('🔧 AI screening debugging functions loaded!');
  console.log('Run window.runCompleteAIDebug() to debug AI screening failures');
}
