'use client';

import { useEffect, useState } from 'react';
import { HighPerformanceAd } from './HighPerformanceAd';
import { EffectiveGateCPMAd } from './EffectiveGateCPMAd';

export const ProductionAds = () => {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production
    const isProd = process.env.NODE_ENV === 'production' && 
                  window.location.hostname !== 'localhost' &&
                  window.location.hostname !== '127.0.0.1';
    setIsProduction(isProd);
  }, []);

  // Only show ads in production
  if (!isProduction) {
    return null; // No ads in development
  }

  return (
    <div className="flex justify-center gap-4">
      <HighPerformanceAd />
      <EffectiveGateCPMAd />
    </div>
  );
};
