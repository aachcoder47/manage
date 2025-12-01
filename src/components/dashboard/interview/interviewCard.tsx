import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight, Brain, Filter, BarChart3, Users } from "lucide-react";
import { CopyCheck } from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
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
                (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  // Ensure the URL has a protocol
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = 'https://' + baseUrl;
  }
  
  // Remove trailing slash if present
  return baseUrl.replace(/\/$/, '');
};

const base_url = getBaseUrl();

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
      const interviewer =
        await InterviewerService.getInterviewer(interviewerId);
      setImg(interviewer.image);
    };
    fetchInterviewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchAIData = async () => {
      if (!id) return;
      
      try {
        // Fetch real skill assessments for this interview
        const assessmentsResponse = await fetch(`/api/skill-assessments?interviewId=${id}`);
        const assessmentsData = assessmentsResponse.ok ? await assessmentsResponse.json() : { assessments: [] };
        
        // Fetch real responses for this interview
        const responsesResponse = await fetch(`/api/responses?interviewId=${id}`);
        const responsesData = responsesResponse.ok ? await responsesResponse.json() : { responses: [] };
        
        // Calculate real average scores from actual response data
        const scoredResponses = responsesData.responses.filter((r: any) => {
          if (r.analytics) {
            const analytics = typeof r.analytics === 'string' ? JSON.parse(r.analytics) : r.analytics;
            return analytics.overall_score !== null && analytics.overall_score !== undefined;
          }
          return false;
        });
        
        const averageScore = scoredResponses.length > 0
          ? Math.round(scoredResponses.reduce((sum: number, r: any) => {
              const analytics = typeof r.analytics === 'string' ? JSON.parse(r.analytics) : r.analytics;
              return sum + analytics.overall_score;
            }, 0) / scoredResponses.length)
          : 0;
        
        // Set real AI features state
        setHasAssessments(assessmentsData.assessments.length > 0);
        setAverageScore(averageScore);
        
      } catch (error) {
        console.error("Error fetching AI features data:", error);
        // Keep default values if API calls fail
      }
    };
    
    fetchAIData();
  }, [id]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);
        
        setIsFetching(true);
        
        // Original analytics fetching
        for (const response of responses) {
          if (!response.is_analysed) {
            try {
              const result = await axios.post("/api/get-call", {
                id: response.call_id,
              });

              if (result.status !== 200) {
                throw new Error(`HTTP error! status: ${result.status}`);
              }
            } catch (error) {
              console.error(
                `Failed to call api/get-call for response id ${response.call_id}:`,
                error,
              );
            }
          }
        }
        setIsFetching(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copyToClipboard = () => {
    // Construct the full interview URL. If a readable slug is available, use the base URL with the slug.
    // Otherwise, use the provided URL directly (it may already be absolute) or fallback to the base URL.
    const fullUrl = readableSlug
      ? `${base_url}/call/${readableSlug}`
      : typeof url === "string" && url.startsWith('http')
        ? url
        : `${base_url}/call/${url}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(
        () => {
          setCopied(true);
          toast.success(
            "The link to your interview has been copied to your clipboard.",
            {
              position: "bottom-right",
              duration: 3000,
            },
          );
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        },
        (err) => {
          console.error("failed to copy", err.message);
        },
      );
  };

  const handleJumpToInterview = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    // Construct the full interview URL similar to copy functionality.
    const fullUrl = readableSlug
      ? `${base_url}/call/${readableSlug}`
      : typeof url === "string" && url.startsWith('http')
        ? url
        : `${base_url}/call/${url}`;
    window.open(fullUrl, "_blank");
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
      href={`/interviews/${id}`}
      style={{
        pointerEvents: isFetching ? "none" : "auto",
        cursor: isFetching ? "default" : "pointer",
      }}
    >
      <Card className="group relative h-72 w-full rounded-xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
        <CardContent className={`p-0 h-full flex flex-col ${isFetching ? "opacity-60" : ""}`}>
          {/* Header with gradient background */}
          <div className="w-full h-28 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-600/90 group-hover:scale-105 transition-transform duration-500" />
            
            <div className="relative z-10 p-4 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg font-semibold leading-tight line-clamp-2 text-left">
                  {name}
                </CardTitle>
                
                {/* Action Buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md"
                    onClick={handleJumpToInterview}
                  >
                    <ArrowUpRight size={14} />
                  </Button>
                  <Button
                    size="icon"
                    className={`h-7 w-7 bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md ${
                      copied ? "bg-white/40" : ""
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      copyToClipboard();
                    }}
                  >
                    {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                {/* AI Features Badge */}
                {hasAssessments && (
                  <div className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                    <Brain className="h-3 w-3" />
                    AI Active
                  </div>
                )}
                
                {/* Average Score Badge */}
                {averageScore !== null && (
                  <div className="bg-emerald-500/80 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Avg: {averageScore}%
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between bg-background/50">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-background shadow-sm">
                <Image
                  src={img}
                  alt="Interviewer"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Responses</span>
                <span className="text-lg font-bold text-foreground">
                  {responseCount?.toString() || 0}
                </span>
              </div>
            </div>
            
            {/* AI Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button
                variant="outline"
                className="h-8 text-xs flex items-center justify-center gap-1.5 border-primary/10 hover:bg-primary/5 hover:text-primary transition-colors"
                title="Create Skill Assessment"
                onClick={handleCreateAssessment}
              >
                <Brain className="h-3.5 w-3.5" />
                Assess
              </Button>
              
              <Button
                variant="outline"
                className="h-8 text-xs flex items-center justify-center gap-1.5 border-primary/10 hover:bg-primary/5 hover:text-primary transition-colors"
                title="Filter Candidates"
                disabled={responseCount === 0}
                onClick={handleFilterCandidates}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
              
              <Button
                variant="outline"
                className="h-8 text-xs flex items-center justify-center gap-1.5 border-primary/10 hover:bg-primary/5 hover:text-primary transition-colors"
                title="View Analytics"
                disabled={responseCount === 0}
                onClick={handleViewAnalytics}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default InterviewCard;
