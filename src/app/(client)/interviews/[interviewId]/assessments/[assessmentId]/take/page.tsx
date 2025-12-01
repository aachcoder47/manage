"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle, 
  Trophy, 
  Brain,
  ArrowLeft,
  BarChart3,
  Code,
  MessageSquare,
  Play,
  Save
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  question: string;
  type: 'coding' | 'technical' | 'behavioral';
  expected_answer: string;
  points: number;
  time_minutes: number;
  starter_code?: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  assessment_type: string;
  difficulty_level: string;
  time_limit: number;
  passing_score: number;
  challenges?: Question[];
}

interface Submission {
  startTime: string;
  answers: Record<string, any>;
  codeSubmissions: Record<string, string>;
}

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { interviewId, assessmentId } = params as { interviewId: string; assessmentId: string };

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submission, setSubmission] = useState<Submission>({
    startTime: '',
    answers: {},
    codeSubmissions: {}
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: ''
  });
  const [showCandidateForm, setShowCandidateForm] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (started && !submitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [started, submitted, timeLeft, handleSubmit]);

  const fetchAssessment = useCallback(async () => {
    try {
      const apiResponse = await fetch(`/api/conduct-assessment?assessmentId=${assessmentId}&responseId=preview`);
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        
        // For preview mode, just load assessment without checking attempts
        const assessmentWithChallenges = {
          ...data.assessment,
          challenges: data.challenges || []
        };
        setAssessment(assessmentWithChallenges);
        setTimeLeft(data.assessment.time_limit * 60);
        console.log('📋 Assessment loaded:', assessmentWithChallenges);
        console.log('❓ Challenges found:', data.challenges?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const getOrCreateResponse = async (interviewId: string) => {
    try {
      // Try to get existing responses
      const responsesResponse = await fetch(`/api/responses?interviewId=${interviewId}`);
      if (responsesResponse.ok) {
        const data = await responsesResponse.json();
        if (data.responses && data.responses.length > 0) {
          return data.responses[0]; // Return first existing response
        }
      }

      // Create new response if none exists
      const createResponse = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          candidateData: { 
            name: candidateInfo.name,
            email: candidateInfo.email,
            source: 'assessment_taking'
          },
          analytics: {}
        })
      });

      if (createResponse.ok) {
        const newData = await createResponse.json();
        return newData.response;
      }
    } catch (error) {
      console.error("Error getting/creating response:", error);
    }
    return null;
  };

  const handleStart = () => {
    setShowCandidateForm(true);
  };

  const handleCandidateSubmit = async () => {
    // Validate form
    if (!candidateInfo.name.trim() || !candidateInfo.email.trim()) {
      toast.error("Please enter both name and email");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateInfo.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check for duplicate name/email
    try {
      const responsesResponse = await fetch(`/api/responses?interviewId=${interviewId}`);
      if (responsesResponse.ok) {
        const data = await responsesResponse.json();
        const existingResponses = data.responses || [];
        
        const duplicate = existingResponses.find((response: any) => 
          response.details?.name?.toLowerCase() === candidateInfo.name.toLowerCase() ||
          response.details?.email?.toLowerCase() === candidateInfo.email.toLowerCase()
        );

        if (duplicate) {
          toast.error("This name or email has already been used for this assessment. Please use different credentials.");
          return;
        }
      }
    } catch (error) {
      console.error("Error checking for duplicates:", error);
    }

    // Create response and check for existing attempts
    try {
      let response = await getOrCreateResponse(interviewId);
      if (response) {
        setResponseId(response.id.toString());

        // Check if this assessment has already been attempted by this response
        const attemptResponse = await fetch(`/api/conduct-assessment?assessmentId=${assessmentId}&responseId=${response.id}`);
        if (attemptResponse.ok) {
          const attemptData = await attemptResponse.json();
          
          if (attemptData.hasAttempted) {
            setResults(attemptData.assessment);
            setSubmitted(true);
            setShowCandidateForm(false);
            toast.info("You have already taken this assessment. Only one attempt is allowed.");
            return;
          }
        }
      }
    } catch (error) {
      console.error("Error setting up assessment:", error);
      toast.error("Failed to set up assessment");
      return;
    }

    // Proceed with assessment
    setStarted(true);
    setShowCandidateForm(false);
    setSubmission({
      startTime: new Date().toISOString(),
      answers: {},
      codeSubmissions: {}
    });
    toast.success("Assessment started! Good luck!");
  };

  const handleSubmit = useCallback(async () => {
    if (!assessment || !responseId) {
      return;
    }

    // Log current submission state before submitting
    console.log('🔍 Current submission state:', {
      submission,
      codeSubmissionsCount: Object.keys(submission.codeSubmissions).length,
      answersCount: Object.keys(submission.answers).length,
      currentQuestion,
      totalQuestions: questions.length
    });

    // Check if there's any actual submission data
    const hasCodeSubmission = Object.keys(submission.codeSubmissions).length > 0 && 
      Object.values(submission.codeSubmissions).some(code => code && code.trim().length > 0);
    
    const hasAnswerSubmission = Object.keys(submission.answers).length > 0 && 
      Object.values(submission.answers).some(answer => answer && answer.trim().length > 0);

    if (!hasCodeSubmission && !hasAnswerSubmission) {
      toast.error("Please provide at least one answer before submitting");
      return;
    }

    setSubmitted(true);
    setStarted(false);

    try {
      console.log('📤 Submitting assessment...');
      console.log('📋 Submission data:', {
        assessmentId,
        responseId: responseId, // Use numeric response ID
        submissionData: submission
      });

      const response = await fetch('/api/conduct-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          responseId: responseId, // Use numeric response ID
          submissionData: submission
        })
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Submission result:', result);
        setResults(result);
        toast.success("Assessment submitted successfully!");
      } else {
        const errorText = await response.text();
        console.error('❌ Submission failed:', response.status, errorText);
        throw new Error(`Failed to submit assessment: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
      setSubmitted(false);
    }
  }, [assessment, responseId, submission]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="h-4 w-4" />;
      case 'technical': return <Brain className="h-4 w-4" />;
      case 'behavioral': return <MessageSquare className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return "bg-green-100 text-green-800";
      case 'intermediate': return "bg-blue-100 text-blue-800";
      case 'advanced': return "bg-orange-100 text-orange-800";
      case 'expert': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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

  if (submitted && results) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
          
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
              <p className="text-muted-foreground">Here are your results</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {results.evaluation?.overall_score || 0}%
                </div>
                <Badge 
                  className={`${results.evaluation?.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {results.evaluation?.passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>

              {/* Detailed Feedback */}
              {results.evaluation?.detailed_feedback && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.evaluation.detailed_feedback.map((feedback: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Question {feedback.question_number}</span>
                            <span className="text-sm text-muted-foreground">
                              {feedback.score}/{feedback.max_score} points
                            </span>
                          </div>
                          <p className="text-sm">{feedback.feedback}</p>
                          {feedback.strengths && feedback.strengths.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-green-600">Strengths: </span>
                              <span className="text-sm">{feedback.strengths.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Insights */}
              {results.insights && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Strengths</h3>
                      <ul className="text-sm text-left mt-2">
                        {results.insights.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Areas to Improve</h3>
                      <ul className="text-sm text-left mt-2">
                        {results.insights.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-600 mr-2">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Recommendations</h3>
                      <ul className="text-sm text-left mt-2">
                        {results.insights.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="text-center">
                <p className="text-muted-foreground mb-4">{results.insights?.next_steps}</p>
                <Button onClick={() => router.back()}>
                  Back to Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show "Already Taken" page if assessment was already completed
  if (submitted && !results) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
          
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Assessment Already Completed</CardTitle>
              <p className="text-muted-foreground">You have already taken this assessment</p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">One Attempt Only</h3>
                <p className="text-yellow-700">
                  This assessment allows only one attempt per candidate. You have already completed it.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  To view your results, check the assessment analytics page or speak with the interviewer.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you believe this is an error, please contact the administrator.
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={() => router.push(`/interviews/${interviewId}/assessments/analytics`)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Results
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  Back to Assessments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Assessment Not Found</h3>
          <p className="text-muted-foreground">This assessment may not be available.</p>
        </div>
      </div>
    );
  }

  const questions = assessment.challenges?.map((challenge: any) => ({
  question: challenge.title || challenge.question || 'No question text',
  type: challenge.type || 'coding',
  expected_answer: challenge.description || challenge.expected_answer || 'No description',
  points: challenge.points || 100,
  time_minutes: challenge.time_minutes || 15,
  starter_code: challenge.starter_code || ''
})) || [];

  // Candidate Information Form Modal
  if (showCandidateForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Candidate Information</h2>
            <p className="text-muted-foreground">Please provide your details before starting the assessment</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={candidateInfo.name}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={candidateInfo.email}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email address"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Each person must use a unique name and email. Duplicate entries will be blocked.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowCandidateForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCandidateSubmit}
              className="flex-1"
            >
              Start Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(assessment.assessment_type)}
                  {assessment.title}
                </CardTitle>
                <p className="text-muted-foreground mt-2">{assessment.description}</p>
                <div className="flex gap-2 mt-4">
                  <Badge className={getDifficultyColor(assessment.difficulty_level)}>
                    {assessment.difficulty_level}
                  </Badge>
                  <Badge variant="outline">
                    {assessment.assessment_type}
                  </Badge>
                </div>
              </div>
              
              {started && (
                <div className="text-right">
                  <div className="flex items-center gap-2 text-red-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Time remaining</p>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {!started ? (
        /* Start Screen */
        <Card>
          <CardHeader>
            <CardTitle>Ready to Start Assessment?</CardTitle>
            <p className="text-muted-foreground">
              This assessment consists of {questions.length} question(s) and has a time limit of {assessment.time_limit} minutes.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {assessment.instructions}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Assessment Details:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{assessment.time_limit} minutes</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Passing Score:</span>
                  <span className="ml-2 font-medium">{assessment.passing_score}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="ml-2 font-medium">{questions.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="ml-2 font-medium">{assessment.difficulty_level}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Important Notice:</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>One attempt only:</strong> You can only take this assessment once. Make sure you&apos;re ready before starting.
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  <strong>Unique credentials:</strong> Each person must use a unique name and email. Duplicate entries will be blocked.
                </p>
              </div>
            </div>

            <Button 
              className="w-full"
              size="lg"
              onClick={handleStart}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Assessment Questions */
        <div className="space-y-6">
          {/* Progress Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          {questions[currentQuestion] && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(questions[currentQuestion].type)}
                    Question {currentQuestion + 1}
                  </CardTitle>
                  <Badge variant="outline">
                    {questions[currentQuestion].points} points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{questions[currentQuestion].question}</h3>
                  <p className="text-sm text-muted-foreground">
                    {questions[currentQuestion].expected_answer}
                  </p>
                </div>

                {questions[currentQuestion].type === 'coding' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Solution:</label>
                    <Textarea
                      value={submission.codeSubmissions[currentQuestion] || questions[currentQuestion].starter_code || ''}
                      placeholder="Write your solution here..."
                      className="font-mono"
                      rows={12}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        console.log('💻 Code changed for question', currentQuestion, ':', newCode.substring(0, 50) + '...');
                        
                        setSubmission({
                          ...submission,
                          codeSubmissions: {
                            ...submission.codeSubmissions,
                            [currentQuestion]: newCode
                          }
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Answer:</label>
                    <Textarea
                      value={submission.answers[currentQuestion] || ''}
                      placeholder="Type your answer here..."
                      rows={6}
                      onChange={(e) => setSubmission({
                        ...submission,
                        answers: {
                          ...submission.answers,
                          [currentQuestion]: e.target.value
                        }
                      })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {questions.map((_, index) => (
                <Button
                  key={`question-${index}`}
                  variant={index === currentQuestion ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            <Button
              variant={currentQuestion === questions.length - 1 ? "default" : "outline"}
              onClick={currentQuestion === questions.length - 1 ? handleSubmit : () => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            >
              {currentQuestion === questions.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Assessment
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
