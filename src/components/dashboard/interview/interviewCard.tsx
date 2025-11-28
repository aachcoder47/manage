"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight } from "lucide-react";

export default function CandidatePage() {
  const params = useParams();
  const slug = params?.candidateSlug;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function loadCandidate() {
      try {
        const res = await fetch(`/api/candidates/${slug}`);
        if (!res.ok) throw new Error("Candidate not found");

        const data = await res.json();

        // Fix readableSlug missing → causes runtime error
        const fixedData = {
          ...data,
          readableSlug: data.readableSlug ?? data.slug ?? slug,
        };

        setCandidate(fixedData);
      } catch (err) {
        console.error("Error loading candidate:", err);
        toast.error("Failed to load candidate");
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!candidate) return <div>Candidate not found</div>;

  // Interview URL fix
  const interviewURL = `${window.location.origin}/interview/${candidate.readableSlug}`;

  // --- FIX 1: COPY WORKS NOW ---
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(interviewURL);
      toast.success("Interview link copied!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy");
    }
  };

  // --- FIX 2: JUMP WORKS NOW ---
  const jumpToInterview = () => {
    try {
      window.open(interviewURL, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error("Could not open interview");
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardContent>
          <CardTitle className="text-xl mb-4">Candidate Information</CardTitle>

          <div className="mb-4">
            <p>Name: {candidate.name}</p>
            <p>Email: {candidate.email}</p>
            <p>Role: {candidate.role}</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={copyText}>
              <Copy size={16} className="mr-2" /> Copy Interview Link
            </Button>

            <Button onClick={jumpToInterview}>
              Jump to Interview <ArrowUpRight size={16} className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
