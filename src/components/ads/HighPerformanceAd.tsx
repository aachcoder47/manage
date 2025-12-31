'use client';

import { useEffect, useState } from 'react';

export const HighPerformanceAd = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    // Set up ad options
    (window as any).atOptions = {
      'key': 'fe3895f99206c82f4759859c69595d78',
      'format': 'iframe',
      'height': 60,
      'width': 468,
      'params': {}
    };

    // Load the ad script
    const script = document.createElement('script');
    script.src = 'https://www.highperformanceformat.com/fe3895f99206c82f4759859c69595d78/invoke.js';
    
    script.onload = () => {
      setAdLoaded(true);
      console.log('High Performance Format ad script loaded successfully');
    };
    
    script.onerror = (error) => {
      setAdError(true);
      console.warn('High Performance Format ad script failed to load (normal in development):', error);
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '468px', 
      margin: '20px auto',
      border: '2px solid #ff6b35',
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      minHeight: '60px'
    }}>
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#666', 
        marginBottom: '5px' 
      }}>
        Advertisement
      </div>
      <div style={{
        width: '468px',
        height: '60px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        margin: '0 auto'
      }}>
        {!adLoaded && !adError && 'Loading ad...'}
        {adError && 'Ad space (development)'}
        {adLoaded && 'Ad space (468x60)'}
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          fontSize: '10px',
          color: '#999',
          textAlign: 'center',
          marginTop: '5px'
        }}>
          Dev mode - Network errors expected
        </div>
      )}
    </div>
  );
};
