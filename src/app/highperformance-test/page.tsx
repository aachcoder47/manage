'use client';

import { HighPerformanceAd } from '@/components/ads/HighPerformanceAd';

export default function HighPerformanceTestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 High Performance Format Ad Test</h1>
      
      <div style={{ 
        background: '#fff3e0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ff6b35'
      }}>
        <h3>✅ New High Performance Ad Active!</h3>
        <p><strong>Ad Key:</strong> fe3895f99206c82f4759859c69595d78</p>
        <p><strong>Format:</strong> iframe</p>
        <p><strong>Size:</strong> 468x60 pixels</p>
        <p><strong>Script:</strong> https://www.highperformanceformat.com/fe3895f99206c82f4759859c69595d78/invoke.js</p>
        <p><strong>Check browser console for loading status</strong></p>
      </div>

      <HighPerformanceAd />

      <div style={{ marginTop: '40px' }}>
        <h2>What you should see:</h2>
        <ul>
          <li>Orange bordered box (this is the ad container)</li>
          <li>"Advertisement" text at the top</li>
          <li>"Loading ad..." text initially</li>
          <li>Either a real ad or "Ad space (468x60)" text</li>
          <li>Smaller size than previous ads (468x60 vs 728x90)</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Ad Configuration:</h2>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
{`atOptions = {
  'key' : 'fe3895f99206c82f4759859c69595d78',
  'format' : 'iframe',
  'height' : 60,
  'width' : 468,
  'params' : {}
};`}
        </pre>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Ad Locations Updated:</h2>
        <ol>
          <li><strong>Dashboard</strong> (/dashboard) - Free users only</li>
          <li><strong>Jobs Page</strong> (/jobs) - All users</li>
          <li><strong>Find Jobs</strong> (/find-jobs) - Job seekers</li>
          <li><strong>Homepage</strong> (/) - All visitors</li>
        </ol>
      </div>

      <div style={{ 
        background: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: '1px solid #4CAF50'
      }}>
        <h3>📝 Migration Complete:</h3>
        <ul>
          <li>✅ Replaced EffectiveGate with High Performance Format</li>
          <li>✅ Updated all 4 main ad placements</li>
          <li>✅ Created new HighPerformanceAd component</li>
          <li>✅ Changed ad size to 468x60 (smaller, less intrusive)</li>
          <li>✅ Updated visual styling (orange border)</li>
          <li>✅ Maintained non-disturbing placement strategy</li>
        </ul>
      </div>

      <div style={{ 
        background: '#f0f8ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: '1px solid #0066cc'
      }}>
        <h3>🔄 Ad Evolution History:</h3>
        <ol>
          <li><strong>AdSense</strong> - Google AdSense (728x90)</li>
          <li><strong>EffectiveGate</strong> - EffectiveGate CPM (728x90)</li>
          <li><strong>High Performance</strong> - High Performance Format (468x60) ← CURRENT</li>
        </ol>
      </div>
    </div>
  );
}
