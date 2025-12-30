"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import { TrialsService } from "@/services/trials.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateTrialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const candidateIdParam = searchParams.get("candidateId");
  const candidateEmailParam = searchParams.get("candidateEmail"); // Optional, for display
  const applicationIdParam = searchParams.get("applicationId");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    payment_amount: "",
    due_date: "",
    candidate_email: candidateEmailParam || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let finalCandidateId = candidateIdParam;

      // If no candidate ID but email provided, try to find user (Best effort)
      if (!finalCandidateId && formData.candidate_email) {
          const { data: userData } = await supabase
            .from("user")
            .select("id")
            .eq("email", formData.candidate_email)
            .single();
          
          if (userData) {
              finalCandidateId = userData.id;
          } else {
              toast.error("Candidate email not found in system.");
              setLoading(false);
              return;
          }
      }

      if (!finalCandidateId) {
          toast.error("Candidate is required.");
          setLoading(false);
          return;
      }

      await TrialsService.createTrial({
        employer_id: user.id,
        candidate_id: finalCandidateId,
        job_application_id: applicationIdParam || undefined,
        title: formData.title,
        description: formData.description,
        payment_amount: parseFloat(formData.payment_amount),
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        status: 'pending'
      });

      toast.success("Work Trial Created!");
      router.push("/trials");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create trial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 md:p-10">
      <Link href="/trials" className="flex items-center text-sm text-muted-foreground hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Trials
      </Link>

      <h1 className="text-3xl font-bold mb-6">Create Work Trial</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        
        <div className="space-y-2">
            <Label htmlFor="candidate">Candidate Email</Label>
            <Input 
                id="candidate" 
                value={formData.candidate_email} 
                onChange={(e) => setFormData({...formData, candidate_email: e.target.value})}
                placeholder="candidate@example.com"
                disabled={!!candidateIdParam} // Disable if ID is passed
                required
            />
            {candidateIdParam && <p className="text-xs text-muted-foreground">Linked from application.</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="title">Trial Title</Label>
            <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Build a React Component"
                required
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="description">Description & Requirements</Label>
            <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed instructions for the candidate..."
                className="min-h-[150px]"
                required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="payment">Payment Amount (₹)</Label>
                <Input 
                    id="payment" 
                    type="number"
                    value={formData.payment_amount} 
                    onChange={(e) => setFormData({...formData, payment_amount: e.target.value})}
                    placeholder="500.00"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input 
                    id="due_date" 
                    type="date"
                    value={formData.due_date} 
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                />
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Trial
            </Button>
        </div>
      </form>
    </main>
  );
}
