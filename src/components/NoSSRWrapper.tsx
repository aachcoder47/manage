// components/NoSSRWrapper.tsx
'use client';

import { useEffect, useState } from 'react';

interface NoSSRWrapperProps {
  children: React.ReactNode;
}

export const NoSSRWrapper: React.FC<NoSSRWrapperProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
};
