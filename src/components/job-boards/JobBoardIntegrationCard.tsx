"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

interface JobBoardIntegration {
  id: string;
  platform: "linkedin" | "indeed" | "naukri" | "other";
  status: "connected" | "disconnected" | "expired" | "error";
  platform_name: string | null;
  platform_email: string | null;
  is_active: boolean;
  last_error: string | null;
}

interface JobBoardIntegrationCardProps {
  platform: "linkedin" | "indeed" | "naukri";
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function JobBoardIntegrationCard({
  platform,
  title,
  description,
  icon,
}: JobBoardIntegrationCardProps) {
  const { organization } = useOrganization();
  const [integration, setIntegration] = useState<JobBoardIntegration | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, [organization]);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(
        `/api/job-boards/integrations?organization_id=${organization?.id || ""}`
      );
      if (response.ok) {
        const data = await response.json();
        const found = data.integrations?.find(
          (i: JobBoardIntegration) => i.platform === platform && i.is_active
        );
        setIntegration(found || null);
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Use environment variable redirect URI, or construct from current origin
      // The callback path is generic per platform: /api/job-boards/${platform}/callback
      const redirectUri = process.env[`${platform.toUpperCase()}_REDIRECT_URI`] || 
                          `${window.location.origin}/api/job-boards/${platform}/callback`;
      
      window.location.href = `/api/job-boards/${platform}/connect?organization_id=${organization?.id || ""}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to initiate connection");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integration) return;

    setLoading(true);
    try {
      // We essentially just delete the integration record
      const endpoint = `/api/job-boards/integrations?integration_id=${integration.id}`;
      
      const response = await fetch(
        endpoint,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success(`${title} disconnected successfully`);
        setIntegration(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to disconnect");
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  const isConnected = integration?.status === "connected" && integration.is_active;

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">{icon}</div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
              </div>
            </div>
            {isConnected && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-3">
              {integration.platform_name && (
                <p className="text-sm text-muted-foreground">
                  Connected as: <span className="font-medium">{integration.platform_name}</span>
                </p>
              )}
              {integration.status === "error" && integration.last_error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <XCircle className="w-4 h-4 inline mr-1" />
                  {integration.last_error}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect {title}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}

