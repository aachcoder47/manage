// components/NaukriIntegration.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Briefcase, 
    Check, 
    AlertCircle, 
    Clock, 
    Eye, 
    Users, 
    Loader2, 
    ExternalLink,
    Globe,
    TrendingUp,
    Target,
    Zap,
    RefreshCw,
    Plus,
    Trash2
} from 'lucide-react';

interface NaukriIntegrationProps {
  userId: string;
  onJobPosted?: (result: any) => void;
}

interface NaukriIntegration {
  id: string;
  user_id: string;
  platform: string;
  status: string;
  api_key: string;
  created_at: string;
}

interface NaukriJob {
  id: string;
  title: string;
  location: string;
  views: number;
  applications: number;
  posted_at: string;
  external_job_url: string;
}

const NaukriIntegration = ({ userId, onJobPosted }: NaukriIntegrationProps) => {
  const [integration, setIntegration] = useState<NaukriIntegration | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<NaukriJob[]>([]);
  const [stats, setStats] = useState({ posted: 0, views: 0, applications: 0 });

  useEffect(() => {
    fetchNaukriIntegration();
  }, [userId]);

  const fetchNaukriIntegration = async () => {
    try {
      const response = await fetch(`/api/job-boards/naukri/integrations?user_id=${userId}`);
      const data = await response.json();
      setIntegration(data);
    } catch (error) {
      console.error('Failed to fetch Naukri integration:', error);
    }
  };

  const handleConnectNaukri = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/job-boards/naukri/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect to Naukri:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectNaukri = async () => {
    try {
      await fetch(`/api/job-boards/naukri/integrations/${userId}`, {
        method: 'DELETE'
      });
      
      setIntegration(null);
      setJobs([]);
      setStats({ posted: 0, views: 0, applications: 0 });
    } catch (error) {
      console.error('Failed to disconnect Naukri:', error);
    }
  };

  const handleRefreshJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/job-boards/naukri/jobs?user_id=${userId}`);
      const data = await response.json();
      setJobs(data.jobs || []);
      setStats(data.stats || { posted: 0, views: 0, applications: 0 });
    } catch (error) {
      console.error('Failed to fetch Naukri jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobUrl: string) => {
    window.open(jobUrl, '_blank');
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job from Naukri?')) {
      try {
        await fetch(`/api/job-boards/naukri/jobs/${jobId}`, {
          method: 'DELETE'
        });
        
        setJobs(prev => prev.filter(job => job.id !== jobId));
        setStats(prev => ({
          ...prev,
          posted: prev.posted - 1
        }));
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
  };

  const platforms = [
    { 
      id: 'naukri', 
      name: 'Naukri', 
      icon: Briefcase, 
      color: 'green',
      description: 'Post jobs to Naukri and reach millions of job seekers',
      status: integration?.status || 'disconnected'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-green-600 mt-1" />
          Naukri Integration
          {integration && (
            <Badge className="bg-green-600 text-white">
              <Check className="w-3 h-3" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`p-4 rounded-lg border-2 ${
          integration 
            ? 'border-green-200 bg-green-50' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {integration ? 'Naukri Account Connected' : 'Connect Naukri Account'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {integration 
                  ? 'Post jobs to Naukri and redirect candidates to your platform' 
                  : 'Connect your Naukri account to start posting jobs automatically'
                }
              </p>
            </div>
            {integration ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectNaukri}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleConnectNaukri}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Connect Naukri
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>

        {integration && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.posted}</p>
                    <p className="text-sm text-gray-600">Jobs Posted</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.views}</p>
                    <p className="text-sm text-gray-600">Total Views</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.applications}</p>
                    <p className="text-sm text-gray-600">Applications</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Posted Jobs</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshJobs}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No jobs posted to Naukri yet</p>
                  <p className="text-sm">Create a job and select Naukri as posting platform</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.location}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>👁️ {job.views || 0} views</span>
                            <span>📝 {job.applications || 0} applications</span>
                            <span>📅 {new Date(job.posted_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewJob(job.external_job_url)}
                          >
                            <ExternalLink className="w-4 h-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Naukri Integration Features
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Automatic job posting to Naukri.com</li>
            <li>• All candidates redirect to your platform</li>
            <li>• Real-time job status tracking</li>
            <li>• View counts and application metrics</li>
            <li>• Job editing and deletion support</li>
            <li>• India&apos;s largest job portal reach</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NaukriIntegration;
