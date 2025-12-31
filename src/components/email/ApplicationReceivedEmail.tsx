import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Button } from '@react-email/button';
import { EmailLayout } from './EmailLayout';

interface ApplicationReceivedEmailProps {
  candidateName: string;
  positionTitle: string;
  organizationName: string;
  applicationId: string;
  candidateEmail?: string;
  resumeUrl?: string;
  dashboardUrl?: string;
}

export function ApplicationReceivedEmail({ 
  candidateName, 
  positionTitle, 
  organizationName,
  applicationId,
  candidateEmail,
  resumeUrl,
  dashboardUrl = 'https://app.futuristic-hr.com'
}: ApplicationReceivedEmailProps) {
  return (
  <EmailLayout 
    preview={`New application: ${candidateName} for ${positionTitle}`}
    footerText="Stay ahead of the competition with real-time application notifications."
  >
    <Section>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#f0fdf4', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <span style={{ fontSize: '40px' }}>📬</span>
        </div>
        <Text style={{ color: '#1e293b', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
          New Application Received
        </Text>
        <Text style={{ color: '#64748b', fontSize: '16px', margin: '0' }}>
          {candidateName} applied for {positionTitle}
        </Text>
      </div>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
        border: '1px solid #0ea5e9', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '32px' 
      }}>
        <Text style={{ color: '#0c4a6e', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          📋 Application Details
        </Text>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Candidate</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{candidateName}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Position</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{positionTitle}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Organization</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{organizationName}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Application ID</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>#{applicationId}</Text>
          </div>
          {candidateEmail && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Email</Text>
              <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{candidateEmail}</Text>
            </div>
          )}
        </div>
      </div>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        A new candidate has applied for your position. Our AI is already analyzing their application and will provide insights within the next few minutes.
      </Text>
      
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          🤖 AI Analysis in Progress
        </Text>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            <Text style={{ color: '#374151', fontSize: '14px', margin: '0' }}>Resume parsing and analysis</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            <Text style={{ color: '#374151', fontSize: '14px', margin: '0' }}>Skills assessment and matching</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            <Text style={{ color: '#374151', fontSize: '14px', margin: '0' }}>Experience verification</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#fbbf24', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <Text style={{ color: '#374151', fontSize: '14px', margin: '0' }}>Generating fit score and insights...</Text>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button
          href={`${dashboardUrl}/applications/${applicationId}`}
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
          Review Application →
        </Button>
      </div>
      
      {resumeUrl && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <a 
            href={resumeUrl} 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}
          >
            Download Resume →
          </a>
        </div>
      )}
      
      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          ⚡ Quick Actions
        </Text>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a 
            href={`${dashboardUrl}/applications/${applicationId}/schedule-interview`}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Schedule Interview
          </a>
          <a 
            href={`${dashboardUrl}/applications/${applicationId}/ai-screen`}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            AI Screening
          </a>
          <a 
            href={`${dashboardUrl}/applications/${applicationId}/message`}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Send Message
          </a>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e2e8f0' }}>
        <Text style={{ color: '#64748b', fontSize: '14px', margin: '0' }}>
          You&apos;ll receive another notification once AI analysis is complete.
        </Text>
      </div>
    </Section>
  </EmailLayout>
  );
}
