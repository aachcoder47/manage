// services/ai-screening.service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface AIScreening {
  id: string;
  created_at: string;
  updated_at: string;
  application_id: string;
  screening_status: 'pending' | 'processing' | 'completed' | 'failed';
  screening_result: any;
  screening_score: number;
  screening_reason?: string;
  screening_model: string;
  screening_version: string;
  error_message?: string;
  error_code?: string;
  retry_count: number;
  max_retries: number;
  last_retry_at?: string;
  metadata: any;
  is_active: boolean;
}

export interface AIScreeningLog {
  id: string;
  created_at: string;
  screening_id: string;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  log_message: string;
  log_data: any;
  processing_time_ms?: number;
  api_response?: string;
  error_details?: any;
}

export class AIScreeningService {
  /**
   * Create AI screening for an application
   */
  static async createScreening(applicationId: string): Promise<AIScreening> {
    const { data, error } = await supabase
      .from('ai_screening')
      .insert({
        application_id: applicationId,
        screening_status: 'pending',
        screening_result: {},
        screening_score: 0.00,
        screening_model: 'gpt-4',
        screening_version: '1.0',
        retry_count: 0,
        max_retries: 3,
        metadata: {},
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create AI screening: ${error.message}`);
    }

    return data as AIScreening;
  }

  /**
   * Process AI screening for an application
   */
  static async processScreening(screeningId: string): Promise<void> {
    try {
      // Get screening details
      const { data: screening, error: fetchError } = await supabase
        .from('ai_screening')
        .select(`
          *,
          job_applications (
            applicant_name,
            applicant_email,
            resume_url,
            cover_letter,
            job:jobs (
              title,
              description,
              requirements
            )
          )
        `)
        .eq('id', screeningId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch screening: ${fetchError.message}`);
      }

      // Update status to processing
      await this.updateScreeningStatus(screeningId, 'processing');
      await this.addScreeningLog(screeningId, 'info', 'Started AI screening process');

      // Simulate AI processing (replace with actual AI service call)
      const startTime = Date.now();
      const aiResult = await this.callAIService(screening);
      const processingTime = Date.now() - startTime;

      // Update screening with results
      await this.updateScreeningResults(screeningId, {
        screening_status: 'completed',
        screening_result: aiResult.result,
        screening_score: aiResult.score,
        screening_reason: aiResult.reason,
        metadata: {
          ...screening.metadata,
          processing_time_ms: processingTime,
          model_confidence: aiResult.confidence,
        },
      });

      await this.addScreeningLog(screeningId, 'info', 'AI screening completed successfully', {
        processing_time_ms: processingTime,
        score: aiResult.score,
      });

    } catch (error: any) {
      console.error('AI screening processing error:', error);
      
      // Handle failure
      await this.handleScreeningFailure(screeningId, error);
    }
  }

  /**
   * Simulate AI service call (replace with actual AI service)
   */
  private static async callAIService(screening: any): Promise<{
    result: any;
    score: number;
    reason: string;
    confidence: number;
  }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const application = screening.job_applications;
    const job = application.job;

    // Simulate AI analysis
    const score = Math.random() * 0.4 + 0.6; // Random score between 0.6 and 1.0
    const confidence = Math.random() * 0.2 + 0.8; // Random confidence between 0.8 and 1.0

    // Simulate occasional failures (20% chance)
    if (Math.random() < 0.2) {
      throw new Error('AI service temporarily unavailable');
    }

    return {
      result: {
        match_score: score,
        skills_match: ['JavaScript', 'React', 'Node.js'],
        experience_match: score > 0.7,
        education_match: true,
        location_match: true,
        culture_fit: score > 0.8,
      },
      score,
      reason: `Candidate shows strong alignment with job requirements. Match score: ${(score * 100).toFixed(1)}%`,
      confidence,
    };
  }

  /**
   * Handle screening failure
   */
  private static async handleScreeningFailure(screeningId: string, error: any): Promise<void> {
    const { data: screening } = await supabase
      .from('ai_screening')
      .select('retry_count, max_retries')
      .eq('id', screeningId)
      .single();

    const newRetryCount = (screening?.retry_count || 0) + 1;
    const shouldRetry = newRetryCount < (screening?.max_retries || 3);

    await this.updateScreeningResults(screeningId, {
      screening_status: shouldRetry ? 'pending' : 'failed',
      error_message: error.message,
      error_code: this.getErrorCode(error),
      retry_count: newRetryCount,
      last_retry_at: new Date().toISOString(),
    });

    await this.addScreeningLog(screeningId, 'error', `AI screening failed: ${error.message}`, {
      error_type: error.name,
      retry_count: newRetryCount,
      should_retry: shouldRetry,
    });

    // Schedule retry if needed
    if (shouldRetry) {
      setTimeout(() => {
        this.processScreening(screeningId);
      }, 5000 * newRetryCount); // Exponential backoff
    }
  }

  /**
   * Get error code from error
   */
  private static getErrorCode(error: any): string {
    if (error.message.includes('unavailable')) return 'AI_SERVICE_UNAVAILABLE';
    if (error.message.includes('timeout')) return 'AI_SERVICE_TIMEOUT';
    if (error.message.includes('quota')) return 'AI_QUOTA_EXCEEDED';
    if (error.message.includes('auth')) return 'AI_AUTH_ERROR';
    return 'AI_UNKNOWN_ERROR';
  }

  /**
   * Update screening status
   */
  static async updateScreeningStatus(screeningId: string, status: 'pending' | 'processing' | 'completed' | 'failed'): Promise<void> {
    const { error } = await supabase
      .from('ai_screening')
      .update({
        screening_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', screeningId);

    if (error) {
      throw new Error(`Failed to update screening status: ${error.message}`);
    }
  }

  /**
   * Update screening results
   */
  static async updateScreeningResults(screeningId: string, updates: Partial<AIScreening>): Promise<void> {
    const { error } = await supabase
      .from('ai_screening')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', screeningId);

    if (error) {
      throw new Error(`Failed to update screening results: ${error.message}`);
    }
  }

  /**
   * Add screening log
   */
  static async addScreeningLog(
    screeningId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('ai_screening_logs')
      .insert({
        screening_id: screeningId,
        log_level: level,
        log_message: message,
        log_data: data || {},
        processing_time_ms: data?.processing_time_ms || null,
        api_response: data?.api_response || null,
        error_details: data?.error_details || null,
      });

    if (error) {
      console.error('Failed to add screening log:', error);
    }
  }

  /**
   * Get screening by application ID
   */
  static async getScreeningByApplicationId(applicationId: string): Promise<AIScreening | null> {
    const { data, error } = await supabase
      .from('ai_screening')
      .select('*')
      .eq('application_id', applicationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get screening: ${error.message}`);
    }

    return data as AIScreening;
  }

  /**
   * Get screening logs
   */
  static async getScreeningLogs(screeningId: string): Promise<AIScreeningLog[]> {
    const { data, error } = await supabase
      .from('ai_screening_logs')
      .select('*')
      .eq('screening_id', screeningId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get screening logs: ${error.message}`);
    }

    return data as AIScreeningLog[];
  }

  /**
   * Retry failed screenings
   */
  static async retryFailedScreenings(): Promise<void> {
    const { data, error } = await supabase
      .from('ai_screening')
      .select('*')
      .eq('screening_status', 'failed')
      .lt('retry_count', 'max_retries')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to get failed screenings: ${error.message}`);
    }

    const screenings = data as AIScreening[];
    
    for (const screening of screenings) {
      // Check if enough time has passed for retry
      const retryDelay = 5000 * (screening.retry_count + 1); // Exponential backoff
      const timeSinceLastRetry = screening.last_retry_at 
        ? Date.now() - new Date(screening.last_retry_at).getTime()
        : Infinity;

      if (timeSinceLastRetry >= retryDelay) {
        await this.processScreening(screening.id);
      }
    }
  }

  /**
   * Get screening statistics
   */
  static async getScreeningStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    average_score: number;
  }> {
    const { data, error } = await supabase
      .from('ai_screening')
      .select('screening_status, screening_score')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to get screening stats: ${error.message}`);
    }

    const screenings = data as AIScreening[];
    
    const stats = {
      total: screenings.length,
      pending: screenings.filter(s => s.screening_status === 'pending').length,
      processing: screenings.filter(s => s.screening_status === 'processing').length,
      completed: screenings.filter(s => s.screening_status === 'completed').length,
      failed: screenings.filter(s => s.screening_status === 'failed').length,
      average_score: screenings
        .filter(s => s.screening_status === 'completed')
        .reduce((sum, s) => sum + s.screening_score, 0) / 
        Math.max(1, screenings.filter(s => s.screening_status === 'completed').length),
    };

    return stats;
  }
}
