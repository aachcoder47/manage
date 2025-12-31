import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailTemplate {
  to: string | string[];
  data: Record<string, any>;
  subject?: string;
}

export class EmailService {
  private static instance: EmailService;
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail({ to, subject, html, from, replyTo }: EmailData): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: from || 'Futuristic HR <onboarding@futuristiccreations.store>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        replyTo: replyTo || undefined,
      });

      if (error) {
        console.error('Email send error:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  async logEmail(
    userId: string | null,
    organizationId: string | null,
    emailType: string,
    status: string,
    to: string,
    subject: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_log')
        .insert({
          user_id: userId,
          organization_id: organizationId,
          email_type: emailType,
          recipient_email: to,
          subject,
          status,
          error_message: errorMessage,
        });

      if (error) {
        console.error('Failed to log email:', error);
      }
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  async getUserEmailPreferences(userId: string, organizationId: string): Promise<{
    product_updates: boolean;
    hiring_updates: boolean;
    marketing: boolean;
    transactional: boolean;
    weekly_summary: boolean;
  }> {
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .single();

      if (error || !data) {
        // Return default preferences if not found
        return {
          product_updates: true,
          hiring_updates: true,
          marketing: false,
          transactional: true,
          weekly_summary: true,
        };
      }

      return {
        product_updates: data.product_updates,
        hiring_updates: data.hiring_updates,
        marketing: data.marketing,
        transactional: data.transactional,
        weekly_summary: data.weekly_summary,
      };
    } catch (error) {
      console.error('Failed to get email preferences:', error);
      return {
        product_updates: true,
        hiring_updates: true,
        marketing: false,
        transactional: true,
        weekly_summary: true,
      };
    }
  }

  async updateUserEmailPreferences(
    userId: string,
    organizationId: string,
    preferences: Partial<{
      product_updates: boolean;
      hiring_updates: boolean;
      marketing: boolean;
      transactional: boolean;
      weekly_summary: boolean;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: userId,
          organization_id: organizationId,
          ...preferences,
        });

      if (error) {
        console.error('Failed to update email preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update email preferences:', error);
      return false;
    }
  }

  async canSendEmail(
    userId: string,
    organizationId: string,
    emailType: 'transactional' | 'product_updates' | 'hiring_updates' | 'marketing' | 'weekly_summary'
  ): Promise<boolean> {
    const preferences = await this.getUserEmailPreferences(userId, organizationId);
    return preferences[emailType];
  }
}

export const emailService = EmailService.getInstance();
