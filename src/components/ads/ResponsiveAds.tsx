'use client';

import { useState, useEffect } from 'react';
import { HighPerformanceAd } from './HighPerformanceAd';
import { EffectiveGateCPMAdSolo } from './EffectiveGateCPMAdSolo';

export const MobileOnlyAds = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show ads on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <div className="mobile-only-ads" style={{ width: '100%' }}>
      <div className="grid grid-cols-1 gap-4">
        <HighPerformanceAd />
        <EffectiveGateCPMAdSolo />
      </div>
    </div>
  );
};

export const DesktopOnlyAds = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show ads on desktop devices
  if (isMobile) {
    return null;
  }

  return (
    <div className="desktop-only-ads" style={{ width: '100%' }}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <HighPerformanceAd />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
        <EffectiveGateCPMAdSolo />
      </div>
    </div>
  );
};

export const ResponsiveAds = ({ mobileCount = 2, desktopCount = 12 }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const adCount = isMobile ? mobileCount : desktopCount;

  return (
    <div className="responsive-ads" style={{ width: '100%' }}>
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'} gap-4`}>
        {/* Always include High Performance Ad */}
        <HighPerformanceAd />
        
        {/* Add EffectiveGate CPM ads based on count */}
        {Array.from({ length: adCount - 1 }, (_, index) => (
          <EffectiveGateCPMAdSolo key={index} />
        ))}
      </div>
    </div>
  );
};
