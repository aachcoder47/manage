'use client';

import { useEffect, useRef, useState } from 'react';
import { ADSENSE_CONFIG, loadAdSenseScript, shouldShowAds } from '@/config/adsense.config';

interface AdSenseAdProps {
  slot: keyof typeof ADSENSE_CONFIG.adSlots;
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

export const AdSenseAd: React.FC<AdSenseAdProps> = ({ 
  slot, 
  className = '', 
  style = {},
  responsive = true 
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Check if ads should be shown
    if (!shouldShowAds()) {
      setShowAd(false);
      return;
    }
    setShowAd(true);

    // Load AdSense and display ad
    const loadAd = async () => {
      try {
        await loadAdSenseScript();
        
        if (adRef.current && window.googletag) {
          const slotConfig = ADSENSE_CONFIG.adSlots[slot];
          
          // Define ad slot
          const adSlot = window.googletag.defineSlot(
            `/${ADSENSE_CONFIG.publisherId}`,
            slotConfig.size,
            slotConfig.id
          );
          
          if (adSlot) {
            // Add targeting
            Object.entries(slotConfig.targeting).forEach(([key, value]) => {
              adSlot.setTargeting(key, value);
            });
            
            // Add service and display
            adSlot.addService(window.googletag.pubads());
            window.googletag.display(slotConfig.id);
            setIsLoaded(true);
          }
        }
      } catch (error) {
        console.error('Failed to load ad:', error);
      }
    };

    loadAd();

    // Cleanup
    return () => {
      if (window.googletag && adRef.current) {
        const slotConfig = ADSENSE_CONFIG.adSlots[slot];
        const adSlot = window.googletag.getSlots().find((slot: any) => slot.getSlotElementId() === slotConfig.id);
        if (adSlot) {
          window.googletag.destroySlots([adSlot]);
        }
      }
    };
  }, [slot]);

  if (!showAd) {
    return null; // Don't render anything if ads should be hidden
  }

  const slotConfig = ADSENSE_CONFIG.adSlots[slot];

  return (
    <div className={`ad-container ${className}`} style={{ ...style }}>
      <div
        id={slotConfig.id}
        ref={adRef}
        className="ad-slot"
        style={{
          minHeight: getMinHeight(slotConfig.size),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          position: 'relative'
        }}
      >
        {!isLoaded && (
          <div className="ad-placeholder" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            color: '#6c757d'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #dee2e6',
              borderTop: '2px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '10px'
            }} />
            <span style={{ fontSize: '12px' }}>Advertisement</span>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .ad-container {
          margin: 20px 0;
          text-align: center;
        }
        
        .ad-slot {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

// Helper function to get minimum height for ad slot
const getMinHeight = (sizes: number[][]): number => {
  const heights = sizes.map(size => size[1]);
  return Math.min(...heights);
};

// Responsive Ad Component
export const ResponsiveAdSenseAd: React.FC<Omit<AdSenseAdProps, 'responsive'>> = (props) => {
  return <AdSenseAd {...props} responsive={true} />;
};

// Header Banner Ad
export const HeaderBannerAd: React.FC<{ className?: string }> = ({ className }) => (
  <AdSenseAd 
    slot="headerBanner" 
    className={`header-ad ${className}`}
    style={{ width: '100%', maxWidth: '970px', margin: '0 auto' }}
  />
);

// Sidebar Ad
export const SidebarAd: React.FC<{ className?: string }> = ({ className }) => (
  <AdSenseAd 
    slot="sidebar" 
    className={`sidebar-ad ${className}`}
    style={{ width: '300px', margin: '20px auto' }}
  />
);

// Footer Banner Ad
export const FooterBannerAd: React.FC<{ className?: string }> = ({ className }) => (
  <AdSenseAd 
    slot="footerBanner" 
    className={`footer-ad ${className}`}
    style={{ width: '100%', maxWidth: '970px', margin: '20px auto' }}
  />
);

// In-Content Ad
export const InContentAd: React.FC<{ className?: string }> = ({ className }) => (
  <AdSenseAd 
    slot="inContent" 
    className={`in-content-ad ${className}`}
    style={{ width: '100%', maxWidth: '336px', margin: '20px auto' }}
  />
);

// Mobile Banner Ad
export const MobileBannerAd: React.FC<{ className?: string }> = ({ className }) => (
  <AdSenseAd 
    slot="mobileBanner" 
    className={`mobile-ad ${className}`}
    style={{ width: '100%', maxWidth: '320px', margin: '10px auto' }}
  />
);
