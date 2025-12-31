import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Button } from '@react-email/button';
import { EmailLayout } from './EmailLayout';

interface InterviewInviteEmailProps {
  candidateName: string;
  positionTitle: string;
  interviewDate: string;
  interviewTime: string;
  interviewLink: string;
  organizationName: string;
  interviewerName?: string;
  interviewDuration?: string;
  preparationTips?: string[];
  calendarLinks?: {
    google: string;
    outlook: string;
    apple: string;
  };
}

export const InterviewInviteEmail = ({ 
  candidateName, 
  positionTitle, 
  interviewDate, 
  interviewTime, 
  interviewLink,
  organizationName,
  interviewerName = 'AI Interviewer',
  interviewDuration = '30-45 minutes',
  preparationTips = [
    'Test your camera and microphone before the interview',
    'Ensure you have a stable internet connection',
    'Find a quiet, well-lit space for the interview',
    'Have your resume and any relevant documents ready'
  ],
  calendarLinks
}: InterviewInviteEmailProps) => {
  return (
  <EmailLayout 
    preview={`Interview invitation: ${positionTitle} at ${organizationName}`}
    footerText="This is an AI-powered interview that you can take from anywhere. We're excited to learn more about you!"
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
          <span style={{ fontSize: '40px' }}>🎯</span>
        </div>
        <Text style={{ color: '#1e293b', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
          Interview Invitation
        </Text>
        <Text style={{ color: '#64748b', fontSize: '16px', margin: '0' }}>
          {positionTitle} at {organizationName}
        </Text>
      </div>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        Hi {candidateName},
      </Text>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        Congratulations! We were impressed with your application and would like to invite you for an interview for the <strong>{positionTitle}</strong> position at <strong>{organizationName}</strong>.
      </Text>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
        border: '1px solid #0ea5e9', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '32px' 
      }}>
        <Text style={{ color: '#0c4a6e', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          📅 Interview Details
        </Text>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Date</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{interviewDate}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Time</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{interviewTime}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Duration</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{interviewDuration}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Format</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>AI-powered video interview</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>Interviewer</Text>
            <Text style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{interviewerName}</Text>
          </div>
        </div>
      </div>
      
      <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
        This is an AI-powered interview that adapts to your responses in real-time. Our intelligent system will assess your skills, experience, and cultural fit through a series of conversational questions.
      </Text>
      
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          💡 What to Expect
        </Text>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>🤖</span>
            <div>
              <Text style={{ color: '#334155', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                AI Conversation
              </Text>
              <Text style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>
                Natural conversation with our AI interviewer
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>📝</span>
            <div>
              <Text style={{ color: '#334155', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Real-time Analysis
              </Text>
              <Text style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>
                AI analyzes your responses as you speak
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <div>
              <Text style={{ color: '#334155', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Skill Assessment
              </Text>
              <Text style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>
                Technical and behavioral questions tailored to the role
              </Text>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button
          href={interviewLink}
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
          Start Interview →
        </Button>
      </div>
      
      {calendarLinks && (
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <Text style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>
            Add to your calendar:
          </Text>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <a 
              href={calendarLinks.google}
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: '500',
                border: '1px solid #667eea',
                padding: '8px 16px',
                borderRadius: '6px'
              }}
            >
              Google Calendar
            </a>
            <a 
              href={calendarLinks.outlook}
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: '500',
                border: '1px solid #667eea',
                padding: '8px 16px',
                borderRadius: '6px'
              }}
            >
              Outlook
            </a>
            <a 
              href={calendarLinks.apple}
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: '500',
                border: '1px solid #667eea',
                padding: '8px 16px',
                borderRadius: '6px'
              }}
            >
              Apple Calendar
            </a>
          </div>
        </div>
      )}
      
      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          🔧 Technical Requirements
        </Text>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b' }}>✓</span>
            <Text style={{ color: '#78350f', fontSize: '13px', margin: '0' }}>Chrome/Firefox browser (latest version)</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b' }}>✓</span>
            <Text style={{ color: '#78350f', fontSize: '13px', margin: '0' }}>Working webcam and microphone</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b' }}>✓</span>
            <Text style={{ color: '#78350f', fontSize: '13px', margin: '0' }}>Stable internet connection (3+ Mbps)</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b' }}>✓</span>
            <Text style={{ color: '#78350f', fontSize: '13px', margin: '0' }}>Quiet, well-lit environment</Text>
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <Text style={{ color: '#0c4a6e', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          💡 Preparation Tips
        </Text>
        <div style={{ display: 'grid', gap: '8px' }}>
          {preparationTips.map((tip, index) => (
            <div key={`prep-tip-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
              <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
                {tip}
              </Text>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e2e8f0' }}>
        <Text style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>
          Questions? Need to reschedule?
        </Text>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href="mailto:support@futuristic-hr.com" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Contact Support
          </a>
          <a href={interviewLink} style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Test Setup
          </a>
        </div>
      </div>
    </Section>
  </EmailLayout>
  );
};
