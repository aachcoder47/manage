"use client";

import React, { useEffect, useState } from "react";
import { TrialsService, WorkTrial } from "@/services/trials.service";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Loader2, Plus, Calendar, DollarSign, User, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TrialsPage() {
  const { user } = useUser();
  const [employerTrials, setEmployerTrials] = useState<WorkTrial[]>([]);
  const [candidateTrials, setCandidateTrials] = useState<WorkTrial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrials = async () => {
      if (user) {
        try {
          const [asEmployer, asCandidate] = await Promise.all([
            TrialsService.getTrialsByEmployer(user.id),
            TrialsService.getTrialsByCandidate(user.id)
          ]);
          setEmployerTrials(asEmployer);
          setCandidateTrials(asCandidate);
        } catch (error) {
          console.error("Error fetching trials:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchTrials();
    }
  }, [user]);

  if (loading) {return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;}

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Trials</h1>
            <p className="text-muted-foreground">Manage ongoing and completed work trials.</p>
        </div>
        <Link href="/trials/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Trial
            </Button>
        </Link>
      </div>

      <div className="space-y-10">
        {/* As Candidate Section */}
        {candidateTrials.length > 0 && (
            <section>
                <h2 className="text-xl font-semibold mb-4">Assigned to You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidateTrials.map(trial => (
                        <TrialCard key={trial.id} trial={trial} role="candidate" />
                    ))}
                </div>
            </section>
        )}

        {/* As Employer Section */}
        <section>
            <h2 className="text-xl font-semibold mb-4">Created by You</h2>
             {employerTrials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employerTrials.map(trial => (
                        <TrialCard key={trial.id} trial={trial} role="employer" />
                    ))}
                </div>
             ) : (
                <div className="text-center py-12 border rounded-xl border-dashed bg-muted/30">
                    <p className="text-muted-foreground">You haven't created any work trials yet.</p>
                </div>
             )}
        </section>
      </div>
    </main>
  );
}

function TrialCard({ trial, role }: { trial: WorkTrial, role: 'employer' | 'candidate' }) {
    return (
        <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <Badge variant={
                        trial.status === 'completed' ? 'default' : 
                        trial.status === 'in_progress' ? 'secondary' : 
                        'outline'
                    }>
                        {trial.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(trial.created_at), { addSuffix: true })}
                    </span>
                </div>
                <CardTitle className="text-lg mt-2">{trial.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {trial.description}
                </p>
                
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium">${trial.payment_amount}</span>
                    </div>
                    {trial.due_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Due {new Date(trial.due_date).toLocaleDateString()}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>
                            {role === 'employer' 
                                // @ts-ignore
                                ? `Candidate: ${trial.candidate?.email || 'N/A'}`
                                // @ts-ignore
                                : `Employer: ${trial.employer?.email || 'N/A'}`
                            }
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <Button variant="ghost" className="text-indigo-600 p-0 hover:bg-transparent hover:underline" asChild>
                        <Link href={`/trials/${trial.id}`}>View Details</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
