'use client';

import { useState, useEffect } from 'react';
import { HeaderBannerAd, FooterBannerAd, SidebarAd, MobileBannerAd } from './AdSenseAd';
import { useAdSense } from '@/contexts/AdSenseContext';

interface AdSenseLayoutProps {
  children: React.ReactNode;
  showHeaderAd?: boolean;
  showFooterAd?: boolean;
  showSidebarAd?: boolean;
  showMobileAd?: boolean;
}

export const AdSenseLayout: React.FC<AdSenseLayoutProps> = ({
  children,
  showHeaderAd = true,
  showFooterAd = true,
  showSidebarAd = true,
  showMobileAd = true,
}) => {
  const { isEnabled, isLoaded } = useAdSense();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="adsense-layout">
      {/* Header Banner - Show on desktop only */}
      {showHeaderAd && !isMobile && (
        <div className="header-ad-container">
          <HeaderBannerAd />
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="main-content-wrapper" style={{ display: 'flex', gap: '20px' }}>
        {/* Main Content */}
        <div className="main-content" style={{ flex: 1 }}>
          {children}
        </div>

        {/* Sidebar - Show on desktop only */}
        {showSidebarAd && !isMobile && (
          <aside className="sidebar-ads" style={{ width: '300px', flexShrink: 0 }}>
            <SidebarAd />
            {/* Additional sidebar content can go here */}
          </aside>
        )}
      </div>

      {/* Mobile Banner - Show on mobile only */}
      {showMobileAd && isMobile && (
        <div className="mobile-ad-container">
          <MobileBannerAd />
        </div>
      )}

      {/* Footer Banner */}
      {showFooterAd && (
        <div className="footer-ad-container">
          <FooterBannerAd />
        </div>
      )}

      <style jsx>{`
        .adsense-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header-ad-container {
          background: #ffffff;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .main-content-wrapper {
          flex: 1;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .mobile-ad-container {
          padding: 10px 0;
          background: #ffffff;
          border-top: 1px solid #e9ecef;
        }

        .footer-ad-container {
          background: #f8f9fa;
          padding: 20px 0;
          border-top: 1px solid #e9ecef;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .main-content-wrapper {
            flex-direction: column;
            padding: 10px;
          }

          .sidebar-ads {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
