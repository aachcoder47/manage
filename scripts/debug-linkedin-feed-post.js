// LinkedIn permission debugging script
// This will help identify why LinkedIn feed posts are not working

// Test 1: Check LinkedIn app permissions
async function testLinkedInPermissions() {
  console.log('🔍 Testing LinkedIn Permissions...');
  
  // Check what permissions the app has
  const scopes = [
    'openid',
    'profile', 
    'email',
    'w_member_social', // Required for feed posts
    'w_organization_social' // Not required for feed posts
  ];
  
  console.log('Required permissions for feed posts:', scopes);
  console.log('Current app permissions: Check LinkedIn Developer Portal');
  
  return {
    required: scopes,
    message: 'Check your LinkedIn Developer Portal app permissions'
  };
}

// Test 2: Check LinkedIn integration status
async function testLinkedInIntegration() {
  console.log('🔍 Testing LinkedIn Integration...');
  
  try {
    const response = await fetch('/api/job-boards/integrations?organization_id=org_35yQtFg3zHUHOYvunaXt5bxdzxb');
    const data = await response.json();
    
    const linkedinIntegration = data.integrations?.find(i => i.platform === 'linkedin');
    
    if (!linkedinIntegration) {
      console.log('❌ No LinkedIn integration found');
      return { success: false, error: 'No LinkedIn integration' };
    }
    
    console.log('✅ LinkedIn integration found:', linkedinIntegration);
    console.log('Status:', linkedinIntegration.status);
    console.log('Has token:', !!linkedinIntegration.access_token);
    console.log('Token expires:', linkedinIntegration.token_expires_at);
    
    // Check if token is expired
    if (linkedinIntegration.token_expires_at) {
      const expiresAt = new Date(linkedinIntegration.token_expires_at);
      const now = new Date();
      const isExpired = expiresAt < now;
      
      console.log('Token expired:', isExpired);
      
      if (isExpired) {
        return { success: false, error: 'LinkedIn access token expired' };
      }
    }
    
    return { success: true, integration: linkedinIntegration };
  } catch (error) {
    console.error('❌ Error checking LinkedIn integration:', error);
    return { success: false, error: error.message };
  }
}

// Test 3: Test LinkedIn API endpoints
async function testLinkedInAPI() {
  console.log('🔍 Testing LinkedIn API Endpoints...');
  
  try {
    // Test 1: Get user profile
    console.log('Testing LinkedIn profile endpoint...');
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:(id)', {
      headers: {
        'Authorization': 'Bearer test_token', // We'll need real token
      },
    });
    
    console.log('Profile endpoint status:', profileResponse.status);
    
    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      console.log('Profile endpoint error:', error);
      
      if (profileResponse.status === 403) {
        console.log('❌ Permission denied for profile endpoint');
        console.log('Required: w_member_social permission');
        console.log('Check LinkedIn Developer Portal app permissions');
      }
    }
    
    // Test 2: Get user info (alternative endpoint)
    console.log('Testing LinkedIn me endpoint...');
    const meResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': 'Bearer test_token', // We'll need real token
      },
    });
    
    console.log('Me endpoint status:', meResponse.status);
    
    if (!meResponse.ok) {
      const error = await meResponse.text();
      console.log('Me endpoint error:', error);
      
      if (meResponse.status === 403) {
        console.log('❌ Permission denied for me endpoint');
        console.log('Required: w_member_social permission');
        console.log('Check LinkedIn Developer Portal app permissions');
      }
    }
    
    return {
      profileStatus: profileResponse.status,
      meStatus: meResponse.status,
      message: 'Both endpoints require w_member_social permission'
    };
  } catch (error) {
    console.error('❌ Error testing LinkedIn API:', error);
    return { error: error.message };
  }
}

// Test 4: Check LinkedIn app configuration
function checkLinkedInAppConfig() {
  console.log('🔍 Checking LinkedIn App Configuration...');
  
  const config = {
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'Set' : 'Not set',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI,
  };
  
  console.log('LinkedIn App Configuration:', config);
  
  if (!config.clientId) {
    console.log('❌ NEXT_PUBLIC_LINKEDIN_CLIENT_ID not set');
    return { error: 'LinkedIn client ID not configured' };
  }
  
  if (!config.clientSecret) {
    console.log('❌ LINKEDIN_CLIENT_SECRET not set');
    return { error: 'LinkedIn client secret not configured' };
  }
  
  if (!config.redirectUri) {
    console.log('❌ LINKEDIN_REDIRECT_URI not set');
    return { error: 'LinkedIn redirect URI not configured' };
  }
  
  console.log('✅ LinkedIn app configuration looks good');
  return { success: true, config };
}

// Test 5: Generate LinkedIn OAuth URL
function generateLinkedInOAuthURL() {
  console.log('🔍 Generating LinkedIn OAuth URL...');
  
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/job-boards/linkedin/callback';
  const userId = 'test-user-id';
  
  const scopes = [
    'openid',
    'profile',
    'email',
    'w_member_social', // Required for feed posts
    'w_organization_social' // Not required but good to have
  ];
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: userId,
    scope: scopes.join(' '),
  });
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  
  console.log('LinkedIn OAuth URL:', authUrl);
  console.log('Required permissions:', scopes);
  console.log('Redirect URI:', redirectUri);
  
  return { authUrl, scopes, redirectUri };
}

// Run all tests
async function runAllTests() {
  console.log('🔍 LinkedIn Feed Post Debugging');
  console.log('=====================================');
  
  console.log('1. Checking LinkedIn app configuration...');
  const configResult = checkLinkedInAppConfig();
  
  console.log('\n2. Testing LinkedIn integration...');
  const integrationResult = await testLinkedInIntegration();
  
  console.log('\n3. Testing LinkedIn API endpoints...');
  const apiResult = await testLinkedInAPI();
  
  console.log('\n4. Testing LinkedIn permissions...');
  const permissionsResult = testLinkedInPermissions();
  
  console.log('\n5. Generating LinkedIn OAuth URL...');
  const oauthResult = generateLinkedInOAuthURL();
  
  console.log('\n✅ Debugging Complete!');
  console.log('=====================================');
  console.log('Results:');
  console.log('Config:', configResult);
  console.log('Integration:', integrationResult);
  console.log('API:', apiResult);
  console.log('Permissions:', permissionsResult);
  console.log('OAuth URL:', oauthResult);
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check LinkedIn Developer Portal app permissions');
  console.log('2. Ensure w_member_social permission is requested');
  console.log('3. Verify redirect URI matches app settings');
  console.log('4. Reconnect LinkedIn if permissions changed');
  console.log('5. Test feed post after fixing permissions');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugLinkedInFeedPost = runAllTests;
  console.log('🔧 LinkedIn feed post debugging functions loaded. Run window.debugLinkedInFeedPost() to debug.');
}
