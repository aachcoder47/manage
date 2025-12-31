import { render } from '@react-email/render';
import { emailService } from './email.service';
import { WelcomeEmail } from '../components/email/WelcomeEmail';
import { ApplicationReceivedEmail } from '../components/email/ApplicationReceivedEmail';
import { InterviewInviteEmail } from '../components/email/InterviewInviteEmail';
import { WeeklySummaryEmail } from '../components/email/WeeklySummaryEmail';
import { RejectionEmail } from '../components/email/RejectionEmail';
import { OfferEmail } from '../components/email/OfferEmail';

export interface SendWelcomeEmailParams {
  name: string;
  userEmail: string;
  userId: string;
  organizationId: string;
}

export interface SendApplicationReceivedEmailParams {
  candidateName: string;
  positionTitle: string;
  organizationName: string;
  applicationId: string;
  recipientEmail: string;
  userId?: string;
  organizationId: string;
}

export interface SendInterviewInviteEmailParams {
  candidateName: string;
  positionTitle: string;
  interviewDate: string;
  interviewTime: string;
  interviewLink: string;
  organizationName: string;
  recipientEmail: string;
  userId?: string;
  organizationId: string;
}

export interface SendRejectionEmailParams {
  candidateName: string;
  positionTitle: string;
  organizationName: string;
  recipientEmail: string;
  userId?: string;
  organizationId: string;
  rejectionReason?: string;
}

export interface SendOfferEmailParams {
  candidateName: string;
  positionTitle: string;
  organizationName: string;
  recipientEmail: string;
  userId?: string;
  organizationId: string;
  salary?: string;
  startDate?: string;
  offerDetails?: string;
  acceptanceDeadline?: string;
  contactPerson?: string;
  contactEmail?: string;
}

export interface SendWeeklySummaryEmailParams {
  userName: string;
  organizationName: string;
  recipientEmail: string;
  userId: string;
  organizationId: string;
  weekSummary: {
    candidatesScreened: number;
    interviewsCompleted: number;
    hiresMade: number;
    hoursSaved: number;
    avgResponseTime: string;
    topPerformers: Array<{
      name: string;
      position: string;
      score: number;
      experience: string;
      avatar?: string;
    }>;
    upcomingInterviews: Array<{
      candidateName: string;
      position: string;
      date: string;
      time: string;
      interviewer: string;
    }>;
    recentHires: Array<{
      name: string;
      position: string;
      startDate: string;
    }>;
    efficiencyMetrics: {
      timeToHire: string;
      costPerHire: string;
      satisfactionRate: number;
    };
  };
}

export class EmailTriggerService {
  private static instance: EmailTriggerService;
  
  static getInstance(): EmailTriggerService {
    if (!EmailTriggerService.instance) {
      EmailTriggerService.instance = new EmailTriggerService();
    }
    return EmailTriggerService.instance;
  }

