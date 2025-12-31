'use client';

import { ProductionDomainResponsiveAds } from '@/components/ads/ProductionDomainAds';
import { ProductionDomainAds } from '@/components/ads/ProductionDomainAds';

export default function ProductionDomainTestPage() {
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  const isProductionDomain = currentDomain === 'hr.futuristiccreations.store';

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🌐 Production Domain Ads Test</h1>
      
      <div style={{ 
        background: isProductionDomain ? '#e8f5e8' : '#fff3e0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: `1px solid ${isProductionDomain ? '#4CAF50' : '#FF9800'}`
      }}>
        <h3>{isProductionDomain ? '✅' : '⚠️'} Current Domain: {currentDomain}</h3>
        <p><strong>Production Domain:</strong> hr.futuristiccreations.store</p>
        <p><strong>Status:</strong> {isProductionDomain ? 'Ads will show' : 'Ads will be hidden'}</p>
        <p><strong>Reason:</strong> Ads only display on hr.futuristiccreations.store</p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🎯 Production Domain Responsive Ads</h2>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          These ads will only appear on hr.futuristiccreations.store
        </p>
        <ProductionDomainResponsiveAds />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>📊 Production Domain Static Ads</h2>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          These ads will only appear on hr.futuristiccreations.store
        </p>
        <ProductionDomainAds />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🔧 How Domain Detection Works</h2>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h4>Domain Detection Code:</h4>
          <pre style={{ 
            background: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            marginBottom: '15px'
          }}>
{`useEffect(() => {
  // Check if we're on the production domain
  const isProd = window.location.hostname === 'hr.futuristiccreations.store';
  setIsProductionDomain(isProd);
}, []);

// Only show ads on hr.futuristiccreations.store
if (!isProductionDomain) {
  return null;
}`}
          </pre>

          <h4>Domain Comparison:</h4>
          <ul>
            <li><strong>✅ hr.futuristiccreations.store</strong> - Ads will show</li>
            <li><strong>❌ localhost:3000</strong> - Ads will be hidden</li>
            <li><strong>❌ 127.0.0.1:3000</strong> - Ads will be hidden</li>
            <li><strong>❌ any-other-domain.com</strong> - Ads will be hidden</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>📱 Responsive Behavior on Production Domain</h2>
        <div style={{ 
          background: '#f0f8ff', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h4>On hr.futuristiccreations.store:</h4>
          <ul>
            <li><strong>Mobile (&le;768px):</strong> 2 ads (1 High Performance + 1 EffectiveGate CPM)</li>
            <li><strong>Desktop (&gt;768px):</strong> 13 ads (1 High Performance + 12 EffectiveGate CPM)</li>
            <li><strong>Real-time:</strong> Ads switch when you resize browser</li>
            <li><strong>Revenue:</strong> Real advertisements will appear</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🚀 Production Benefits</h2>
        <div style={{ 
          background: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <ul>
            <li><strong>Domain-Specific:</strong> Only shows on your production domain</li>
            <li><strong>Real Ads:</strong> Actual advertisements will appear</li>
            <li><strong>Revenue:</strong> Income generation begins</li>
            <li><strong>Analytics:</strong> Full tracking and reporting</li>
            <li><strong>Clean:</strong> No ad containers in development</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>📍 Updated Pages</h2>
        <div style={{ 
          background: '#fff3e0', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h4>All pages now use production domain ads:</h4>
          <ul>
            <li><strong>Homepage:</strong> ProductionDomainResponsiveAds</li>
            <li><strong>Dashboard:</strong> ProductionDomainResponsiveAds (free users only)</li>
            <li><strong>Jobs Page:</strong> ProductionDomainResponsiveAds (when jobs exist)</li>
            <li><strong>Find Jobs:</strong> ProductionDomainResponsiveAds (when results exist)</li>
          </ul>
        </div>
      </div>

      <div style={{ 
        background: isProductionDomain ? '#e8f5e8' : '#fff3e0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '40px',
        border: `1px solid ${isProductionDomain ? '#4CAF50' : '#FF9800'}`
      }}>
        <h3>{isProductionDomain ? '🎉 Production Domain Detected!' : '⚠️ Not Production Domain'}</h3>
        {isProductionDomain ? (
          <ul>
            <li>✅ Real advertisements will appear</li>
            <li>✅ Revenue generation active</li>
            <li>✅ Analytics tracking enabled</li>
            <li>✅ Professional appearance</li>
          </ul>
        ) : (
          <ul>
            <li>⚠️ Ads are hidden (not production domain)</li>
            <li>⚠️ No revenue generation in development</li>
            <li>⚠️ Clean interface for testing</li>
            <li>✅ Ready for production deployment</li>
          </ul>
        )}
      </div>
    </div>
  );
}
