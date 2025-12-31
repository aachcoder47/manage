'use client';

import { EffectiveGateAd } from '@/components/ads/EffectiveGateAd';

export default function EffectiveGateTestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 EffectiveGate Ad Test</h1>
      
      <div style={{ 
        background: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #4CAF50'
      }}>
        <h3>✅ New Ad Script Active!</h3>
        <p>Script: https://pl28372665.effectivegatecpm.com/38/41/9d/bc1qdw7cav7z9l2675fslaupjxu4ugdn2lz5x8q5e7.js</p>
        <p>Component: EffectiveGateAd</p>
        <p><strong>Check browser console for loading status</strong></p>
      </div>

      <EffectiveGateAd />

      <div style={{ marginTop: '40px' }}>
        <h2>What you should see:</h2>
        <ul>
          <li>Green bordered box (this is the ad container)</li>
          <li>"Advertisement" text at the top</li>
          <li>"Loading ad..." text initially</li>
          <li>Either a real ad or "Ad space" text</li>
        </ul>
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
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>📝 Migration Complete:</h3>
        <ul>
          <li>✅ Replaced AdSense script with EffectiveGate script</li>
          <li>✅ Updated all 4 main ad placements</li>
          <li>✅ Created new EffectiveGateAd component</li>
          <li>✅ Maintained non-disturbing placement strategy</li>
          <li>✅ Kept same visual styling (green border)</li>
        </ul>
      </div>
    </div>
  );
}
