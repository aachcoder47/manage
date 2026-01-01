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
  
  // Dialog state
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [extraId, setExtraId] = useState(""); // publisherId or companyId

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
    if (platform === "linkedin") {
      setConnecting(true);
      try {
        // Use environment variable redirect URI, or construct from current origin
        const redirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || `${window.location.origin}/api/job-boards/linkedin/callback`;
        window.location.href = `/api/job-boards/linkedin/connect?organization_id=${organization?.id || ""}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      } catch (error) {
        console.error("Connection error:", error);
        toast.error("Failed to initiate connection");
        setConnecting(false);
      }
    } else {
      // Open API Key Dialog for Indeed/Naukri
      setShowApiKeyDialog(true);
    }
  };

  const handleSubmitApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    
    try {
      const endpoint = `/api/job-boards/${platform}/api-key`;
      const payload: any = { apiKey, apiSecret };
      
      if (platform === "indeed") {
        payload.publisherId = extraId;
      } else if (platform === "naukri") {
        payload.companyId = extraId;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`Connected to ${title} successfully`);
        setShowApiKeyDialog(false);
        fetchIntegrations(); // Refresh status
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to connect");
      }
    } catch (error) {
      console.error("API Key connection error:", error);
      toast.error("Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integration) return;

    setLoading(true);
    try {
      let endpoint = `/api/job-boards/integrations?integration_id=${integration.id}`;
      // For API Key integrations, we might need a specific delete endpoint if the integration record is not enough
      // But typically check if we need to delete the key specifically.
      // The API route for integrations DELETE usually handles this, or we call the specific platform DELETE.
      
      // Based on the route files we saw earlier:
      // indeed/api-key/route.ts has a DELETE
      // naukri/api-key/route.ts has a DELETE
      
      if (platform === "indeed" || platform === "naukri") {
          endpoint = `/api/job-boards/${platform}/api-key`;
      }

      const response = await fetch(
        endpoint,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success(`${title} disconnected successfully`);
        setIntegration(null);
      } else {
        const error = await response.json();
        // Fallback for integrations endpoint if specific endpoint failed or logic differs
        // If it was the integrations endpoint, stick with it. 
        // But for API keys, we observed specific delete routes. 
        // Let's retry with generic integrations endpoint if specific failed? 
        // Actually, let's keep it simple. If it's indeed/naukri, use their route.
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
              {/* For API Key integrations, we likely don't have email/name from the key itself unless we fetch it */}
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

      {/* API Key Dialog */}
      {(platform === "indeed" || platform === "naukri") && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${showApiKeyDialog ? 'flex' : 'hidden'}`}>
           <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Connect {title}</h3>
                <button onClick={() => setShowApiKeyDialog(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="w-5 h-5" />
                </button>
             </div>
             <form onSubmit={handleSubmitApiKey} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <input 
                    type="password" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={`Enter ${title} API Key`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Secret</label>
                  <input 
                    type="password" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={`Enter ${title} API Secret`}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {platform === "indeed" ? "Publisher ID" : "Company ID"}
                  </label>
                  <input 
                    type="text" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={`Enter ${platform === "indeed" ? "Publisher ID" : "Company ID"}`}
                    value={extraId}
                    onChange={(e) => setExtraId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {platform === "indeed" ? (
                      <>
                        Find API Key in <a href="https://secure.indeed.com/publisher" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Indeed Publisher Dashboard</a>
                      </>
                    ) : (
                      <>
                         Find details in <a href="https://recruit.naukri.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Naukri Recruiter Portal</a> (Corporate)
                      </>
                    )}
                  </p>
                </div>
                <div className="flex justify-end pt-4 gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowApiKeyDialog(false)}>Cancel</Button>
                  <Button type="submit" disabled={connecting}>
                    {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                  </Button>
                </div>
             </form>
           </div>
        </div>
      )}
    </>
  );
}

