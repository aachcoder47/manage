# 🔧 **Email API Not Working - Debugging Guide**

## ❌ **Problem Identified**
Emails are not being sent through the API endpoints.

## 🔍 **Root Causes & Solutions**

### **1. Missing Email Types in API**
The email API was missing `rejection` and `offer` types.

**✅ FIXED**: Added missing email types to `/api/email/route.ts`

### **2. Environment Variables**
Check if your `.env` file has the correct Resend configuration:

```env
# Required for email sending
RESEND_API_KEY=re_ht4JNAKN_4YotutZgde5CdjhJBeUZhMCbJ
RESEND_FROM_EMAIL=onboarding@futuristiccreations.store
RESEND_FROM_NAME=Futuristic HR
```

### **3. API Endpoint Testing**
Use the new test endpoint to debug:

```bash
# Test rejection email
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "type": "rejection"
  }'

# Test offer email
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "type": "offer"
  }'
```

## 🚀 **Quick Debug Steps**

### **Step 1: Test API Directly**
```javascript
// Test in browser console
fetch('/api/email/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your-email@example.com',
    type: 'rejection'
  })
})
.then(res => res.json())
.then(data => console.log('Result:', data))
.catch(err => console.error('Error:', err));
```

### **Step 2: Check Console Logs**
Look for these messages:
- `Email sent successfully: {id: "..."}`
- `Rejection email sent to: email@example.com`
- `Error sending rejection email:`

### **Step 3: Check Network Tab**
Look for failed requests to:
- `/api/email/test`
- `/api/email`
- `/api/candidate-status`

### **Step 4: Verify Environment**
```javascript
// Check if environment variables are loaded
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Missing');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Missing');
```

## 📧 **Email Flow Debug**

### **When You Change Candidate Status:**
1. **Status Update** → `candidate-status.service.ts`
2. **Check Preferences** → `emailService.canSendEmail()`
3. **Send Email** → `emailTriggerService.sendRejectionEmail()`
4. **Resend API** → `resend.emails.send()`
5. **Log Result** → `emailService.logEmail()`

### **Common Break Points:**
- ❌ Missing environment variables
- ❌ Invalid email address
- ❌ User opted out of emails
- ❌ Network issues with Resend API
- ❌ Invalid API key

## 🔍 **Debug Script**

### **Complete Email Test**
```javascript
// Test all email types
const testEmail = async (type) => {
  const response = await fetch('/api/email/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'your-email@example.com',
      type: type
    })
  });
  
  const result = await response.json();
  console.log(`${type} email:`, result);
};

// Test all types
testEmail('welcome');
testEmail('rejection');
testEmail('offer');
```

## 🎯 **Immediate Actions**

### **Step 1: Restart Application**
```bash
npm run dev
```

### **Step 2: Test Email API**
```javascript
fetch('/api/email/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your-email@example.com',
    type: 'rejection'
  })
})
```

### **Step 3: Check Results**
- ✅ Success: Email sent to your inbox
- ❌ Error: Check console logs for details

### **Step 4: Test Candidate Status**
1. Change any candidate status to "REJECTED" or "OFFERED"
2. Check browser console for logs
3. Check email inbox

## 🚨 **If Still Not Working**

### **Check Resend API Directly**
```javascript
// Test Resend API directly
fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer re_ht4JNAKN_4YotutZgde5CdjhJBeUZhMCbJ',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'onboarding@futuristiccreations.store',
    to: 'your-email@example.com',
    subject: 'Direct API Test',
    html: '<h1>Direct Test</h1>'
  })
})
```

### **Check Supabase Connection**
```javascript
// Test database connection
const { data, error } = await supabase
  .from('email_log')
  .select('*')
  .limit(1);
console.log('Database test:', { data, error });
```

## 📋 **Working Checklist**

- ✅ `.env` has Resend keys
- ✅ API endpoints include all email types
- ✅ Application restarted
- ✅ Test API endpoint works
- ✅ Console shows success messages
- ✅ Emails arrive in inbox

**Use the test endpoint to debug your email issues!** 🚀

The new `/api/email/test` endpoint will help you identify exactly where the email sending is failing.
