import { EmailLayout } from './EmailLayout';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Button } from '@react-email/button';

interface NewApplicationEmailProps {
  employerName: string;
  candidateName: string;
  positionTitle: string;
  organizationName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  applicationId: string;
  resumeUrl?: string;
  dashboardUrl?: string;
  applicationDate?: string;
}

export const NewApplicationEmail = ({
  employerName,
  candidateName,
  positionTitle,
  organizationName,
  candidateEmail,
  candidatePhone,
  applicationId,
  resumeUrl,
  dashboardUrl = 'https://hr.futuristiccreations.store/applications',
  applicationDate
}: NewApplicationEmailProps) => {
  return (
    <EmailLayout
      preview={`New application received for ${positionTitle}`}
      footerText="Stay on top of your hiring pipeline with instant application notifications."
    >
      <Section>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ fontSize: '24px' }}>📬</span>
          </div>
          <h1 style={{ 
            color: '#1f2937', 
            fontSize: '24px', 
            fontWeight: '600',
            margin: '0',
            lineHeight: '32px'
          }}>
            New Application Received
          </h1>
        </div>

        {/* Main Message */}
        <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
          Dear <strong>{employerName}</strong>,
        </Text>

        <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '32px' }}>
          Great news! A new candidate has applied for the <strong>{positionTitle}</strong> position at <strong>{organizationName}</strong>. 
          We wanted to notify you immediately so you can review their application and take the next steps in your hiring process.
        </Text>

        {/* Candidate Details */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            color: '#1e40af', 
            fontSize: '18px', 
            fontWeight: '600',
            margin: '0 0 16px 0',
            lineHeight: '24px'
          }}>
            Candidate Information
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <Text style={{ color: '#1e3a8a', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
              Name:
            </Text>
            <Text style={{ color: '#1e40af', fontSize: '16px', margin: '0' }}>
              {candidateName}
            </Text>
          </div>
          
          {candidateEmail && (
            <div style={{ marginBottom: '12px' }}>
              <Text style={{ color: '#1e3a8a', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Email:
              </Text>
              <Text style={{ color: '#1e40af', fontSize: '16px', margin: '0' }}>
                {candidateEmail}
              </Text>
            </div>
          )}
          
          {candidatePhone && (
            <div style={{ marginBottom: '12px' }}>
              <Text style={{ color: '#1e3a8a', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Phone:
              </Text>
              <Text style={{ color: '#1e40af', fontSize: '16px', margin: '0' }}>
                {candidatePhone}
              </Text>
            </div>
          )}
          
          <div style={{ marginBottom: '12px' }}>
            <Text style={{ color: '#1e3a8a', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
              Applied:
            </Text>
            <Text style={{ color: '#1e40af', fontSize: '16px', margin: '0' }}>
              {applicationDate || new Date().toLocaleDateString()}
            </Text>
          </div>
          
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #bfdbfe' }}>
            <Text style={{ color: '#1e3a8a', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
              Application ID:
            </Text>
            <Text style={{ color: '#6366f1', fontSize: '14px', fontFamily: 'monospace', margin: '0' }}>
              {applicationId}
            </Text>
          </div>
        </div>

        {/* Next Steps */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <Text style={{ color: '#0c4a6e', fontSize: '15px', margin: '0 0 12px 0' }}>
            <strong>Recommended Next Steps:</strong>
          </Text>
          <ol style={{ 
            color: '#475569', 
            fontSize: '14px', 
            lineHeight: '20px',
            margin: '0',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}>Review the candidate resume and qualifications</li>
            <li style={{ marginBottom: '8px' }}>Screen the application using AI-powered analysis</li>
            <li style={{ marginBottom: '8px' }}>Schedule an interview if they are a good fit</li>
            <li>Respond to the candidate within 24-48 hours</li>
          </ol>
        </div>

        {/* CTA Buttons */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Button
              href={dashboardUrl}
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              Review Application
            </Button>
          </div>
          
          {resumeUrl && (
            <div style={{ marginBottom: '16px' }}>
              <Button
                href={resumeUrl}
                style={{
                  backgroundColor: '#64748b',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '13px'
                }}
              >
                View Resume
              </Button>
            </div>
          )}
          
          <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            Application ID: <span style={{ fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{applicationId}</span>
          </Text>
        </div>

        {/* Closing */}
        <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e5e7eb' }}>
          <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            Stay ahead of your competition with instant application notifications.
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: '13px', margin: '8px 0 0 0' }}>
            This automated notification helps you respond to candidates faster and improve your hiring success rate.
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
};
