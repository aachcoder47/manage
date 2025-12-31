"use client";

import React, { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import JobCard from "@/components/dashboard/jobs/JobCard";
import CreateJobCard from "@/components/dashboard/jobs/CreateJobCard";
import { JobsService } from "@/services/jobs.service";
import { Job } from "@/types/job";
import { Building2, ArrowUpLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ManualAdSense } from "@/components/ads/AdSenseScriptLoader";
import { EffectiveGateAd } from "@/components/ads/EffectiveGateAd";
import { HighPerformanceAd } from "@/components/ads/HighPerformanceAd";
import { EffectiveGateCPMAd } from "@/components/ads/EffectiveGateCPMAd";
import { ProductionAds } from "@/components/ads/ProductionAds";
import { EffectiveGateCPMAdSolo } from "@/components/ads/EffectiveGateCPMAdSolo";

function JobsPage() {
  const { organization, isLoaded } = useOrganization();
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      if (organization?.id) {
        try {
          const data = await JobsService.getAllJobsByOrg(organization.id);
          setJobs(data);
        } catch (error) {
          console.error("Error fetching jobs:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (organization?.id) {
      fetchJobs();
    }
  }, [organization?.id]);

  function JobsLoader() {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 w-full animate-pulse rounded-xl bg-muted/50 border border-muted" />
        ))}
      </>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!mounted || !isLoaded) {
    return (
      <main className="p-8 max-w-7xl mx-auto">
        <JobsLoader />
      </main>
    );
  }

  if (!organization) {
    return (
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
           <div className="p-6 bg-indigo-50 rounded-full text-indigo-600 ring-8 ring-indigo-50/50">
              <Building2 size={48} />
           </div>
           <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Create an Organization</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
                You need to create or select an organization to post jobs.
            </p>
           </div>
           <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
             <ArrowUpLeft size={16} />
             <span>Use the switcher in the sidebar to create one</span>
           </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Manage Jobs
          </h2>
          <p className="text-muted-foreground text-lg">
            Create and track your job postings.
          </p>
        </div>

        {/* Ad space - ads will load in production */}
        <div className="w-full" style={{ minHeight: '90px' }}>
          <ProductionAds />
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <motion.div variants={item}>
            <CreateJobCard />
          </motion.div>

          {loading ? (
            <JobsLoader />
          ) : (
            <>
              {jobs.map((job) => (
                <motion.div key={job.id} variants={item}>
                  <JobCard job={job} />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* Additional EffectiveGate CPM Ads - Grid layout */}
        {jobs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Sponsored Opportunities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <EffectiveGateCPMAdSolo />
              <EffectiveGateCPMAdSolo />
              <EffectiveGateCPMAdSolo />
              <EffectiveGateCPMAdSolo />
              <EffectiveGateCPMAdSolo />
              <EffectiveGateCPMAdSolo />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default JobsPage;
