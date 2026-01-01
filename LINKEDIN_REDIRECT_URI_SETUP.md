# LinkedIn Redirect URI Setup Guide

## Error: "The redirect_uri does not match the registered value"

This error means the redirect URI you're using (`http://localhost:3000/api/job-boards/linkedin/callback`) is not registered in your LinkedIn app.

## Step-by-Step Fix

### 1. Go to LinkedIn Developer Portal
Visit: https://www.linkedin.com/developers/apps

### 2. Select Your App
- Find and click on **"R Recruiter"** (Client ID: 866hyjtgc1o36p)

### 3. Navigate to Auth Tab
- Click on the **"Auth"** tab in the left sidebar

### 4. Add Redirect URIs
Scroll down to **"Authorized redirect URLs for your app"** section.

Add these URLs (one per line, exactly as shown):

```
http://localhost:3000/api/job-boards/linkedin/callback
https://hr.futuristiccreations.store/api/job-boards/linkedin/callback
```

**Important:**
- ✅ Include the protocol (`http://` or `https://`)
- ✅ Include the full path including `/api/job-boards/linkedin/callback`
- ✅ No trailing slashes
- ✅ Case-sensitive (lowercase)
- ✅ One URL per line

### 5. Save Changes
- Click **"Update"** button at the bottom
- Wait 2-5 minutes for changes to propagate

### 6. Verify Your .env File
Make sure your `.env` or `.env.local` has:

```env
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/job-boards/linkedin/callback
LINKEDIN_CLIENT_ID=866hyjtgc1o36p
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

### 7. Restart Your Dev Server
After updating LinkedIn settings:
```bash
# Stop your server (Ctrl+C)
# Then restart
npm run dev
```

## Common Issues

### Issue: Still getting error after adding URI
**Solution:** 
- Wait 5-10 minutes (LinkedIn can take time to update)
- Double-check for typos (extra spaces, wrong case, missing slashes)
- Make sure you're using the exact same URL (including `http://` vs `https://`)

### Issue: Different port number
If your app runs on a different port (e.g., `3001`), add that redirect URI too:
```
http://localhost:3001/api/job-boards/linkedin/callback
```

### Issue: Production URL
For production, make sure to add your production URL:
```
https://hr.futuristiccreations.store/api/job-boards/linkedin/callback
```

## Testing

After setup, try connecting again:
1. Go to `/settings/integrations`
2. Click "Connect LinkedIn"
3. You should be redirected to LinkedIn authorization page
4. After authorizing, you'll be redirected back to your app

## Visual Guide

In LinkedIn Developer Portal, the redirect URIs section looks like this:

```
┌─────────────────────────────────────────────────────────┐
│ Authorized redirect URLs for your app                   │
├─────────────────────────────────────────────────────────┤
│ http://localhost:3000/api/job-boards/linkedin/callback  │
│ https://hr.futuristiccreations.store/api/job-boards/... │
│                                                          │
│ [Add another URL]                                        │
└─────────────────────────────────────────────────────────┘
```

## Need Help?

If you're still having issues:
1. Check browser console for exact redirect URI being used
2. Compare it character-by-character with what's in LinkedIn
3. Make sure there are no hidden characters or spaces
4. Try clearing browser cache and cookies

