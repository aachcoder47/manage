# Automatic Job Posting to LinkedIn, Naukri, and Indeed

## Overview

Your HR platform now automatically posts jobs to LinkedIn, Naukri, and Indeed when you create a job. All applications redirect to your website, giving you full control over candidate data.

## How It Works

### 1. **Automatic Posting Flow**

When you create a job:
1. Job is saved to your database
2. System checks for connected job board accounts
3. **Automatically posts to all connected boards** (LinkedIn, Naukri, Indeed)
4. All job posts include an apply URL pointing to your website
5. Candidates click "Apply" → redirected to your platform

### 2. **Application Redirect**

All job board posts include an apply URL like:
```
https://yourdomain.com/find-jobs/{jobId}?source=linkedin&utm_source=linkedin
```

**Benefits:**
- ✅ All applications come to your platform
- ✅ Full control over candidate data
- ✅ Track which board each candidate came from
- ✅ Unified application management

### 3. **Source Tracking**

Each platform adds source tracking:
- **LinkedIn**: `?source=linkedin&utm_source=linkedin`
- **Indeed**: `?source=indeed&utm_source=indeed`
- **Naukri**: `?source=naukri&utm_source=naukri`

This lets you:
- See which boards drive the most applications
- Track ROI per job board
- Optimize your posting strategy

## Setup Instructions

### Step 1: Connect Your Job Board Accounts

1. Go to `/settings/integrations`
2. Click "Connect LinkedIn" (OAuth)
3. For Indeed/Naukri: Copy the XML Feed URL and submit it to their portals

### Step 2: Create a Job

1. Go to `/jobs/new`
2. Fill in job details
3. **Toggle "Automatically post to job boards"** (enabled by default)
4. Click "Create & Post Job"
5. System automatically posts to all connected boards

### Step 3: Applications Come to Your Site

- Candidates see your job on LinkedIn/Naukri/Indeed
- They click "Apply"
- They're redirected to: `yourdomain.com/find-jobs/{jobId}?source=linkedin`
- They fill out your application form
- Application is saved in your database

## Features

### ✅ Automatic Posting
- Posts to all connected boards automatically
- No manual selection needed
- Can be toggled on/off per job

### ✅ Smart Redirect
- All applications redirect to your website
- Source tracking included
- Unified candidate management

### ✅ Error Handling
- If one board fails, others still post
- Clear error messages
- Retry capability

### ✅ Posting Status
- Track which boards the job was posted to
- See external job URLs
- Monitor posting success/failure

## Job Creation Page

The job creation form now includes:

```
☑ Automatically post to job boards
  Post this job to all connected boards (LinkedIn, Naukri, Indeed). 
  Applications will redirect to your website.
```

**Default:** Enabled (auto-posts to all connected boards)

## API Endpoints

### Auto-Post After Job Creation
The job creation automatically calls:
```
POST /api/job-boards/post
{
  "job_id": "job-123",
  "integration_ids": ["integration-1", "integration-2", ...]
}
```

### Manual Posting
You can also manually post later:
- Use the `JobBoardPostingSelector` component
- Or call the API directly

## Database Tracking

All postings are tracked in:
- `external_job_posting` table
- Stores external job IDs and URLs
- Tracks posting status
- Records success/failure

## Example Flow

```
1. User creates job "Software Engineer"
   ↓
2. System checks: LinkedIn ✓, Indeed ✓, Naukri ✗
   ↓
3. Auto-posts to LinkedIn & Indeed
   ↓
4. LinkedIn job URL: linkedin.com/jobs/view/12345
   Indeed job URL: indeed.com/viewjob?jk=abc123
   ↓
5. Candidate clicks "Apply" on LinkedIn
   ↓
6. Redirected to: yourdomain.com/find-jobs/job-123?source=linkedin
   ↓
7. Candidate fills application on your site
   ↓
8. Application saved with source="linkedin"
```

## Configuration

### Environment Variables

```env
# Required for LinkedIn
LINKEDIN_CLIENT_ID=866hyjtgc1o36p
LINKEDIN_CLIENT_SECRET=your_secret
LINKEDIN_REDIRECT_URI=https://yourdomain.com/api/job-boards/linkedin/callback

# Required for apply URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Required for database
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Troubleshooting

### Jobs not posting automatically
- Check if job board accounts are connected
- Verify integrations are active in `/settings/integrations`
- Check server logs for errors

### Applications not redirecting
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check that `/find-jobs/{jobId}` page exists
- Ensure job board allows external apply URLs

### Posting fails for one board
- Other boards will still post successfully
- Check integration status in database
- Verify API keys/tokens are valid

## Next Steps

1. **Connect your accounts** at `/settings/integrations`
2. **Create a test job** with auto-posting enabled
3. **Verify** the job appears on LinkedIn/Naukri/Indeed
4. **Test application flow** by clicking apply from external board
5. **Monitor** applications in your dashboard with source tracking

## Support

For issues:
- Check server logs for detailed errors
- Verify environment variables are set
- Ensure database tables exist (run migrations)
- Check LinkedIn/Indeed/Naukri API status

