import { checkEnvironment, testResendConnection, testEmailSending } from './src/utils/test-resend.js';

console.log('=== RESEND TROUBLESHOOTING ===');
checkEnvironment();

if (process.env.RESEND_API_KEY) {
  console.log('\n=== TESTING CONNECTION ===');
  await testResendConnection();
  
  console.log('\n=== TESTING EMAIL SENDING ===');
  await testEmailSending();
} else {
  console.log('\n❌ Please set RESEND_API_KEY in your .env file first');
}
