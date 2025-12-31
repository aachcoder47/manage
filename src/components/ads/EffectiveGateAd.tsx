'use client';

import { useEffect, useState } from 'react';

export const EffectiveGateAd = () => {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Load the ad script
    const script = document.createElement('script');
    script.src = 'https://pl28372665.effectivegatecpm.com/38/41/9d/bc1qdw7cav7z9l2675fslaupjxu4ugdn2lz5x8q5e7.js';
    
    script.onload = () => {
      setAdLoaded(true);
      console.log('EffectiveGate ad script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load EffectiveGate ad script');
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
      maxWidth: '728px', 
      margin: '20px auto',
      border: '2px solid #28a745',
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      minHeight: '90px'
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
        width: '100%',
        height: '90px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        {!adLoaded ? 'Loading ad...' : 'Ad space'}
      </div>
    </div>
  );
};
