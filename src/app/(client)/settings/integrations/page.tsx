"use client";

import React from "react";
import { useOrganization } from "@clerk/nextjs";
import JobBoardIntegrationCard from "@/components/job-boards/JobBoardIntegrationCard";
import XMLFeedCard from "@/components/job-boards/XMLFeedCard";
import { Linkedin } from "lucide-react";

export default function IntegrationsPage() {
  const { organization } = useOrganization();

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Board Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your job board accounts to automatically post jobs to multiple platforms.
        </p>
      </div>

      <div className="space-y-4">
        <JobBoardIntegrationCard
          platform="linkedin"
          title="LinkedIn"
          description="Post jobs to LinkedIn using OAuth"
          icon={<Linkedin className="w-6 h-6 text-blue-600" />}
        />

        <XMLFeedCard />
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">How it works:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Connect your LinkedIn account using OAuth</li>
          <li>Use the XML Feed to have job boards like Indeed and Naukri automatically index your jobs</li>
          <li>When you create a job, you can choose to post it to connected boards</li>
          <li>All applications will redirect to your platform</li>
          <li>Track posting status and analytics in your dashboard</li>
        </ul>
      </div>
    </main>
  );
}

