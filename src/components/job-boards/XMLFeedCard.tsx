"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { Rss, Copy, Check } from "lucide-react";

export default function XMLFeedCard() {
  const { organization } = useOrganization();
  const [copied, setCopied] = useState(false);

  // Determine base URL (browser-side)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const feedUrl = `${baseUrl}/api/job-boards/feed/xml${organization?.id ? `?organization_id=${organization.id}` : ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    toast.success("Feed URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Rss className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">XML Job Feed</CardTitle>
              <CardDescription className="text-sm">
                Use this XML feed URL to automatically post jobs to Indeed, Naukri, and other aggregators.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <code className="flex-1 p-2 bg-slate-100 rounded text-sm text-slate-600 truncate border">
            {feedUrl}
          </code>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "Copied" : "Copy URL"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Submit this URL to Indeed or Naukri support to have them automatically index your jobs.
        </p>
      </CardContent>
    </Card>
  );
}
