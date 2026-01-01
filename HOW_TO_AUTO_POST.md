# How to Auto-Post Jobs to LinkedIn, Naukri, and Indeed

## Quick Start Guide

### Step 1: Connect Your Accounts (One-Time Setup)

1. **Navigate to Integrations**
   - Click "Integrations" in the left sidebar
   - Or go to: `/settings/integrations`

2. **Connect LinkedIn**
   - Click "Connect LinkedIn" button
   - Authorize the app
   - Done! ✅

3. **Connect Indeed & Naukri** (When Available)
   - Enter your API keys
   - Save

### Step 2: Create a Job with Auto-Posting

1. **Go to Create Job Page**
   - Click "Manage Jobs" → "Post a New Job"
   - Or go to: `/jobs/new`

2. **Fill Job Details**
   - Job Title
   - Description
   - Location
   - Salary Range
   - Employment Type
   - etc.

3. **Enable Auto-Posting** (Default: ON)
   - Look for the toggle: "Automatically post to job boards"
   - ✅ Enabled = Posts to all connected boards automatically
   - ❌ Disabled = Job created but not posted to boards

4. **Click "Create & Post Job"**
   - Job is saved
   - Automatically posts to LinkedIn, Naukri, Indeed
   - Shows success message

### Step 3: Applications Come to Your Site

**What Happens:**
1. Job appears on LinkedIn/Naukri/Indeed
2. Candidate clicks "Apply"
3. Redirected to: `yourdomain.com/find-jobs/{jobId}?source=linkedin`
4. Candidate fills your application form
5. Application saved in your database

## Toggle Auto-Posting On/Off

**Location:** Job creation form, below "Remote Position" toggle

```
☑ Automatically post to job boards
  Post this job to all connected boards (LinkedIn, Naukri, Indeed). 
  Applications will redirect to your website.
```

**To Disable:** Uncheck the toggle if you don't want to post to boards for a specific job

## What Gets Posted Automatically

When auto-posting is enabled:
- ✅ Posts to **all connected** job board accounts
- ✅ Uses the **exact same job details** you entered
- ✅ Adds **apply URL** pointing to your website
- ✅ Includes **source tracking** (linkedin, indeed, naukri)

## Example

**You Create:**
- Job: "Senior Software Engineer"
- Location: "Remote"
- Salary: "$100k - $140k"

**System Automatically:**
1. Posts to LinkedIn → `linkedin.com/jobs/view/12345`
2. Posts to Indeed → `indeed.com/viewjob?jk=abc123`
3. Posts to Naukri → `naukri.com/job/xyz789`

**All with Apply URL:**
`yourdomain.com/find-jobs/job-123?source=linkedin`

## Check Posting Status

After creating a job:
- Success toast: "Job automatically posted to X job board(s)!"
- Check job details page to see external posting status
- View in database: `external_job_posting` table

## Troubleshooting

### Auto-posting not working?
1. **Check connections:** Go to `/settings/integrations`
2. **Verify accounts are connected** (green "Connected" badge)
3. **Check server logs** for error messages
4. **Ensure Supabase is configured** correctly

### Job created but not posted?
- Check if toggle was enabled
- Verify at least one board is connected
- Check error messages in toast notifications

### Want to post manually later?
- Go to job details page
- Use the job board posting selector
- Select boards and post

## Tips

✅ **Best Practice:** Keep auto-posting enabled for all jobs
✅ **Source Tracking:** All applications include source (linkedin/indeed/naukri)
✅ **Unified Management:** All applications in one place on your platform
✅ **Full Control:** You own all candidate data

## Need Help?

- Check `/settings/integrations` to verify connections
- Review server logs for detailed errors
- Ensure environment variables are set correctly

