import { createClient } from "@supabase/supabase-js";
import PublicJobDetailsClient from "./PublicJobDetailsClient";

function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_LIVE_URL;
  if (configured) {
    if (configured.startsWith("http://") || configured.startsWith("https://")) {
      return configured.replace(/\/$/, "");
    }
    return `https://${configured.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export default async function PublicJobDetailsPage({
  params,
}: {
  params: { jobId: string };
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return <div className="p-10 text-center">Job not found</div>;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: job, error } = await supabase
    .from("job")
    .select(`*, organization(name, image_url)`)
    .eq("id", params.jobId)
    .single();

  if (error || !job) {
    return <div className="p-10 text-center">Job not found</div>;
  }

  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/find-jobs/${job.id}`;

  const jsonLd: any = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    employmentType: job.employment_type || undefined,
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization?.name || undefined,
      logo: job.organization?.image_url || undefined,
    },
    identifier: {
      "@type": "PropertyValue",
      name: job.organization?.name || undefined,
      value: job.id,
    },
    jobLocationType: job.is_remote ? "TELECOMMUTE" : undefined,
    jobLocation: job.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
          },
        }
      : undefined,
    url: canonicalUrl,
    applyUrl: canonicalUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicJobDetailsClient job={job as any} />
    </>
  );
}
