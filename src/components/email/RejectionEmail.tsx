import { EmailLayout } from './EmailLayout';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Button } from '@react-email/button';

interface RejectionEmailProps {
  candidateName: string;
  positionTitle: string;
  organizationName: string;
  rejectionReason?: string;
  dashboardUrl?: string;
}

export const RejectionEmail = ({
  candidateName,
  positionTitle,
  organizationName = 'Your Organization',
  rejectionReason = 'We have decided to move forward with other candidates whose qualifications more closely match our current needs.',
  dashboardUrl = 'https://app.futuristic-hr.com/jobs'
}: RejectionEmailProps) => {
  return (
    <EmailLayout
      preview={`Update on your application for ${positionTitle} at ${organizationName}`}
      footerText="We appreciate your interest in joining our team. Your profile will remain in our database for future opportunities."
    >
      <Section>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            backgroundColor: '#fee2e2',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ fontSize: '24px' }}>📋</span>
          </div>
          <h1 style={{ 
            color: '#1f2937', 
            fontSize: '24px', 
            fontWeight: '600',
            margin: '0',
            lineHeight: '32px'
          }}>
            Application Update
          </h1>
        </div>

        {/* Main Message */}
        <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
          Dear <strong>{candidateName}</strong>,
        </Text>

        <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '32px' }}>
          Thank you for your interest in the <strong>{positionTitle}</strong> position at <strong>{organizationName}</strong>. 
          We appreciate the time and effort you invested in your application and interview process.
        </Text>

        {/* Decision */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            color: '#d97706', 
            fontSize: '18px', 
            fontWeight: '600',
            margin: '0 0 16px 0',
            lineHeight: '24px'
          }}>
            Application Status: Not Moving Forward
          </h2>
          
          <Text style={{ color: '#92400e', fontSize: '16px', lineHeight: '24px', margin: '0' }}>
            {rejectionReason}
          </Text>
        </div>

        {/* Encouragement */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <Text style={{ color: '#0c4a6e', fontSize: '15px', lineHeight: '22px', margin: '0' }}>
            <strong>Why this isn&apos;t the end:</strong>
          </Text>
          <ul style={{ 
            color: '#475569', 
            fontSize: '14px', 
            lineHeight: '20px',
            margin: '12px 0 0 0',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}>Your profile will remain in our talent database</li>
            <li style={{ marginBottom: '8px' }}>We&apos;ll reach out for future positions that match your skills</li>
            <li style={{ marginBottom: '8px' }}>We encourage you to continue developing your expertise</li>
            <li>Feel free to apply for other roles that align with your experience</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px 0' }}>
            Explore other opportunities at {organizationName}
          </Text>
          
          <Button
            href={dashboardUrl}
            style={{
              backgroundColor: '#1f2937',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            View Open Positions
          </Button>
        </div>

        {/* Closing */}
        <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e5e7eb' }}>
          <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            We wish you the best in your job search and future career endeavors.
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: '13px', margin: '8px 0 0 0' }}>
            This decision was based on a comprehensive review of all candidates and does not reflect on your qualifications or potential.
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
};
