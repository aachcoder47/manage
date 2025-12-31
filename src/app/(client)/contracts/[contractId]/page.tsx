"use client";

import React, { useEffect, useState } from "react";
import { ContractsService, Contract } from "@/services/contracts.service";
import { Loader2, CheckCircle, FileSignature, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ContractDetailsPage({ params }: { params: { contractId: string } }) {
  const { user } = useUser();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const data = await ContractsService.getContractById(params.contractId);
        setContract(data);
      } catch (error) {
        console.error("Error fetching contract:", error);
        toast.error("Contract not found");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [params.contractId]);

  const handleSign = async (role: 'employer' | 'candidate') => {
      if (!contract) {return;}
      setProcessing(true);
      try {
          const updates: any = {};
          if (role === 'employer') {
              updates.employer_signed_at = new Date().toISOString();
              // If candidate already signed, activate
              if (contract.candidate_signed_at) {
                  updates.status = 'active';
              } else {
                  updates.status = 'sent'; // Employer signed and sending
              }
          } else {
              updates.candidate_signed_at = new Date().toISOString();
               // If employer already signed, activate
               if (contract.employer_signed_at) {
                  updates.status = 'active';
              } else {
                   // Candidate signed first? Usually waiting for employer. 
                   // Let's assume candidate just signs and status becomes 'signed' waiting for countersign if not already.
                   updates.status = 'signed';
              }
          }

          const updated = await ContractsService.updateContract(contract.id, updates);
          setContract(updated);
          toast.success("Contract signed successfully!");
      } catch (error) {
           toast.error("Failed to sign contract");
      } finally {
          setProcessing(false);
      }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("contract-content");
    if (!element) {return;}
    
    setProcessing(true);
    try {
        // Use html2canvas to render the element including styles
        const canvas = await html2canvas(element, { scale: 2 } as any);
        const imgData = canvas.toDataURL("image/png");
        
        // A4 size in mm
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Contract_${contract?.id.slice(0,6)}.pdf`);
    } catch (error) {
        console.error(error);
        toast.error("Failed to generate PDF");
    } finally {
        setProcessing(false);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  if (loading) {return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;}
  if (!contract) {return <div className="p-10 text-center">Contract not found</div>;}

  const isCandidate = user?.id === contract.candidate_id;
  const isEmployer = user?.id === contract.employer_id;

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10 bg-white min-h-screen shadow-sm my-8 rounded-xl print:shadow-none print:m-0">
      <div className="flex justify-between items-start mb-8 print:hidden">
        <div>
            <h1 className="text-2xl font-bold mb-2">Contract Details</h1>
            <Badge variant={contract.status === 'active' ? 'default' : 'outline'}>
                {contract.status.toUpperCase()}
            </Badge>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" disabled={processing} onClick={handleDownloadPDF}>
                <Printer className="w-4 h-4 mr-2" />
                {processing ? "Generating..." : "Download PDF"}
            </Button>
            {isEmployer && !contract.employer_signed_at && (
                <Button disabled={processing} className="bg-indigo-600" onClick={() => handleSign('employer')}>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Sign & Send
                </Button>
            )}
            {isCandidate && !contract.candidate_signed_at && contract.status !== 'draft' && (
                <Button disabled={processing} className="bg-green-600" onClick={() => handleSign('candidate')}>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Accept & Sign
                </Button>
            )}
            {(contract.status === 'active' || contract.status === 'signed') && (
                 <Button variant="secondary" onClick={() => window.location.href = `/contracts/${contract.id}/onboarding`}>
                    Onboarding
                 </Button>
            )}
        </div>
      </div>

      <div id="contract-content" className="prose max-w-none bg-white p-8">
          <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 border-b pb-4">{contract.title}</h2>
              <p className="text-muted-foreground mt-2">
                  Agreement ID: {contract.id.slice(0, 8)} | Date: {new Date(contract.created_at).toLocaleDateString()}
              </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="block text-muted-foreground uppercase text-xs font-bold mb-1">Employer (Client)</span>
                   {/* @ts-ignore */}
                  <span className="text-lg font-medium">{contract.employer?.organization?.name || "Company"}</span>
                   {/* @ts-ignore */}
                  <div className="text-gray-600">{contract.employer?.email}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="block text-muted-foreground uppercase text-xs font-bold mb-1">Candidate (Contractor)</span>
                   {/* @ts-ignore */}
                  <span className="text-lg font-medium">{contract.candidate?.email || "Candidate"}</span>
              </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="border p-3 rounded text-center">
                  <span className="block text-xs uppercase text-muted-foreground">Start Date</span>
                  <span className="font-medium">{contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="border p-3 rounded text-center">
                  <span className="block text-xs uppercase text-muted-foreground">Rate</span>
                  <span className="font-medium">${contract.rate} / {contract.rate_period}</span>
              </div>
              <div className="border p-3 rounded text-center">
                  <span className="block text-xs uppercase text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{contract.status}</span>
              </div>
          </div>
          
          <Separator className="my-8" />

          <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800 p-4 min-h-[400px]">
              {contract.content}
          </div>

          <div className="mt-20 grid grid-cols-2 gap-20 page-break-inside-avoid">
              <div className="border-t-2 border-gray-300 pt-4">
                  <p className="font-bold text-lg mb-1">Signed by Client</p>
                  {contract.employer_signed_at ? (
                      <div className="text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>Signed on {new Date(contract.employer_signed_at).toLocaleDateString()}</span>
                      </div>
                  ) : (
                      <p className="text-muted-foreground italic">Pending signature...</p>
                  )}
              </div>
              <div className="border-t-2 border-gray-300 pt-4">
                  <p className="font-bold text-lg mb-1">Signed by Contractor</p>
                   {contract.candidate_signed_at ? (
                      <div className="text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>Signed on {new Date(contract.candidate_signed_at).toLocaleDateString()}</span>
                      </div>
                  ) : (
                      <p className="text-muted-foreground italic">Pending signature...</p>
                  )}
              </div>
          </div>
      </div>
    </main>
  );
}
