import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Button } from '@react-email/button';
import { EmailLayout } from './EmailLayout';

interface PasswordResetEmailProps {
  resetLink: string;
  userEmail: string;
  expirationTime?: string;
  supportEmail?: string;
}

export const PasswordResetEmail = ({ 
  resetLink, 
  userEmail,
  expirationTime = '1 hour',
  supportEmail = 'support@futuristic-hr.com'
}: PasswordResetEmailProps) => (
  <EmailLayout 
    preview="Reset your Futuristic HR password"
    footerText="If you didn't request this password reset, you can safely ignore this email. Your account remains secure."
  >
    <Section>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <span style={{ fontSize: '40px' }}>🔐</span>
        </div>
        <Text style={{ color: '#1e293b', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
          Reset Your Password
        </Text>
        <Text style={{ color: '#64748b', fontSize: '16px', margin: '0' }}>
          Secure access to your Futuristic HR account
        </Text>
      </div>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        Hi there,
      </Text>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        We received a request to reset the password for your Futuristic HR account associated with <strong>{userEmail}</strong>. 
      </Text>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '32px' }}>
        Click the button below to reset your password. This link will expire in {expirationTime} for security reasons.
      </Text>
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button
          href={resetLink}
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
          Reset Password →
        </Button>
      </div>
      
      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          🔒 Security Notice
        </Text>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#f59e0b', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#78350f', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              This link expires in {expirationTime} for your security
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#f59e0b', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#78350f', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              If you didn't request this reset, please ignore this email
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#f59e0b', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#78350f', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              Never share this link with anyone
            </Text>
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#0c4a6e', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          🛡️ Tips for a Strong Password
        </Text>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              Use at least 12 characters
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              Include uppercase, lowercase, numbers, and symbols
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
            <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
              Avoid common words or personal information
            </Text>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e2e8f0' }}>
        <Text style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>
          Need help?
        </Text>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href={`mailto:${supportEmail}`} style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Contact Support
          </a>
          <a href="https://docs.futuristic-hr.com/security" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Security Guide
          </a>
        </div>
      </div>
    </Section>
  </EmailLayout>
);
