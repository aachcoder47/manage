"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Brain,
  ArrowLeft,
  Eye,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface CandidateAssessment {
  id: string;
  candidate_name: string;
  assessment_title: string;
  score: number;
  passed: boolean;
  submitted_at: string;
  evaluation_details?: any;
  assessment_type: string;
  difficulty_level: string;
}

export default function AssessmentAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { interviewId } = params as { interviewId: string };

  const [candidates, setCandidates] = useState<CandidateAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAssessment | null>(null);

  const fetchCandidateAssessments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all responses for the interview
      const responsesResponse = await fetch(`/api/responses?interviewId=${interviewId}`);
      if (!responsesResponse.ok) throw new Error('Failed to fetch responses');
      
      const responsesData = await responsesResponse.json();
      const responses = responsesData.responses || [];
      
      if (responses.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      console.log(`📊 Found ${responses.length} responses for interview`);

      // Get all candidate assessments for this interview
      const allAssessments: CandidateAssessment[] = [];
      
      for (const response of responses) {
        try {
          console.log(`🔍 Checking assessments for response ${response.id}`);
          
          // Get assessments for this response using the correct API endpoint
          const assessmentsResponse = await fetch(`/api/candidate-assessments?responseId=${response.id}`);
          if (assessmentsResponse.ok) {
            const assessmentsData = await assessmentsResponse.json();
            const assessments = assessmentsData.assessments || [];
            
            console.log(`📋 Found ${assessments.length} assessments for response ${response.id}`);
            
            assessments.forEach((assessment: any) => {
              // Check if assessment has evaluation details (was submitted and evaluated)
              if (assessment.evaluation_details && assessment.score !== null) {
                allAssessments.push({
                  id: assessment.id,
                  candidate_name: response.details?.name || `Candidate ${response.id}`,
                  assessment_title: assessment.skill_assessment?.title || 'Unknown Assessment',
                  score: assessment.score || 0,
                  passed: assessment.passed || false,
                  submitted_at: assessment.completed_at || assessment.created_at,
                  evaluation_details: assessment.evaluation_details,
                  assessment_type: assessment.skill_assessment?.assessment_type || 'unknown',
                  difficulty_level: assessment.skill_assessment?.difficulty_level || 'intermediate'
                });
                
                console.log(`✅ Added assessment result: ${assessment.score}% for ${response.details?.name || 'Candidate ' + response.id}`);
              }
            });
          } else {
            console.error(`❌ Failed to fetch assessments for response ${response.id}:`, assessmentsResponse.status);
          }
        } catch (error) {
          console.error(`Error fetching assessments for response ${response.id}:`, error);
        }
      }
      
      // Sort by submission date (newest first)
      allAssessments.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      
      console.log(`📊 Total assessment results found: ${allAssessments.length}`);
      setCandidates(allAssessments);
    } catch (error) {
      console.error('Error fetching candidate assessments:', error);
      toast.error('Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchCandidateAssessments();
  }, [fetchCandidateAssessments]);

  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return 'text-green-600 bg-green-100';
    }
    if (score >= 60) {
      return 'text-yellow-600 bg-yellow-100';
    }
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    if (candidates.length === 0) return { total: 0, passed: 0, failed: 0, avgScore: 0 };
    
    const passed = candidates.filter(c => c.passed).length;
    const failed = candidates.length - passed;
    const avgScore = Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length);
    
    return { total: candidates.length, passed, failed, avgScore };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assessment Analytics</h1>
            <p className="text-muted-foreground">View candidate performance and results</p>
          </div>
          <Button onClick={() => fetchCandidateAssessments()}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.passed}</div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidate Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Assessment Results Yet</h3>
              <p className="text-muted-foreground">
                Candidates haven&apos;t taken any assessments yet. Share the assessment link to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{candidate.candidate_name}</h3>
                        <Badge className={getDifficultyColor(candidate.difficulty_level)}>
                          {candidate.difficulty_level}
                        </Badge>
                        <Badge variant="outline">
                          {candidate.assessment_type}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-2">{candidate.assessment_title}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(candidate.submitted_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {candidate.score}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getScoreColor(candidate.score)}>
                        {candidate.passed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            PASSED
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            FAILED
                          </>
                        )}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedCandidate.candidate_name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCandidate(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assessment</label>
                    <p className="font-semibold">{selectedCandidate.assessment_title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Score</label>
                    <p className="font-semibold">{selectedCandidate.score}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="font-semibold">{selectedCandidate.passed ? 'PASSED' : 'FAILED'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                    <p className="font-semibold">{new Date(selectedCandidate.submitted_at).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedCandidate.evaluation_details && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">AI Feedback</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(selectedCandidate.evaluation_details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
