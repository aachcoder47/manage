"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useInterviews } from "@/contexts/interviews.context";
import { Share2, Filter, Pencil, UserIcon, Eye, Palette, BarChart3, MoreVertical, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ResponseService } from "@/services/responses.service";
import { ClientService } from "@/services/clients.service";
import { Interview } from "@/types/interview";
import { Response } from "@/types/response";
import { formatTimestampToDateHHMM } from "@/lib/utils";
import CallInfo from "@/components/call/callInfo";
import SummaryInfo from "@/components/dashboard/interview/summaryInfo";
import { InterviewService } from "@/services/interviews.service";
import EditInterview from "@/components/dashboard/interview/editInterview";
import Modal from "@/components/dashboard/Modal";
import { toast } from "sonner";
import { ChromePicker } from "react-color";
import SharePopup from "@/components/dashboard/interview/sharePopup";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateStatus } from "@/lib/enum";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

interface Props {
  params: {
    interviewId: string;
  };
  searchParams: {
    call: string;
    edit: boolean;
  };
}

const getBaseUrl = () => {
  let baseUrl = process.env.NEXT_PUBLIC_LIVE_URL || 
                (typeof window !== 'undefined' ? window.location.origin.replace(/^https?:\/\//, '') : 'localhost:3000');
  
  // Remove trailing slash if present
  return baseUrl.replace(/\/$/, '');
};

const base_url = getBaseUrl();

function InterviewHome({ params, searchParams }: Props) {
  const [interview, setInterview] = useState<Interview>();
  const [responses, setResponses] = useState<Response[]>();
  const { getInterviewById } = useInterviews();
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const router = useRouter();
  const [isActive, setIsActive] = useState<boolean>(true);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [isGeneratingInsights, setIsGeneratingInsights] =
    useState<boolean>(false);
  const [isViewed, setIsViewed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [themeColor, setThemeColor] = useState<string>("#4F46E5");
  const [iconColor, seticonColor] = useState<string>("#4F46E5");
  const { organization } = useOrganization();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const seeInterviewPreviewPage = () => {
    const protocol = base_url?.includes("localhost") ? "http" : "https";
    if (interview?.url) {
      const url = interview?.readable_slug
        ? `${protocol}://${base_url}/call/${interview?.readable_slug}`
        : interview.url.startsWith("http")
          ? interview.url
          : `https://${interview.url}`;
      window.open(url, "_blank");
    } else {
      toast.error("Interview URL not found");
    }
  };

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await getInterviewById(params.interviewId);
        if (response) {
            setInterview(response);
            setIsActive(response.is_active);
            setIsViewed(response.is_viewed);
            setThemeColor(response.theme_color ?? "#4F46E5");
            seticonColor(response.theme_color ?? "#4F46E5");
        }
        setLoading(true);
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to fetch interview details", {
            description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    if (!interview || !isGeneratingInsights) {
      fetchInterview();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getInterviewById, params.interviewId, isGeneratingInsights]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await ResponseService.getAllResponses(
          params.interviewId,
        );
        setResponses(response);
        setLoading(true);
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to fetch responses", {
            description: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteResponse = (deletedCallId: string) => {
    if (responses) {
      setResponses(
        responses.filter((response) => response.call_id !== deletedCallId),
      );
      if (searchParams.call === deletedCallId) {
        router.push(`/interviews/${params.interviewId}`);
      }
    }
  };

  const handleResponseClick = async (response: Response) => {
    try {
      await ResponseService.saveResponse({ is_viewed: true }, response.call_id);
      if (responses) {
        const updatedResponses = responses.map((r) =>
          r.call_id === response.call_id ? { ...r, is_viewed: true } : r,
        );
        setResponses(updatedResponses);
      }
      setIsViewed(true);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update view status", {
        description: error.message
      });
    }
  };

  const handleToggle = async () => {
    try {
      const updatedIsActive = !isActive;
      setIsActive(updatedIsActive);

      await InterviewService.updateInterview(
        { is_active: updatedIsActive },
        params.interviewId,
      );

      toast.success("Interview status updated", {
        description: `The interview is now ${
          updatedIsActive ? "active" : "inactive"
        }.`,
        position: "bottom-right",
        duration: 3000,
      });
    } catch (error: any) {
      console.error(error);
      setIsActive(!isActive); // Revert on error
      toast.error("Error", {
        description: error.message || "Failed to update the interview status.",
        duration: 3000,
      });
    }
  };

  const handleThemeColorChange = async (newColor: string) => {
    try {
      await InterviewService.updateInterview(
        { theme_color: newColor },
        params.interviewId,
      );

      toast.success("Theme color updated", {
        position: "bottom-right",
        duration: 3000,
      });
    } catch (error: any) {
      console.error(error);
      toast.error("Error", {
        description: error.message || "Failed to update the theme color.",
        duration: 3000,
      });
    }
  };

  const handleCandidateStatusChange = (callId: string, newStatus: string) => {
    setResponses((prevResponses) => {
      return prevResponses?.map((response) =>
        response.call_id === callId
          ? { ...response, candidate_status: newStatus }
          : response,
      );
    });
  };

  const openSharePopup = () => {
    setIsSharePopupOpen(true);
  };

  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  const handleColorChange = (color: any) => {
    setThemeColor(color.hex);
  };

  const applyColorChange = () => {
    if (themeColor !== iconColor) {
      seticonColor(themeColor);
      handleThemeColorChange(themeColor);
    }
    setShowColorPicker(false);
  };

  const filterResponses = () => {
    if (!responses) {
      return [];
    }
    if (filterStatus == "ALL") {
      return responses;
    }

    return responses?.filter(
      (response) => response?.candidate_status == filterStatus,
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case "NOT_SELECTED": return "bg-red-500";
        case "POTENTIAL": return "bg-yellow-500";
        case "SELECTED": return "bg-green-500";
        default: return "bg-gray-300";
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-background/50 backdrop-blur-sm">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[80%] w-full">
          <LoaderWithText />
        </div>
      ) : (
        <>
          {/* Header Bar */}
          <div className="flex flex-row px-6 py-4 justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
            <div className="flex items-center gap-4">
                <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: iconColor }}
                title="Change Theme Color"
                onClick={() => setShowColorPicker(true)}
                />
                <div>
                    <h1 className="font-bold text-xl tracking-tight">{interview?.name}</h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserIcon size={12} />
                        <span>{responses?.length || 0} Responses</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50 mr-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-background hover:text-indigo-600 transition-colors"
                                onClick={() => router.push(`/interviews/${params.interviewId}/hiring-overview`)}
                            >
                                <BarChart3 size={18} />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>Hiring Overview</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-background hover:text-indigo-600 transition-colors"
                                onClick={openSharePopup}
                            >
                                <Share2 size={18} />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>Share Interview</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-background hover:text-indigo-600 transition-colors"
                                onClick={seeInterviewPreviewPage}
                            >
                                <Eye size={18} />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>Preview as Candidate</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-background hover:text-indigo-600 transition-colors"
                                onClick={() => router.push(`/interviews/${params.interviewId}?edit=true`)}
                            >
                                <Pencil size={18} />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Interview</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                    <span className={`text-xs font-medium ${isActive ? "text-green-600" : "text-muted-foreground"}`}>
                        {isActive ? "Active" : "Inactive"}
                    </span>
                    <Switch
                        checked={isActive}
                        className="scale-75 data-[state=checked]:bg-green-600"
                        disabled={currentPlan === "free_trial_over"}
                        onCheckedChange={handleToggle}
                    />
                </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-row w-full h-[calc(100vh-80px)] p-6 gap-6 overflow-hidden">
            
            {/* Sidebar: Response List */}
            <Card className="w-[350px] flex flex-col h-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/10">
                <Select
                  onValueChange={async (newValue: string) => {
                    setFilterStatus(newValue);
                  }}
                >
                  <SelectTrigger className="w-full bg-background border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter size={16} />
                        <SelectValue placeholder="Filter Responses" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Responses</SelectItem>
                    <SelectItem value={CandidateStatus.NO_STATUS}>No Status</SelectItem>
                    <SelectItem value={CandidateStatus.NOT_SELECTED}>Not Selected</SelectItem>
                    <SelectItem value={CandidateStatus.POTENTIAL}>Potential</SelectItem>
                    <SelectItem value={CandidateStatus.SELECTED}>Selected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                    <AnimatePresence>
                        {filterResponses().length > 0 ? (
                        filterResponses().map((response) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={response?.id}
                                className={`
                                    group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer
                                    ${searchParams.call == response.call_id 
                                        ? "bg-indigo-50/80 border-indigo-200 shadow-sm" 
                                        : "bg-background border-transparent hover:bg-muted/50 hover:border-border/50"}
                                `}
                                onClick={() => {
                                    router.push(`/interviews/${params.interviewId}?call=${response.call_id}`);
                                    handleResponseClick(response);
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${getStatusColor(response.candidate_status || "")}`} />
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-sm truncate text-foreground">
                                                {response?.name || "Anonymous"}
                                            </p>
                                            {!response.is_viewed && (
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock size={12} />
                                            <span>{formatTimestampToDateHHMM(String(response?.created_at))}</span>
                                        </div>
                                    </div>

                                    {response.analytics?.overallScore !== undefined && (
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2
                                            ${response.analytics.overallScore >= 70 
                                                ? "border-green-200 bg-green-50 text-green-700" 
                                                : response.analytics.overallScore >= 40 
                                                    ? "border-yellow-200 bg-yellow-50 text-yellow-700" 
                                                    : "border-red-200 bg-red-50 text-red-700"}
                                        `}>
                                            {response.analytics.overallScore}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                        ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                            <p>No responses found</p>
                        </div>
                        )}
                    </AnimatePresence>
                </div>
              </ScrollArea>
            </Card>

            {/* Main Detail View */}
            <div className="flex-1 h-full overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                {responses && (
                    <div className="h-full w-full">
                        {searchParams.call ? (
                        <CallInfo
                            call_id={searchParams.call}
                            onDeleteResponse={handleDeleteResponse}
                            onCandidateStatusChange={handleCandidateStatusChange}
                        />
                        ) : searchParams.edit ? (
                        <EditInterview interview={interview} />
                        ) : (
                        <SummaryInfo responses={responses} interview={interview} />
                        )}
                    </div>
                )}
            </div>
          </div>
        </>
      )}
      <Modal
        open={showColorPicker}
        closeOnOutsideClick={false}
        onClose={applyColorChange}
      >
        <div className="w-[250px] p-3">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Choose a Theme Color
          </h3>
          <ChromePicker
            disableAlpha={true}
            color={themeColor}
            styles={{
              default: {
                picker: { width: "100%" },
              },
            }}
            onChange={handleColorChange}
          />
        </div>
      </Modal>
      {isSharePopupOpen && (
        <SharePopup
          open={isSharePopupOpen}
          shareContent={
            interview?.readable_slug
              ? `${window.location.protocol}//${base_url}/call/${interview?.readable_slug}`
              : (interview?.url?.startsWith('http') ? interview.url : `${window.location.protocol}//${interview?.url}`)
          }
          onClose={closeSharePopup}
        />
      )}
    </div>
  );
}

export default InterviewHome;
