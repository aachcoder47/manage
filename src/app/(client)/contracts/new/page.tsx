"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ContractsService } from "@/services/contracts.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const candidateIdParam = searchParams.get("candidateId");
  const candidateEmailParam = searchParams.get("candidateEmail");
  const applicationIdParam = searchParams.get("applicationId");

  // Default contract template
  const defaultContent = `**Engagement Letter**

This contract is between [Employer Name] ("Client") and [Candidate Name] ("Contractor").

1. **Services**: The Contractor agrees to perform the following services: [Description of roles]
2. **Rate**: The Client agrees to pay the Contractor at the rate specified below.
3. **Term**: This agreement commences on [Start Date] and continues until terminated.
4. **Confidentiality**: The Contractor agrees to keep all Client information confidential.

Signed: ___________________ (Client)
Signed: ___________________ (Contractor)
`;

  const [formData, setFormData] = useState({
    title: "Employment Contract",
    content: defaultContent,
    rate: "",
    rate_period: "monthly",
    start_date: "",
    candidate_email: candidateEmailParam || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {return;}

    setLoading(true);
    try {
      let finalCandidateId = candidateIdParam;

      if (!finalCandidateId && formData.candidate_email) {
          const { data: userData } = await supabase
            .from("user")
            .select("id")
            .eq("email", formData.candidate_email)
            .single();
          
          if (userData) {
              finalCandidateId = userData.id;
          } else {
              toast.error("Candidate email not found.");
              setLoading(false);
              return;
          }
      }

      if (!finalCandidateId) {
          toast.error("Candidate is required.");
          setLoading(false);
          return;
      }

      const contract = await ContractsService.createContract({
        employer_id: user.id,
        candidate_id: finalCandidateId,
        job_application_id: applicationIdParam || undefined,
        title: formData.title,
        content: formData.content,
        rate: parseFloat(formData.rate),
        rate_period: formData.rate_period,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        status: 'draft'
      });

      toast.success("Contract draft created!");
      router.push(`/contracts/${contract.id}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      <Link href="/contracts" className="flex items-center text-sm text-muted-foreground hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Contracts
      </Link>

      <h1 className="text-3xl font-bold mb-6">Draft New Contract</h1>

      <form className="space-y-6 bg-white p-8 rounded-xl border shadow-sm" onSubmit={handleSubmit}>
        
        <div className="space-y-2">
            <Label>Candidate Email</Label>
            <Input 
                value={formData.candidate_email} 
                placeholder="candidate@example.com"
                disabled={!!candidateIdParam}
                required
                onChange={(e) => setFormData({...formData, candidate_email: e.target.value})}
            />
        </div>

        <div className="space-y-2">
            <Label>Contract Title</Label>
            <Input 
                value={formData.title} 
                required
                onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Rate Amount</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input 
                        type="number"
                        className="pl-6"
                        value={formData.rate} 
                        required
                        onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    />
                </div>
            </div>
             <div className="space-y-2">
                <Label>Period</Label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.rate_period}
                    onChange={(e) => setFormData({...formData, rate_period: e.target.value})}
                >
                    <option value="hourly">Hourly</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="fixed">Fixed</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                    type="date"
                    value={formData.start_date} 
                    required
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
            </div>
        </div>

        <div className="space-y-2">
            <Label>Contract Terms (Markdown supported)</Label>
            <Textarea 
                value={formData.content} 
                className="min-h-[300px] font-mono text-sm"
                required
                onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
        </div>

        <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Draft
            </Button>
        </div>
      </form>
    </main>
  );
}
