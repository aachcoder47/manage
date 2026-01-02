// src/components/applications/ApplicationCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Linkedin, 
  FileText, 
  MessageSquare,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';
import { JobApplication } from '@/services/job-applications.service';

interface ApplicationCardProps {
  application: JobApplication;
  onStatusUpdate: (applicationId: string, status: string) => void;
  onViewDetails: (applicationId: string) => void;
}

const ApplicationCard = ({ application, onStatusUpdate, onViewDetails }: ApplicationCardProps) => {
  const [updating, setUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'indeed':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'naukri':
        return <FileText className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await onStatusUpdate(application.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={application.applicant_linkedin} />
              <AvatarFallback>
                {application.applicant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {application.applicant_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                {getPlatformIcon(application.platform)}
                <span className="capitalize">{application.platform}</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{new Date(application.applied_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(application.application_status)}>
            {application.application_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{application.applicant_email}</span>
            </div>
            {application.applicant_phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{application.applicant_phone}</span>
              </div>
            )}
          </div>

          {/* Cover Letter Preview */}
          {application.cover_letter && (
            <div className="text-sm text-gray-600">
              <p className="line-clamp-2">{application.cover_letter}</p>
            </div>
          )}

          {/* Resume Link */}
          {application.resume_url && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(application.resume_url, '_blank')}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Resume
              </Button>
            </div>
          )}

          {/* LinkedIn Profile */}
          {application.applicant_linkedin && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(application.applicant_linkedin, '_blank')}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn Profile
              </Button>
            </div>
          )}

          {/* Status Update */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Status:</span>
            <div className="flex gap-1">
              {application.application_status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('reviewing')}
                  disabled={updating}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Start Review
                </Button>
              )}
              {application.application_status === 'reviewing' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('shortlisted')}
                    disabled={updating}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={updating}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                </>
              )}
              {application.application_status === 'shortlisted' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('hired')}
                    disabled={updating}
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    Hire
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={updating}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(application.id)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`mailto:${application.applicant_email}`, '_blank')}
                className="text-gray-600 border-gray-600 hover:bg-gray-50"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              {application.applicant_phone && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`tel:${application.applicant_phone}`, '_blank')}
                  className="text-gray-600 border-gray-600 hover:bg-gray-50"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;
