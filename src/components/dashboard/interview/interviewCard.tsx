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

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

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
    navigator.clipboard
      .writeText(
        readableSlug ? `${base_url}/call/${readableSlug}` : (url as string),
      )
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
          console.log("failed to copy", err.mesage);
        },
      );
  };

  const handleJumpToInterview = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const interviewUrl = readableSlug
      ? `/call/${readableSlug}`
      : `/call/${url}`;
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
      href={`/interviews/${id}`}
      style={{
        pointerEvents: isFetching ? "none" : "auto",
        cursor: isFetching ? "default" : "pointer",
      }}
    >
      <Card className="relative p-0 mt-4 inline-block cursor-pointer h-72 w-56 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <CardContent className={`p-0 ${isFetching ? "opacity-60" : ""}`}>
          {/* Header with gradient background */}
          <div className="w-full h-32 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center text-center relative">
            <CardTitle className="w-full mt-3 mx-2 text-white text-lg px-2">
              {name}
              {isFetching && (
                <div className="z-100 mt-[-5px]">
                  <MiniLoader />
                </div>
              )}
            </CardTitle>
            
            {/* AI Features Badge */}
            {hasAssessments && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI
              </div>
            )}
            
            {/* Average Score Badge */}
            {averageScore !== null && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                {averageScore}%
              </div>
            )}
          </div>
          
          {/* Interviewer and Response Info */}
          <div className="flex flex-row items-center mx-4 py-3">
            <div className="w-full overflow-hidden">
              <Image
                src={img}
                alt="Picture of the interviewer"
                width={50}
                height={50}
                className="object-cover object-center rounded-full"
              />
            </div>
            <div className="text-black text-sm font-semibold ml-2 mr-2 whitespace-nowrap">
              Responses:{" "}
              <span className="font-normal">
                {responseCount?.toString() || 0}
              </span>
            </div>
          </div>
          
          {/* AI Features Section */}
          <div className="px-4 pb-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">AI Features</span>
              {hasAssessments ? (
                <span className="text-green-600 font-medium">Active</span>
              ) : (
                <span className="text-gray-400">Not Set Up</span>
              )}
            </div>
            
            {/* AI Action Buttons */}
            <div className="grid grid-cols-3 gap-1">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 px-1 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
                onClick={handleCreateAssessment}
                title="Create Skill Assessment"
              >
                <Brain className="h-3 w-3" />
                <span className="text-xs">Assess</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 px-1 flex flex-col items-center justify-center gap-1 hover:bg-green-50"
                onClick={handleFilterCandidates}
                title="Filter Candidates"
                disabled={responseCount === 0}
              >
                <Filter className="h-3 w-3" />
                <span className="text-xs">Filter</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 px-1 flex flex-col items-center justify-center gap-1 hover:bg-purple-50"
                onClick={handleViewAnalytics}
                title="View Analytics"
                disabled={responseCount === 0}
              >
                <BarChart3 className="h-3 w-3" />
                <span className="text-xs">Analytics</span>
              </Button>
            </div>
          </div>
          
          {/* Original Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              className="text-xs text-white px-1 h-6 bg-white/20 hover:bg-white/30 border border-white/30"
              variant={"secondary"}
              onClick={handleJumpToInterview}
            >
              <ArrowUpRight size={16} />
            </Button>
            <Button
              className={`text-xs text-white px-1 h-6 bg-white/20 hover:bg-white/30 border border-white/30 ${
                copied ? "bg-white/40" : ""
              }`}
              variant={"secondary"}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                copyToClipboard();
              }}
            >
              {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default InterviewCard;
