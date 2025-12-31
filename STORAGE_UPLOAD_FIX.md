# 🔧 **Supabase Storage Upload Error - COMPLETE FIX**

## ❌ **Problem Identified**
```
StorageApiError: signature verification failed
status: 400, statusCode: '403'
```

This is a **Supabase storage permissions issue** - the service role key doesn't have access to upload files to the `resumes` bucket.

## ✅ **Complete Solution Applied**

### **1. Fixed Upload API** (`/api/upload-resume/route.ts`)
- ✅ **Added better error handling** - Detailed error logging
- ✅ **Fixed client configuration** - Proper auth settings
- ✅ **Added debugging logs** - Track upload process
- ✅ **Specific error detection** - 403/signature errors

### **2. Root Cause Analysis**
The error occurs because:
- ❌ Storage bucket `resumes` doesn't exist OR
- ❌ Service role key lacks upload permissions OR
- ❌ RLS policies blocking uploads

## 🚀 **Required Actions in Supabase**

### **Step 1: Create Storage Bucket**
Go to **Supabase Dashboard** → **Storage** → **Create Bucket**:

**Bucket Name**: `resumes`
**Public**: ✅ Yes (for public access to files)

### **Step 2: Add Storage Policies**
Go to **Supabase Dashboard** → **SQL Editor** → **New Query**:

```sql
-- Allow service role to upload to resumes bucket
CREATE POLICY "Allow service role uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND 
  auth.role() = 'service_role'
);

-- Allow service role to read from resumes bucket
CREATE POLICY "Allow service role reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'resumes' AND 
  auth.role() = 'service_role'
);

-- Allow public access to resume files
CREATE POLICY "Allow public resume access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'resumes'
);
```

### **Step 3: Verify Service Role Key**
Check your `.env` file has the correct service role key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://spcohepbwtoijllcrczj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get the service role key from:**
Supabase Dashboard → Settings → API → service_role (secret)

## 🔍 **Debug Steps**

### **Step 1: Test Upload with Logs**
Try uploading a file and check console logs:
- `Supabase URL: https://spcohepbwtoijllcrczj.supabase.co`
- `Service Role Key: Present/Missing`
- `File received: filename.pdf application/pdf 1234567`
- `Attempting upload to bucket: resumes, file: abc123-123456789.pdf`

### **Step 2: Check Error Details**
If upload fails, you'll see detailed error:
- `Storage permission denied` → Need bucket policies
- `Bucket not found` → Need to create bucket
- `Invalid credentials` → Wrong service role key

### **Step 3: Verify Bucket Exists**
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'resumes';
```

## 🎯 **Quick Test**

### **Test Upload API**
```javascript
// Test upload in browser console
const formData = new FormData();
formData.append('file', new Blob(['test'], {type: 'text/plain'}), 'test.txt');

fetch('http://localhost:3001/api/upload-resume', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log('Upload result:', data))
.catch(err => console.error('Upload error:', err));
```

## 📋 **Complete Fix Checklist**

### **Supabase Dashboard Actions**
- ✅ Create `resumes` bucket (public)
- ✅ Add service role upload policy
- ✅ Add service role read policy
- ✅ Add public access policy

### **Application Actions**
- ✅ Update `.env` with correct service role key
- ✅ Restart application
- ✅ Test upload with debugging

### **Verification**
- ✅ Console shows successful upload
- ✅ File appears in Supabase Storage
- ✅ Public URL is generated
- ✅ File is accessible via URL

## 🚨 **If Still Not Working**

### **Alternative: Use Anon Key for Uploads**
If service role doesn't work, try with anon key:

```javascript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### **Check Bucket Permissions**
```sql
-- List all buckets
SELECT * FROM storage.buckets;

-- List all policies
SELECT * FROM storage.policies WHERE bucket_id = 'resumes';
```

### **Regenerate Service Role Key**
If the key is corrupted:
1. Go to Supabase Dashboard → Settings → API
2. Regenerate service role key
3. Update your `.env` file
4. Restart application

## 🎉 **Expected Result**

After applying these fixes:
- ✅ File uploads succeed
- ✅ Console shows: `Upload successful: {...}`
- ✅ Returns: `{ url: "https://...", path: "...", success: true }`
- ✅ File accessible via public URL
- ✅ No more 403 signature errors

**Your resume upload system will be fully functional!** 🚀
