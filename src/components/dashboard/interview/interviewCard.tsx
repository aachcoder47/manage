// src/components/dashboard/interview/interviewCard.tsx
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight, Brain, Filter, BarChart3 } from "lucide-react";
import { CopyCheck } from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { InterviewerService } from "@/services/interviewers.service";
import { useRouter } from "next/navigation";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
}

const getBaseUrl = () => {
  let baseUrl = process.env.NEXT_PUBLIC_LIVE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    baseUrl = "https://" + baseUrl;
  }
  return baseUrl.replace(/\/$/, "");
};

function InterviewCard({ name, interviewerId, id, url, readableSlug }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");
  const [hasAssessments, setHasAssessments] = useState(false);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchInterviewer = async () => {
      try {
        const interviewer = await InterviewerService.getInterviewer(interviewerId);
        setImg(interviewer.image);
      } catch (err) {
        console.error("Error fetching interviewer image:", err);
      }
    };
    fetchInterviewer();
  }, [interviewerId]);

  useEffect(() => {
    const fetchAIData = async () => {
      if (!id) return;
      try {
        const assessmentsResponse = await fetch(`/api/skill-assessments?interviewId=${id}`);
        const assessments = await assessmentsResponse.json();
        setHasAssessments(Array.isArray(assessments) && assessments.length > 0);
        if (assessments && assessments.length > 0) {
          const avg = assessments.map(a => a.score || 0).reduce((a, b) => a + b, 0) / assessments.length;
          setAverageScore(Math.round(avg * 100) / 100);
        }
      } catch (err) {
        setHasAssessments(false);
        setAverageScore(null);
      }
    };
    fetchAIData();
  }, [id]);

  useEffect(() => {
    const fetchResponses = async () => {
      setIsFetching(true);
      try {
        const count = await ResponseService.getResponseCountByInterviewId(id);
        setResponseCount(count);
      } catch (error) {
        console.error(error);
      }
      setIsFetching(false);
    };
    fetchResponses();
  }, [id]);

  const copyToClipboard = () => {
    const link = readableSlug 
      ? `${getBaseUrl()}/call/${readableSlug}` 
      : url 
        ? `${getBaseUrl()}/call/${url}` 
        : "";
    if (!link) {
      toast.error("Interview link is unavailable.", {
        position: "bottom-right",
        duration: 3000
      });
      return;
    }
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true);
        toast.success("Interview link copied to clipboard.", {
          position: "bottom-right",
          duration: 3000
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        setCopied(false);
        toast.error("Failed to copy interview link: " + err.message, {
          position: "bottom-right",
          duration: 3000
        });
      });
  };

  const handleJumpToInterview = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const interviewUrl = readableSlug
      ? `${getBaseUrl()}/call/${readableSlug}`
      : url
        ? `${getBaseUrl()}/call/${url}`
        : "";
    if (!interviewUrl) {
      toast.error("Interview link is unavailable.", {
        position: "bottom-right",
        duration: 3000
      });
      return;
    }
    window.open(interviewUrl, "_blank");
  };

  const handleCreateAssessment = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    router.push(`/interviews/${id}/assessments`);
  };

  const handleFilterCandidates = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    router.push(`/interviews/${id}/filter`);
  };

  const handleViewAnalytics = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    router.push(`/interviews/${id}/analytics`);
  };

  return (
    <a
      href={id ? `/interviews/${id}` : "#"}
      style={{
        pointerEvents: isFetching ? "none" : "auto",
        cursor: isFetching ? "default" : "pointer"
      }}
      onClick={e => isFetching && e.preventDefault()}
    >
      <Card className="group relative h-72 w-full rounded-xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-600/90 group-hover:scale-105 transition-transform duration-500" />
        <CardContent className={`relative z-10 p-4 flex flex-col h-full justify-between ${isFetching ? "opacity-60" : ""}`}>
          <div className="flex justify-between items-start">
            <CardTitle className="text-white text-lg font-semibold leading-tight line-clamp-2 text-left">
              {name}
            </CardTitle>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="icon"
                className="h-7 w-7 bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md"
                onClick={handleJumpToInterview}
                disabled={isFetching}
              >
                <ArrowUpRight size={14} />
              </Button>
              <Button
                size="icon"
                className={`h-7 w-7 border-none text-white backdrop-blur-md ${copied ? "bg-white/40" : "bg-white/20 hover:bg-white/30"}`}
                onClick={copyToClipboard}
                disabled={isFetching}
              >
                {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            {hasAssessments && (
              <div className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <Brain className="h-3 w-3" />
                AI Active
              </div>
            )}
            {averageScore !== null && (
              <div className="bg-emerald-500/80 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                Avg Score: {averageScore}
              </div>
            )}
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div className="flex gap-2">
              <Button size="sm" className="bg-indigo-500/80 text-white" onClick={handleCreateAssessment} disabled={isFetching}>
                <Brain size={13} className="mr-1" />
                Assessments
              </Button>
              <Button size="sm" className="bg-purple-500/80 text-white" onClick={handleFilterCandidates} disabled={isFetching}>
                <Filter size={13} className="mr-1" />
                Filter Candidates
              </Button>
              <Button size="sm" className="bg-blue-500/80 text-white" onClick={handleViewAnalytics} disabled={isFetching}>
                <BarChart3 size={13} className="mr-1" />
                Analytics
              </Button>
            </div>
            <div>
              {img ? (
                <Image
                  src={img}
                  alt="Interviewer"
                  width={42}
                  height={42}
                  className="rounded-full border-2 border-white/30"
                />
              ) : (
                <MiniLoader />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default InterviewCard;
