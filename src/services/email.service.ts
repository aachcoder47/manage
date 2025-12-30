export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SubscriptionEmailData {
  userEmail: string;
  userName: string;
  planName: string;
  planPrice: number;
  currency: string;
  trialEnds?: Date;
  nextBilling?: Date;
  interviewsUsed?: number;
  interviewsLimit?: number;
}

export interface MailerLiteSubscriber {
  email: string;
  name?: string;
  fields?: Record<string, any>;
}

export interface JobPostedEmailData {
  employerEmail: string;
  employerName?: string;
  employerPhone?: string;
  organizationId?: string;
  organizationName?: string;
  jobId: string;
  jobTitle: string;
}

export interface JobApplicationEventData {
  applicationId: string;
  jobId: string;
  jobTitle?: string;
  organizationId?: string;
  organizationName?: string;
  candidateId?: string;
  candidateEmail: string;
  candidateName?: string;
  candidatePhone?: string;
}

export interface ApplicationStatusEventData {
  applicationId: string;
  jobId: string;
  jobTitle?: string;
  organizationId?: string;
  organizationName?: string;
  candidateEmail: string;
  candidateName?: string;
  candidatePhone?: string;
  status: string;
  interviewUrl?: string;
}

export interface InterviewCreatedEventData {
  interviewId: string;
  interviewName?: string;
  organizationId?: string;
  organizationName?: string;
  employerEmail: string;
  employerName?: string;
}

export interface InterviewUpdatedEventData {
  interviewId: string;
  organizationId?: string;
  organizationName?: string;
  employerEmail: string;
  employerName?: string;
  changes?: Record<string, any>;
}

export interface InterviewDeletedEventData {
  interviewId: string;
  organizationId?: string;
  organizationName?: string;
  employerEmail: string;
  employerName?: string;
}

export class EmailService {
  private static readonly API_BASE = 'https://connect.mailerlite.com/api';
  private static readonly API_KEY = process.env.MAILERLITE_API_KEY;

  private static readonly GROUP_JOB_POSTED = process.env.MAILERLITE_GROUP_JOB_POSTED || 'Job Posted';
  private static readonly GROUP_APPLICATION_SUBMITTED = process.env.MAILERLITE_GROUP_APPLICATION_SUBMITTED || 'Job Application Submitted';
  private static readonly GROUP_NEW_APPLICANT_EMPLOYER = process.env.MAILERLITE_GROUP_NEW_APPLICANT_EMPLOYER || 'New Applicant (Employer)';
  private static readonly GROUP_APPLICATION_STATUS_UPDATED = process.env.MAILERLITE_GROUP_APPLICATION_STATUS_UPDATED || 'Application Status Updated';
  private static readonly GROUP_INTERVIEW_LINK_READY = process.env.MAILERLITE_GROUP_INTERVIEW_LINK_READY || 'Interview Link Ready';
  private static readonly GROUP_INTERVIEW_CREATED = process.env.MAILERLITE_GROUP_INTERVIEW_CREATED || 'Interview Created';
  private static readonly GROUP_INTERVIEW_UPDATED = process.env.MAILERLITE_GROUP_INTERVIEW_UPDATED || 'Interview Updated';
  private static readonly GROUP_INTERVIEW_DELETED = process.env.MAILERLITE_GROUP_INTERVIEW_DELETED || 'Interview Deleted';

  private static groupIdCache = new Map<string, string>();

