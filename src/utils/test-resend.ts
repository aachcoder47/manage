import { Resend } from 'resend';

// Test Resend configuration
const resend = new Resend('re_test_key_placeholder');

export async function testResendConnection() {
  try {
    console.log('Testing Resend connection...');
    
    // Test API key validity
    const { data, error } = await resend.domains.list();
    
    if (error) {
      console.error('Resend API Key Error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Resend connection successful');
    console.log('Available domains:', data);
    
    return { success: true, domains: data };
  } catch (error) {
    console.error('Resend connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function testEmailSending() {
  try {
    console.log('Testing email sending...');
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@futuristiccreations.store',
      to: 'test@example.com', // Replace with your test email
      subject: 'Test Email from Futuristic HR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">Test Email</h2>
          <p style="color: #374151;">This is a test email to verify Resend is working.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; color: #1f2937;">If you receive this email, Resend is properly configured!</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email sending test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Environment check
export function checkEnvironment() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  
  console.log('Environment Check:');
  console.log('RESEND_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
  console.log('RESEND_FROM_EMAIL:', fromEmail ? `✅ ${fromEmail}` : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  
  if (!apiKey) {
    console.error('\n❌ RESEND_API_KEY is not set in environment variables');
    console.log('Please add your Resend API key to your .env file:');
    console.log('RESEND_API_KEY=re_your_actual_resend_api_key_here');
  }
  
  if (!fromEmail) {
    console.error('\n❌ RESEND_FROM_EMAIL is not set');
    console.log('Please add your sender email to your .env file:');
    console.log('RESEND_FROM_EMAIL=onboarding@futuristiccreations.store');
  }
  
  return { apiKey: !!apiKey, fromEmail: !!fromEmail };
}
