"use client";

import React, { useEffect, useState } from "react";
import { TrialsService, WorkTrial } from "@/services/trials.service";
import { Loader2, IndianRupee, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // To get current user
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChatBox from "@/components/chat/ChatBox";
import RazorpayPaymentButton from "@/components/payments/RazorpayPaymentButton";

export default function TrialDetailsPage({ params }: { params: { trialId: string } }) {
  const { user } = useUser();
  const [trial, setTrial] = useState<WorkTrial | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTrial = async () => {
      try {
        // We can use a direct query or service. For now, let's fetch by ID via a hypothetical service method or just query.
        // Assuming TrialsService needs a getById method. I'll add a helper here or fetch all and find (not efficient but works for now if Service doesn't have it).
        // Actually best to query directly here if Service is missing it.
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
            .from("work_trial")
            .select(`*, candidate:user!candidate_id(email), employer:user!employer_id(email)`)
            .eq("id", params.trialId)
            .single();
        
        if (error) {throw error;}
        setTrial(data as WorkTrial);
        if (data.submission_url) {setSubmissionUrl(data.submission_url);}
      } catch (error) {
        console.error("Error fetching trial:", error);
        toast.error("Trial not found");
      } finally {
        setLoading(false);
      }
    };

    fetchTrial();
  }, [params.trialId]);

  const handleSubmitWork = async () => {
    if (!submissionUrl) {return toast.error("Please enter a URL");}
    setUpdating(true);
    try {
        await TrialsService.updateTrial(params.trialId, {
            submission_url: submissionUrl,
            status: 'submitted'
        });
        setTrial(prev => prev ? ({ ...prev, submission_url: submissionUrl, status: 'submitted' }) : null);
        toast.success("Work submitted successfully!");
    } catch (error) {
        toast.error("Failed to submit");
    } finally {
        setUpdating(false);
    }
  };

  const handleReview = async (status: 'completed' | 'failed') => {
      setUpdating(true);
      try {
          await TrialsService.updateTrial(params.trialId, { status });
          setTrial(prev => prev ? ({ ...prev, status }) : null);
          toast.success(`Trial marked as ${status}`);
          // TODO: Trigger payment release if completed
      } catch (error) {
          toast.error("Failed to update status");
      } finally {
          setUpdating(false);
      }
  };

  if (loading) {return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;}
  if (!trial) {return <div className="p-10 text-center">Trial not found</div>;}

  const isCandidate = user?.id === trial.candidate_id;
  const isEmployer = user?.id === trial.employer_id;

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10">
      <script src="https://checkout.razorpay.com/v1/checkout.js" /> 
      <div className="flex justify-between items-start mb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{trial.title}</h1>
            <div className="flex items-center gap-3">
                <Badge variant={
                    trial.status === 'completed' ? 'default' : 
                    trial.status === 'in_progress' ? 'secondary' : 
                    'outline'
                }>
                    {trial.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {/* @ts-ignore */}
                <span className="text-muted-foreground text-sm">With {isCandidate ? trial.employer?.email : trial.candidate?.email}</span>
            </div>
        </div>
        <div className="text-right">
             <div className="text-2xl font-bold text-green-600 flex items-center justify-end gap-1">
                <IndianRupee className="w-6 h-6" />
                {trial.payment_amount}
             </div>
             <p className="text-xs text-muted-foreground uppercase tracking-wide">Bounty</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
              <Card>
                  <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                  <CardContent className="whitespace-pre-line text-muted-foreground">
                      {trial.description}
                  </CardContent>
              </Card>

              {/* Submission Area */}
              <Card>
                  <CardHeader><CardTitle>Submission</CardTitle></CardHeader>
                  <CardContent>
                      {isCandidate && (trial.status === 'in_progress' || trial.status === 'submitted') ? (
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <Label>Project URL / Link</Label>
                                  <Input 
                                    placeholder="https://github.com/..." 
                                    value={submissionUrl}
                                    onChange={(e) => setSubmissionUrl(e.target.value)}
                                  />
                              </div>
                              <Button disabled={updating || trial.status === 'submitted'} className="w-full bg-indigo-600" onClick={handleSubmitWork}>
                                  {updating ? "Submitting..." : (trial.status === 'submitted' ? "Submitted" : "Submit Work")}
                              </Button>
                          </div>
                      ) : (
                          <div className="bg-muted p-4 rounded-md">
                              {trial.status === 'pending' ? (
                                  <div className="text-center py-6">
                                      <p className="text-muted-foreground mb-4">Trial is pending activation.</p>
                                      {isEmployer && (
                                          <RazorpayPaymentButton
                                              trialId={trial.id}
                                              amount={trial.payment_amount || 0}
                                              className="bg-green-600 hover:bg-green-700"
                                              onSuccess={() => {
                                                  toast.success("Payment successful! Trial activated.");
                                                  setTrial(prev => prev ? ({ ...prev, status: 'in_progress' }) : null);
                                              }}
                                              onError={(error) => {
                                                  toast.error(error);
                                              }}
                                          >
                                              Fund & Activate Trial (₹{trial.payment_amount})
                                          </RazorpayPaymentButton>
                                      )}
                                      {isCandidate && <p className="text-sm text-yellow-600">Waiting for employer to fund escrow.</p>}
                                  </div>
                              ) : (
                                  <>
                                  <Label className="text-xs uppercase text-muted-foreground">Submitted Link</Label>
                                  {trial.submission_url ? (
                                      <a href={trial.submission_url} target="_blank" className="block text-indigo-600 hover:underline mt-1 truncate">
                                          {trial.submission_url}
                                      </a>
                                  ) : (
                                      <p className="text-sm text-muted-foreground mt-1">No submission yet.</p>
                                  )}
                                  </>
                              )}
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>

          <div className="space-y-6">
              <Card>
                  <CardHeader><CardTitle className="text-sm uppercase text-muted-foreground">Timeline</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <div>
                              <p className="font-medium">Created</p>
                              <p className="text-muted-foreground">{new Date(trial.created_at).toLocaleDateString()}</p>
                          </div>
                      </div>
                      {trial.due_date && (
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-red-600" />
                            <div>
                                <p className="font-medium">Due Date</p>
                                <p className="text-muted-foreground">{new Date(trial.due_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                      )}
                  </CardContent>
              </Card>

              {/* Employer Actions */}
              {isEmployer && (trial.status === 'submitted' || trial.status === 'reviewing') && (
                  <Card className="border-indigo-200 bg-indigo-50/50">
                      <CardHeader><CardTitle className="text-sm uppercase text-indigo-900">Actions</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                          <Button className="w-full bg-green-600 hover:bg-green-700" disabled={updating} onClick={() => handleReview('completed')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept & Pay
                          </Button>
                          <Button variant="destructive" className="w-full" disabled={updating} onClick={() => handleReview('failed')}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                          </Button>
                      </CardContent>
                  </Card>
              )}

              <ChatBox 
                  trialId={trial.id} 
                  otherUserId={isCandidate ? (trial.employer_id || "") : (trial.candidate_id || "")}
                  // @ts-ignore
                  otherUserName={isCandidate ? "Employer" : (trial.candidate?.email || "Candidate")}
              />
          </div>
      </div>
    </main>
  );
}
