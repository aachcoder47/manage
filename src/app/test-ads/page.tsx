'use client';

import { ManualAdSense } from '@/components/ads/AdSenseScriptLoader';
import { AdSenseDebug } from '@/components/ads/AdSenseDebug';
import { useState } from 'react';

export default function TestAdsPage() {
  const [showAds, setShowAds] = useState(true);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <AdSenseDebug />
      <h1>📱 AdSense Test Page</h1>
      
      <div style={{ 
        background: '#f0f8ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #0066cc'
      }}>
        <h3>Ad Status</h3>
        <p>Publisher ID: ca-pub-8490513657943266</p>
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>AdSense Enabled: {process.env.NEXT_PUBLIC_ADSENSE_ENABLED}</p>
        <button 
          onClick={() => setShowAds(!showAds)}
          style={{
            padding: '8px 16px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {showAds ? 'Hide Ads' : 'Show Ads'}
        </button>
      </div>

      {showAds && (
        <>
          <section style={{ marginBottom: '40px' }}>
            <h2>Header Banner Ad (728x90)</h2>
            <div style={{ 
              border: '2px dashed #ccc', 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <ManualAdSense 
                adSlot="1234567890"
                style={{ 
                  width: '728px', 
                  height: '90px', 
                  maxWidth: '100%',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2>Sidebar Rectangle Ad (300x250)</h2>
            <div style={{ 
              border: '2px dashed #ccc', 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              width: '340px',
              margin: '0 auto'
            }}>
              <ManualAdSense 
                adSlot="0987654321"
                style={{ 
                  width: '300px', 
                  height: '250px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2>Responsive Ad (Auto Size)</h2>
            <div style={{ 
              border: '2px dashed #ccc', 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <ManualAdSense 
                adSlot="1111222233"
                adFormat="auto"
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  minHeight: '250px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2>Large Rectangle Ad (336x280)</h2>
            <div style={{ 
              border: '2px dashed #ccc', 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              width: '376px',
              margin: '0 auto'
            }}>
              <ManualAdSense 
                adSlot="4444555566"
                style={{ 
                  width: '336px', 
                  height: '280px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </section>
        </>
      )}

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>🔍 Troubleshooting</h3>
        <p><strong>If you don't see ads:</strong></p>
        <ol>
          <li>Check browser console for errors</li>
          <li>Disable ad blocker for localhost</li>
          <li>Ensure environment variables are set</li>
          <li>Wait a few seconds for ads to load</li>
          <li>Check if AdSense script loads in network tab</li>
        </ol>
        
        <p><strong>Expected behavior:</strong></p>
        <ul>
          <li>Empty boxes with borders should appear</li>
          <li>"Advertisement" text may show initially</li>
          <li>Real ads will appear in production with valid ad slots</li>
          <li>In development, you'll see placeholder spaces</li>
        </ul>
      </div>
    </div>
  );
}
