# 🔧 **Supabase API Key Issues - Fix Guide**

## ❌ **Problem Identified**
You're getting "Invalid API key" errors for all Supabase requests:
- `spcohepbwtoijllcrczj.supabase.co/rest/v1/user?select=*&id=eq.user_364WebGvJNOCngdeyz4qTP7wXXA:1  Failed to load resource: the server responded with a status of 401 ()`
- `Error: Invalid API key`

## 🎯 **Root Cause**
Your Supabase API keys are either:
1. **Missing** from your `.env` file
2. **Incorrect/Invalid** (wrong format, expired, or wrong key type)
3. **Not being loaded** properly by the application

## 📋 **Required Supabase Environment Variables**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://spcohepbwtoijllcrczj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🔍 **How to Fix**

### **Step 1: Get Your Supabase Keys**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `spcohepbwtoijllcrczj`
3. Go to **Settings** → **API**
4. Copy the required keys:

#### **Anon Key** (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Used for client-side requests
- Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

#### **Service Role Key** (Server)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Used for server-side requests
- Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- **More powerful** - keep secret!

### **Step 2: Update Your .env File**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://spcohepbwtoijllcrczj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwY29oZXBidG9pamxsY3JjanoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MDAwMDAwMCwiZXhwIjoxOTg1NTU2MDAwfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwY29oZXBidG9pamxsY3JjanoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjcwMDAwMDAwLCJleHAiOjE5ODU1NTYwMDB9.example
```

### **Step 3: Restart Your Application**

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### **Step 4: Verify Keys Are Working**

#### **Test Anon Key (Client-side)**
```bash
curl -X GET "https://spcohepbwtoijllcrczj.supabase.co/rest/v1/user?select=*&limit=1" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### **Test Service Role Key (Server-side)**
```bash
curl -X GET "https://spcohepbwtoijllcrczj.supabase.co/rest/v1/user?select=*&limit=1" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

## 🚨 **Common Mistakes to Avoid**

### **❌ Wrong Key Type**
```env
# WRONG - Using service role key for client
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...service_role_key...

# CORRECT - Use anon key for client
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon_key...
```

### **❌ Missing URL**
```env
# WRONG - Missing URL
NEXT_PUBLIC_SUPABASE_URL=

# CORRECT - Full URL
NEXT_PUBLIC_SUPABASE_URL=https://spcohepbwtoijllcrczj.supabase.co
```

### **❌ Extra Spaces/Quotes**
```env
# WRONG - Extra spaces
NEXT_PUBLIC_SUPABASE_ANON_KEY= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CORRECT - No extra spaces
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 **Debugging Steps**

### **1. Check Environment Variables**
```javascript
// In your browser console
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

### **2. Test Direct API Call**
```javascript
// Test in browser console
fetch('https://spcohepbwtoijllcrczj.supabase.co/rest/v1/user?select=*&limit=1', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

### **3. Check Network Tab**
1. Open **Developer Tools** → **Network**
2. Look for failed requests to `spcohepbwtoijllcrczj.supabase.co`
3. Check **Headers** → **Authorization** and **apikey** values

## 🚀 **Quick Fix Checklist**

1. ✅ **Get keys from Supabase Dashboard**
2. ✅ **Update .env file with correct keys**
3. ✅ **Restart application**
4. ✅ **Test API calls work**
5. ✅ **No more 401 errors**

## 📞 **If Still Not Working**

### **Regenerate Keys**
1. Go to Supabase Dashboard → Settings → API
2. Click **"Regenerate"** for both keys
3. Update your `.env` file
4. Restart application

### **Check Project Status**
- Ensure your Supabase project is **active**
- Check if you're on the **correct project**
- Verify your **project URL** is correct

## 🎯 **After Fix**

Once you fix the Supabase keys, your application should:
- ✅ Load user data successfully
- ✅ Fetch interviews without 401 errors
- ✅ Display organization information
- ✅ Work with subscription data

**Then** you can test the Resend email functionality! 🚀

---

**Next Steps:**
1. Fix Supabase keys first
2. Test application loads properly
3. Then we can troubleshoot Resend emails
