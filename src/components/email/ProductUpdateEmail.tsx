import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Button } from '@react-email/button';
import { EmailLayout } from './EmailLayout';

interface ProductUpdateEmailProps {
  userName: string;
  updateTitle: string;
  updateDescription: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  updateType: 'feature' | 'improvement' | 'bug_fix';
  learnMoreUrl?: string;
  dashboardUrl?: string;
}

export const ProductUpdateEmail = ({ 
  userName,
  updateTitle,
  updateDescription,
  features,
  updateType,
  learnMoreUrl,
  dashboardUrl = 'https://app.futuristic-hr.com/dashboard'
}: ProductUpdateEmailProps) => {
  const getUpdateTypeConfig = () => {
    switch (updateType) {
      case 'feature':
        return {
          icon: '✨',
          color: '#3b82f6',
          bgColor: '#dbeafe',
          title: 'New Feature'
        };
      case 'improvement':
        return {
          icon: '🚀',
          color: '#10b981',
          bgColor: '#d1fae5',
          title: 'Improvement'
        };
      case 'bug_fix':
        return {
          icon: '🔧',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          title: 'Bug Fix'
        };
      default:
        return {
          icon: '📢',
          color: '#8b5cf6',
          bgColor: '#ede9fe',
          title: 'Update'
        };
    }
  };

  const config = getUpdateTypeConfig();

  return (
    <EmailLayout 
      preview={`${config.title}: ${updateTitle}`}
      footerText="Stay updated with the latest features and improvements to make your hiring process even better."
    >
      <Section>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: config.bgColor, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <span style={{ fontSize: '40px' }}>{config.icon}</span>
          </div>
          <Text style={{ color: '#1e293b', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
            {config.title}
          </Text>
          <Text style={{ color: '#64748b', fontSize: '16px', margin: '0' }}>
            {updateTitle}
          </Text>
        </div>
        
        <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
          Hi {userName},
        </Text>
        
        <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '32px' }}>
          {updateDescription}
        </Text>
        
        <div style={{ marginBottom: '32px' }}>
          <Text style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            What's Included
          </Text>
          <div style={{ display: 'grid', gap: '16px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: config.bgColor, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    {feature.icon}
                  </div>
                  <div>
                    <Text style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      {feature.title}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: '14px', lineHeight: '20px', margin: '0' }}>
                      {feature.description}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
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
            Try It Now →
          </Button>
        </div>
        
        {learnMoreUrl && (
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <a 
              href={learnMoreUrl}
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}
            >
              Learn more about this update →
            </a>
          </div>
        )}
        
        <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
          <Text style={{ color: '#0c4a6e', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            💡 How This Helps You
          </Text>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
              <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
                Save more time with automated workflows
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
              <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
                Make better hiring decisions with enhanced AI insights
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '12px', marginTop: '2px' }}>•</span>
              <Text style={{ color: '#0c4a6e', fontSize: '13px', margin: '0', lineHeight: '18px' }}>
                Improve candidate experience with smoother processes
              </Text>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e2e8f0' }}>
          <Text style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>
            Have feedback or questions?
          </Text>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <a href="mailto:feedback@futuristic-hr.com" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
              Share Feedback
            </a>
            <a href="https://docs.futuristic-hr.com/whats-new" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
              See All Updates
            </a>
          </div>
        </div>
      </Section>
    </EmailLayout>
  );
};
