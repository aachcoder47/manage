import { EmailLayout } from './EmailLayout';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Button } from '@react-email/button';

interface OfferEmailProps {
  candidateName: string;
  positionTitle: string;
  organizationName: string;
  salary?: string;
  startDate?: string;
  offerDetails?: string;
  acceptanceDeadline?: string;
  contactPerson?: string;
  contactEmail?: string;
  dashboardUrl?: string;
}

export const OfferEmail = ({
  candidateName,
  positionTitle,
  organizationName = 'Your Organization',
  salary,
  startDate,
  offerDetails,
  acceptanceDeadline,
  contactPerson = 'HR Team',
  contactEmail = 'hr@company.com',
  dashboardUrl = 'https://hr.futuristiccreations.store/offers'
}: OfferEmailProps) => {
  return (
    <EmailLayout
      preview={`Job Offer: ${positionTitle} at ${organizationName}`}
      footerText="Congratulations on your offer! We're excited to have you join our team."
    >
      <Section>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            backgroundColor: '#dcfce7',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ fontSize: '24px' }}>🎉</span>
          </div>
          <h1 style={{ 
            color: '#1f2937', 
            fontSize: '24px', 
            fontWeight: '600',
            margin: '0',
            lineHeight: '32px'
          }}>
            Congratulations! You've Got an Offer
          </h1>
        </div>

        {/* Main Message */}
        <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
          Dear <strong>{candidateName}</strong>,
        </Text>

        <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '32px' }}>
          We are thrilled to extend an offer to you for the <strong>{positionTitle}</strong> position at <strong>{organizationName}</strong>. 
          After careful consideration of your qualifications and interview performance, we believe you would be an excellent addition to our team.
        </Text>

        {/* Offer Details */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            color: '#166534', 
            fontSize: '18px', 
            fontWeight: '600',
            margin: '0 0 16px 0',
            lineHeight: '24px'
          }}>
            Offer Details
          </h2>
          
          {salary && (
            <div style={{ marginBottom: '12px' }}>
              <Text style={{ color: '#15803d', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Compensation:
              </Text>
              <Text style={{ color: '#166534', fontSize: '16px', margin: '0' }}>
                {salary}
              </Text>
            </div>
          )}
          
          {startDate && (
            <div style={{ marginBottom: '12px' }}>
              <Text style={{ color: '#15803d', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Start Date:
              </Text>
              <Text style={{ color: '#166534', fontSize: '16px', margin: '0' }}>
                {startDate}
              </Text>
            </div>
          )}
          
          {offerDetails && (
            <div style={{ marginBottom: '12px' }}>
              <Text style={{ color: '#15803d', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Additional Details:
              </Text>
              <Text style={{ color: '#166534', fontSize: '16px', margin: '0', lineHeight: '22px' }}>
                {offerDetails}
              </Text>
            </div>
          )}
          
          {acceptanceDeadline && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #bbf7d0' }}>
              <Text style={{ color: '#dc2626', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Please respond by:
              </Text>
              <Text style={{ color: '#dc2626', fontSize: '16px', margin: '0' }}>
                {acceptanceDeadline}
              </Text>
            </div>
          )}
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
            <strong>Next Steps:</strong>
          </Text>
          <ol style={{ 
            color: '#475569', 
            fontSize: '14px', 
            lineHeight: '20px',
            margin: '0',
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '8px' }}>Review the complete offer details in your candidate portal</li>
            <li style={{ marginBottom: '8px' }}>Accept or decline the offer by the deadline</li>
            <li style={{ marginBottom: '8px' }}>Complete any required paperwork</li>
            <li>Prepare for your exciting new journey with us!</li>
          </ol>
        </div>

        {/* CTA Buttons */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Button
              href={dashboardUrl}
              style={{
                backgroundColor: '#22c55e',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              View Full Offer Details
            </Button>
          </div>
          
          <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px 0' }}>
            Questions about your offer?
          </Text>
          
          <Button
            href={`mailto:${contactEmail}`}
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
            Contact {contactPerson}
          </Button>
        </div>

        {/* Contact Information */}
        <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #e5e7eb' }}>
          <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>
            We're excited to welcome you to the {organizationName} team!
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: '13px', margin: '0' }}>
            If you have any questions, please don't hesitate to reach out to {contactPerson} at {contactEmail}
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
};
