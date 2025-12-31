'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { loadAdSenseScript } from '@/config/adsense.config';

interface AdSenseContextType {
  isLoaded: boolean;
  isEnabled: boolean;
  error: string | null;
}

const AdSenseContext = createContext<AdSenseContextType>({
  isLoaded: false,
  isEnabled: false,
  error: null,
});

export const useAdSense = () => useContext(AdSenseContext);

interface AdSenseProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const AdSenseProvider: React.FC<AdSenseProviderProps> = ({ 
  children, 
  enabled = true 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);

  useEffect(() => {
    // Load in both development and production for testing
    if (!enabled) {
      setIsEnabled(false);
      return;
    }

    // Check if user has premium subscription (hide ads for premium users)
    const userTier = localStorage.getItem('userTier');
    if (userTier === 'premium' || userTier === 'enterprise') {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    // Load AdSense script
    loadAdSenseScript()
      .then(() => {
        setIsLoaded(true);
        console.log('AdSense loaded successfully');
      })
      .catch((err) => {
        setError(err.message);
        console.error('Failed to load AdSense:', err);
      });
  }, [enabled]);

  return (
    <AdSenseContext.Provider value={{ isLoaded, isEnabled, error }}>
      {children}
    </AdSenseContext.Provider>
  );
};
