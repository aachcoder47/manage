'use client';

import { useEffect, useState } from 'react';
import { HighPerformanceAd } from './HighPerformanceAd';
import { EffectiveGateCPMAdSolo } from './EffectiveGateCPMAdSolo';

export const ProductionDomainAds = () => {
  const [isProductionDomain, setIsProductionDomain] = useState(false);

  useEffect(() => {
    // Check if we're on the production domain
    const isProd = window.location.hostname === 'hr.futuristiccreations.store';
    setIsProductionDomain(isProd);
  }, []);

  // Only show ads on hr.futuristiccreations.store
  if (!isProductionDomain) {
    return null;
  }

  return (
    <div className="production-domain-ads" style={{ width: '100%' }}>
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
        <EffectiveGateCPMAdSolo />
      </div>
    </div>
  );
};

export const ProductionDomainResponsiveAds = () => {
  const [isProductionDomain, setIsProductionDomain] = useState(false);

  useEffect(() => {
    // Check if we're on the production domain
    const isProd = window.location.hostname === 'hr.futuristiccreations.store';
    setIsProductionDomain(isProd);
  }, []);

  // Only show ads on hr.futuristiccreations.store
  if (!isProductionDomain) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        .mobileShow { display: none; }
        
        /* Mobile devices */
        @media only screen and (min-device-width: 320px) and (max-device-width: 768px) {
          .mobileShow { display: block; }
        }
        
        .mobileHide { display: block; }
        
        /* Mobile devices */
        @media only screen and (min-device-width: 320px) and (max-device-width: 768px) {
          .mobileHide { display: none; }
        }
      `}</style>

      {/* Mobile-only ads */}
      <div className="mobileShow">
        <div style={{ width: '100%', padding: '10px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '14px' }}>
            Mobile Opportunities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <HighPerformanceAd />
            <EffectiveGateCPMAdSolo />
          </div>
        </div>
      </div>

      {/* Desktop-only ads */}
      <div className="mobileHide">
        <div style={{ width: '100%', padding: '20px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px' }}>
            Desktop Opportunities
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: '15px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
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
            <EffectiveGateCPMAdSolo />
          </div>
        </div>
      </div>
    </>
  );
};
