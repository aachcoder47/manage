'use client';

import { HighPerformanceAd } from '@/components/ads/HighPerformanceAd';
import { EffectiveGateCPMAd } from '@/components/ads/EffectiveGateCPMAd';

export default function DualAdTestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Dual Ad System Test</h1>
      
      <div style={{ 
        background: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #4CAF50'
      }}>
        <h3>✅ New Dual Ad System Active!</h3>
        <p><strong>High Performance Format:</strong> 468x60 pixels</p>
        <p><strong>EffectiveGate CPM:</strong> 160x300 pixels</p>
        <p><strong>Check browser console for loading status</strong></p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🟠 High Performance Format Ad (468x60)</h2>
        <HighPerformanceAd />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🟢 EffectiveGate CPM Ad (160x300)</h2>
        <EffectiveGateCPMAd />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🎯 Side-by-Side Comparison</h2>
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>High Performance</h3>
            <HighPerformanceAd />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>EffectiveGate CPM</h3>
            <EffectiveGateCPMAd />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>📍 Ad Locations Updated</h2>
        <ol>
          <li><strong>Dashboard</strong> (/dashboard) - Free users only - Both ads</li>
          <li><strong>Jobs Page</strong> (/jobs) - All users - Both ads</li>
          <li><strong>Find Jobs</strong> (/find-jobs) - Job seekers - Both ads</li>
          <li><strong>Homepage</strong> (/) - All visitors - Both ads</li>
        </ol>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🔧 Ad Configuration</h2>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
          <h4>High Performance Format:</h4>
          <pre style={{ 
            background: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '11px',
            overflow: 'auto'
          }}>
{`atOptions = {
  'key': 'fe3895f99206c82f4759859c69595d78',
  'format': 'iframe',
  'height': 60,
  'width': 468,
  'params': {}
};`}
          </pre>

          <h4 style={{ marginTop: '15px' }}>EffectiveGate CPM:</h4>
          <pre style={{ 
            background: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '11px',
            overflow: 'auto'
          }}>
{`atOptions = {
  'key': '246865934f701b98747445a2ca184197',
  'format': 'iframe',
  'height': 300,
  'width': 160,
  'params': {}
};`}
          </pre>
        </div>
      </div>

      <div style={{ 
        background: '#f0f8ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: '1px solid #0066cc'
      }}>
        <h3>📱 Responsive Design</h3>
        <ul>
          <li><strong>High Performance:</strong> Horizontal banner (468x60)</li>
          <li><strong>EffectiveGate CPM:</strong> Vertical rectangle (160x300)</li>
          <li><strong>Layout:</strong> Side-by-side on desktop, stacked on mobile</li>
          <li><strong>Non-disturbing:</strong> Placed between content sections</li>
        </ul>
      </div>

      <div style={{ 
        background: '#fff3e0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>🎉 Dual Ad System Complete!</h3>
        <ul>
          <li>✅ Two different ad networks</li>
          <li>✅ Different sizes for variety</li>
          <li>✅ Error handling for both</li>
          <li>✅ Client-side rendering</li>
          <li>✅ Production ready</li>
          <li>✅ Revenue maximization</li>
        </ul>
      </div>
    </div>
  );
}
