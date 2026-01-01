export type JobApplication = {
    id: string;
    created_at: string;
    job_id: string;
    candidate_id: string; // The user id
    status: 'applied' | 'screening' | 'interviewing' | 'trial' | 'offer' | 'hired' | 'rejected';
    resume_url?: string;
    cover_letter?: string;
    screening_score?: number;
    screening_notes?: string;
    email?: string;
    phone?: string;
    source_platform?: 'linkedin' | 'indeed' | 'naukri' | 'google' | 'google_jobs' | 'wellfound' | 'referral' | 'other';
    
    // Join fields (optional)
    job?: {
        title: string;
        organization?: {
            name: string;
            image_url: string;
        }
    };
    candidate?: {
        email: string;
        // Profile join would happen here
    }
}
