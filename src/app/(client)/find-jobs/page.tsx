"use client";

import React, { useState, useEffect } from "react";
import PublicJobCard from "@/components/dashboard/jobs/PublicJobCard";
import { JobsService } from "@/services/jobs.service";
import { Job } from "@/types/job";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ManualAdSense } from "@/components/ads/AdSenseScriptLoader";
import { EffectiveGateAd } from "@/components/ads/EffectiveGateAd";
import { HighPerformanceAd } from "@/components/ads/HighPerformanceAd";
import { EffectiveGateCPMAd } from "@/components/ads/EffectiveGateCPMAd";
import { ProductionAds } from "@/components/ads/ProductionAds";
import { EffectiveGateCPMAdSolo } from "@/components/ads/EffectiveGateCPMAdSolo";
import { CSSResponsiveAds } from "@/components/ads/CSSResponsiveAds";
import { ProductionDomainResponsiveAds } from "@/components/ads/ProductionDomainAds";

function FindJobsPage() {
  const [jobs, setJobs] = useState<(Job & { organization: { name: string; image_url: string } })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await JobsService.getPublicJobs();
        // @ts-ignore
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function JobsLoader() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 w-full animate-pulse rounded-xl bg-muted/50 border border-muted" />
        ))}
      </div>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-4 items-center text-center py-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Find Your Dream Job
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Browse through hundreds of opportunities from top companies vetted by AI.
          </p>
          
          <div className="relative w-full max-w-lg mt-4">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
                className="pl-10 h-12 text-lg rounded-full shadow-sm" 
                placeholder="Search by title, company, or keywords..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <JobsLoader />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <PublicJobCard key={job.id} job={job} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-muted-foreground">No jobs found matching your search.</div>
                </div>
              )}
            </div>

            {/* Production Domain Ads - Only show when there are jobs */}
            {filteredJobs.length > 0 && (
              <div className="mt-8">
                <ProductionDomainResponsiveAds />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default FindJobsPage;
