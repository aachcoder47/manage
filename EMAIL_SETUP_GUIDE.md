# Email System Setup Guide

This guide will help you set up the complete email system for Futuristic HR using Resend.

## 🚀 Quick Setup (7 Days)

### Day 1–2: Resend Configuration

1. **Sign up for Resend**
   - Go to [resend.com](https://resend.com)
   - Create an account
   - Get your API key from the dashboard

2. **Verify Your Domain**
   - Add your domain (`futuristiccreations.store`)
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification (usually 24-48 hours)

3. **Add Environment Variables**
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=onboarding@futuristiccreations.store
   RESEND_FROM_NAME=Futuristic HR
   ```

### Day 3–4: Database Setup

1. **Run Database Migration**
   ```bash
   # Apply the email system migration
   supabase db push
   ```

2. **Verify Tables Created**
   - `email_preferences`
   - `email_log`
   - `email_type` enum

### Day 5–7: Integration

1. **Test Email Templates**
   - Welcome email
   - Application received
   - Interview invite
   - Weekly summary

2. **Set Up Email Preferences UI**
   - Add to user settings
   - Test preference updates

## 📧 Email Types Implemented

### ✅ Transactional Emails (Always Sent)
- Welcome email
- Password reset
- Account notifications

### ✅ Hiring Updates (User Controlled)
- Application received
- Interview invitations
- Screening completed
- Status changes

### ✅ Product Updates (User Controlled)
- New features
- Improvements
- Bug fixes

### ✅ Weekly Summary (User Controlled)
- Hiring metrics
- Time saved
- Top candidates
- Upcoming interviews

### ✅ Marketing (Opt-in Only)
- Tips and case studies
- Promotional offers

## 🔧 API Usage

### Send Welcome Email
```javascript
fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome',
    name: 'John Doe',
    userEmail: 'john@example.com',
    userId: 'user_123',
    organizationId: 'org_456'
  })
})
```

### Send Application Received Email
```javascript
fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'application_received',
    candidateName: 'Jane Smith',
    positionTitle: 'Senior Developer',
    organizationName: 'Tech Corp',
    applicationId: 'app_789',
    recipientEmail: 'hiring@techcorp.com',
    organizationId: 'org_456'
  })
})
```

### Send Interview Invite
```javascript
fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'interview_invite',
    candidateName: 'Jane Smith',
    positionTitle: 'Senior Developer',
    interviewDate: '2024-01-15',
    interviewTime: '2:00 PM',
    interviewLink: 'https://app.futuristic-hr.com/interview/abc123',
    organizationName: 'Tech Corp',
    recipientEmail: 'jane@example.com',
    organizationId: 'org_456'
  })
})
```

### Send Weekly Summary
```javascript
fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'weekly_summary',
    userName: 'John Doe',
    organizationName: 'Tech Corp',
    recipientEmail: 'john@techcorp.com',
    userId: 'user_123',
    organizationId: 'org_456',
    weekSummary: {
      candidatesScreened: 12,
      interviewsCompleted: 3,
      hiresMade: 1,
      hoursSaved: 9,
      topPerformers: [
        { name: 'Jane Smith', position: 'Senior Developer', score: 92 }
      ],
      upcomingInterviews: [
        { candidateName: 'Bob Johnson', position: 'Designer', date: '2024-01-16', time: '3:00 PM' }
      ]
    }
  })
})
```

## 🎯 Email Hooks Integration

### In Your User Registration
```javascript
import { emailTriggerService } from '@/services/email-trigger.service';

// After successful user registration
await emailTriggerService.sendWelcomeEmail({
  name: user.name,
  userEmail: user.email,
  userId: user.id,
  organizationId: user.organizationId
});
```

### In Application Submission
```javascript
// After candidate applies
await emailTriggerService.sendApplicationReceivedEmail({
  candidateName: application.name,
  positionTitle: job.title,
  organizationName: org.name,
  applicationId: application.id,
  recipientEmail: hiringManager.email,
  organizationId: org.id
});
```

### In Interview Scheduling
```javascript
// When interview is scheduled
await emailTriggerService.sendInterviewInviteEmail({
  candidateName: candidate.name,
  positionTitle: job.title,
  interviewDate: '2024-01-15',
  interviewTime: '2:00 PM',
  interviewLink: interview.url,
  organizationName: org.name,
  recipientEmail: candidate.email,
  organizationId: org.id
});
```

## 📊 Email Analytics

### View Email Logs
```sql
-- Check email delivery status
SELECT * FROM email_log 
WHERE organization_id = 'your_org_id' 
ORDER BY created_at DESC 
LIMIT 50;
```

### Email Open Rates (Resend Dashboard)
- Login to Resend dashboard
- View analytics for each campaign
- Track open rates, click rates, bounces

## 🛡️ Compliance Features

### ✅ GDPR Compliant
- User consent required for marketing
- Easy unsubscribe links
- Data deletion on request

### ✅ CAN-SPAM Compliant
- Physical address in footer
- Clear unsubscribe mechanism
- No misleading subject lines

### ✅ Email Preferences
- User-controlled preferences
- Category-based opt-outs
- Instant preference updates

## 🔄 Weekly Summary Automation

### Set Up Cron Job
```bash
# Send weekly summaries every Monday at 9 AM
0 9 * * 1 curl -X POST https://yourapp.com/api/email/weekly-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Weekly Summary Endpoint
Create `/api/email/weekly-summary` that:
1. Fetches all users with weekly_summary enabled
2. Calculates weekly metrics
3. Sends personalized summaries
4. Logs all emails

## 🧪 Testing

### Test Email Templates
```javascript
// Test in development
import { emailTriggerService } from '@/services/email-trigger.service';

await emailTriggerService.sendWelcomeEmail({
  name: 'Test User',
  userEmail: 'test@example.com',
  userId: 'test_user',
  organizationId: 'test_org'
});
```

### Check Email Logs
```sql
-- View recent emails
SELECT email_type, status, recipient_email, created_at 
FROM email_log 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## 🚨 Troubleshooting

### Common Issues

1. **Domain Not Verified**
   - Check DNS records
   - Wait 48 hours for propagation
   - Contact Resend support

2. **Emails Going to Spam**
   - Check SPF/DKIM records
   - Verify sender reputation
   - Reduce marketing frequency

3. **API Key Issues**
   - Verify RESEND_API_KEY in .env
   - Check API key permissions
   - Regenerate if compromised

4. **Template Rendering Errors**
   - Check React Email syntax
   - Validate required props
   - Test with different data

### Debug Mode
```javascript
// Enable debug logging
process.env.DEBUG_EMAIL = 'true';
```

## 📈 Best Practices

1. **Subject Lines**
   - Keep under 50 characters
   - Be specific and clear
   - Include personalization

2. **Send Times**
   - Transactional: Immediate
   - Updates: Business hours
   - Summary: Monday morning

3. **Frequency Limits**
   - Max 1 marketing email/day
   - Max 3 updates/week
   - Respect user preferences

4. **A/B Testing**
   - Test subject lines
   - Test send times
   - Test content variations

## 🎉 Success Metrics

Track these metrics:
- **Open Rate**: 60-80% (transactional), 30-50% (updates)
- **Click Rate**: 5-10% (summary emails)
- **Unsubscribe Rate**: < 2% (marketing)
- **Delivery Rate**: > 98%

Your email system is now ready to engage users and reduce hiring anxiety! 🚀
