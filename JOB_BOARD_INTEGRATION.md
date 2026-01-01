# Job Board Integration System

This document explains how to set up and use the job board integration system that allows users to connect their own LinkedIn, Indeed, and Naukri accounts to automatically post jobs.

## Features

- **Multi-User Integration**: Each user connects their own job board accounts
- **OAuth Support**: LinkedIn integration via OAuth 2.0
- **API Key Support**: Indeed and Naukri via API keys (coming soon)
- **Automatic Posting**: Post jobs to multiple boards with one click
- **Secure Token Storage**: All tokens and API keys are encrypted at rest
- **Posting Tracking**: Track job postings and their status across platforms

## Database Setup

Run the migration to create the necessary tables:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrations/add_job_board_integrations.sql
```

This creates:
- `job_board_integration` - Stores user's connected accounts
- `external_job_posting` - Tracks job postings to external boards

## Environment Variables

Add these to your `.env.local` file:

```env
# LinkedIn OAuth (Required for LinkedIn integration)
LINKEDIN_CLIENT_ID=866hyjtgc1o36p
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://hr.futuristiccreations.store/api/job-boards/linkedin/callback

# App URL (Required for generating apply URLs)
NEXT_PUBLIC_APP_URL=https://hr.futuristiccreations.store

# Indeed & Naukri (Optional - API keys are stored per-user in database)
# Users will connect their own API keys through the UI
# These are just for reference/documentation:
# INDEED_API_ENDPOINT=https://api.indeed.com/v2/jobs
# NAUKRI_API_ENDPOINT=https://api.naukri.com/v1/jobs
```

### Getting LinkedIn Credentials

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app ("R Recruiter")
3. Go to **Auth** tab
4. Copy **Client ID** and **Client Secret**
5. Add redirect URI: `https://yourdomain.com/api/job-boards/linkedin/callback`
6. Request access to **Share on LinkedIn** product (if not already approved)

### LinkedIn Scope Requirements

**Current Setup (Basic):**
- `openid`, `profile`, `email` - Available by default
- `w_member_social` - Post content as user (requires "Share on LinkedIn" product)

**For Job Posting (Advanced - Requires Approval):**
- `w_organization_social` - Post jobs on behalf of organization
  - This scope requires LinkedIn partnership/approval
  - Currently disabled in code to avoid errors
  - To enable: Request access in LinkedIn Developer Portal → Products → Request access to "Share on LinkedIn" for organizations

**Note:** Without `w_organization_social`, you can still post jobs, but they'll be posted as the user (not the organization). This is usually sufficient for most use cases.

## How It Works

### 1. User Connects Account

1. User goes to `/settings/integrations`
2. Clicks "Connect LinkedIn"
3. Redirected to LinkedIn OAuth consent page
4. Authorizes the app
5. Redirected back with access token
6. Token is encrypted and stored in database

### 2. Posting a Job

1. User creates a job on `/jobs/new`
2. After job creation, job board posting selector appears
3. User selects which boards to post to
4. System uses stored tokens to post to each platform
5. External job IDs and URLs are saved for tracking

### 3. Candidate Collection

- All job posts include `applyUrl` pointing to your platform
- Candidates apply directly on your platform
- Full control over candidate data

## API Endpoints

### Connect LinkedIn
```
GET /api/job-boards/linkedin/connect?organization_id={orgId}
```
Initiates LinkedIn OAuth flow.

### LinkedIn Callback
```
GET /api/job-boards/linkedin/callback?code={code}&state={state}
```
Handles OAuth callback and saves integration.

### Get Integrations
```
GET /api/job-boards/integrations?organization_id={orgId}
```
Returns all connected integrations for the user.

### Disconnect Integration
```
DELETE /api/job-boards/integrations?integration_id={id}
```
Disconnects an integration.

### Post Job to Boards
```
POST /api/job-boards/post
Body: {
  job_id: string,
  integration_ids: string[],
  apply_url?: string
}
```
Posts a job to selected job boards.

## Components

### JobBoardIntegrationCard
Displays connection status and connect/disconnect button for a job board.

**Location**: `src/components/job-boards/JobBoardIntegrationCard.tsx`

### JobBoardPostingSelector
Allows user to select which boards to post a job to.

**Location**: `src/components/job-boards/JobBoardPostingSelector.tsx`

## Services

### JobBoardIntegrationService
Manages job board integrations (CRUD operations, token encryption/decryption).

**Location**: `src/services/job-board-integration.service.ts`

### LinkedInOAuthService
Handles LinkedIn OAuth flow and job posting.

**Location**: `src/services/linkedin-oauth.service.ts`

### JobBoardPostingService
Posts jobs to different platforms (LinkedIn, Indeed, Naukri).

**Location**: `src/services/job-board-posting.service.ts`

## Security

- **User Isolation**: Each user can only access their own integrations
- **CSRF Protection**: OAuth state tokens prevent CSRF attacks
- **Secure Cookies**: OAuth state stored in httpOnly, secure cookies
- **Note**: Tokens are stored in plain text in the database. For production, consider implementing encryption or using Supabase Vault for sensitive data.

## LinkedIn API Requirements

To post jobs to LinkedIn, you need:

1. **LinkedIn Talent Solutions API Access**
   - Requires LinkedIn partnership approval
   - Apply through LinkedIn Developer Portal
   - Standard or Development tier access

2. **Required Scopes**:
   - `w_organization_social` - Post jobs on behalf of organization
   - `w_member_social` - Post content as user
   - `openid`, `profile`, `email` - User authentication

3. **Company URN** (Optional):
   - Format: `urn:li:organization:123456`
   - Get from LinkedIn Company Page
   - Required for posting jobs on company page

## Indeed & Naukri Integration

### Indeed
- Requires Indeed Publisher API access
- API key authentication
- Apply through Indeed for Publishers

### Naukri
- Requires Naukri Enterprise API access
- API key authentication
- Contact Naukri for enterprise partnership

## Troubleshooting

### "Cannot read properties of undefined (reading 'createCustomer')"
- Fixed: This was a payment subscription issue, not related to job boards
- Ensure RazorpayService is properly imported

### LinkedIn OAuth fails
- Check redirect URI matches exactly in LinkedIn app settings
- Verify CLIENT_ID and CLIENT_SECRET are correct
- Ensure app has required product access

### Token expired errors
- System automatically refreshes tokens when possible
- User needs to reconnect if refresh token is invalid

### Job posting fails
- Check integration status in database
- Verify token hasn't expired
- Check platform-specific API requirements
- Review error messages in `external_job_posting` table

## Future Enhancements

- [ ] Indeed API key integration UI
- [ ] Naukri API key integration UI
- [ ] Webhook support for application notifications
- [ ] Analytics dashboard for posting performance
- [ ] Bulk job posting
- [ ] Scheduled posting
- [ ] Auto-refresh expired tokens
- [ ] Support for more job boards (Monster, Glassdoor, etc.)

## Support

For issues or questions:
1. Check error logs in browser console
2. Review database `job_board_integration` and `external_job_posting` tables
3. Verify environment variables are set correctly
4. Check LinkedIn/Indeed/Naukri API status

