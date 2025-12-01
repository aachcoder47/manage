"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Award,
  AlertCircle,
  BarChart3,
  ArrowLeft,
  UserCheck,
  UserX,
  Mail,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { CandidateStatus } from "@/types/skill-assessment";

interface Candidate {
  id: number;
  name: string;
  email: string;
  status: string;
  interviewScore?: number;
  assessmentScore?: number;
  assessmentPassed?: boolean;
  overallScore?: number;
  recommendation?: 'hire' | 'consider' | 'reject';
  submittedAt?: string;
  assessmentCompletedAt?: string;
  interviewCompletedAt?: string;
}

interface HiringStats {
  totalCandidates: number;
  interviewCompleted: number;
  assessmentCompleted: number;
  bothCompleted: number;
  passedAssessment: number;
  recommendedForHire: number;
  averageInterviewScore: number;
  averageAssessmentScore: number;
}

export default function HiringOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<HiringStats>({
    totalCandidates: 0,
    interviewCompleted: 0,
    assessmentCompleted: 0,
    bothCompleted: 0,
    passedAssessment: 0,
    recommendedForHire: 0,
    averageInterviewScore: 0,
    averageAssessmentScore: 0
  });
  const [loading, setLoading] = useState(true);



  const handleCandidateAction = async (candidateId: number, action: 'hire' | 'consider' | 'reject') => {
    try {
      // Map actions to CandidateStatus enum values
      const statusMap = {
        'hire': CandidateStatus.SELECTED,
        'consider': CandidateStatus.ON_HOLD, // Use ON_HOLD for "consider" 
        'reject': CandidateStatus.REJECTED
      };

      const response = await fetch('/api/candidate-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseId: candidateId,
          newStatus: statusMap[action],
          reason: `Candidate ${action}ed via hiring overview`,
          requestedBy: 'hiring_manager'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setCandidates(prev => prev.map(c => 
          c.id === candidateId 
            ? { ...c, status: statusMap[action], recommendation: action }
            : c
        ));
        
        toast.success(`Candidate ${action === 'hire' ? 'hired' : action === 'consider' ? 'marked as on hold' : 'rejected'} successfully!`);
        
        // Refresh data to get updated stats
        fetchHiringData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update candidate status');
      }
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update candidate status');
    }
  };

  const fetchHiringData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all responses (interview candidates)
      const responsesResponse = await fetch(`/api/responses?interviewId=${interviewId}`);
      if (!responsesResponse.ok) {
        throw new Error('Failed to fetch responses');
      }
      
      const responsesData = await responsesResponse.json();
      const responses = responsesData.responses || [];

      console.log(`📊 Found ${responses.length} interview responses`);

      // Get all candidate assessments
      const allCandidates: Candidate[] = [];
      
      for (const response of responses) {
        const candidate: Candidate = {
          id: response.id,
          name: response.details?.name || `Candidate ${response.id}`,
          email: response.details?.email || 'No email',
          status: response.status || 'No Status',
          interviewScore: response.score || 0,
          submittedAt: response.created_at,
          interviewCompletedAt: response.updated_at || response.created_at
        };

        // Get assessment data for this candidate
        try {
          const assessmentsResponse = await fetch(`/api/candidate-assessments?responseId=${response.id}`);
          if (assessmentsResponse.ok) {
            const assessmentsData = await assessmentsResponse.json();
            const assessments = assessmentsData.assessments || [];
            
            // Find completed assessments
            const completedAssessments = assessments.filter((assessment: any) => 
              assessment.evaluation_details && assessment.score !== null
            );

            if (completedAssessments.length > 0) {
              // Get the latest assessment
              const latestAssessment = completedAssessments[0];
              
              candidate.assessmentScore = latestAssessment.score || 0;
              candidate.assessmentPassed = latestAssessment.passed || false;
              candidate.assessmentCompletedAt = latestAssessment.completed_at || latestAssessment.created_at;
              
              // Calculate overall score (70% assessment, 30% interview)
              const assessmentWeight = 0.7;
              const interviewWeight = 0.3;
              
              candidate.overallScore = Math.round(
                ((candidate.assessmentScore ?? 0) * assessmentWeight) + 
                ((candidate.interviewScore ?? 0) * interviewWeight)
              );
              
              // Make recommendation based on overall performance
              if (candidate.assessmentPassed && candidate.overallScore >= 80) {
                candidate.recommendation = 'hire';
              } else if (candidate.assessmentPassed && candidate.overallScore >= 60) {
                candidate.recommendation = 'consider';
              } else {
                candidate.recommendation = 'reject';
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching assessments for candidate ${response.id}:`, error);
        }
        
        allCandidates.push(candidate);
      }

      // Sort by overall score (highest first)
      allCandidates.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
      
      console.log(`📊 Processed ${allCandidates.length} candidates`);
      setCandidates(allCandidates);

      // Calculate statistics
      const newStats: HiringStats = {
        totalCandidates: allCandidates.length,
        interviewCompleted: allCandidates.filter(c => c.interviewScore && c.interviewScore > 0).length,
        assessmentCompleted: allCandidates.filter(c => c.assessmentScore !== undefined).length,
        bothCompleted: allCandidates.filter(c => 
          c.interviewScore && c.interviewScore > 0 && c.assessmentScore !== undefined
        ).length,
        passedAssessment: allCandidates.filter(c => c.assessmentPassed).length,
        recommendedForHire: allCandidates.filter(c => c.recommendation === 'hire').length,
        averageInterviewScore: Math.round(
          allCandidates.filter(c => c.interviewScore && c.interviewScore > 0)
            .reduce((sum, c) => sum + (c.interviewScore || 0), 0) / 
          allCandidates.filter(c => c.interviewScore && c.interviewScore > 0).length || 0
        ),
        averageAssessmentScore: Math.round(
          allCandidates.filter(c => c.assessmentScore !== undefined)
            .reduce((sum, c) => sum + (c.assessmentScore || 0), 0) / 
          allCandidates.filter(c => c.assessmentScore !== undefined).length || 0
        )
      };

      setStats(newStats);
      console.log('📈 Hiring stats calculated:', newStats);

    } catch (error) {
      console.error('Error fetching hiring data:', error);
      toast.error('Failed to load hiring overview');
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchHiringData();
  }, [fetchHiringData]);

  const getRecommendationIcon = (recommendation?: string) => {
    switch (recommendation) {
      case 'hire':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'consider':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'reject':
        return <UserX className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRecommendationColor = (recommendation?: string) => {
    switch (recommendation) {
      case 'hire':
        return 'bg-green-100 text-green-800';
      case 'consider':
        return 'bg-yellow-100 text-yellow-800';
      case 'reject':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'selected':
        return 'bg-green-100 text-green-800';
      case 'potential':
        return 'bg-yellow-100 text-yellow-800';
      case 'not selected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Interview
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Hiring Overview
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete analysis of interview and assessment performance
            </p>
          </div>
          <Button variant="outline" onClick={fetchHiringData}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.bothCompleted}</div>
            <p className="text-sm text-muted-foreground">Completed Both</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{stats.passedAssessment}</div>
            <p className="text-sm text-muted-foreground">Passed Assessment</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.recommendedForHire}</div>
            <p className="text-sm text-muted-foreground">Recommended for Hire</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Average Interview Score</span>
              <span className="font-semibold">{stats.averageInterviewScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Average Assessment Score</span>
              <span className="font-semibold">{stats.averageAssessmentScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Interview Completion Rate</span>
              <span className="font-semibold">
                {Math.round((stats.interviewCompleted / stats.totalCandidates) * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Assessment Completion Rate</span>
              <span className="font-semibold">
                {Math.round((stats.assessmentCompleted / stats.totalCandidates) * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Assessment Pass Rate</span>
              <span className="font-semibold">
                {stats.assessmentCompleted > 0 
                  ? Math.round((stats.passedAssessment / stats.assessmentCompleted) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Total Candidates</span>
                <span className="font-semibold">{stats.totalCandidates}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Completed Assessment</span>
                <span className="font-semibold">{stats.assessmentCompleted}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(stats.assessmentCompleted / stats.totalCandidates) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Passed Assessment</span>
                <span className="font-semibold">{stats.passedAssessment}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(stats.passedAssessment / stats.totalCandidates) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Recommended for Hire</span>
                <span className="font-semibold">{stats.recommendedForHire}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(stats.recommendedForHire / stats.totalCandidates) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Details</CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Candidates Yet</h3>
              <p className="text-muted-foreground">
                Candidates will appear here once they complete interviews or assessments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{candidate.name}</h3>
                        <Badge className={getStatusColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                        <Badge className={getRecommendationColor(candidate.recommendation)}>
                          {getRecommendationIcon(candidate.recommendation)}
                          <span className="ml-1">
                            {candidate.recommendation ? candidate.recommendation.toUpperCase() : 'PENDING'}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {candidate.email}
                        </div>
                        {candidate.interviewCompletedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Interview: {new Date(candidate.interviewCompletedAt).toLocaleDateString()}
                          </div>
                        )}
                        {candidate.assessmentCompletedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Assessment: {new Date(candidate.assessmentCompletedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">
                            {candidate.interviewScore || 0}%
                          </div>
                          <p className="text-xs text-muted-foreground">Interview Score</p>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-green-600">
                            {candidate.assessmentScore || 0}%
                          </div>
                          <p className="text-xs text-muted-foreground">Assessment Score</p>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-purple-600">
                            {candidate.overallScore || 0}%
                          </div>
                          <p className="text-xs text-muted-foreground">Overall Score</p>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold">
                            {candidate.assessmentPassed ? (
                              <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600 mx-auto" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">Assessment Status</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCandidateAction(candidate.id, 'hire')}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Hire
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCandidateAction(candidate.id, 'consider')}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Consider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleCandidateAction(candidate.id, 'reject')}
                        >
                          <UserX className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
