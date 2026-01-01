# Job Board Posting Status Feature

## Overview

The job board posting status feature shows you the status of your job postings on external platforms (LinkedIn, Naukri, Indeed) directly on the job details page. You can see which platforms the job was posted to, whether it was successful, and track applications from each platform.

## Features

### 1. **Posting Status Display**

On each job's details page (`/jobs/[jobId]`), you'll see a new "Job Board Postings" card that shows:

- ✅ **Platform**: Which platform (LinkedIn, Indeed, Naukri)
- ✅ **Status**: Posted, Pending, Failed, or Expired
- ✅ **External URL**: Direct link to view the job on the external platform
- ✅ **Posted Date**: When the job was posted
- ✅ **Expiry Date**: When the posting expires (if applicable)
- ✅ **Views**: Number of views on the external platform
- ✅ **Applications**: Number of applications received from that platform
- ✅ **Error Messages**: If posting failed, shows the error

### 2. **Application Source Tracking**

In the applications table, you'll see a new "Source" column that shows:

- **LinkedIn**: Blue badge for LinkedIn applications
- **Indeed**: Purple badge for Indeed applications
- **Naukri**: Green badge for Naukri applications
- **Direct**: For applications that came directly to your site

This helps you:
- Track which platforms drive the most applications
- Measure ROI per job board
- Optimize your posting strategy

## How It Works

### Viewing Posting Status

1. Go to any job details page: `/jobs/[jobId]`
2. Scroll to the "Job Board Postings" card (above the Candidates table)
3. See all platforms the job was posted to with their status

### Understanding Statuses

- **Posted** ✅: Job successfully posted to the platform
- **Pending** ⏳: Posting is in progress
- **Failed** ❌: Posting failed (check error message)
- **Expired** ⏰: Posting has expired

### Application Source Tracking

When candidates apply from external job boards:

1. They click "Apply" on LinkedIn/Naukri/Indeed
2. They're redirected to: `yourdomain.com/find-jobs/{jobId}?source=linkedin`
3. The system automatically captures the source from the URL
4. Application is saved with `source_platform` field
5. You see the source badge in the applications table

## UI Components

### Job Board Posting Status Card

```
┌─────────────────────────────────────────┐
│ Job Board Postings                      │
│ Status of job postings on external      │
│ platforms                               │
├─────────────────────────────────────────┤
│ [LinkedIn] [Posted ✓]                  │
│ 🔗 View on LinkedIn                     │
│ Posted 2 days ago                       │
│ 👁️ 45 views  👥 12 applications        │
├─────────────────────────────────────────┤
│ [Indeed] [Posted ✓]                    │
│ 🔗 View on Indeed                       │
│ Posted 2 days ago                       │
│ 👁️ 32 views  👥 8 applications        │
└─────────────────────────────────────────┘
```

### Applications Table with Source

```
Candidate    | Applied  | Source    | Resume | AI Score | ...
-------------|----------|-----------|---------|----------|----
john@...     | 1/15/24  | [LinkedIn]| View    | 85       | ...
jane@...      | 1/14/24  | [Indeed]  | View    | 72       | ...
bob@...       | 1/13/24  | Direct    | View    | 68       | ...
```

## API Endpoints

### Get Job Postings

```
GET /api/job-boards/postings?job_id={jobId}
```

**Response:**
```json
{
  "postings": [
    {
      "id": "posting-123",
      "platform": "linkedin",
      "posting_status": "posted",
      "external_job_url": "https://linkedin.com/jobs/view/12345",
      "posted_at": "2024-01-15T10:00:00Z",
      "views": 45,
      "applications_count": 12,
      "error_message": null
    }
  ]
}
```

## Database Schema

The posting status is stored in the `external_job_posting` table:

- `platform`: Which platform (linkedin, indeed, naukri)
- `posting_status`: Current status (pending, posted, failed, expired)
- `external_job_url`: Link to view job on external platform
- `posted_at`: When it was posted
- `expires_at`: When it expires
- `views`: Number of views
- `applications_count`: Number of applications
- `error_message`: Error if posting failed

## Benefits

✅ **Visibility**: See exactly where your jobs are posted
✅ **Tracking**: Monitor views and applications per platform
✅ **Debugging**: Quickly identify failed postings
✅ **Analytics**: Understand which platforms perform best
✅ **Source Attribution**: Know where each candidate came from

## Example Workflow

1. **Create Job** with auto-posting enabled
2. **System Posts** to LinkedIn, Indeed, Naukri
3. **View Status** on job details page
4. **See Applications** with source badges
5. **Track Performance** per platform

## Troubleshooting

### No postings showing?
- Check if job was posted to boards
- Verify integrations are connected
- Check server logs for errors

### Status shows "Failed"?
- Click to see error message
- Check integration status in `/settings/integrations`
- Verify API keys/tokens are valid

### Source not showing in applications?
- Ensure candidates clicked from external boards
- Check URL parameters are being captured
- Verify `source_platform` column exists in database

## Next Steps

1. **View Posting Status**: Go to any job details page
2. **Check Applications**: See source badges in the table
3. **Analyze Performance**: Compare views/applications per platform
4. **Optimize Strategy**: Focus on platforms that drive results

