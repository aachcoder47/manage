"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidateFilterPanel } from "@/components/dashboard/candidate-filter/CandidateFilterPanel";
import { 
  Users, 
  ArrowLeft, 
  Download, 
  Eye,
  Star,
  TrendingUp,
  UserCheck,
  UserX,
  Clock
} from "lucide-react";
import { CandidateStatus, FilterCriteria } from "@/types/skill-assessment";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  email: string;
  overall_score: number | null;
  candidate_status: CandidateStatus;
  communication_score: number | null;
  response_date: string;
  skills?: string[];
  experience_years?: number;
  location?: string;
  ai_insights?: {
    match_score: number;
    strengths: string[];
    weaknesses: string[];
    risk_factors: string[];
  };
}

export default function InterviewFilterPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetchCandidates();
  }, [interviewId]);

  const fetchCandidates = async () => {
    try {
      // Fetch real responses from your database
      const response = await fetch(`/api/responses?interviewId=${interviewId}`);
      if (response.ok) {
        const data = await response.json();
        const responses = data.responses || [];
        
        // Transform real response data into candidate format
        const candidatesData = responses.map((response: any) => {
          // Extract real analytics data
          const analytics = response.analytics ? 
            (typeof response.analytics === 'string' ? JSON.parse(response.analytics) : response.analytics) : {};
          
          // Extract real details data
          const details = response.details ? 
            (typeof response.details === 'string' ? JSON.parse(response.details) : response.details) : {};
          
          // Extract skills from real transcript and answers
          const skills = extractRealSkills(response, details);
          
          // Extract experience from real data
          const experience = extractRealExperience(response, details);
          
          // Extract location from real data
          const location = extractRealLocation(response, details);
          
          return {
            id: response.id.toString(),
            name: response.name || `Candidate ${response.id}`,
            email: response.email || "No email provided",
            overall_score: analytics.overall_score || null,
            candidate_status: mapCandidateStatus(response.candidate_status),
            communication_score: analytics.communication_score || null,
            response_date: response.created_at,
            skills,
            experience_years: experience,
            location,
            // Real AI insights from evaluation details if available
            ai_insights: analytics.ai_insights || null
          };
        });
        
        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const extractRealSkills = (response: any, details: any): string[] => {
    const skills: string[] = [];
    
    // Extract from transcript if available
    if (response.transcript) {
      const text = response.transcript.toLowerCase();
      const techSkills = [
        'javascript', 'react', 'nodejs', 'python', 'java', 'typescript', 
        'aws', 'docker', 'kubernetes', 'mongodb', 'postgresql', 'mysql',
        'angular', 'vue', 'express', 'django', 'flask', 'spring', 'git',
        'ci/cd', 'devops', 'microservices', 'api', 'rest', 'graphql',
        'html', 'css', 'sass', 'webpack', 'babel', 'eslint', 'jest',
        'redis', 'elasticsearch', 'terraform', 'ansible', 'jenkins'
      ];
      
      techSkills.forEach(skill => {
        if (text.includes(skill)) skills.push(skill);
      });
    }
    
    // Extract from details.answers if available
    if (details.answers) {
      Object.values(details.answers).forEach((answer: any) => {
        if (typeof answer === 'string') {
          const text = answer.toLowerCase();
          const techSkills = [
            'javascript', 'react', 'nodejs', 'python', 'java', 'typescript', 
            'aws', 'docker', 'kubernetes', 'mongodb', 'postgresql', 'mysql'
          ];
          
          techSkills.forEach(skill => {
            if (text.includes(skill) && !skills.includes(skill)) skills.push(skill);
          });
        }
      });
    }
    
    return Array.from(new Set(skills)); // Remove duplicates
  };

  const extractRealExperience = (response: any, details: any): number | undefined => {
    // Try to extract experience from multiple sources
    const textSources = [
      response.transcript,
      details.transcript,
      JSON.stringify(details.answers || {}),
      JSON.stringify(details.questions || {})
    ].filter(Boolean);
    
    for (const source of textSources) {
      const text = source.toLowerCase();
      // Look for patterns like "5 years experience", "3+ years", etc.
      const patterns = [
        /(\d+)\+?\s*(years?|yrs?)(\s*of\s*experience)?/i,
        /(\d+)\s*-\s*(\d+)\s*(years?|yrs?)(\s*of\s*experience)?/i,
        /experience\s*:?\s*(\d+)/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          return parseInt(match[1]);
        }
      }
    }
    
    return undefined;
  };

  const extractRealLocation = (response: any, details: any): string | undefined => {
    const textSources = [
      response.transcript,
      details.transcript,
      JSON.stringify(details.answers || {})
    ].filter(Boolean);
    
    const locations = [
      'new york', 'san francisco', 'london', 'paris', 'berlin', 'tokyo',
      'remote', 'hybrid', 'onsite', 'office', 'home', 'wfh',
      'california', 'texas', 'florida', 'new york', 'washington',
      'uk', 'usa', 'europe', 'asia', 'india', 'canada', 'australia'
    ];
    
    for (const source of textSources) {
      const text = source.toLowerCase();
      for (const location of locations) {
        if (text.includes(location)) {
          return location.charAt(0).toUpperCase() + location.slice(1);
        }
      }
    }
    
    return undefined;
  };

  const mapCandidateStatus = (status: string | null): CandidateStatus => {
    if (!status) return CandidateStatus.PENDING;
    
    const statusMap: Record<string, CandidateStatus> = {
      'pending': CandidateStatus.PENDING,
      'in_review': CandidateStatus.IN_REVIEW,
      'selected': CandidateStatus.SELECTED,
      'rejected': CandidateStatus.REJECTED,
      'on_hold': CandidateStatus.ON_HOLD,
      'withdrawn': CandidateStatus.WITHDRAWN
    };
    
    return statusMap[status.toLowerCase()] || CandidateStatus.PENDING;
  };

  const handleFilter = async (criteria: FilterCriteria) => {
    setFiltering(true);
    
    try {
      // Apply client-side filtering on real data
      let filtered = [...candidates];
      
      if (criteria.minScore !== undefined) {
        filtered = filtered.filter(c => c.overall_score && c.overall_score >= criteria.minScore!);
      }
      
      if (criteria.maxScore !== undefined) {
        filtered = filtered.filter(c => c.overall_score && c.overall_score <= criteria.maxScore!);
      }
      
      if (criteria.skills && criteria.skills.length > 0) {
        filtered = filtered.filter(c => 
          Array.from(criteria.skills!).some(skill => 
            Array.from(c.skills || []).some(candidateSkill => 
              candidateSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }
      
      if (criteria.experienceYears) {
        if (criteria.experienceYears.min !== undefined) {
          filtered = filtered.filter(c => 
            c.experience_years && c.experience_years >= criteria.experienceYears!.min!
          );
        }
        if (criteria.experienceYears.max !== undefined) {
          filtered = filtered.filter(c => 
            c.experience_years && c.experience_years <= criteria.experienceYears!.max!
          );
        }
      }
      
      if (criteria.location && criteria.location.length > 0) {
        filtered = filtered.filter(c => 
          criteria.location!.some(loc => 
            c.location?.toLowerCase().includes(loc.toLowerCase())
          )
        );
      }
      
      if (criteria.status && criteria.status.length > 0) {
        filtered = filtered.filter(c => criteria.status!.includes(c.candidate_status));
      }
      
      // Generate real AI insights using your actual filter API
      if (filtered.length > 0) {
        try {
          const insightsResponse = await fetch('/api/filter-candidates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              interviewId,
              criteria,
              page: 1,
              limit: 50
            })
          });
          
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            setInsights(insightsData.insights);
            
            // Add real AI insights to candidates from your database
            if (insightsData.candidates) {
              filtered = filtered.map((candidate, index) => {
                const aiData = insightsData.candidates.find((c: any) => 
                  c.id.toString() === candidate.id
                );
                return {
                  ...candidate,
                  ai_insights: aiData?.ai_insights || candidate.ai_insights
                };
              });
            }
          } else {
            // Fallback: generate insights from real data
            const fallbackInsights = generateRealInsights(filtered, criteria);
            setInsights(fallbackInsights);
          }
        } catch (error) {
          console.error("Error fetching AI insights:", error);
          // Fallback: generate insights from real data
          const fallbackInsights = generateRealInsights(filtered, criteria);
          setInsights(fallbackInsights);
        }
      }
      
      setFilteredCandidates(filtered);
      toast.success(`Found ${filtered.length} matching candidates`);
      
    } catch (error) {
      console.error("Error filtering candidates:", error);
      toast.error("Failed to filter candidates");
    } finally {
      setFiltering(false);
    }
  };

  const generateRealInsights = (filteredCandidates: Candidate[], criteria: FilterCriteria) => {
    const totalCandidates = filteredCandidates.length;
    const scoredCandidates = filteredCandidates.filter(c => c.overall_score !== null);
    
    // Calculate real metrics from actual data
    const averageScore = scoredCandidates.length > 0 
      ? Math.round(scoredCandidates.reduce((sum, c) => sum + c.overall_score!, 0) / scoredCandidates.length)
      : 0;
    
    const topCandidates = scoredCandidates.filter(c => c.overall_score! >= 80).length;
    const recommendationScore = averageScore >= 70 ? Math.min(95, averageScore + 10) : Math.max(40, averageScore - 10);
    
    // Generate real recommendations based on actual data
    const recommendations = [];
    
    if (averageScore < 50) {
      recommendations.push("Consider adjusting filter criteria - average scores are very low");
    }
    
    if (criteria.minScore && averageScore < criteria.minScore + 10) {
      recommendations.push(`Lower minimum score to ${Math.max(0, (criteria.minScore || 0) - 10)} to include more candidates`);
    }
    
    if (criteria.skills && criteria.skills.length > 0) {
      const skillMatchRate = filteredCandidates.filter(c => 
        c.skills && c.skills.some(skill => criteria.skills!.includes(skill))
      ).length / totalCandidates;
      
      if (skillMatchRate < 0.3) {
        recommendations.push("Consider adding alternative skill keywords or removing skill filters");
      }
    }
    
    if (totalCandidates < 5) {
      recommendations.push("Broaden search criteria to find more candidates");
    } else if (totalCandidates > 50) {
      recommendations.push("Consider adding more specific filters to narrow down results");
    }
    
    // Find most common skills
    const skillFrequency: Record<string, number> = {};
    filteredCandidates.forEach(candidate => {
      candidate.skills?.forEach(skill => {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
      });
    });
    
    const topSkills = Object.entries(skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([skill]) => skill);
    
    return {
      averageScore,
      topCandidates,
      recommendationScore,
      recommendations,
      topSkills,
      totalCandidates,
      skillDistribution: skillFrequency
    };
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch('/api/export-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          format,
          criteria: {}
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `candidates_${interviewId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Candidates exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Error exporting candidates:", error);
      toast.error("Failed to export candidates");
    }
  };

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.SELECTED: return "bg-green-100 text-green-800";
      case CandidateStatus.REJECTED: return "bg-red-100 text-red-800";
      case CandidateStatus.IN_REVIEW: return "bg-blue-100 text-blue-800";
      case CandidateStatus.ON_HOLD: return "bg-orange-100 text-orange-800";
      case CandidateStatus.WITHDRAWN: return "bg-gray-100 text-gray-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.SELECTED: return <UserCheck className="h-3 w-3" />;
      case CandidateStatus.REJECTED: return <UserX className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Candidate Filtering</h1>
            <p className="text-muted-foreground">AI-powered candidate matching and insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            {showFilterPanel ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.averageScore || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {insights.topCandidates || 0}
                </div>
                <div className="text-sm text-muted-foreground">Top Candidates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {insights.recommendationScore || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Match Quality</div>
              </div>
            </div>
            
            {insights.recommendations && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">AI Recommendations:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {insights.recommendations.map((rec: string, index: number) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="lg:col-span-1">
            <CandidateFilterPanel
              onFilter={handleFilter}
              onExport={handleExport}
              loading={filtering}
            />
          </div>
        )}

        {/* Results */}
        <div className={`${showFilterPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Filtered Candidates ({filteredCandidates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No candidates found</p>
                  <p className="text-sm">Try adjusting your filter criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{candidate.name}</h3>
                              <Badge className={getStatusColor(candidate.candidate_status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(candidate.candidate_status)}
                                  {candidate.candidate_status.replace('_', ' ')}
                                </div>
                              </Badge>
                              {candidate.ai_insights && (
                                <Badge variant="outline" className="text-purple-600">
                                  <Star className="h-3 w-3 mr-1" />
                                  {candidate.ai_insights.match_score}% Match
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-2">
                              {candidate.email}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              {candidate.overall_score !== null && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Score:</span>
                                  <span className={candidate.overall_score >= 70 ? "text-green-600" : "text-orange-600"}>
                                    {candidate.overall_score}%
                                  </span>
                                </div>
                              )}
                              
                              {candidate.communication_score !== null && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Communication:</span>
                                  <span>{candidate.communication_score}%</span>
                                </div>
                              )}
                              
                              {candidate.experience_years && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Experience:</span>
                                  <span>{candidate.experience_years} years</span>
                                </div>
                              )}
                              
                              {candidate.location && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Location:</span>
                                  <span>{candidate.location}</span>
                                </div>
                              )}
                            </div>
                            
                            {candidate.skills && candidate.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {candidate.skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {candidate.ai_insights && (
                              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                <div className="text-sm">
                                  <div className="font-medium text-purple-900 mb-1">AI Insights:</div>
                                  {candidate.ai_insights.strengths.length > 0 && (
                                    <div className="text-xs text-green-700 mb-1">
                                      <strong>Strengths:</strong> {candidate.ai_insights.strengths.join(', ')}
                                    </div>
                                  )}
                                  {candidate.ai_insights.weaknesses.length > 0 && (
                                    <div className="text-xs text-orange-700 mb-1">
                                      <strong>Areas to improve:</strong> {candidate.ai_insights.weaknesses.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
