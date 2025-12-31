'use client';

import { useEffect, useState, useRef } from 'react';
import AdErrorBoundary from './AdErrorBoundary';

const EffectiveGateCPMAdInner = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    if (window.atOptions && window.atOptions.key === '246865934f701b98747445a2ca184197') {
      setScriptLoaded(true);
      setAdLoaded(true);
      return;
    }

    // Set up ad options
    window.atOptions = {
      'key': '246865934f701b98747445a2ca184197',
      'format': 'iframe',
      'height': 300,
      'width': 160,
      'params': {}
    };

    // Load ad script
    const script = document.createElement('script');
    script.src = 'https://pl28372930.effectivegatecpm.com/ab/7e/59/ab7e59d6e02e59d9bad31bf3ed28e256.js';
    script.async = true;
    
    script.onload = () => {
      setScriptLoaded(true);
      setAdLoaded(true);
      console.log('EffectiveGate CPM ad script loaded successfully');
    };
    
    script.onerror = (error) => {
      setAdError(true);
      console.warn('EffectiveGate CPM ad script failed to load (normal in development):', error);
    };
    
    // Add script to head
    try {
      document.head.appendChild(script);
    } catch (error) {
      console.warn('Failed to append EffectiveGate CPM ad script:', error);
      setAdError(true);
    }

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize ad when script is loaded and container is ready
  useEffect(() => {
    if (scriptLoaded && containerRef.current) {
      try {
        // Create ad container element that script expects
        const adContainer = document.createElement('ins');
        adContainer.className = 'adsbygoogle';
        adContainer.style.display = 'block';
        adContainer.style.width = '160px';
        adContainer.style.height = '300px';
        
        // Clear container and append ad element
        const adInner = containerRef.current.querySelector('.ad-inner');
        if (adInner) {
          adInner.innerHTML = '';
          adInner.appendChild(adContainer);
        }
        
        // Try to initialize ad
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          window.adsbygoogle.push({});
        }
        
        console.log('EffectiveGate CPM ad container initialized, waiting for ad content...');
      } catch (error) {
        console.warn('Failed to initialize EffectiveGate CPM ad:', error);
      }
    }
  }, [scriptLoaded]);

  return (
    <div ref={containerRef} style={{ 
      width: '100%', 
      maxWidth: '160px', 
      margin: '20px auto',
      border: '2px solid #28a745',
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      minHeight: '300px'
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
        width: '160px',
        height: '300px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div className="ad-inner" style={{ width: '100%', height: '100%' }}>
          {!scriptLoaded && !adError && 'Initializing...'}
          {scriptLoaded && !adError && !adLoaded && 'Loading ad...'}
          {adError && 'Ad space (development)'}
          {adLoaded && !adError && 'Ad space (160x300)'}
        </div>
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

export const EffectiveGateCPMAdSolo = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render on client side to prevent hydration issues
  if (!isClient) {
    return (
      <div style={{ 
        width: '100%', 
        maxWidth: '160px', 
        margin: '20px auto',
        border: '2px solid #28a745',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Advertisement
      </div>
    );
  }

  return (
    <AdErrorBoundary>
      <EffectiveGateCPMAdInner />
    </AdErrorBoundary>
  );
};
