'use client';

import { useEffect } from 'react';
import { ADSENSE_CONFIG } from '@/config/adsense.config';

interface AdSenseScriptLoaderProps {
  children: React.ReactNode;
}

export const AdSenseScriptLoader: React.FC<AdSenseScriptLoaderProps> = ({ children }) => {
  useEffect(() => {
    // Load in both development and production for testing
    if (process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== 'true') return;

    // Check if script is already loaded
    if (window.adsbygoogle && window.adsbygoogle.length > 0) {
      return;
    }

    // Create and inject AdSense script
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Initialize adsbygoogle array
    window.adsbygoogle = window.adsbygoogle || [];
    
    document.head.appendChild(script);

    // Initialize Google Publisher Tag
    if (window.googletag && window.googletag.cmd) {
      window.googletag.cmd.push(() => {
        window.googletag.pubads().enableSingleRequest();
        window.googletag.pubads().collapseEmptyDivs();
        window.googletag.enableServices();
      });
    }

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector(`script[src*="pagead2.googlesyndication.com"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return <>{children}</>;
};

// Auto Ad Component (for automatic ad placement)
export const AutoAdSense: React.FC = () => {
  useEffect(() => {
    // Show in both development and production for testing
    if (process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== 'true') return;
    
    // Check if user has premium subscription
    const userTier = localStorage.getItem('userTier');
    if (userTier === 'premium' || userTier === 'enterprise') return;

    // Initialize auto ads
    if (window.adsbygoogle) {
      window.adsbygoogle.push({
        google_ad_client: ADSENSE_CONFIG.publisherId,
        enable_page_level_ads: true
      });
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CONFIG.publisherId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

// Manual Ad Component (for specific placement)
interface ManualAdSenseProps {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const ManualAdSense: React.FC<ManualAdSenseProps> = ({
  adSlot,
  adFormat = 'auto',
  style = { display: 'block' },
  className = ''
}) => {
  useEffect(() => {
    // Show in both development and production for testing
    if (process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== 'true') return;
    
    // Check if user has premium subscription
    const userTier = localStorage.getItem('userTier');
    if (userTier === 'premium' || userTier === 'enterprise') return;

    // Push ad to adsbygoogle array
    if (window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [adSlot, adFormat]);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={ADSENSE_CONFIG.publisherId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
};

// TypeScript declarations
declare global {
  interface Window {
    adsbygoogle: any[];
    googletag: any;
  }
}