  /**
   * MailerLite automations are best triggered by upserting a subscriber and adding them to a group.
   */
  private static async upsertSubscriber(subscriber: MailerLiteSubscriber, groupIds: string[] = []): Promise<void> {
    if (!this.API_KEY) return;

    const fields = {
      ...(subscriber.fields || {}),
      ...(subscriber.name ? { name: subscriber.name } : {}),
    };

    const response = await fetch(`${this.API_BASE}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: JSON.stringify({
        email: subscriber.email,
        fields,
        ...(groupIds.length > 0 ? { groups: groupIds } : {}),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`MailerLite API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
  }

  private static async getGroupIdByName(groupName: string): Promise<string | null> {
    if (!this.API_KEY) return null;

    const cached = this.groupIdCache.get(groupName);
    if (cached) return cached;

    const url = `${this.API_BASE}/groups?filter[name]=${encodeURIComponent(groupName)}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
      },
    });

    if (!response.ok) return null;

    const groupsData = await response.json().catch(() => ({}));
    const group = groupsData.data?.[0];
    if (!group?.id) return null;

    this.groupIdCache.set(groupName, group.id);
    return group.id;
  }

  /**
   * Add subscriber to MailerLite group
   */
  private static async addSubscriberToGroup(subscriber: MailerLiteSubscriber, groupName: string): Promise<void> {
    try {
      if (!this.API_KEY) return;

      const groupId = await this.getGroupIdByName(groupName);
      if (!groupId) return;

      await this.upsertSubscriber(subscriber, [groupId]);
    } catch (error) {
      console.error('Error adding subscriber to MailerLite:', error);
    }
  }

  static async trackJobPosted(data: JobPostedEmailData): Promise<void> {
    if (!data.employerEmail) return;

    await this.addSubscriberToGroup(
      {
        email: data.employerEmail,
        name: data.employerName,
        fields: {
          phone: data.employerPhone,
          organization_id: data.organizationId,
          organization_name: data.organizationName,
          job_id: data.jobId,
          job_title: data.jobTitle,
        },
      },
      this.GROUP_JOB_POSTED
    );
  }

  static async trackJobApplicationSubmitted(data: JobApplicationEventData): Promise<void> {
    if (!data.candidateEmail) return;

    await this.addSubscriberToGroup(
      {
        email: data.candidateEmail,
        name: data.candidateName,
        fields: {
          phone: data.candidatePhone,
          candidate_id: data.candidateId,
          application_id: data.applicationId,
          job_id: data.jobId,
          job_title: data.jobTitle,
          organization_id: data.organizationId,
          organization_name: data.organizationName,
        },
      },
      this.GROUP_APPLICATION_SUBMITTED
    );
  }

  static async trackEmployerNewApplicant(employerEmail: string, data: JobApplicationEventData): Promise<void> {
    if (!employerEmail) return;

    await this.addSubscriberToGroup(
      {
        email: employerEmail,
        fields: {
          application_id: data.applicationId,
          job_id: data.jobId,
          job_title: data.jobTitle,
          organization_id: data.organizationId,
          organization_name: data.organizationName,
          candidate_email: data.candidateEmail,
          candidate_phone: data.candidatePhone,
        },
      },
      this.GROUP_NEW_APPLICANT_EMPLOYER
    );
  }

  static async trackApplicationStatusChanged(data: ApplicationStatusEventData): Promise<void> {
    if (!data.candidateEmail) return;

    await this.addSubscriberToGroup(
      {
        email: data.candidateEmail,
        name: data.candidateName,
        fields: {
          phone: data.candidatePhone,
          application_id: data.applicationId,
          job_id: data.jobId,
          job_title: data.jobTitle,
          organization_id: data.organizationId,
          organization_name: data.organizationName,
          application_status: data.status,
          interview_url: data.interviewUrl,
        },
      },
      this.GROUP_APPLICATION_STATUS_UPDATED
    );

    if (data.status === 'interviewing' && data.interviewUrl) {
      await this.addSubscriberToGroup(
        {
          email: data.candidateEmail,
          name: data.candidateName,
          fields: {
            phone: data.candidatePhone,
            application_id: data.applicationId,
            job_id: data.jobId,
            job_title: data.jobTitle,
            organization_id: data.organizationId,
            organization_name: data.organizationName,
            interview_url: data.interviewUrl,
          },
        },
        this.GROUP_INTERVIEW_LINK_READY
      );
    }
  }

  static async trackInterviewCreated(data: InterviewCreatedEventData): Promise<void> {
    if (!data.employerEmail) return;

    await this.addSubscriberToGroup(
      {
        email: data.employerEmail,
        name: data.employerName,
        fields: {
          organization_id: data.organizationId,
          organization_name: data.organizationName,
          interview_id: data.interviewId,
          interview_name: data.interviewName,
        },
      },
      this.GROUP_INTERVIEW_CREATED
    );
  }

  static async trackInterviewUpdated(data: InterviewUpdatedEventData): Promise<void> {
    if (!data.employerEmail) return;

    await this.addSubscriberToGroup(
      {
        email: data.employerEmail,
        name: data.employerName,
        fields: {
          organization_id: data.organizationId,
          organization_name: data.organizationName,
          interview_id: data.interviewId,
          changes: data.changes,
        },
      },
      this.GROUP_INTERVIEW_UPDATED
    );
  }

  static async trackInterviewDeleted(data: InterviewDeletedEventData): Promise<void> {
    if (!data.employerEmail) return;

    await this.addSubscriberToGroup(
      {
        email: data.employerEmail,
        name: data.employerName,
        fields: {
          organization_id: data.organizationId,
          organization_name: data.organizationName,
          interview_id: data.interviewId,
        },
      },
      this.GROUP_INTERVIEW_DELETED
    );
  }

  /**
   * Send subscription confirmation email
   */
  static async sendSubscriptionConfirmation(data: SubscriptionEmailData): Promise<void> {
    await this.addSubscriberToGroup(
      {
        email: data.userEmail,
        name: data.userName,
        fields: {
          plan: data.planName,
          plan_type: data.trialEnds ? 'trial' : 'paid',
          trial_end: data.trialEnds?.toISOString(),
          next_billing: data.nextBilling?.toISOString(),
        },
      },
      'Active Subscribers'
    );
  }

  /**
   * Send trial expiration reminder
   */
  static async sendTrialExpirationReminder(data: SubscriptionEmailData): Promise<void> {
    await this.addSubscriberToGroup(
      {
        email: data.userEmail,
        name: data.userName,
        fields: {
          plan: data.planName,
          trial_end: data.trialEnds?.toISOString(),
        },
      },
      'Trial Expiring'
    );
  }

  /**
   * Send monthly usage report
   */
  static async sendMonthlyUsageReport(data: SubscriptionEmailData): Promise<void> {
    await this.addSubscriberToGroup(
      {
        email: data.userEmail,
        name: data.userName,
        fields: {
          plan: data.planName,
          interviews_used: data.interviewsUsed,
          interviews_limit: data.interviewsLimit,
        },
      },
      'Monthly Usage'
    );
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailedNotification(data: SubscriptionEmailData): Promise<void> {
    // Add to payment issues group for follow-up
    await this.addSubscriberToGroup(
      {
        email: data.userEmail,
        name: data.userName,
        fields: {
          plan: data.planName,
          last_payment_failed: new Date().toISOString(),
        },
      },
      'Payment Issues'
    );
  }

  /**
   * Send subscription cancelled confirmation
   */
  static async sendSubscriptionCancelled(data: SubscriptionEmailData): Promise<void> {
    // Move to cancelled subscribers group
    await this.addSubscriberToGroup(
      {
        email: data.userEmail,
        name: data.userName,
        fields: {
          plan: data.planName,
          cancelled_date: new Date().toISOString(),
        },
      },
      'Cancelled Subscribers'
    );
  }

  private static getSubscriptionConfirmationTemplate(data: SubscriptionEmailData): EmailTemplate {
    const isTrial = !!data.trialEnds;
    const trialDays = data.trialEnds ? Math.ceil((data.trialEnds.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      to: data.userEmail,
      subject: isTrial 
        ? `Your ${data.planName} Trial Has Started!` 
        : `Welcome to ${data.planName} - Subscription Confirmed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${isTrial ? 'Trial Started' : 'Subscription Confirmed'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isTrial ? '🎉 Trial Started!' : '✅ Subscription Confirmed'}</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>${isTrial 
                ? `Your ${data.planName} trial has started and will last for ${trialDays} days.`
                : `Your ${data.planName} subscription has been successfully activated.`
              }</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>Subscription Details:</h3>
                <p><strong>Plan:</strong> ${data.planName}</p>
                <p><strong>Price:</strong> ${data.currency} ${data.planPrice}/month</p>
                ${isTrial 
                  ? `<p><strong>Trial Ends:</strong> ${data.trialEnds?.toLocaleDateString()}</p>`
                  : `<p><strong>Next Billing:</strong> ${data.nextBilling?.toLocaleDateString()}</p>`
                }
                ${data.interviewsLimit !== undefined 
                  ? `<p><strong>Interview Credits:</strong> ${data.interviewsLimit}/month</p>`
                  : ''
                }
              </div>

              ${isTrial 
                ? `<p>You'll have full access to all ${data.planName} features during your trial. No charges will be made until the trial ends.</p>`
                : `<p>You now have full access to all ${data.planName} features. You can manage your subscription from your dashboard.</p>`
              }

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  Go to Dashboard
                </a>
              </div>

              <p>Best regards,<br>The Team</p>
            </div>
            <div class="footer">
              <p>If you have any questions, reply to this email or contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        ${isTrial ? 'Trial Started' : 'Subscription Confirmed'}
        
        Hi ${data.userName},
        
        ${isTrial 
          ? `Your ${data.planName} trial has started and will last for ${trialDays} days.`
          : `Your ${data.planName} subscription has been successfully activated.`
        }
        
        Subscription Details:
        Plan: ${data.planName}
        Price: ${data.currency} ${data.planPrice}/month
        ${isTrial 
          ? `Trial Ends: ${data.trialEnds?.toLocaleDateString()}`
          : `Next Billing: ${data.nextBilling?.toLocaleDateString()}`
        }
        ${data.interviewsLimit !== undefined 
          ? `Interview Credits: ${data.interviewsLimit}/month`
          : ''
        }
        
        ${isTrial 
          ? "You'll have full access to all features during your trial. No charges until trial ends."
          : "You now have full access to all features."
        }
        
        Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
      `
    };
  }

  private static getTrialExpirationTemplate(data: SubscriptionEmailData): EmailTemplate {
    const daysLeft = data.trialEnds ? Math.ceil((data.trialEnds.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      to: data.userEmail,
      subject: `Your ${data.planName} Trial Ends in ${daysLeft} Days`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Trial Expiration Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .urgent { background: #FEE2E2; border: 1px solid #FCA5A5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Trial Ending Soon</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <div class="urgent">
                <strong>⚠️ Action Required:</strong> Your ${data.planName} trial ends in <strong>${daysLeft} days</strong>.
              </div>
              
              <p>To continue enjoying all the features of ${data.planName}, please add your payment details before the trial ends.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>What happens after the trial?</h3>
                <ul>
                  <li>If you add payment details: Your subscription continues automatically</li>
                  <li>If you don't: Your account will downgrade to the Free plan</li>
                  <li>You'll lose access to premium features and interview credits</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" class="button">
                  Add Payment Details
                </a>
              </div>

              <p>Questions? We're here to help!</p>
              <p>Best regards,<br>The Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Trial Expiration Reminder
        
        Hi ${data.userName},
        
        Your ${data.planName} trial ends in ${daysLeft} days.
        
        To continue enjoying all features, please add your payment details before the trial ends.
        
        What happens after the trial?
        - If you add payment details: Your subscription continues automatically
        - If you don't: Your account will downgrade to the Free plan
        - You'll lose access to premium features and interview credits
        
        Add payment details: ${process.env.NEXT_PUBLIC_APP_URL}/billing
      `
    };
  }

