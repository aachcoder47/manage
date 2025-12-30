"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ApplicationsService } from "@/services/applications.service";
import { Job } from "@/types/job";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Building,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StorageService } from "@/services/storage.service";
import { useSearchParams } from "next/navigation";

type Props = {
  job: Job & { organization: { name: string; image_url: string } };
};

function normalizeSourcePlatform(raw: string | null):
  | "linkedin"
  | "indeed"
  | "google"
  | "google_jobs"
  | "wellfound"
  | "referral"
  | "other"
  | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();

  if (v === "linkedin") return "linkedin";
  if (v === "indeed") return "indeed";
  if (v === "google") return "google";
  if (v === "google_jobs" || v === "google-jobs" || v === "googlejobs") {
    return "google_jobs";
  }
  if (v === "wellfound" || v === "angellist") return "wellfound";
  if (v === "referral") return "referral";

  return "other";
}

export default function PublicJobDetailsClient({ job }: Props) {
  const { user } = useUser();
  const searchParams = useSearchParams();

  const [applying, setApplying] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  const sourcePlatform = useMemo(() => {
    const raw =
      searchParams.get("source") ||
      searchParams.get("utm_source") ||
      searchParams.get("src");
    return normalizeSourcePlatform(raw);
  }, [searchParams]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply");
      return;
    }
    if (!resumeFile) {
      toast.error("Please upload a resume");
      return;
    }

    setApplying(true);
    try {
      const uploadedUrl = await StorageService.uploadResume(resumeFile);

      await ApplicationsService.createApplication({
        job_id: job.id,
        candidate_id: user.id,
        resume_url: uploadedUrl,
        cover_letter: coverLetter,
        email: email,
        phone: phone,
        status: "applied",
        source_platform: sourcePlatform || undefined,
      });

      toast.success("Application submitted successfully!");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10">
      <Link
        href="/find-jobs"
        className="flex items-center text-sm text-muted-foreground hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Jobs
      </Link>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              {job.organization?.image_url ? (
                <img
                  src={job.organization.image_url}
                  alt={job.organization.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
              ) : (
                <div className="p-4 bg-indigo-100 rounded-lg">
                  <Building className="w-8 h-8 text-indigo-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-lg text-muted-foreground font-medium">
                  {job.organization?.name}
                </p>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Apply Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply to {job.title}</DialogTitle>
                  <DialogDescription>
                    Submit your application to {job.organization?.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume (PDF)</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    />
                    {resumeFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {resumeFile.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover">Cover Letter</Label>
                    <Textarea
                      id="cover"
                      placeholder="Why are you a good fit?"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={applying}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleApply} disabled={applying || !resumeFile}>
                    {applying ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Submit Application
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border">
              <MapPin className="w-4 h-4" />
              {job.location} {job.is_remote ? "(Remote)" : ""}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border">
              <Briefcase className="w-4 h-4" />
              {job.employment_type}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border">
              <DollarSign className="w-4 h-4" />
              {job.salary_range}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border">
              <Calendar className="w-4 h-4" />
              Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h3 className="text-lg font-semibold mb-3">About the Role</h3>
            <div className="prose max-w-none text-gray-600 whitespace-pre-line">
              {job.description}
            </div>
          </section>

          {job.requirements && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Requirements</h3>
              <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                {job.requirements}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
