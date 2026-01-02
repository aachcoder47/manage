// src/components/applications/JobApplicationsList.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase
} from 'lucide-react';
import { JobApplicationsService } from '@/services/job-applications.service';
import ApplicationCard from './ApplicationCard';

interface JobApplicationsListProps {
  jobId?: string;
  organizationId?: string;
}

const JobApplicationsList = ({ jobId, organizationId }: JobApplicationsListProps) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
  });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let fetchedApplications;
      
      if (jobId) {
        fetchedApplications = await JobApplicationsService.getJobApplications(jobId);
      } else if (organizationId) {
        fetchedApplications = await JobApplicationsService.getOrganizationApplications(organizationId);
      } else {
        fetchedApplications = await JobApplicationsService.searchApplications({});
      }

      setApplications(fetchedApplications);

      // Calculate stats
      const applicationStats = await JobApplicationsService.getApplicationStats(jobId, organizationId);
      setStats(applicationStats);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, organizationId]);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await JobApplicationsService.updateApplicationStatus(
        applicationId,
        newStatus as 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
      );
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  const handleViewDetails = (applicationId: string) => {
    // Navigate to application details page or open modal
    console.log('View details for application:', applicationId);
  };

  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch = searchTerm === '' || 
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.application_status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || app.platform === platformFilter;

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.reviewing}</p>
                <p className="text-sm text-gray-600">Reviewing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.shortlisted}</p>
                <p className="text-sm text-gray-600">Shortlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.hired}</p>
                <p className="text-sm text-gray-600">Hired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Job Applications ({filteredApplications.length})</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApplications}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="indeed">Indeed</SelectItem>
                <SelectItem value="naukri">Naukri</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || platformFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start receiving applications to see them here'}
              </p>
              {!searchTerm && statusFilter === 'all' && platformFilter === 'all' && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Find Jobs
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application: any) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobApplicationsList;
