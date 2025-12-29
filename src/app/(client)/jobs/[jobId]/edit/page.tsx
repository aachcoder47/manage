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

export default function EditJobPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const { organization } = useOrganization();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    employment_type: "Full-time",
    salary_range: "",
    is_remote: false,
    status: "open" as const,
    interview_id: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const job = await JobsService.getJobById(params.jobId);
        // @ts-ignore
        setFormData({
            title: job.title,
            description: job.description,
            requirements: job.requirements || "",
            location: job.location || "",
            employment_type: job.employment_type || "Full-time",
            salary_range: job.salary_range || "",
            is_remote: job.is_remote || false,
            status: job.status as any,
            // @ts-ignore
            interview_id: job.interview_id || "",
        });

        if (user?.id && organization?.id) {
            const { InterviewService } = await import("@/services/interviews.service");
            const [allInterviews, jobInterviews] = await Promise.all([
                InterviewService.getAllInterviews(user.id, organization.id),
                InterviewService.getInterviewsByJobId(params.jobId)
            ]);
            setInterviews(allInterviews);
            if (jobInterviews.length > 0) {
                setFormData(prev => ({ ...prev, interview_id: jobInterviews[0].id }));
            }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load job data");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [params.jobId, user, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    setLoading(true);
    try {
      const { interview_id, ...jobPayload } = formData;
      await JobsService.updateJob(params.jobId, jobPayload);

      if (interview_id) {
          await JobsService.associateInterviewWithJob(interview_id, params.jobId);
      } else {
          await JobsService.unlinkInterviewsFromJob(params.jobId);
      }

      toast.success("Job updated successfully!");
      router.push(`/jobs/${params.jobId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${params.jobId}`} className="flex items-center text-sm text-muted-foreground hover:text-indigo-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Job Details
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-muted-foreground mt-2">
          Update the details for this job posting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            required
            placeholder="e.g. Senior Frontend Engineer"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            placeholder="Describe the role and responsibilities..."
            className="min-h-[150px]"
            value={formData.description}
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
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="remote"
            checked={formData.is_remote}
            onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
          />
          <Label htmlFor="remote">Remote Position</Label>
        </div>

        <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
            </select>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </main>
  );
}
