import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Font } from '@react-email/font';
import { Button } from '@react-email/button';
import { Link } from '@react-email/link';
import { Img } from '@react-email/img';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
  footerText?: string;
}

export const EmailLayout = ({ children, preview, footerText }: EmailLayoutProps) => {
  return (
    <Html>
      <Head>
        <title>{preview || 'Futuristic HR'}</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={['Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', Arial, sans-serif;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
          }
          .content {
            padding: 40px 30px;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .metric {
            background-color: white;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .metric-value {
            font-size: 28px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 4px;
          }
          .metric-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-success {
            background-color: #dcfce7;
            color: #16a34a;
          }
          .badge-warning {
            background-color: #fef3c7;
            color: #d97706;
          }
          .badge-info {
            background-color: #dbeafe;
            color: #2563eb;
          }
        `}</style>
      </Head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <div className="logo">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                <rect width="120" height="40" rx="8" fill="white" opacity="0.1"/>
                <text x="60" y="25" font-family="Inter" font-size="16" font-weight="700" fill="white" text-anchor="middle">
                  Futuristic HR
                </text>
              </svg>
            </div>
            <Text style={{ color: 'white', fontSize: '14px', margin: '0', opacity: 0.9 }}>
              AI-Powered Hiring Platform
            </Text>
          </div>

          {/* Content */}
          <div className="content">
            {children}
          </div>

          {/* Footer */}
          <div className="footer">
            <Text style={{ color: '#64748b', fontSize: '12px', margin: '0 0 16px 0' }}>
              {footerText || 'This email was sent by Futuristic HR. You received this email because you have an account with us.'}
            </Text>
            <div style={{ marginBottom: '16px' }}>
              <Link href="https://app.futuristic-hr.com/settings/email" style={{ color: '#667eea', textDecoration: 'none', fontSize: '12px', marginRight: '16px' }}>
                Email Preferences
              </Link>
              <Link href="https://app.futuristic-hr.com" style={{ color: '#667eea', textDecoration: 'none', fontSize: '12px', marginRight: '16px' }}>
                Dashboard
              </Link>
              <Link href="mailto:support@futuristic-hr.com" style={{ color: '#667eea', textDecoration: 'none', fontSize: '12px' }}>
                Support
              </Link>
            </div>
            <Text style={{ color: '#94a3b8', fontSize: '11px', margin: '0' }}>
              © 2024 Futuristic HR. All rights reserved. | 123 Tech Street, San Francisco, CA 94105
            </Text>
          </div>
        </div>
      </body>
    </Html>
  );
};
