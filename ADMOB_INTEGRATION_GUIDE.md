# 📱 **AdMob/AdSense Integration Guide**

## 🎯 **Overview**

This guide shows how to integrate Google AdSense (web equivalent of AdMob) into your Futuristic HR Next.js application.

## ⚡ **Quick Setup**

### **1. Get AdSense Publisher ID**
1. **Sign up** at [Google AdSense](https://www.google.com/adsense/start/)
2. **Add your site**: `https://hr.futuristiccreations.store`
3. **Get Publisher ID**: Format: `ca-pub-xxxxxxxxxxxxxxxx`
4. **Wait for approval** (usually 1-2 weeks)

### **2. Update Environment Variables**
```env
# In your .env file
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_PUBLISHER_ID
NEXT_PUBLIC_ADSENSE_ENABLED=true
```

### **3. Components Available**

#### **Ad Components**
- `AdSenseAd` - Generic ad component
- `HeaderBannerAd` - Top banner (728x90)
- `SidebarAd` - Sidebar rectangle (300x250)
- `FooterBannerAd` - Bottom banner (728x90)
- `InContentAd` - Content rectangle (300x250)
- `MobileBannerAd` - Mobile banner (320x50)

#### **Layout Components**
- `AdSenseLayout` - Full page with ads
- `AdSenseProvider` - Context provider

## 🚀 **Usage Examples**

### **Basic Usage**
```tsx
import { HeaderBannerAd, SidebarAd } from '@/components/ads/AdSenseAd';

export default function MyPage() {
  return (
    <div>
      <HeaderBannerAd />
      
      <div style={{ display: 'flex' }}>
        <main>Your content here</main>
        <aside>
          <SidebarAd />
        </aside>
      </div>
    </div>
  );
}
```

### **Full Layout with Ads**
```tsx
import { AdSenseLayout } from '@/components/ads/AdSenseLayout';

export default function MyPage() {
  return (
    <AdSenseLayout 
      showHeaderAd={true}
      showFooterAd={true}
      showSidebarAd={true}
      showMobileAd={true}
    >
      <div>Your content here</div>
    </AdSenseLayout>
  );
}
```

### **Conditional Ads**
```tsx
import { useAdSense } from '@/contexts/AdSenseContext';
import { InContentAd } from '@/components/ads/AdSenseAd';

export default function BlogPost() {
  const { isEnabled } = useAdSense();
  
  return (
    <article>
      <p>Your blog content...</p>
      
      {isEnabled && <InContentAd />}
      
      <p>More content...</p>
    </article>
  );
}
```

## 📊 **Ad Placements**

### **Header Banner**
- **Size**: 728x90 (Leaderboard)
- **Location**: Top of page
- **Best for**: General visibility

### **Sidebar**
- **Size**: 300x250 (Medium Rectangle)
- **Location**: Right sidebar
- **Best for**: Desktop views

### **Footer Banner**
- **Size**: 728x90 or 970x250
- **Location**: Bottom of page
- **Best for**: Exit intent

### **In-Content**
- **Size**: 300x250 or 336x280
- **Location**: Between content
- **Best for**: Blog posts, documentation

### **Mobile Banner**
- **Size**: 320x50
- **Location**: Mobile views
- **Best for**: Mobile users

## 🎛️ **Configuration Options**

### **AdSense Config** (`src/config/adsense.config.ts`)
```typescript
export const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-YOUR_ID',
  adSlots: {
    // Define custom ad slots
    customAd: {
      id: 'custom-ad',
      size: [[300, 250]],
      targeting: {
        category: 'hr-tech',
        page_type: 'custom'
      }
    }
  },
  settings: {
    enableSingleRequest: true,
    collapseEmptyDivs: true,
    centerAds: true
  }
};
```

### **Targeting Options**
```typescript
targeting: {
  category: 'hr-tech',
  page_type: 'dashboard',
  user_tier: 'free',
  industry: 'technology'
}
```

## 🚫 **Ad Blocking Rules**

### **Automatic Ad Blocking**
- **Development mode**: Ads disabled
- **Premium users**: Ads hidden
- **Admin pages**: No ads
- **Settings pages**: No ads

### **User-Based Blocking**
```typescript
// Check user tier in localStorage
const userTier = localStorage.getItem('userTier');
if (userTier === 'premium' || userTier === 'enterprise') {
  // Don't show ads
}
```

## 💰 **Revenue Optimization**

### **Best Practices**
1. **Strategic Placement**: Above the fold, in-content
2. **Responsive Design**: Mobile-optimized ads
3. **User Experience**: Don't overdo ads
4. **A/B Testing**: Test different placements
5. **Analytics**: Monitor performance

### **Ad Density Guidelines**
- **Desktop**: Max 3-4 ads per page
- **Mobile**: Max 2-3 ads per page
- **Content Ratio**: 70% content, 30% ads max

## 🔧 **Customization**

### **Custom Ad Component**
```tsx
import { AdSenseAd } from '@/components/ads/AdSenseAd';

export const CustomAd = () => (
  <AdSenseAd 
    slot="customAd"
    className="my-custom-ad"
    style={{ width: '100%', maxWidth: '600px' }}
  />
);
```

### **Custom Styling**
```css
.ad-container {
  margin: 20px 0;
  text-align: center;
}

.ad-slot {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}
```

## 📱 **Mobile Optimization**

### **Responsive Ads**
```tsx
import { AdSenseAd } from '@/components/ads/AdSenseAd';

export const ResponsiveAd = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  return (
    <AdSenseAd 
      slot={isMobile ? 'mobileBanner' : 'sidebar'}
      responsive={true}
    />
  );
};
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Ads Not Showing**
1. **Check Publisher ID**: Correct format?
2. **Environment Variables**: Set correctly?
3. **Development Mode**: Ads disabled in dev
4. **AdSense Approval**: Account approved?
5. **Console Errors**: Check browser console

#### **Empty Ad Spaces**
1. **No Inventory**: No ads available
2. **Blocking**: Ad blocker enabled
3. **Targeting**: Too specific targeting
4. **Size**: Unsupported ad size

#### **Revenue Issues**
1. **Traffic**: Low page views
2. **Placement**: Poor ad positions
3. **Content**: Not ad-friendly
4. **Geography**: Low CPC regions

### **Debug Tools**
```typescript
// Enable debug mode
localStorage.setItem('adsense_debug', 'true');

// Check ad status
console.log('AdSense enabled:', useAdSense().isEnabled);
console.log('AdSense loaded:', useAdSense().isLoaded);
```

## 📋 **Testing**

### **Test Page**
Visit `/ads-example` to test ad integration:
```bash
npm run dev
# Navigate to http://localhost:3000/ads-example
```

### **Test Checklist**
- [ ] Ads load correctly
- [ ] Responsive design works
- [ ] Premium users see no ads
- [ ] Mobile ads display properly
- [ ] No console errors
- [ ] AdSense script loads

## 🎯 **Next Steps**

1. **Get AdSense Approval**
2. **Update Environment Variables**
3. **Test with Real Publisher ID**
4. **Monitor Performance**
5. **Optimize Placements**
6. **Scale Revenue**

## 📞 **Support**

- **Google AdSense Help**: https://support.google.com/adsense
- **AdSense Policies**: https://support.google.com/adsense/policy
- **Revenue Reports**: AdSense Dashboard

---

**Note**: AdSense approval can take 1-2 weeks. Apply early and ensure your site has quality content and good user experience.
