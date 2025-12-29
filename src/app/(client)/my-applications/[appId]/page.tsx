"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApplicationsService } from "@/services/applications.service";
import { TrialsService, WorkTrial } from "@/services/trials.service";
import { ContractsService, Contract } from "@/services/contracts.service";
import { OnboardingService, OnboardingPackage } from "@/services/onboarding.service";
import { InterviewService } from "@/services/interviews.service";
import { SkillAssessmentService } from "@/services/skill-assessment.service";
import { SkillAssessment, CandidateAssessment } from "@/types/skill-assessment";
import { JobApplication } from "@/types/application";
import { useUser } from "@clerk/nextjs";
import { 
    Loader2, 
    ArrowLeft, 
    Building, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    FileText, 
    Briefcase,
    MessageSquare,
    PlayCircle,
    ClipboardCheck,
    Lock,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ApplicationDetailPage() {
  const { appId } = useParams();
  const { user } = useUser();
  const router = useRouter();
  
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [trial, setTrial] = useState<WorkTrial | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingPackage | null>(null);
  const [interviewUrl, setInterviewUrl] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [candidateAssessments, setCandidateAssessments] = useState<CandidateAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!appId || !user) return;
      
      try {
        const appData = await ApplicationsService.getApplicationById(appId as string);
        setApplication(appData);

        // Fetch associated entities in parallel
        const [trialData, contractData, interviewData] = await Promise.all([
            TrialsService.getTrialByApplicationId(appId as string),
            ContractsService.getContractByApplicationId(appId as string),
            InterviewService.getInterviewsByJobId(appData.job_id)
        ]);

        setTrial(trialData);
        setContract(contractData);
        
        if (interviewData.length > 0) {
            const intv = interviewData[0];
            setInterviewUrl(`${window.location.origin}/call/${intv.readable_slug || intv.id}`);
        }

        if (contractData) {
            const obData = await OnboardingService.getPackageByContract(contractData.id);
            setOnboarding(obData);
        }

        // Fetch Assessments
        const [jobAssessments, userAssessments] = await Promise.all([
            SkillAssessmentService.getAssessmentsByJob(appData.job_id),
            SkillAssessmentService.getCandidateAssessmentsByApplication(appId as string)
        ]);

        setAssessments(jobAssessments);
        setCandidateAssessments(userAssessments);

      } catch (error) {
        console.error("Error fetching application details:", error);
        toast.error("Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appId, user]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!application) return <div className="p-10 text-center">Application not found</div>;

  const steps = [
      { id: 'applied', label: 'Applied', icon: ClipboardCheck },
      { id: 'screening', label: 'AI Screening', icon: PlayCircle },
      { id: 'interviewing', label: 'Interview', icon: MessageSquare },
      { id: 'trial', label: 'Work Trial', icon: Briefcase },
      { id: 'offer', label: 'Offer & Onboarding', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === application.status) === -1 
    ? (application.status === 'rejected' ? -1 : 0) 
    : steps.findIndex(s => s.id === application.status);

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10">
      <Link href="/my-applications" className="flex items-center text-sm text-muted-foreground hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to My Applications
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div className="flex items-start gap-5">
              <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
                  <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                  {/* @ts-ignore */}
                  <h1 className="text-3xl font-bold tracking-tight">{application.job?.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                      {/* @ts-ignore */}
                      <span className="font-medium text-indigo-600">{application.job?.organization?.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3" />
                          Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                      </span>
                  </div>
              </div>
          </div>
          <Badge className={`text-sm px-4 py-1.5 rounded-full ${
              application.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
          }`}>
              {application.status.toUpperCase()}
          </Badge>
      </div>

      {/* Progress Stepper */}
      <div className="mb-12 relative">
          <div className="hidden md:flex justify-between">
              {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                      <div key={step.id} className="flex flex-col items-center gap-3 z-10 relative px-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                              isCompleted ? 'bg-indigo-600 border-indigo-100 text-white' :
                              isCurrent ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-100' :
                              'bg-white border-gray-100 text-gray-300'
                          }`}>
                              <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs font-semibold ${isCurrent ? 'text-indigo-600' : 'text-muted-foreground'}`}>
                              {step.label}
                          </span>
                      </div>
                  )
              })}
          </div>
          {/* Progress Line */}
          <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-gray-100 -z-0 hidden md:block">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 ease-out" 
                style={{ width: `${Math.max(0, currentStepIndex) * 25}%` }} 
              />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              {/* Screening Section */}
              {application.status === 'screening' && (
                  <Card className="border-indigo-100 bg-indigo-50/30 overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                          <PlayCircle className="w-24 h-24" />
                      </div>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <PlayCircle className="w-5 h-5 text-indigo-600" />
                              AI Screening in Progress
                          </CardTitle>
                          <CardDescription>
                              Our AI is currently reviewing your resume against the job requirements.
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground">
                              You will be notified once the screening is complete and the hiring team reviews the results.
                          </p>
                      </CardContent>
                  </Card>
              )}

              {/* Assessment Section */}
              {assessments.length > 0 && (application.status === 'screening' || application.status === 'interviewing' || application.status === 'trial') && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                            Skill Assessments
                        </CardTitle>
                        <CardDescription>Complete these assessments to demonstrate your technical skills.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {assessments.map(assessment => {
                            const result = candidateAssessments.find(ca => ca.skill_assessment_id === assessment.id);
                            const interviewId = assessment.interview_id;
                            const takeUrl = `/interviews/${interviewId}/assessments/${assessment.id}/take?appId=${appId}`;

                            return (
                                <div key={assessment.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-lg ${result ? (result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-white border'}`}>
                                            {result ? (result.passed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />) : <PlayCircle className="w-5 h-5 text-indigo-600" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{assessment.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[10px]">{assessment.assessment_type}</Badge>
                                                <span className="text-[10px] text-muted-foreground">{assessment.time_limit} mins</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {result ? (
                                            <div className="text-right">
                                                <p className="text-sm font-bold">{result.score}%</p>
                                                <p className={`text-[10px] ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                    {result.passed ? 'Passed' : 'Not Passed'}
                                                </p>
                                            </div>
                                        ) : (
                                            <Link href={takeUrl}>
                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Start</Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
              )}

              {/* Interviewing Section */}
              {application.status === 'interviewing' && interviewUrl && (
                  <Card className="border-purple-100 bg-purple-50/30">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-purple-600" />
                              AI Interview Ready
                          </CardTitle>
                          <CardDescription>
                              The employer has invited you to an AI-powered video interview.
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                              <a href={interviewUrl} target="_blank">Start AI Interview</a>
                          </Button>
                          <p className="text-[10px] text-center text-muted-foreground mt-3">
                              Make sure you are in a quiet place with a good internet connection.
                          </p>
                      </CardContent>
                  </Card>
              )}

              {/* Work Trial Section */}
              {trial && (
                  <Card className={`border-emerald-100 ${application.status === 'trial' ? 'bg-emerald-50/30' : ''}`}>
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <div>
                                  <CardTitle className="flex items-center gap-2">
                                      <Briefcase className="w-5 h-5 text-emerald-600" />
                                      Work Trial: {trial.title}
                                  </CardTitle>
                                  <CardDescription>
                                      A practical task to demonstrate your capabilities.
                                  </CardDescription>
                              </div>
                              <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700">
                                  {trial.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <div className="mb-4 text-sm whitespace-pre-wrap">{trial.description}</div>
                          <Link href={`/trials/${trial.id}`}>
                              <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                  Go to Task Page
                              </Button>
                          </Link>
                      </CardContent>
                  </Card>
              )}

              {/* Contract Section */}
              {contract && (
                  <Card className={`border-indigo-100 shadow-xl shadow-indigo-50/50 ${contract.status === 'sent' ? 'ring-2 ring-indigo-600' : ''}`}>
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <div>
                                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                                      <FileText className="w-5 h-5 text-indigo-600" />
                                      Job Offer & Contract
                                  </CardTitle>
                                  <CardDescription>
                                      Congratulation! You have received a formal offer.
                                  </CardDescription>
                              </div>
                              <Badge className={
                                  contract.status === 'signed' || contract.status === 'active' 
                                  ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                              }>
                                  {contract.status.toUpperCase()}
                              </Badge>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={`/contracts/${contract.id}`} className="flex-1">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    {contract.status === 'signed' || contract.status === 'active' ? 'View Signed Contract' : 'Review & Sign Contract'}
                                </Button>
                            </Link>
                            {contract.status === 'active' && onboarding && (
                                <Link href={`/contracts/${contract.id}/onboarding`} className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        Access Onboarding
                                    </Button>
                                </Link>
                            )}
                          </div>
                      </CardContent>
                  </Card>
              )}

              {/* Default View */}
              {application.status === 'applied' && !trial && !contract && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Application Documents</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white rounded border">
                                      <FileText className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium">Resume.pdf</p>
                                      <p className="text-[10px] text-muted-foreground">Uploaded with application</p>
                                  </div>
                              </div>
                              {application.resume_url && (
                                  <Button variant="ghost" size="sm" asChild>
                                      <a href={application.resume_url} target="_blank">View</a>
                                  </Button>
                              )}
                          </div>
                      </CardContent>
                  </Card>
              )}
          </div>

          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-6">
                          <div className="flex gap-4">
                              <div className="relative">
                                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
                                  <div className="absolute top-4 left-[3px] bottom-0 w-0.5 bg-gray-100" />
                              </div>
                              <div>
                                  <p className="text-sm font-bold">Application Submitted</p>
                                  <p className="text-xs text-muted-foreground">{new Date(application.created_at).toLocaleDateString()}</p>
                              </div>
                          </div>
                          {application.status !== 'applied' && (
                            <div className="flex gap-4">
                                <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Moved to {application.status}</p>
                                    <p className="text-xs text-muted-foreground">Progress update</p>
                                </div>
                            </div>
                          )}
                      </div>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Job Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">Location</span>
                          {/* @ts-ignore */}
                          <span className="text-sm">{application.job?.location}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">Type</span>
                          {/* @ts-ignore */}
                          <span className="text-sm">{application.job?.employment_type}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">Salary</span>
                          {/* @ts-ignore */}
                          <span className="text-sm font-mono text-indigo-600">{application.job?.salary_range || 'Not specified'}</span>
                      </div>
                      <Button variant="outline" size="sm" asChild className="w-full mt-4">
                          <Link href={`/find-jobs/${application.job_id}`}>
                              View Full Listing <ExternalLink className="w-3 h-3 ml-2" />
                          </Link>
                      </Button>
                  </CardContent>
              </Card>
          </div>
      </div>
    </main>
  );
}
