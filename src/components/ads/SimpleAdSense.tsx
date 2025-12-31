'use client';

import { useEffect, useState } from 'react';

export const SimpleAdSense = () => {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Load AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8490513657943266';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      setAdLoaded(true);
      console.log('AdSense script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load AdSense script');
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (adLoaded && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log('Ad pushed to adsbygoogle');
      } catch (error) {
        console.error('Error pushing ad:', error);
      }
    }
  }, [adLoaded]);

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '728px', 
      margin: '20px auto',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#666', 
        marginBottom: '5px' 
      }}>
        Advertisement
      </div>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: '100%',
          height: '90px',
          backgroundColor: '#fff',
          border: '1px solid #ddd'
        }}
        data-ad-client="ca-pub-8490513657943266"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      {!adLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666'
        }}>
          Loading ad...
        </div>
      )}
    </div>
  );
};

// TypeScript declaration
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
