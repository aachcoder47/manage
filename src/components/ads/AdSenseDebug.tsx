'use client';

import { useEffect, useState } from 'react';

export const AdSenseDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    scriptLoaded: false,
    adsbygoogle: false,
    googletag: false,
    environment: '',
    publisherId: '',
    adSenseEnabled: '',
    userTier: '',
    localStorage: {}
  });

  useEffect(() => {
    const checkAdSense = () => {
      setDebugInfo({
        scriptLoaded: !!document.querySelector('script[src*="pagead2.googlesyndication.com"]'),
        adsbygoogle: !!(window.adsbygoogle && window.adsbygoogle.length > 0),
        googletag: !!window.googletag,
        environment: process.env.NODE_ENV,
        publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'Not set',
        adSenseEnabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED || 'Not set',
        userTier: localStorage.getItem('userTier') || 'Not set',
        localStorage: {
          userTier: localStorage.getItem('userTier'),
          // Add other relevant localStorage items
        }
      });
    };

    checkAdSense();
    const interval = setInterval(checkAdSense, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>🔍 AdSense Debug</h4>
      <div style={{ lineHeight: '1.4' }}>
        <div>Script: {debugInfo.scriptLoaded ? '✅' : '❌'}</div>
        <div>Adsbygoogle: {debugInfo.adsbygoogle ? '✅' : '❌'}</div>
        <div>Googletag: {debugInfo.googletag ? '✅' : '❌'}</div>
        <div>Env: {debugInfo.environment}</div>
        <div>Publisher ID: {debugInfo.publisherId}</div>
        <div>Enabled: {debugInfo.adSenseEnabled}</div>
        <div>User Tier: {debugInfo.userTier}</div>
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Reload Page
      </button>
    </div>
  );
};
