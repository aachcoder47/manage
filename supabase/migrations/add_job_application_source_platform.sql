alter table if exists public.job_application
add column if not exists source_platform text;

alter table if exists public.job_application
add constraint if not exists job_application_source_platform_check
check (source_platform is null or source_platform in (
  'linkedin',
  'indeed',
  'google',
  'google_jobs',
  'wellfound',
  'referral',
  'other'
));
