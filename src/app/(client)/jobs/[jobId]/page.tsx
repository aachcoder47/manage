"use client";

import React, { useEffect, useState } from "react";
import { JobsService } from "@/services/jobs.service";
import { ApplicationsService } from "@/services/applications.service";
import { InterviewService } from "@/services/interviews.service";
import { SkillAssessmentService } from "@/services/skill-assessment.service";
import { Job } from "@/types/job";
import { JobApplication } from "@/types/application";
import { Loader2, ArrowLeft, MoreHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function EmployerJobDetailsPage({ params }: { params: { jobId: string } }) {
  const [job, setJob] = useState<(Job & { organization?: { name: string; image_url: string } }) | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, appsData, interviewData] = await Promise.all([
            JobsService.getJobById(params.jobId),
            ApplicationsService.getApplicationsByJob(params.jobId),
            InterviewService.getInterviewsByJobId(params.jobId)
        ]);
        setJob(jobData);
        setApplications(appsData);
        setInterviews(interviewData);

        if (appsData.length > 0) {
            const results = await SkillAssessmentService.getResultsForJobApplications(appsData.map(a => a.id));
            setAssessmentResults(results);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.jobId]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) {return;}
        const data = await res.json();
        setIsAdmin(Boolean(data?.isAdmin));
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleStatusChange = async (appId: string, status: string) => {
      try {
          await ApplicationsService.updateApplicationStatus(appId, status);
          
          const app = applications.find(a => a.id === appId);

          // Auto-screen if moving to screening and not already scored
          if (status === 'screening' && (!app?.screening_score)) {
              toast.info("Triggering AI screening...");
              fetch(`/api/applications/${appId}/screen`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setApplications(apps => apps.map(a => 
                            a.id === appId ? { ...a, screening_score: data.score, screening_notes: data.notes } : a
                        ));
                        toast.success("AI Screening complete!");
                    }
                })
                .catch(err => console.error("Auto-screen failed:", err));
          }

          // Handle Move to Interview
          if (status === 'interviewing') {
              if (interviews.length > 0) {
                  const interview = interviews[0]; // Take primary
                  const url = `${window.location.origin}/call/${interview.readable_slug || interview.id}`;
                  toast.success("Candidate moved to Interview!", {
                      description: "Copy this AI Interview link to send to candidate:",
                      action: {
                          label: "Copy Link",
                          onClick: () => {
                              navigator.clipboard.writeText(url);
                              toast.success("Link copied!");
                          }
                      },
                      duration: 10000
                  });
              } else {
                  toast.info("Moved to Interview, but no AI Interview is linked to this job yet.");
              }
          }

          setApplications(apps => apps.map(app => 
              app.id === appId ? { ...app, status: status as any } : app
          ));
          if (status !== 'interviewing') {toast.success("Status updated to " + status);}
      } catch (error) {
          toast.error("Failed to update status");
      }
  };

  const handleBulkScreen = async () => {
    if (selectedIds.length === 0) {return;}
    setIsBulkLoading(true);
    toast.info(`Screening ${selectedIds.length} candidates...`);
    
    try {
        const results = await Promise.all(
            selectedIds.map(id => fetch(`/api/applications/${id}/screen`, { method: 'POST' }).then(res => res.json()))
        );
        
        setApplications(apps => apps.map(a => {
            const result = results.find(r => r.success && results.indexOf(r) === selectedIds.indexOf(a.id));
            if (result && result.success) {
                return { ...a, screening_score: result.score, screening_notes: result.notes };
            }
            return a;
        }));
        
        toast.success(`Screened ${selectedIds.length} candidates!`);
        setSelectedIds([]);
    } catch (error) {
        toast.error("Some screenings failed");
    } finally {
        setIsBulkLoading(false);
    }
  };

  const handleBulkInterview = async () => {
    if (selectedIds.length === 0) {return;}
    setIsBulkLoading(true);
    
    try {
        await Promise.all(selectedIds.map(id => ApplicationsService.updateApplicationStatus(id, 'interviewing')));
        
        setApplications(apps => apps.map(a => 
            selectedIds.includes(a.id) ? { ...a, status: 'interviewing' } : a
        ));

        if (interviews.length > 0) {
            const interview = interviews[0];
            const url = `${window.location.origin}/call/${interview.readable_slug || interview.id}`;
            toast.success(`Moved ${selectedIds.length} to Interview!`, {
                description: "Link for all candidates copied to clipboard.",
                duration: 5000
            });
            navigator.clipboard.writeText(url);
        } else {
            toast.success(`Moved ${selectedIds.length} to Interview!`);
        }
        setSelectedIds([]);
    } catch (error) {
        toast.error("Failed to move some candidates");
    } finally {
        setIsBulkLoading(false);
    }
  };

  if (loading) {return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;}
  if (!job) {return <div className="p-10 text-center">Job not found</div>;}

  const toggleAll = () => {
    if (selectedIds.length === applications.length) {
        setSelectedIds([]);
    } else {
        setSelectedIds(applications.map(a => a.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getPublicApplyUrl = () => {
    if (typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/find-jobs/${params.jobId}`;
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10 pb-32">
      <Link href="/jobs" className="flex items-center text-sm text-muted-foreground hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Manage Jobs
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>{job.status}</Badge>
                  <span>•</span>
                  <span>{applications.length} Applicants</span>
              </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="destructive"
                onClick={async () => {
                  const ok = window.confirm("Delete this job? This will also delete related applications/trials.");
                  if (!ok) {return;}
                  const res = await fetch(`/api/admin/jobs/${params.jobId}`, { method: "DELETE" });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    toast.error(data.error || "Failed to delete job");
                    return;
                  }
                  toast.success("Job deleted");
                  window.location.href = "/jobs";
                }}
              >
                Admin Delete
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                const url = getPublicApplyUrl();
                navigator.clipboard.writeText(url);
                toast.success("Public apply link copied!", {
                  description: "Paste this into LinkedIn/Indeed as 'Apply on company website'.",
                  duration: 4000,
                });
              }}
            >
              Copy Apply Link
            </Button>
            <Link href={`/jobs/${params.jobId}/edit`}>
              <Button variant="outline">Edit Job</Button>
            </Link>
          </div>
      </div>

      {selectedIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4">
              <span className="text-sm font-medium text-indigo-600">{selectedIds.length} Selected</span>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                  <Button size="sm" disabled={isBulkLoading} className="bg-indigo-600 hover:bg-indigo-700" onClick={handleBulkScreen}>
                      {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Bulk Run AI Screen
                  </Button>
                  <Button size="sm" variant="outline" disabled={isBulkLoading} onClick={handleBulkInterview}>
                      Move to Interview
                  </Button>
                  <Button size="sm" variant="ghost" disabled={isBulkLoading} className="text-muted-foreground" onClick={() => setSelectedIds([])}>
                      Cancel
                  </Button>
              </div>
          </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Candidates</h2>
              {selectedIds.length > 0 && <span className="text-sm text-muted-foreground">{selectedIds.length} candidates selected</span>}
          </div>
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedIds.length === applications.length && applications.length > 0} 
                            onCheckedChange={toggleAll}
                          />
                      </TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>AI Score</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {applications.length > 0 ? (
                      applications.map((app) => (
                          <TableRow key={app.id} className={selectedIds.includes(app.id) ? 'bg-indigo-50/30' : ''}>
                              <TableCell>
                                  <Checkbox 
                                    checked={selectedIds.includes(app.id)} 
                                    onCheckedChange={() => toggleOne(app.id)}
                                  />
                              </TableCell>
                              <TableCell>
                                  <div className="flex flex-col">
                                      <span className="font-bold">{app.email || app.candidate?.email || "Candidate"}</span>
                                      {app.phone && <span className="text-[10px] text-muted-foreground">{app.phone}</span>}
                                  </div>
                              </TableCell>
                              <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                  {app.resume_url ? (
                                      <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:underline">
                                          <FileText className="w-4 h-4 mr-1" /> View
                                      </a>
                                  ) : (
                                      <span className="text-muted-foreground">No Resume</span>
                                  )}
                              </TableCell>
                              <TableCell>
                                  {app.screening_score !== null && app.screening_score !== undefined ? (
                                      <div className="flex items-center gap-2">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                              app.screening_score >= 80 ? 'bg-green-500' :
                                              app.screening_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}>
                                              {app.screening_score}
                                          </div>
                                          {app.screening_notes && (
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 px-1 text-[10px]"
                                                onClick={() => toast.info("AI Analysis", { description: app.screening_notes })}
                                              >
                                                Notes
                                              </Button>
                                          )}
                                      </div>
                                  ) : (
                                      <span className="text-muted-foreground text-xs italic">Not Screened</span>
                                  )}
                              </TableCell>
                              <TableCell>
                                  {(() => {
                                      const results = assessmentResults.filter(r => r.job_application_id === app.id);
                                      if (results.length === 0) {return <span className="text-muted-foreground text-xs italic">N/A</span>;}
                                      const bestScore = Math.max(...results.map(r => r.score));
                                      return (
                                          <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                              bestScore >= 70 ? 'bg-green-100 text-green-700' : 
                                              bestScore >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                          }`}>
                                              {bestScore}%
                                          </div>
                                      );
                                  })()}
                              </TableCell>
                              <TableCell>
                                  <Badge variant="outline" className={
                                      app.status === 'applied' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      app.status === 'screening' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                      app.status === 'interviewing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                      app.status === 'offer' ? 'bg-green-50 text-green-700 border-green-200' :
                                      'bg-gray-50 text-gray-700 border-gray-200'
                                  }>
                                      {app.status}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem onClick={async () => {
                                              toast.promise(
                                                fetch(`/api/applications/${app.id}/screen`, { method: 'POST' })
                                                  .then(res => {
                                                      if (!res.ok) {throw new Error("Failed");}
                                                      return res.json();
                                                  })
                                                  .then(data => {
                                                      // Update local state
                                                      setApplications(apps => apps.map(a => 
                                                          a.id === app.id ? { ...a, screening_score: data.score, screening_notes: data.notes } : a
                                                      ));
                                                  }),
                                                {
                                                  loading: 'AI is analyzing resume...',
                                                  success: 'AI Screening complete!',
                                                  error: 'AI Screening failed'
                                                }
                                              );
                                          }}>
                                              Run AI Screen
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'screening')}>Move to Screening</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'interviewing')}>Move to Interview</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'offer')}>Make Offer</DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem asChild>
                                            <Link href={`/trials/new?candidateId=${app.candidate_id}&candidateEmail=${
                                                app.candidate?.email || ""
                                            }&applicationId=${app.id}`}>
                                                Assign Work Trial
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem asChild>
                                            <Link href={`/contracts/new?candidateId=${app.candidate_id}&candidateEmail=${
                                                app.candidate?.email || ""
                                            }&applicationId=${app.id}`}>
                                                Draft Contract
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(app.id, 'rejected')}>Reject</DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                              No applications yet.
                          </TableCell>
                      </TableRow>
                  )}
              </TableBody>
          </Table>
      </div>
    </main>
  );
}
