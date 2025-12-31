// AdSense configuration for Futuristic HR
export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-8490513657943266',
  
  // Ad slots configuration
  adSlots: {
    // Header banner ad
    headerBanner: {
      id: 'header-banner-ad',
      size: [[728, 90], [970, 90]], // Leaderboard
      targeting: {
        category: 'hr-tech',
        page_type: 'header'
      }
    },
    
    // Sidebar ad
    sidebar: {
      id: 'sidebar-ad',
      size: [[300, 250], [300, 600]], // Medium rectangle and large skyscraper
      targeting: {
        category: 'hr-tech',
        page_type: 'sidebar'
      }
    },
    
    // Footer ad
    footerBanner: {
      id: 'footer-banner-ad',
      size: [[728, 90], [970, 250]], // Leaderboard and billboard
      targeting: {
        category: 'hr-tech',
        page_type: 'footer'
      }
    },
    
    // In-content ad for blog/documentation pages
    inContent: {
      id: 'in-content-ad',
      size: [[300, 250], [336, 280]], // Medium rectangle and large rectangle
      targeting: {
        category: 'hr-tech',
        page_type: 'content'
      }
    },
    
    // Mobile responsive ad
    mobileBanner: {
      id: 'mobile-banner-ad',
      size: [[320, 50], [320, 100]], // Mobile leaderboard
      targeting: {
        category: 'hr-tech',
        page_type: 'mobile'
      }
    }
  },
  
  // AdSense settings
  settings: {
    enableSingleRequest: true,
    collapseEmptyDivs: true,
    centerAds: true,
    targeting: {
      site: 'futuristic-hr',
      industry: 'hr-technology',
      platform: 'web'
    }
  }
};

// Helper function to check if ads should be shown
export const shouldShowAds = (): boolean => {
  // Don't show ads in development
  if (process.env.NODE_ENV === 'development') return false;
  
  // Don't show ads for premium users (implement user tier check)
  const userTier = localStorage.getItem('userTier');
  if (userTier === 'premium' || userTier === 'enterprise') return false;
  
  // Don't show ads on admin pages
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('/admin') || path.includes('/settings')) return false;
  }
  
  return true;
};

// AdSense script loader
export const loadAdSenseScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    // Check if script is already loaded
    if (window.googletag && window.googletag.apiReady) {
      resolve();
      return;
    }

    // Create AdSense script
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // Initialize Google Publisher Tag
      window.googletag = window.googletag || { cmd: [] };
      window.googletag.cmd.push(() => {
        window.googletag.pubads().enableSingleRequest();
        window.googletag.pubads().collapseEmptyDivs();
        window.googletag.enableServices();
      });
      resolve();
    };
    
    script.onerror = () => reject(new Error('Failed to load AdSense script'));
    
    document.head.appendChild(script);
  });
};

// TypeScript declarations for Google Publisher Tag
declare global {
  interface Window {
    googletag: any;
    adsbygoogle: any[];
  }
}
