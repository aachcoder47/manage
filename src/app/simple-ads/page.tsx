'use client';

import { ManualAdSense, AutoAdSense } from '@/components/ads/AdSenseScriptLoader';
import { useState } from 'react';

export default function SimpleAdExample() {
  const [showAds, setShowAds] = useState(true);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AdSense Integration - Your Publisher ID: ca-pub-8490513657943266</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
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

      {showAds && (
        <>
          {/* Auto Ad - Google decides placement */}
          <section style={{ marginBottom: '40px' }}>
            <h2>Auto Ad (Google decides placement)</h2>
            <AutoAdSense />
          </section>

          {/* Manual Ad - Specific placement */}
          <section style={{ marginBottom: '40px' }}>
            <h2>Manual Ad (Header Banner)</h2>
            <ManualAdSense 
              adSlot="1234567890" // Replace with your actual ad slot ID
              style={{ 
                width: '728px', 
                height: '90px', 
                margin: '20px auto' 
              }}
            />
          </section>

          {/* Responsive Manual Ad */}
          <section style={{ marginBottom: '40px' }}>
            <h2>Responsive Ad</h2>
            <ManualAdSense 
              adSlot="0987654321" // Replace with your actual ad slot ID
              adFormat="auto"
              style={{ 
                width: '100%', 
                height: 'auto', 
                margin: '20px 0' 
              }}
            />
          </section>

          {/* Content between ads */}
          <section style={{ marginBottom: '40px' }}>
            <h2>About Futuristic HR</h2>
            <p>
              Futuristic HR is revolutionizing the hiring process with AI-powered interviews 
              and smart analytics. Our platform helps companies save time and find the best 
              candidates through innovative technology.
            </p>
            
            {/* Another ad in content */}
            <ManualAdSense 
              adSlot="1111222233" // Replace with your actual ad slot ID
              style={{ 
                width: '300px', 
                height: '250px', 
                float: 'right',
                margin: '0 0 20px 20px'
              }}
            />
            
            <p>
              With our advanced AI algorithms, companies can reduce bias in hiring, 
              save up to 90% of screening time, and improve candidate matching accuracy. 
              Our platform includes video interviews, collaborative hiring tools, and 
              comprehensive analytics to help you make better hiring decisions.
            </p>
            
            <div style={{ clear: 'both' }}></div>
          </section>

          {/* Footer ad */}
          <section>
            <h2>Footer Ad</h2>
            <ManualAdSense 
              adSlot="4444555566" // Replace with your actual ad slot ID
              style={{ 
                width: '728px', 
                height: '90px', 
                margin: '20px auto' 
              }}
            />
          </section>
        </>
      )}

      <div style={{ 
        background: '#e7f3ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px' 
      }}>
        <h3>📋 Next Steps:</h3>
        <ol>
          <li>Update your <code>.env</code> file with your publisher ID</li>
          <li>Create ad units in your AdSense dashboard</li>
          <li>Replace the placeholder ad slot IDs above with your actual ad slot IDs</li>
          <li>Test in production environment</li>
          <li>Monitor performance in AdSense dashboard</li>
        </ol>
        
        <h3>🔧 Environment Variables:</h3>
        <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
{`NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-8490513657943266
NEXT_PUBLIC_ADSENSE_ENABLED=true`}
        </pre>
      </div>
    </div>
  );
}
