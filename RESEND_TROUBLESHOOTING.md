# Resend Email Service Troubleshooting Guide

## 🔍 **Common Issues & Solutions**

### **1. API Key Issues**

#### Problem: "Invalid API key" or "Authentication failed"
**Solution:**
```bash
# Check your .env file
cat .env | grep RESEND
```

**Fix:**
```env
# Get your API key from https://resend.com/dashboard/api-keys
RESEND_API_KEY=re_your_actual_api_key_here
```

### **2. Domain Verification**

#### Problem: "Domain not verified" or "Email not sending"
**Solution:**
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain: `futuristiccreations.store`
3. Add DNS records:
   - **TXT**: `v=spf1 include:_spf.resend.com ~all`
   - **TXT**: `v=dkim1 k=rsa; p=MIGhMA0GCSqGSIb3DQEBAQUAA4GkCCQTF...`
   - **TXT**: `v=DMARC1; p=none; rua=include:_spf.resend.com;`

### **3. From Email Issues**

#### Problem: "Invalid from address"
**Solution:**
```env
# Must match verified domain
RESEND_FROM_EMAIL=onboarding@futuristiccreations.store
RESEND_FROM_NAME=Futuristic HR
```

### **4. Environment Variables**

#### Problem: Environment variables not loading
**Solution:**
```bash
# Restart your development server
npm run dev

# Or rebuild for production
npm run build
npm start
```

## 🧪 **Quick Test Script**

### **Test Resend Connection**
```javascript
// Run this in your browser console or Node.js
import { testResendConnection, testEmailSending, checkEnvironment } from './src/utils/test-resend.js';

// 1. Check environment
checkEnvironment();

// 2. Test connection (only if API key is set)
if (process.env.RESEND_API_KEY) {
  await testResendConnection();
  
  // 3. Test email sending
  await testEmailSending();
}
```

## 📧 **Test Email Templates**

### **Simple Test Email**
```javascript
import { emailService } from './src/services/email.service';

await emailService.sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1><p>This is a test email from Futuristic HR</p>',
});
```

### **Test Welcome Email**
```javascript
import { emailTriggerService } from './src/services/email-trigger.service';

await emailTriggerService.sendWelcomeEmail({
  name: 'Test User',
  userEmail: 'your-email@example.com',
  userId: 'test_user',
  organizationId: 'test_org',
});
```

## 🔧 **Resend API Endpoints**

### **Check API Key Validity**
```bash
curl -X POST https://api.resend.com/domains \
  -H "Authorization: Bearer re_your_api_key" \
  -H "Content-Type: application/json"
```

### **Send Test Email**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@futuristiccreations.store",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

## 🚀 **Production Setup**

### **1. Domain Setup**
1. **Add domain** in Resend dashboard
2. **Verify DNS records** (takes 24-48 hours)
3. **Test sending** from verified domain

### **2. Environment Variables**
```env
# Production
RESEND_API_KEY=re_live_production_key
RESEND_FROM_EMAIL=onboarding@futuristiccreations.store
RESEND_FROM_NAME=Futuristic HR
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

### **3. Rate Limits**
- **Free tier**: 100 emails/day
- **Pro tier**: 50,000 emails/day
- **Enterprise**: Unlimited

## 📊 **Debugging Steps**

### **1. Check Environment**
```javascript
console.log('API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Missing');
console.log('From Email:', process.env.RESEND_FROM_EMAIL || 'Missing');
```

### **2. Test API Connection**
```javascript
const response = await fetch('https://api.resend.com/domains', {
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  },
});
```

### **3. Check Email Logs**
```javascript
// In your email service
console.log('Email log:', { userId, emailType, status, to, subject });
```

## 🆘 **Common Error Messages**

### **"Invalid API key"**
- Check API key is correct
- Ensure no extra spaces or quotes
- Verify key is active in Resend dashboard

### **"Domain not verified"**
- Complete domain verification
- Wait 24-48 hours for DNS propagation
- Check SPF/DKIM records

### **"From address not authorized"**
- Use verified domain email
- Ensure domain is added to Resend
- Check DNS configuration

### **"Rate limit exceeded"**
- Check your plan limits
- Wait for rate limit reset
- Consider upgrading plan

## 📞 **Support Resources**

- **Resend Dashboard**: https://resend.com/dashboard
- **Documentation**: https://resend.com/docs
- **Status Page**: https://resend.com/status
- **Support**: support@resend.com

## 🎯 **Quick Fix Checklist**

1. ✅ **API Key**: Set correctly in `.env`
2. ✅ **Domain**: Added and verified in Resend
3. ✅ **DNS**: SPF/DKIM/DMARC records configured
4. ✅ **From Email**: Uses verified domain
5. ✅ **Environment**: Variables loaded properly
6. ✅ **Test**: Send test email successfully

Run the test script to identify your specific issue! 🚀
