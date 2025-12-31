'use client';

import { useState } from 'react';
import { AdSenseLayout } from '@/components/ads/AdSenseLayout';
import { InContentAd } from '@/components/ads/AdSenseAd';
import { useAdSense } from '@/contexts/AdSenseContext';

export default function AdsExamplePage() {
  const { isEnabled, isLoaded, error } = useAdSense();
  const [showAds, setShowAds] = useState(true);

  return (
    <AdSenseLayout 
      showHeaderAd={showAds}
      showFooterAd={showAds}
      showSidebarAd={showAds}
      showMobileAd={showAds}
    >
      <div className="example-page" style={{ padding: '20px' }}>
        <h1>AdSense Integration Example</h1>
        
        {/* Ad Status */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3>AdSense Status</h3>
          <p>Enabled: {isEnabled ? 'Yes' : 'No'}</p>
          <p>Loaded: {isLoaded ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
          <button 
            onClick={() => setShowAds(!showAds)}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showAds ? 'Hide Ads' : 'Show Ads'}
          </button>
        </div>

        {/* Content with In-Content Ad */}
        <section style={{ marginBottom: '40px' }}>
          <h2>About Futuristic HR</h2>
          <p>
            Futuristic HR is revolutionizing the hiring process with AI-powered interviews 
            and smart analytics. Our platform helps companies save time and find the best 
            candidates through innovative technology.
          </p>
          
          {/* In-Content Ad */}
          <InContentAd />
          
          <h3>Key Features</h3>
          <ul>
            <li>AI-powered interview questions</li>
            <li>Automated resume screening</li>
            <li>Candidate ranking and insights</li>
            <li>Video interview capabilities</li>
            <li>Collaborative hiring tools</li>
          </ul>
        </section>

        {/* More Content */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Why Choose AI in Recruitment?</h2>
          <p>
            Artificial Intelligence is transforming how companies approach recruitment. 
            By leveraging machine learning and natural language processing, we can:
          </p>
          <ul>
            <li>Reduce bias in hiring decisions</li>
            <li>Save up to 90% of screening time</li>
            <li>Improve candidate matching accuracy</li>
            <li>Provide data-driven insights</li>
            <li>Enhance candidate experience</li>
          </ul>
        </section>

        {/* Pricing Section */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Pricing Plans</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{ 
              border: '1px solid #dee2e6', 
              padding: '20px', 
              borderRadius: '8px' 
            }}>
              <h3>Starter</h3>
              <p>Perfect for small teams</p>
              <strong>$29/month</strong>
            </div>
            <div style={{ 
              border: '1px solid #dee2e6', 
              padding: '20px', 
              borderRadius: '8px' 
            }}>
              <h3>Professional</h3>
              <p>For growing companies</p>
              <strong>$99/month</strong>
            </div>
            <div style={{ 
              border: '1px solid #dee2e6', 
              padding: '20px', 
              borderRadius: '8px' 
            }}>
              <h3>Enterprise</h3>
              <p>Custom solutions</p>
              <strong>Contact us</strong>
            </div>
          </div>
        </section>

        <style jsx>{`
          .example-page {
            max-width: 800px;
            margin: 0 auto;
          }
          
          h1, h2, h3 {
            color: #333;
            margin-bottom: 15px;
          }
          
          p {
            line-height: 1.6;
            color: #666;
            margin-bottom: 15px;
          }
          
          ul {
            line-height: 1.6;
            color: #666;
            margin-bottom: 20px;
          }
          
          li {
            margin-bottom: 8px;
          }
        `}</style>
      </div>
    </AdSenseLayout>
  );
}
