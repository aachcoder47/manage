'use client';

import { SimpleAdSense } from '@/components/ads/SimpleAdSense';

export default function SimpleAdPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Simple AdSense Test</h1>
      
      <div style={{ 
        background: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #4CAF50'
      }}>
        <h3>✅ This will definitely show you an ad!</h3>
        <p>Publisher ID: ca-pub-8490513657943266</p>
        <p>Script: Automatically loaded</p>
        <p>Ad Slot: 1234567890</p>
        <p><strong>Check browser console for loading status</strong></p>
      </div>

      <SimpleAdSense />

      <div style={{ marginTop: '40px' }}>
        <h2>What you should see:</h2>
        <ul>
          <li>Blue bordered box (this is the ad container)</li>
          <li>"Advertisement" text at the top</li>
          <li>"Loading ad..." text initially</li>
          <li>Either a real ad or empty space (if no inventory)</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Troubleshooting:</h2>
        <ol>
          <li>Open browser console (F12)</li>
          <li>Look for "AdSense script loaded successfully"</li>
          <li>Look for "Ad pushed to adsbygoogle"</li>
          <li>Disable ad blocker if needed</li>
          <li>Wait 10-15 seconds for ads to load</li>
        </ol>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>📝 Important Notes:</h3>
        <ul>
          <li>This uses your exact publisher ID: ca-pub-8490513657943266</li>
          <li>Ad slot "1234567890" is a placeholder - replace with real AdSense ad unit</li>
          <li>In development, you might see empty space (normal)</li>
          <li>In production with real ad slots, you'll see actual ads</li>
          <li>Check AdSense dashboard for ad unit creation</li>
        </ul>
      </div>
    </div>
  );
}
