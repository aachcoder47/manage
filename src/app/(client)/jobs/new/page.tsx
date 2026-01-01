"use client";

import React, { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { JobsService } from "@/services/jobs.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import JobBoardPostingSelector from "@/components/job-boards/JobBoardPostingSelector";

export default function NewJobPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [autoPostToBoards, setAutoPostToBoards] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    employment_type: "Full-time",
    salary_range: "",
    is_remote: false,
    status: "open" as const, // Direct open
    interview_id: "", // Linked interview
  });

  useEffect(() => {
    const fetchInterviews = async () => {
      if (user?.id && organization?.id) {
          try {
              const { InterviewService } = await import("@/services/interviews.service");
              const data = await InterviewService.getAllInterviews(user.id, organization.id);
              setInterviews(data);
          } catch (error) {
              console.error("Error fetching interviews:", error);
          }
      }
    };
    fetchInterviews();
  }, [user, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) {return;}

    setLoading(true);
    try {
      const { interview_id, ...jobPayload } = formData;
      const job = await JobsService.createJob({
        ...jobPayload,
        organization_id: organization.id,
        views: 0
      });

      if (interview_id) {
          await JobsService.associateInterviewWithJob(interview_id, job.id);
      }

      toast.success("Job created successfully!");
      setCreatedJobId(job.id);

      // Auto-post to job boards if enabled
      if (autoPostToBoards) {
        await autoPostJobToBoards(job.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const autoPostJobToBoards = async (jobId: string) => {
    setPosting(true);
    try {
      // Fetch connected integrations
      const response = await fetch(
        `/api/job-boards/integrations?organization_id=${organization?.id || ""}`
      );
      
      if (!response.ok) {
        console.error("Failed to fetch integrations");
        return;
      }

      const data = await response.json();
      const activeIntegrations = data.integrations?.filter(
        (i: any) => i.status === "connected" && i.is_active
      ) || [];

      if (activeIntegrations.length === 0) {
        // No integrations connected, skip auto-posting
        return;
      }

      // Post to all connected boards
      const integrationIds = activeIntegrations.map((i: any) => i.id);
      const postResponse = await fetch("/api/job-boards/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: jobId,
          integration_ids: integrationIds,
        }),
      });

      const postData = await postResponse.json();

      if (postResponse.ok) {
        const successCount = postData.results.filter((r: any) => r.success).length;
        const failCount = postData.results.length - successCount;

        if (successCount > 0) {
          toast.success(`Job automatically posted to ${successCount} job board(s)!`);
        }
        if (failCount > 0) {
          toast.warning(`Failed to post to ${failCount} board(s)`);
        }
      } else {
        console.error("Auto-posting error:", postData.error);
      }
    } catch (error) {
      console.error("Auto-posting error:", error);
      // Don't show error to user - auto-posting is optional
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/jobs" className="flex items-center text-sm text-muted-foreground hover:text-indigo-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Jobs
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details to publish a new job opening.
        </p>
      </div>

      <form className="space-y-6 bg-white p-6 rounded-xl border shadow-sm" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            placeholder="e.g. Senior Frontend Engineer"
            value={formData.title}
            required
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the role and responsibilities..."
            className="min-h-[150px]"
            value={formData.description}
            required
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
             id="requirements"
            placeholder="List the key requirements..."
            className="min-h-[100px]"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Employment Type</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              placeholder="e.g. $100k - $140k"
              value={formData.salary_range}
              onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. San Francisco, CA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="interview">Link AI Interview (Optional)</Label>
            <select
                id="interview"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.interview_id}
                onChange={(e) => setFormData({ ...formData, interview_id: e.target.value })}
            >
                <option value="">No AI Interview</option>
                {interviews.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                ))}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1">
                Candidates moved to the Interview stage will be sent a link to this specific AI interview.
            </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="remote"
            checked={formData.is_remote}
            onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
          />
          <Label htmlFor="remote">Remote Position</Label>
        </div>

        <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Switch
            id="autoPost"
            checked={autoPostToBoards}
            onCheckedChange={setAutoPostToBoards}
          />
          <Label htmlFor="autoPost" className="cursor-pointer">
            <span className="font-medium">Automatically post to job boards</span>
            <p className="text-sm text-muted-foreground font-normal">
              Post this job to all connected boards (LinkedIn, Naukri, Indeed). Applications will redirect to your website.
            </p>
          </Label>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || posting} className="bg-indigo-600 hover:bg-indigo-700">
            {loading || posting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {loading ? "Creating..." : "Posting to boards..."}
              </>
            ) : (
              "Create & Post Job"
            )}
          </Button>
        </div>
      </form>

      {createdJobId && (
        <div className="mt-6">
          <JobBoardPostingSelector
            jobId={createdJobId}
            onPostingComplete={(results) => {
              // Redirect after posting is complete
              setTimeout(() => {
                router.push("/jobs");
              }, 2000);
            }}
          />
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.push("/jobs")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Skip & Go to Jobs
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
