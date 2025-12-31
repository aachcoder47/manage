'use client';

import { useEffect, useState, useRef } from 'react';
import AdErrorBoundary from './AdErrorBoundary';

const HighPerformanceAdInner = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    if (window.atOptions && window.atOptions.key === 'fe3895f99206c82f4759859c69595d78') {
      setScriptLoaded(true);
      setAdLoaded(true);
      return;
    }

    // Set up ad options
    window.atOptions = {
      'key': 'fe3895f99206c82f4759859c69595d78',
      'format': 'iframe',
      'height': 60,
      'width': 468,
      'params': {}
    };

    // Load the ad script
    const script = document.createElement('script');
    script.src = 'https://www.highperformanceformat.com/fe3895f99206c82f4759859c69595d78/invoke.js';
    script.async = true;
    
    script.onload = () => {
      setScriptLoaded(true);
      setAdLoaded(true);
      console.log('High Performance Format ad script loaded successfully');
    };
    
    script.onerror = (error) => {
      setAdError(true);
      console.warn('High Performance Format ad script failed to load (normal in development):', error);
    };
    
    // Add script to head
    try {
      document.head.appendChild(script);
    } catch (error) {
      console.warn('Failed to append ad script:', error);
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
        // Create the ad container element that the script expects
        const adContainer = document.createElement('ins');
        adContainer.className = 'adsbygoogle';
        adContainer.style.display = 'block';
        adContainer.style.width = '468px';
        adContainer.style.height = '60px';
        
        // Clear container and append ad element
        const adInner = containerRef.current.querySelector('.ad-inner');
        if (adInner) {
          adInner.innerHTML = '';
          adInner.appendChild(adContainer);
        }
        
        // Try to initialize the ad
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          window.adsbygoogle.push({});
        }
        
        console.log('Ad container initialized, waiting for ad content...');
      } catch (error) {
        console.warn('Failed to initialize ad:', error);
      }
    }
  }, [scriptLoaded]);

  return (
    <div ref={containerRef} style={{ 
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
        margin: '0 auto',
        position: 'relative'
      }}>
        <div className="ad-inner" style={{ width: '100%', height: '100%' }}>
          {!scriptLoaded && !adError && 'Initializing...'}
          {scriptLoaded && !adError && !adLoaded && 'Loading ad...'}
          {adError && 'Ad space (development)'}
          {adLoaded && !adError && 'Ad space (468x60)'}
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

export const HighPerformanceAd = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render on client side to prevent hydration issues
  if (!isClient) {
    return (
      <div style={{ 
        width: '100%', 
        maxWidth: '468px', 
        margin: '20px auto',
        border: '2px solid #ff6b35',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        minHeight: '60px',
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
      <HighPerformanceAdInner />
    </AdErrorBoundary>
  );
};

// TypeScript declarations
declare global {
  interface Window {
    atOptions: any;
    adsbygoogle: any[];
  }
}
