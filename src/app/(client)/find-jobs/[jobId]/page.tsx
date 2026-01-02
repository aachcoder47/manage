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

  // Helper to map employment type to Schema.org values
  const mapEmploymentType = (type?: string) => {
    if (!type) return "FULL_TIME";
    const t = type.toLowerCase().replace("-", "_");
    if (t.includes("full")) return "FULL_TIME";
    if (t.includes("part")) return "PART_TIME";
    if (t.includes("contract")) return "CONTRACTOR";
    if (t.includes("temp")) return "TEMPORARY";
    if (t.includes("intern")) return "INTERN";
    if (t.includes("volunteer")) return "VOLUNTEER";
    return "FULL_TIME";
  };

  // Combine description parts
  const fullDescription = `
    ${job.description || ""}
    ${job.requirements ? `<h3>Requirements</h3>${job.requirements}` : ""}
    ${job.company_description ? `<h3>About Core</h3>${job.company_description}` : ""}
  `.trim();

  // Basic salary parsing (optimistic attempt)
  let baseSalary = undefined;
  if(job.salary_range) {
     const cleanSalary = job.salary_range.toLowerCase().replace(/,/g, '');
     const match = cleanSalary.match(/(\d+)/);
     if(match) {
        baseSalary = {
           "@type": "MonetaryAmount",
           "currency": "INR", // Defaulting to INR based on user context
           "value": {
              "@type": "QuantitativeValue",
              "value": parseInt(match[0], 10),
              "unitText": "YEAR" // Assumption, can be improved
           }
        };
     }
  }

  const jsonLd: any = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: fullDescription,
    datePosted: job.created_at,
    validThrough: new Date(new Date(job.created_at).setMonth(new Date(job.created_at).getMonth() + 6)).toISOString(), // Valid for 6 months
    employmentType: mapEmploymentType(job.employment_type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name || job.organization?.name || "Hiring Organization",
      logo: job.organization?.image_url || undefined,
      sameAs: job.organization?.website || undefined
    },
    identifier: {
      "@type": "PropertyValue",
      name: job.company_name || job.organization?.name || "Hiring Organization",
      value: job.id,
    },
    jobLocationType: job.is_remote ? "TELECOMMUTE" : undefined,
    jobLocation: job.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
            addressCountry: "IN" // Default context
          },
        }
      : {
          "@type": "Place",
          address: {
             "@type": "PostalAddress",
             addressCountry: "IN"
          }
      },
    baseSalary: baseSalary,
    url: canonicalUrl,
    directApply: true,
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
