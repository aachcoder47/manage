import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Button } from '@react-email/button';
import { EmailLayout } from './EmailLayout';

interface MarketingEmailProps {
  userName: string;
  emailTitle: string;
  emailDescription: string;
  content: {
    heroImage?: string;
    mainMessage: string;
    benefits: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    testimonial?: {
      quote: string;
      author: string;
      role: string;
      company: string;
    };
    ctaText: string;
    ctaUrl: string;
    secondaryCta?: {
      text: string;
      url: string;
    };
  };
  campaignType: 'tips' | 'case_study' | 'promotion' | 'webinar';
}

export const MarketingEmail = ({ 
  userName,
  emailTitle,
  emailDescription,
  content,
  campaignType
}: MarketingEmailProps) => {
  const getCampaignConfig = () => {
    switch (campaignType) {
      case 'tips':
        return {
          icon: '💡',
          color: '#3b82f6',
          bgColor: '#dbeafe',
          title: 'Hiring Tips'
        };
      case 'case_study':
        return {
          icon: '📊',
          color: '#10b981',
          bgColor: '#d1fae5',
          title: 'Success Story'
        };
      case 'promotion':
        return {
          icon: '🎉',
          color: '#8b5cf6',
          bgColor: '#ede9fe',
          title: 'Special Offer'
        };
      case 'webinar':
        return {
          icon: '🎥',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          title: 'Upcoming Webinar'
        };
      default:
        return {
          icon: '📢',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          title: 'Update'
        };
    }
  };

  const config = getCampaignConfig();

  return (
    <EmailLayout 
      preview={emailTitle}
      footerText="You're receiving this email because you opted in to marketing communications from Futuristic HR. Want to change your preferences? Update your email settings anytime."
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
            {emailTitle}
          </Text>
          <Text style={{ color: '#64748b', fontSize: '16px', margin: '0' }}>
            {emailDescription}
          </Text>
        </div>
        
        <Text style={{ color: '#475569', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
          Hi {userName},
        </Text>
        
        {content.heroImage && (
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img 
              src={content.heroImage} 
              alt="Hero" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }} 
            />
          </div>
        )}
        
        <Text style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
          {content.mainMessage}
        </Text>
        
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {content.benefits.map((benefit, index) => (
              <div key={`benefit-${index}`} style={{ 
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
                    {benefit.icon}
                  </div>
                  <div>
                    <Text style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      {benefit.title}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: '14px', lineHeight: '20px', margin: '0' }}>
                      {benefit.description}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {content.testimonial && (
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '32px' 
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>❝</span>
            </div>
            <Text style={{ 
              color: '#0c4a6e', 
              fontSize: '16px', 
              fontStyle: 'italic', 
              lineHeight: '24px', 
              margin: '0 0 16px 0', 
              textAlign: 'center' 
            }}>
              {content.testimonial.quote}
            </Text>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                {content.testimonial.author}
              </Text>
              <Text style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>
                {content.testimonial.role} at {content.testimonial.company}
              </Text>
            </div>
          </div>
        )}
        
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button
            href={content.ctaUrl}
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
            {content.ctaText} →
          </Button>
        </div>
        
        {content.secondaryCta && (
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <a 
              href={content.secondaryCta.url}
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}
            >
              {content.secondaryCta.text}
            </a>
          </div>
        )}
        
        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
          <Text style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            🎯 Why This Matters
          </Text>
          <Text style={{ color: '#78350f', fontSize: '13px', lineHeight: '20px', margin: '0' }}>
            Companies using AI-powered hiring see a 75% reduction in time-to-hire and 40% improvement in candidate quality. Don't get left behind in the recruitment revolution.
          </Text>
        </div>
        
        <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e2e8f0' }}>
          <Text style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>
            Want to receive fewer marketing emails?
          </Text>
          <a 
            href="https://app.futuristic-hr.com/settings/email" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Update Email Preferences
          </a>
        </div>
      </Section>
    </EmailLayout>
  );
};
