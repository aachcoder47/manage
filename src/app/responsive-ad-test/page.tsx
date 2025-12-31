'use client';

import { CSSResponsiveAds } from '@/components/ads/CSSResponsiveAds';
import { MobileOnlyAds } from '@/components/ads/ResponsiveAds';
import { DesktopOnlyAds } from '@/components/ads/ResponsiveAds';

export default function ResponsiveAdTestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📱 Responsive Ad System Test</h1>
      
      <div style={{ 
        background: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #2196F3'
      }}>
        <h3>📱 CSS-Based Responsive Ads</h3>
        <p><strong>Mobile (≤768px):</strong> Shows 2 ads (1 High Performance + 1 EffectiveGate CPM)</p>
        <p><strong>Desktop (>768px):</strong> Shows 13 ads (1 High Performance + 12 EffectiveGate CPM)</p>
        <p><strong>Resize your browser window to see the difference!</strong></p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🎯 CSS Responsive Ads (Auto-switch based on screen size)</h2>
        <CSSResponsiveAds />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>📱 Mobile-Only Ads (JavaScript detection)</h2>
        <MobileOnlyAds />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🖥️ Desktop-Only Ads (JavaScript detection)</h2>
        <DesktopOnlyAds />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🔧 How It Works</h2>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h4>CSS-Based Approach:</h4>
          <pre style={{ 
            background: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            marginBottom: '15px'
          }}>
{`.mobileShow { display: none; }
@media only screen and (min-device-width: 320px) and (max-device-width: 768px) {
  .mobileShow { display: block; }
}

.mobileHide { display: block; }
@media only screen and (min-device-width: 320px) and (max-device-width: 768px) {
  .mobileHide { display: none; }
}`}
          </pre>

          <h4>JavaScript-Based Approach:</h4>
          <pre style={{ 
            background: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto'
          }}>
{`const checkMobile = () => {
  const isMobileDevice = window.innerWidth <= 768;
  setIsMobile(isMobileDevice);
};`}
          </pre>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>📊 Responsive Behavior</h2>
        <div style={{ 
          background: '#fff3e0', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <ul>
            <li><strong>Mobile (≤768px):</strong> Compact layout, fewer ads for better performance</li>
            <li><strong>Desktop (>768px):</strong> Full grid layout, maximum ads for revenue</li>
            <li><strong>Tablet (768px-1024px):</strong> Responsive grid adapts to screen size</li>
            <li><strong>Real-time:</strong> Ads switch when you resize browser window</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🎯 Implementation in Pages</h2>
        <div style={{ 
          background: '#f0f8ff', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h4>All pages now use responsive ads:</h4>
          <ul>
            <li><strong>Homepage:</strong> CSSResponsiveAds in dedicated section</li>
            <li><strong>Dashboard:</strong> CSSResponsiveAds for free users only</li>
            <li><strong>Jobs Page:</strong> CSSResponsiveAds when jobs exist</li>
            <li><strong>Find Jobs:</strong> CSSResponsiveAds when search results exist</li>
          </ul>
        </div>
      </div>

      <div style={{ 
        background: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: '1px solid #4CAF50'
      }}>
        <h3>✅ Responsive Ad System Complete!</h3>
        <ul>
          <li>✅ CSS-based responsive design</li>
          <li>✅ JavaScript-based detection</li>
          <li>✅ Mobile-optimized layouts</li>
          <li>✅ Desktop-maximized revenue</li>
          <li>✅ Real-time switching</li>
          <li>✅ Production ready</li>
        </ul>
      </div>
    </div>
  );
}
