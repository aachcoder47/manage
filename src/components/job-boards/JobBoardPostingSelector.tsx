"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2, Linkedin, Briefcase, Building2 } from "lucide-react";

interface JobBoardIntegration {
  id: string;
  platform: "linkedin" | "indeed" | "naukri" | "other";
  status: "connected" | "disconnected" | "expired" | "error";
  platform_name: string | null;
  is_active: boolean;
}

interface JobBoardPostingSelectorProps {
  jobId: string;
  onPostingComplete?: (results: any[]) => void;
}

const platformIcons = {
  linkedin: <Linkedin className="w-5 h-5 text-blue-600" />,
  indeed: <Briefcase className="w-5 h-5 text-indigo-600" />,
  naukri: <Building2 className="w-5 h-5 text-yellow-600" />,
  other: <Building2 className="w-5 h-5 text-gray-600" />,
};

const platformNames = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  naukri: "Naukri",
  other: "Other",
};

export default function JobBoardPostingSelector({
  jobId,
  onPostingComplete,
}: JobBoardPostingSelectorProps) {
  const { organization } = useOrganization();
  const [integrations, setIntegrations] = useState<JobBoardIntegration[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, [organization]);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(
        `/api/job-boards/integrations?organization_id=${organization?.id || ""}`
      );
      if (response.ok) {
        const data = await response.json();
        const active = data.integrations?.filter(
          (i: JobBoardIntegration) => i.status === "connected" && i.is_active
        ) || [];
        setIntegrations(active);
        // Auto-select all by default
        setSelectedIntegrations(active.map((i: JobBoardIntegration) => i.id));
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    }
  };

  const handleToggleIntegration = (integrationId: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integrationId)
        ? prev.filter((id) => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const handlePostToBoards = async () => {
    if (selectedIntegrations.length === 0) {
      toast.error("Please select at least one job board");
      return;
    }

    setPosting(true);
    try {
      const response = await fetch("/api/job-boards/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: jobId,
          integration_ids: selectedIntegrations,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const successCount = data.results.filter((r: any) => r.success).length;
        const failCount = data.results.length - successCount;

        if (successCount > 0) {
          toast.success(`Job posted to ${successCount} board(s) successfully!`);
        }
        if (failCount > 0) {
          toast.error(`Failed to post to ${failCount} board(s)`);
        }

        if (onPostingComplete) {
          onPostingComplete(data.results);
        }
      } else {
        toast.error(data.error || "Failed to post job");
      }
    } catch (error) {
      console.error("Posting error:", error);
      toast.error("Failed to post job to boards");
    } finally {
      setPosting(false);
    }
  };

  if (integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post to Job Boards</CardTitle>
          <CardDescription>
            Connect your job board accounts to post jobs automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No job board accounts connected. Connect your accounts in settings to post jobs
            automatically.
          </p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard?tab=integrations")}
          >
            Connect Job Boards
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post to Job Boards</CardTitle>
        <CardDescription>
          Select job boards where you want to post this job
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={integration.id}
                checked={selectedIntegrations.includes(integration.id)}
                onCheckedChange={() => handleToggleIntegration(integration.id)}
              />
              <label
                htmlFor={integration.id}
                className="flex-1 flex items-center gap-3 cursor-pointer"
              >
                {platformIcons[integration.platform]}
                <div className="flex-1">
                  <p className="font-medium">{platformNames[integration.platform]}</p>
                  {integration.platform_name && (
                    <p className="text-sm text-muted-foreground">
                      {integration.platform_name}
                    </p>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>

        <Button
          onClick={handlePostToBoards}
          disabled={posting || selectedIntegrations.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {posting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            `Post to ${selectedIntegrations.length} Board(s)`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

