'use client';

import { HighPerformanceAd } from './HighPerformanceAd';
import { EffectiveGateCPMAdSolo } from './EffectiveGateCPMAdSolo';

export const CSSResponsiveAds = () => {
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
