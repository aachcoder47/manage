# 🔧 **Email Not Sending - Troubleshooting Guide**

## ❌ **Problem Identified**
Your rejection emails (and other emails) are not being sent.

## 🔍 **Root Causes & Solutions**

### **1. Environment Variables Missing**
Your `.env` file needs these Resend variables:

```env
# Resend Email Service
RESEND_API_KEY=re_ht4JNAKN_4YotutZgde5CdjhJBeUZhMCbJ
RESEND_FROM_EMAIL=onboarding@futuristiccreations.store
RESEND_FROM_NAME=Futuristic HR
```

**Check your `.env` file** - make sure these are set!

### **2. Email Preferences Blocking**
Candidates might have opted out of emails. Check:

```sql
-- Check email preferences in Supabase
SELECT * FROM email_preferences WHERE user_id = 'candidate_user_id';
```

### **3. Notification Settings**
The candidate status system has notification settings. Check:

```sql
-- Check status transition notifications
SELECT * FROM status_change_request WHERE response_id = 'your_response_id';
```

## 🚀 **Quick Fixes**

### **Fix 1: Update .env File**
```env
RESEND_API_KEY=re_ht4JNAKN_4YotutZgde5CdjhJBeUZhMCbJ
RESEND_FROM_EMAIL=onboarding@futuristiccreations.store
RESEND_FROM_NAME=Futuristic HR
```

### **Fix 2: Restart Application**
```bash
# Stop and restart your app
npm run dev
```

### **Fix 3: Test Email Service**
```javascript
// Test in browser console
fetch('/api/email/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'your-email@example.com',
    subject: 'Test Email',
    html: '<h1>Test Email</h1>'
  })
})
```

## 🔍 **Debug Steps**

### **1. Check Console Logs**
Look for these messages:
- `Rejection email sent to: email@example.com`
- `User has opted out of hiring update emails`
- `Error sending rejection email:`

### **2. Check Network Tab**
Look for failed API calls to:
- `/api/email/preferences`
- `/api/candidate-status`

### **3. Check Email Logs**
```sql
-- Check email log table
SELECT * FROM email_log ORDER BY created_at DESC LIMIT 10;
```

## 📧 **Email Flow Debug**

### **When You Reject a Candidate:**
1. **Status Update** → `candidate-status.service.ts`
2. **Check Preferences** → `emailService.canSendEmail()`
3. **Send Email** → `emailTriggerService.sendRejectionEmail()`
4. **Log Result** → `emailService.logEmail()`

### **Common Break Points:**
- ❌ Missing environment variables
- ❌ User opted out of emails
- ❌ Invalid email address
- ❌ Network issues

## 🎯 **Immediate Actions**

### **Step 1: Verify .env**
```bash
# Check your .env file has:
RESEND_API_KEY=re_ht4JNAKN_4YotutZgde5CdjhJBeUZhMCbJ
RESEND_FROM_EMAIL=onboarding@futuristiccreations.store
```

### **Step 2: Restart App**
```bash
npm run dev
```

### **Step 3: Test Rejection**
1. Reject a candidate
2. Check browser console for logs
3. Check email inbox

### **Step 4: Check Logs**
```sql
-- Check what happened
SELECT * FROM email_log 
WHERE email_type = 'hiring_updates' 
ORDER BY created_at DESC;
```

## 🚨 **If Still Not Working**

### **Check Supabase Connection**
```javascript
// Test in browser console
const { data } = await supabase
  .from('email_preferences')
  .select('*')
  .limit(1);
console.log('Supabase connection:', data);
```

### **Check Resend API**
```javascript
// Test Resend directly
fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer re_ht4JNAKN_4YotutZgde5CdjhJBeUZhMCbJ',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'onboarding@futuristiccreations.store',
    to: 'your-email@example.com',
    subject: 'Direct Test',
    html: '<h1>Direct Test</h1>'
  })
})
```

## 📋 **Working Checklist**

- ✅ `.env` has Resend keys
- ✅ Application restarted
- ✅ No console errors
- ✅ Email preferences allow hiring updates
- ✅ Network requests successful
- ✅ Email logs show attempts

**Follow these steps to get your rejection emails working!** 🚀
