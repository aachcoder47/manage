export type Job = {
    id: string;
    created_at: string;
    organization_id: string;
    title: string;
    description: string;
    requirements?: string;
    location?: string;
    employment_type?: string;
    salary_range?: string;
    is_remote: boolean;
    status: 'open' | 'closed' | 'draft';
    views: number;
    company_name?: string;
    company_description?: string;
}