  private static getMonthlyUsageTemplate(data: SubscriptionEmailData): EmailTemplate {
    const usagePercentage = data.interviewsLimit && data.interviewsUsed 
      ? Math.round((data.interviewsUsed / data.interviewsLimit) * 100)
      : 0;

    return {
      to: data.userEmail,
      subject: `Your Monthly Usage Report - ${data.interviewsUsed}/${data.interviewsLimit} Interviews Used`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Monthly Usage Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .progress-bar { background: #E5E7EB; border-radius: 10px; overflow: hidden; height: 20px; margin: 10px 0; }
            .progress-fill { background: #10B981; height: 100%; transition: width 0.3s ease; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-box { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Monthly Usage Report</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Here's your usage summary for this month:</p>
              
              <div class="stats">
                <div class="stat-box">
                  <h3>${data.interviewsUsed}</h3>
                  <p>Interviews Used</p>
                </div>
                <div class="stat-box">
                  <h3>${data.interviewsLimit}</h3>
                  <p>Monthly Limit</p>
                </div>
              </div>

              <div style="margin: 20px 0;">
                <h4>Usage: ${usagePercentage}%</h4>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${usagePercentage}%"></div>
                </div>
              </div>

              ${usagePercentage > 80 
                ? `<div style="background: #FEF3C7; border: 1px solid #FCD34D; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <strong>💡 Tip:</strong> You're approaching your limit! Consider upgrading if you need more interviews.
                </div>`
                : ''
              }

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  View Dashboard
                </a>
              </div>

              <p>Best regards,<br>The Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Monthly Usage Report
        
        Hi ${data.userName},
        
        Here's your usage summary for this month:
        
        Interviews Used: ${data.interviewsUsed}
        Monthly Limit: ${data.interviewsLimit}
        Usage: ${usagePercentage}%
        
        ${usagePercentage > 80 
          ? "You're approaching your limit! Consider upgrading if you need more interviews."
          : ''
        }
        
        Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
      `
    };
  }

  private static getPaymentFailedTemplate(data: SubscriptionEmailData): EmailTemplate {
    return {
      to: data.userEmail,
      subject: 'Payment Failed - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Failed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .alert { background: #FEE2E2; border: 1px solid #FCA5A5; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Payment Failed</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <div class="alert">
                <strong>⚠️ We couldn't process your payment</strong> for your ${data.planName} subscription.
              </div>
              
              <p>This could be due to:</p>
              <ul>
                <li>Insufficient funds</li>
                <li>Expired card</li>
                <li>Card details changed</li>
                <li>Bank declined the transaction</li>
              </ul>
              
              <p><strong>What happens next:</strong></p>
              <ul>
                <li>We'll retry the payment in 3 days</li>
                <li>Your service will continue during this period</li>
                <li>If payment fails again, your subscription may be cancelled</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" class="button">
                  Update Payment Method
                </a>
              </div>

              <p>Need help? Contact our support team.</p>
              <p>Best regards,<br>The Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Payment Failed - Action Required
        
        Hi ${data.userName},
        
        We couldn't process your payment for your ${data.planName} subscription.
        
        This could be due to:
        - Insufficient funds
        - Expired card
        - Card details changed
        - Bank declined the transaction
        
        What happens next:
        - We'll retry the payment in 3 days
        - Your service will continue during this period
        - If payment fails again, your subscription may be cancelled
        
        Update payment method: ${process.env.NEXT_PUBLIC_APP_URL}/billing
      `
    };
  }

  private static getSubscriptionCancelledTemplate(data: SubscriptionEmailData): EmailTemplate {
    return {
      to: data.userEmail,
      subject: 'Subscription Cancelled',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Subscription Cancelled</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6B7280; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 Subscription Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your ${data.planName} subscription has been cancelled as requested.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>What happens now:</h3>
                <ul>
                  <li>You'll keep access until the end of your current billing period</li>
                  <li>After that, you'll be downgraded to the Free plan</li>
                  <li>Your data and settings will be preserved</li>
                  <li>You can reactivate anytime</li>
                </ul>
              </div>

              <p>We're sorry to see you go! If you changed your mind or need help with anything:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" class="button">
                  Reactivate Subscription
                </a>
              </div>

              <p>Thank you for being part of our community!</p>
              <p>Best regards,<br>The Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Subscription Cancelled
        
        Hi ${data.userName},
        
        Your ${data.planName} subscription has been cancelled as requested.
        
        What happens now:
        - You'll keep access until the end of your current billing period
        - After that, you'll be downgraded to the Free plan
        - Your data and settings will be preserved
        - You can reactivate anytime
        
        Reactivate subscription: ${process.env.NEXT_PUBLIC_APP_URL}/billing
        
        Thank you for being part of our community!
      `
    };
  }
}
