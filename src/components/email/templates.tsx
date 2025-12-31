import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Font } from '@react-email/font';
import { Button } from '@react-email/button';
import { Link } from '@react-email/link';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export const EmailLayout = ({ children, preview }: EmailLayoutProps) => (
  <Html>
    <Head>
      <Font
        fontFamily="Inter"
        fallbackFontFamily="Arial"
        webFont={{
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
    <div style={{ backgroundColor: '#f8fafc', padding: '20px 0' }}>
      <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        {children}
      </Container>
    </div>
  </Html>
);

interface WelcomeEmailProps {
  name: string;
  userEmail: string;
}

export const WelcomeEmail = ({ name, userEmail }: WelcomeEmailProps) => (
  <EmailLayout preview="Welcome to Futuristic HR - Your AI-powered hiring platform">
    <Section style={{ padding: '40px 30px', backgroundColor: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1f2937', fontSize: '24px', fontWeight: '700', margin: '0 0 10px 0' }}>
          Welcome to Futuristic HR
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
          Your AI-powered hiring platform is ready
        </p>
      </div>
      
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '20px' }}>
        Hi {name},
      </Text>
      
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '20px' }}>
        Welcome to the future of hiring! Your Futuristic HR account is now active. You can:
      </Text>
      
      <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <ul style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', margin: '0', paddingLeft: '20px' }}>
          <li>Create AI-powered interviews</li>
          <li>Screen candidates automatically</li>
          <li>Track hiring progress</li>
          <li>Get AI insights on candidates</li>
        </ul>
      </div>
      
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <Button
          href="https://app.futuristic-hr.com/dashboard"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Go to Dashboard
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '30px' }}>
        Need help? Reply to this email or visit our help center.
      </Text>
    </Section>
  </EmailLayout>
);

interface ApplicationReceivedEmailProps {
  candidateName: string;
  positionTitle: string;
  organizationName: string;
  applicationId: string;
}

export const ApplicationReceivedEmail = ({ 
  candidateName, 
  positionTitle, 
  organizationName,
  applicationId 
}: ApplicationReceivedEmailProps) => (
  <EmailLayout preview={`New application from ${candidateName} for ${positionTitle}`}>
    <Section style={{ padding: '40px 30px', backgroundColor: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1f2937', fontSize: '24px', fontWeight: '700', margin: '0 0 10px 0' }}>
          New Application Received
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
          {candidateName} applied for {positionTitle}
        </p>
      </div>
      
      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ color: '#0c4a6e', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
          Application Details
        </div>
        <div style={{ color: '#374151', fontSize: '14px', lineHeight: '20px' }}>
          <div><strong>Candidate:</strong> {candidateName}</div>
          <div><strong>Position:</strong> {positionTitle}</div>
          <div><strong>Organization:</strong> {organizationName}</div>
          <div><strong>Application ID:</strong> {applicationId}</div>
        </div>
      </div>
      
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '20px' }}>
        A new candidate has applied for your position. You can now:
      </Text>
      
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <Button
          href={`https://app.futuristic-hr.com/applications/${applicationId}`}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Review Application
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '30px' }}>
        Our AI will automatically screen this application and provide insights within 24 hours.
      </Text>
    </Section>
  </EmailLayout>
);

interface InterviewInviteEmailProps {
  candidateName: string;
  positionTitle: string;
  interviewDate: string;
  interviewTime: string;
  interviewLink: string;
  organizationName: string;
}

export const InterviewInviteEmail = ({ 
  candidateName, 
  positionTitle, 
  interviewDate, 
  interviewTime, 
  interviewLink,
  organizationName 
}: InterviewInviteEmailProps) => (
  <EmailLayout preview={`Interview invitation for ${positionTitle} at ${organizationName}`}>
    <Section style={{ padding: '40px 30px', backgroundColor: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1f2937', fontSize: '24px', fontWeight: '700', margin: '0 0 10px 0' }}>
          Interview Invitation
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
          {positionTitle} at {organizationName}
        </p>
      </div>
      
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '20px' }}>
        Hi {candidateName},
      </Text>
      
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '20px' }}>
        Congratulations! We'd like to invite you for an interview for the {positionTitle} position.
      </Text>
      
      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ color: '#0c4a6e', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
          Interview Details
        </div>
        <div style={{ color: '#374151', fontSize: '14px', lineHeight: '20px' }}>
          <div><strong>Date:</strong> {interviewDate}</div>
          <div><strong>Time:</strong> {interviewTime}</div>
          <div><strong>Format:</strong> AI-powered video interview</div>
          <div><strong>Duration:</strong> 30-45 minutes</div>
        </div>
      </div>
      
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '20px' }}>
        This is an AI-powered interview that you can take from anywhere. The interview will analyze your responses and provide real-time insights.
      </Text>
      
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <Button
          href={interviewLink}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Start Interview
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '30px' }}>
        <strong>Technical requirements:</strong> Chrome/Firefox browser, webcam, and microphone. Test your setup before the interview.
      </Text>
    </Section>
  </EmailLayout>
);
