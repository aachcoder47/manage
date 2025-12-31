import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  objective: string;
  status: 'open' | 'closed' | 'draft';
  organization_id: string;
  user_id: string;
  interviewer_id: number;
  is_active: boolean;
  is_anonymous: boolean;
  is_archived: boolean;
  logo_url: string;
  theme_color: string;
  url: string;
  readable_slug: string;
  questions: any;
  quotes: any[];
  insights: string[];
  respondents: string[];
  question_count: number;
  response_count: number;
  time_duration: string;
  organization?: {
    name: string;
    image_url: string;
  };
}

export interface JobsResponse {
  data: Job[] | null;
  error: any;
}

export interface JobResponse {
  data: Job | null;
  error: any;
}

export class JobsService {
  private static instance: JobsService;
  
  static getInstance(): JobsService {
    if (!JobsService.instance) {
      JobsService.instance = new JobsService();
    }
    return JobsService.instance;
  }

  async getOpenJobs(): Promise<JobsResponse> {
    try {
      const { data, error } = await supabase
        .from('job')
        .select('*, organization(name, image_url)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching open jobs:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching open jobs:', error);
      return { data: [], error };
    }
  }

  async getJobById(jobId: string): Promise<JobResponse> {
    try {
      const { data, error } = await supabase
        .from('job')
        .select('*, organization(name, image_url)')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job by ID:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error fetching job by ID:', error);
      return { data: null, error };
    }
  }

  async getJobsByOrganization(organizationId: string): Promise<JobsResponse> {
    try {
      const { data, error } = await supabase
        .from('job')
        .select('*, organization(name, image_url)')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs by organization:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching jobs by organization:', error);
      return { data: [], error };
    }
  }

  async getJobsByUser(userId: string): Promise<JobsResponse> {
    try {
      const { data, error } = await supabase
        .from('job')
        .select('*, organization(name, image_url)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs by user:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching jobs by user:', error);
      return { data: [], error };
    }
  }

  async createJob(jobData: Partial<Job>): Promise<JobResponse> {
    try {
      const { data, error } = await supabase
        .from('job')
        .insert(jobData)
        .select('*, organization(name, image_url)')
        .single();

      if (error) {
        console.error('Error creating job:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error creating job:', error);
      return { data: null, error };
    }
  }

  async updateJob(jobId: string, jobData: Partial<Job>): Promise<JobResponse> {
    try {
      const { data, error } = await supabase
        .from('job')
        .update(jobData)
        .eq('id', jobId)
        .select('*, organization(name, image_url)')
        .single();

      if (error) {
        console.error('Error updating job:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error updating job:', error);
      return { data: null, error };
    }
  }

  async deleteJob(jobId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('job')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error deleting job:', error);
      return { success: false, error };
    }
  }
}

export const jobsService = JobsService.getInstance();
