
import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hr.futuristiccreations.store";

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch all open jobs
  const { data: jobs } = await supabase
    .from("job")
    .select("id, created_at")
    .eq("status", "open");

  const jobEntries: MetadataRoute.Sitemap = (jobs || []).map((job) => ({
    url: `${baseUrl}/find-jobs/${job.id}`,
    lastModified: new Date(job.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...jobEntries,
  ];
}