  async sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<boolean> {
    const { name, userEmail, userId, organizationId } = params;
    
    try {
      // Check if user allows transactional emails
      const canSend = await emailService.canSendEmail(userId, organizationId, 'transactional');
      if (!canSend) {
        console.log('User has opted out of transactional emails');
        return false;
      }

      const emailHtml = await render(
        WelcomeEmail({ name, userEmail })
      );

      const success = await emailService.sendEmail({
        to: userEmail,
        subject: 'Welcome to Futuristic HR - Your AI-powered hiring platform',
        html: emailHtml,
      });

      // Log the email
      await emailService.logEmail(
        userId,
        organizationId,
        'welcome',
        success ? 'sent' : 'failed',
        userEmail,
        'Welcome to Futuristic HR - Your AI-powered hiring platform',
        success ? undefined : 'Failed to send welcome email'
      );

      return success;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      await emailService.logEmail(
        userId,
        organizationId,
        'welcome',
        'failed',
        userEmail,
        'Welcome to Futuristic HR - Your AI-powered hiring platform',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  async sendApplicationReceivedEmail(params: SendApplicationReceivedEmailParams): Promise<boolean> {
    const { 
      candidateName, 
      positionTitle, 
      organizationName, 
      applicationId, 
      recipientEmail,
      userId,
      organizationId 
    } = params;
    
    try {
      // Check if user allows hiring updates
      if (userId) {
        const canSend = await emailService.canSendEmail(userId, organizationId, 'hiring_updates');
        if (!canSend) {
          console.log('User has opted out of hiring update emails');
          return false;
        }
      }

      const emailHtml = await render(
        ApplicationReceivedEmail({ 
          candidateName, 
          positionTitle, 
          organizationName,
          applicationId 
        })
      );

      const subject = `New application from ${candidateName} for ${positionTitle}`;
      const success = await emailService.sendEmail({
        to: recipientEmail,
        subject,
        html: emailHtml,
      });

      // Log the email
      await emailService.logEmail(
        userId || null,
        organizationId,
        'application_received',
        success ? 'sent' : 'failed',
        recipientEmail,
        subject,
        success ? undefined : 'Failed to send application received email'
      );

      return success;
    } catch (error) {
      console.error('Error sending application received email:', error);
      await emailService.logEmail(
        userId || null,
        organizationId,
        'application_received',
        'failed',
        recipientEmail,
        `New application from ${candidateName} for ${positionTitle}`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  async sendInterviewInviteEmail(params: SendInterviewInviteEmailParams): Promise<boolean> {
    const { 
      candidateName, 
      positionTitle, 
      interviewDate, 
      interviewTime, 
      interviewLink,
      organizationName,
      recipientEmail,
      userId,
      organizationId 
    } = params;
    
    try {
      // For candidates, we don't check preferences (transactional)
      // For employers, check if they allow hiring updates
      if (userId) {
        const canSend = await emailService.canSendEmail(userId, organizationId, 'hiring_updates');
        if (!canSend) {
          console.log('User has opted out of hiring update emails');
          return false;
        }
      }

      const emailHtml = await render(
        InterviewInviteEmail({ 
          candidateName, 
          positionTitle, 
          interviewDate, 
          interviewTime, 
          interviewLink,
          organizationName 
        })
      );

      const subject = `Interview invitation for ${positionTitle} at ${organizationName}`;
      const success = await emailService.sendEmail({
        to: recipientEmail,
        subject,
        html: emailHtml,
      });

      // Log the email
      await emailService.logEmail(
        userId || null,
        organizationId,
        'interview_invite',
        success ? 'sent' : 'failed',
        recipientEmail,
        subject,
        success ? undefined : 'Failed to send interview invite email'
      );

      return success;
    } catch (error) {
      console.error('Error sending interview invite email:', error);
      await emailService.logEmail(
        userId || null,
        organizationId,
        'interview_invite',
        'failed',
        recipientEmail,
        `Interview invitation for ${positionTitle} at ${organizationName}`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  async sendRejectionEmail(params: SendRejectionEmailParams): Promise<boolean> {
    const { 
      candidateName, 
      positionTitle, 
      organizationName, 
      recipientEmail,
      userId,
      organizationId,
      rejectionReason
    } = params;
    
    try {
      // Check if user allows hiring updates emails
      const canSend = await emailService.canSendEmail(userId || '', organizationId || '', 'hiring_updates');
      if (!canSend) {
        console.log('User has opted out of hiring update emails');
        return false;
      }

      const emailHtml = await render(
        RejectionEmail({ 
          candidateName, 
          positionTitle, 
          organizationName,
          rejectionReason: rejectionReason || 'We have decided to move forward with other candidates whose qualifications more closely match our current needs.'
        })
      );

      const subject = `Update on your application for ${positionTitle} at ${organizationName}`;
      const success = await emailService.sendEmail({
        to: recipientEmail,
        subject,
        html: emailHtml,
      });

      // Log the email
      await emailService.logEmail(
        userId || '',
        organizationId || '',
        'hiring_updates',
        success ? 'sent' : 'failed',
        recipientEmail,
        subject,
        success ? undefined : 'Failed to send rejection email'
      );

      return success;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      await emailService.logEmail(
        userId || '',
        organizationId || '',
        'hiring_updates',
        'failed',
        recipientEmail,
        `Update on your application for ${positionTitle} at ${organizationName}`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  async sendOfferEmail(params: SendOfferEmailParams): Promise<boolean> {
    const { 
      candidateName, 
      positionTitle, 
      organizationName, 
      recipientEmail,
      userId,
      organizationId,
      salary,
      startDate,
      offerDetails,
      acceptanceDeadline,
      contactPerson,
      contactEmail
    } = params;
    
    try {
      // Check if user allows hiring updates emails
      const canSend = await emailService.canSendEmail(userId || '', organizationId || '', 'hiring_updates');
      if (!canSend) {
        console.log('User has opted out of hiring update emails');
        return false;
      }

      const emailHtml = await render(
        OfferEmail({ 
          candidateName, 
          positionTitle, 
          organizationName,
          salary,
          startDate,
          offerDetails,
          acceptanceDeadline,
          contactPerson,
          contactEmail
        })
      );

      const subject = `Job Offer: ${positionTitle} at ${organizationName}`;
      const success = await emailService.sendEmail({
        to: recipientEmail,
        subject,
        html: emailHtml,
      });

      // Log the email
      await emailService.logEmail(
        userId || '',
        organizationId || '',
        'hiring_updates',
        success ? 'sent' : 'failed',
        recipientEmail,
        subject,
        success ? undefined : 'Failed to send offer email'
      );

      return success;
    } catch (error) {
      console.error('Error sending offer email:', error);
      await emailService.logEmail(
        userId || '',
        organizationId || '',
        'hiring_updates',
        'failed',
        recipientEmail,
        `Job Offer: ${positionTitle} at ${organizationName}`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  async sendWeeklySummaryEmail(params: SendWeeklySummaryEmailParams): Promise<boolean> {
    const { 
      userName, 
      organizationName, 
      recipientEmail,
      userId,
      organizationId,
      weekSummary 
    } = params;
    
    try {
      // Check if user allows weekly summary emails
      const canSend = await emailService.canSendEmail(userId, organizationId, 'weekly_summary');
      if (!canSend) {
        console.log('User has opted out of weekly summary emails');
        return false;
      }

      const emailHtml = await render(
        WeeklySummaryEmail({ 
          userName, 
          organizationName,
          weekSummary 
        })
      );

      const subject = `Weekly hiring summary - ${weekSummary.candidatesScreened} candidates screened`;
      const success = await emailService.sendEmail({
        to: recipientEmail,
        subject,
        html: emailHtml,
      });

      // Log the email
      await emailService.logEmail(
        userId,
        organizationId,
        'weekly_summary',
        success ? 'sent' : 'failed',
        recipientEmail,
        subject,
        success ? undefined : 'Failed to send weekly summary email'
      );

      return success;
    } catch (error) {
      console.error('Error sending weekly summary email:', error);
      await emailService.logEmail(
        userId,
        organizationId,
        'weekly_summary',
        'failed',
        recipientEmail,
        `Weekly hiring summary - ${weekSummary.candidatesScreened} candidates screened`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }
}

export const emailTriggerService = EmailTriggerService.getInstance();
