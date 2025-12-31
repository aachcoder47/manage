import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Button } from '@react-email/button';
import { EmailLayout } from './EmailLayout';

interface WelcomeEmailProps {
  name: string;
  userEmail: string;
  organizationName?: string;
  dashboardUrl?: string;
}

export const WelcomeEmail = ({ 
  name, 
  userEmail, 
  organizationName = 'Your Organization',
  dashboardUrl = 'https://app.futuristic-hr.com/dashboard'
}: WelcomeEmailProps) => {
  return (
  <EmailLayout 
    preview={`Welcome to Futuristic HR, ${name}! Your AI-powered hiring journey begins`}
    footerText="Welcome to the future of hiring! This email contains important information about your new account."
  >
    <Section>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <span style={{ fontSize: '40px' }}>🚀</span>
        </div>
        <Text style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
          Welcome to Futuristic HR
        </Text>
        <Text style={{ color: '#64748b', fontSize: '16px', margin: '0' }}>
          Your AI-powered hiring platform is ready
        </Text>
      </div>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        Hi {name},
      </Text>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        Welcome to the future of hiring! We&apos;re thrilled to have you join <strong>{organizationName}</strong> on this journey. Your Futuristic HR account is now active and ready to transform your hiring process.
      </Text>
      
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
        <Text style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          ✨ What You Can Do Now
        </Text>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
            <div>
              <Text style={{ color: '#334155', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Create AI-Powered Interviews
              </Text>
              <Text style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>
                Design intelligent interviews that adapt to candidate responses
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <div>
              <Text style={{ color: '#334155', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Screen Candidates Automatically
              </Text>
              <Text style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>
                Let AI analyze resumes and rank candidates instantly
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            <div>
              <Text style={{ color: '#334155', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Get AI Insights
              </Text>
              <Text style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>
                Receive detailed candidate analysis and predictions
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⏱️</span>
            <div>
              <Text style={{ color: '#334155', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Save 90% of Hiring Time
              </Text>
              <Text style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>
                Automate repetitive tasks and focus on what matters
              </Text>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <Button
          href={dashboardUrl}
          className="button"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            display: 'inline-block'
          }}
        >
          Go to Dashboard →
        </Button>
      </div>
      
      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          💡 Pro Tip
        </Text>
        <Text style={{ color: '#78350f', fontSize: '13px', lineHeight: '20px', margin: '0' }}>
          Start by creating your first interview template. Our AI will guide you through the process and help you set up questions tailored to your role.
        </Text>
      </div>
      
      <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e2e8f0' }}>
        <Text style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
          Need help getting started?
        </Text>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href="mailto:support@futuristic-hr.com" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Email Support
          </a>
          <a href="https://docs.futuristic-hr.com" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Documentation
          </a>
          <a href="https://calendly.com/futuristic-hr/demo" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Schedule Demo
          </a>
        </div>
      </div>
    </Section>
  </EmailLayout>
  );
};
