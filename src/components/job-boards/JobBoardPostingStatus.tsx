"use client";

import React, { useEffect, useState } from "react";
import { ExternalJobPosting } from "@/services/job-board-integration.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, CheckCircle2, XCircle, Clock, Eye, Users, Loader2, Linkedin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobBoardPostingStatusProps {
  jobId: string;
}

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  naukri: "Naukri",
  other: "Other",
};

const platformColors: Record<string, string> = {
  linkedin: "bg-blue-100 text-blue-700 border-blue-200",
  indeed: "bg-purple-100 text-purple-700 border-purple-200",
  naukri: "bg-green-100 text-green-700 border-green-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  posted: {
    label: "Posted",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "bg-green-50 text-green-700 border-green-200",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="w-4 h-4" />,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="w-4 h-4" />,
    color: "bg-red-50 text-red-700 border-red-200",
  },
  expired: {
    label: "Expired",
    icon: <XCircle className="w-4 h-4" />,
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
};

export default function JobBoardPostingStatus({ jobId }: JobBoardPostingStatusProps) {
  const [postings, setPostings] = useState<ExternalJobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostings = async () => {
      try {
        const response = await fetch(`/api/job-boards/postings?job_id=${jobId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch postings");
        }
        const data = await response.json();
        setPostings(data.postings || []);
      } catch (error) {
        console.error("Error fetching postings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostings();
  }, [jobId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Board Postings</CardTitle>
          <CardDescription>Status of job postings on external platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (postings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Board Postings</CardTitle>
          <CardDescription>Status of job postings on external platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>This job hasn't been posted to any job boards yet.</p>
            <p className="text-sm mt-2">Post it from the job creation page or settings.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Board Postings</CardTitle>
        <CardDescription>Status of job postings on external platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {postings.map((posting) => {
            const platform = posting.platform.toLowerCase();
            const status = posting.posting_status.toLowerCase();
            const statusInfo = statusConfig[status] || statusConfig.pending;
            const platformLabel = platformLabels[platform] || platform;
            const platformColor = platformColors[platform] || platformColors.other;

            return (
              <div
                key={posting.id}
                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={platformColor}>
                        {platformLabel}
                      </Badge>
                      <Badge variant="outline" className={statusInfo.color}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.label}</span>
                      </Badge>
                    </div>

                    <div className="space-y-2 mt-3">
                      {posting.external_job_url && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            {platform === 'linkedin' ? (
                              <Linkedin className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            )}
                            <a
                              href={posting.external_job_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`truncate hover:underline ${
                                platform === 'linkedin' ? 'text-blue-600 font-medium' : 'text-indigo-600'
                              }`}
                            >
                              {platform === 'linkedin' ? 'View LinkedIn Post' : `View on ${platformLabel}`}
                            </a>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (posting.external_job_url) {
                                navigator.clipboard.writeText(posting.external_job_url);
                              }
                            }}
                          >
                            Copy Link
                          </Button>
                        </div>
                      )}

                      {posting.posted_at && (
                        <div className="text-sm text-muted-foreground">
                          Posted {formatDistanceToNow(new Date(posting.posted_at), { addSuffix: true })}
                        </div>
                      )}

                      {posting.expires_at && (
                        <div className="text-sm text-muted-foreground">
                          Expires {formatDistanceToNow(new Date(posting.expires_at), { addSuffix: true })}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                        {posting.views !== null && posting.views !== undefined && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            <span>{posting.views} views</span>
                          </div>
                        )}
                        {posting.applications_count !== null && posting.applications_count !== undefined && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{posting.applications_count} applications</span>
                          </div>
                        )}
                      </div>

                      {posting.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Error:</strong> {posting.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Total: {postings.length} posting{postings.length !== 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground">
              Active: {postings.filter(p => p.posting_status === "posted").length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

