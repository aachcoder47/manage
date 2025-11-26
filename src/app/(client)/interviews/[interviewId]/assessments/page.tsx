"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Plus, 
  Code2, 
  Save, 
  Play, 
  Edit, 
  Trash2,
  ArrowLeft,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { AssessmentType, DifficultyLevel } from "@/types/skill-assessment";
import { toast } from "sonner";

export default function InterviewAssessmentsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;
  
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [takenAssessments, setTakenAssessments] = useState<Set<string>>(new Set());
  const [aiFormData, setAiFormData] = useState({
    assessmentType: AssessmentType.CODING,
    difficulty: DifficultyLevel.INTERMEDIATE,
    skills: [] as string[],
    jobRole: ''
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assessment_type: AssessmentType.CODING,
    difficulty_level: DifficultyLevel.INTERMEDIATE,
    time_limit: 45,
    passing_score: 70
  });

  useEffect(() => {
    fetchAssessments();
  }, [interviewId]);

  const fetchAssessments = async () => {
    try {
      // Fetch real skill assessments from your database
      const response = await fetch(`/api/skill-assessments?interviewId=${interviewId}`);
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
        
        // Check which assessments have been taken
        await checkTakenAssessments(data.assessments || []);
      } else {
        throw new Error("Failed to fetch assessments");
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const checkTakenAssessments = async (assessments: any[]) => {
    try {
      // Get responses for this interview
      const responsesResponse = await fetch(`/api/responses?interviewId=${interviewId}`);
      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json();
        const responses = responsesData.responses || [];
        
        if (responses.length > 0) {
          const responseId = responses[0].id;
          
          // Check each assessment for attempts
          const takenSet = new Set<string>();
          
          for (const assessment of assessments) {
            try {
              const attemptResponse = await fetch(`/api/conduct-assessment?assessmentId=${assessment.id}&responseId=${responseId}`);
              if (attemptResponse.ok) {
                const attemptData = await attemptResponse.json();
                if (attemptData.hasAttempted) {
                  takenSet.add(assessment.id);
                }
              }
            } catch (error) {
              console.error(`Error checking assessment ${assessment.id}:`, error);
            }
          }
          
          setTakenAssessments(takenSet);
        }
      }
    } catch (error) {
      console.error("Error checking taken assessments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare real assessment data for your database
      const assessmentData = {
        ...formData,
        interview_id: interviewId,
        evaluation_criteria: {
          code_quality: 30,
          problem_solving: 25,
          best_practices: 20,
          performance: 15,
          readability: 10
        },
        instructions: generateAssessmentInstructions(formData.assessment_type, formData.difficulty_level)
      };
      
      const url = editingAssessment 
        ? `/api/skill-assessments?id=${editingAssessment.id}`
        : "/api/skill-assessments";
      
      const method = editingAssessment ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(editingAssessment ? "Assessment updated!" : "Assessment created!");
        
        // Reset form
        setShowCreateForm(false);
        setEditingAssessment(null);
        setFormData({
          title: "",
          description: "",
          assessment_type: AssessmentType.CODING,
          difficulty_level: DifficultyLevel.INTERMEDIATE,
          time_limit: 45,
          passing_score: 70
        });
        
        // Refresh assessments list
        await fetchAssessments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save assessment");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save assessment");
    }
  };

  const generateAssessmentInstructions = (type: AssessmentType, difficulty: DifficultyLevel): string => {
    const instructions = {
      [AssessmentType.CODING]: {
        [DifficultyLevel.BEGINNER]: "Write a simple function that demonstrates basic programming concepts. Focus on clarity and correctness.",
        [DifficultyLevel.INTERMEDIATE]: "Implement a solution that handles edge cases and follows best practices. Include proper error handling.",
        [DifficultyLevel.ADVANCED]: "Create an efficient solution that considers performance and scalability. Include comprehensive testing.",
        [DifficultyLevel.EXPERT]: "Design and implement a complex system with multiple components. Focus on architecture, performance, and maintainability."
      },
      [AssessmentType.TECHNICAL]: {
        [DifficultyLevel.BEGINNER]: "Answer basic technical questions about fundamental concepts. Show understanding of core principles.",
        [DifficultyLevel.INTERMEDIATE]: "Demonstrate practical knowledge of common technologies and frameworks. Include real-world examples.",
        [DifficultyLevel.ADVANCED]: "Discuss advanced topics and design patterns. Show deep understanding of system architecture.",
        [DifficultyLevel.EXPERT]: "Analyze complex scenarios and provide expert-level solutions. Consider trade-offs and best practices."
      },
      [AssessmentType.BEHAVIORAL]: {
        [DifficultyLevel.BEGINNER]: "Describe your approach to basic work situations. Focus on teamwork and communication.",
        [DifficultyLevel.INTERMEDIATE]: "Share examples of handling challenges and learning experiences. Demonstrate problem-solving skills.",
        [DifficultyLevel.ADVANCED]: "Discuss leadership experiences and conflict resolution. Show strategic thinking.",
        [DifficultyLevel.EXPERT]: "Analyze complex organizational scenarios. Provide insights on team dynamics and culture."
      },
      [AssessmentType.MIXED]: {
        [DifficultyLevel.BEGINNER]: "Complete a mix of basic technical and behavioral questions. Balance technical accuracy with communication skills.",
        [DifficultyLevel.INTERMEDIATE]: "Handle various types of challenges showing both technical knowledge and soft skills.",
        [DifficultyLevel.ADVANCED]: "Tackle complex problems requiring both technical expertise and strong communication.",
        [DifficultyLevel.EXPERT]: "Navigate sophisticated scenarios demonstrating mastery across multiple domains."
      }
    };
    
    return instructions[type]?.[difficulty] || "Complete the assessment to the best of your ability.";
  };

  const generateCodingQuestions = async () => {
    setGenerating(true);
    
    try {
      const response = await fetch('/api/generate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          assessmentType: AssessmentType.CODING,
          difficulty: DifficultyLevel.INTERMEDIATE,
          skills: ['JavaScript', 'React', 'Node.js', 'Problem Solving'],
          jobRole: 'Software Developer',
          questionType: 'coding'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('AI-generated coding assessment created successfully!');
        await fetchAssessments();
        setShowCreateForm(false);
      } else {
        throw new Error('Failed to generate coding questions');
      }
    } catch (error) {
      console.error('Error generating coding questions:', error);
      toast.error('Failed to generate coding questions');
    } finally {
      setGenerating(false);
    }
  };

  const generateMCQQuestions = async () => {
    setGenerating(true);
    
    try {
      const response = await fetch('/api/generate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          assessmentType: AssessmentType.TECHNICAL,
          difficulty: DifficultyLevel.INTERMEDIATE,
          skills: ['JavaScript', 'React', 'Node.js', 'Problem Solving'],
          jobRole: 'Software Developer',
          questionType: 'mcq'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('AI-generated MCQ assessment created successfully!');
        await fetchAssessments();
        setShowCreateForm(false);
      } else {
        throw new Error('Failed to generate MCQ questions');
      }
    } catch (error) {
      console.error('Error generating MCQ questions:', error);
      toast.error('Failed to generate MCQ questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    
    try {
      const response = await fetch('/api/generate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          assessmentType: aiFormData.assessmentType,
          difficulty: aiFormData.difficulty,
          skills: aiFormData.skills,
          jobRole: aiFormData.jobRole
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('AI-generated assessment created successfully!');
        
        // Refresh assessments list
        await fetchAssessments();
        
        // Reset AI form and close modal
        setAiFormData({
          assessmentType: AssessmentType.CODING,
          difficulty: DifficultyLevel.INTERMEDIATE,
          skills: [],
          jobRole: ''
        });
        setShowCreateForm(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate assessment');
      }
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate assessment');
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = (assessment: any) => {
    setEditingAssessment(assessment);
    setFormData({
      title: assessment.title,
      description: assessment.description || "",
      assessment_type: assessment.assessment_type,
      difficulty_level: assessment.difficulty_level,
      time_limit: assessment.time_limit || 45,
      passing_score: assessment.passing_score || 70
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (assessmentId: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    
    try {
      const response = await fetch(`/api/skill-assessments?id=${assessmentId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        toast.success("Assessment deleted!");
        // Refresh the assessments list
        await fetchAssessments();
      } else {
        throw new Error("Failed to delete assessment");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Failed to delete assessment");
    }
  };

  const getTypeIcon = (type: AssessmentType) => {
    switch (type) {
      case AssessmentType.CODING: return <Code2 className="h-4 w-4" />;
      case AssessmentType.TECHNICAL: return <Brain className="h-4 w-4" />;
      case AssessmentType.BEHAVIORAL: return <Brain className="h-4 w-4" />;
      case AssessmentType.MIXED: return <Brain className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    switch (level) {
      case DifficultyLevel.BEGINNER: return "bg-green-100 text-green-800";
      case DifficultyLevel.INTERMEDIATE: return "bg-blue-100 text-blue-800";
      case DifficultyLevel.ADVANCED: return "bg-orange-100 text-orange-800";
      case DifficultyLevel.EXPERT: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
            <h1 className="text-2xl font-bold">Skill Assessments</h1>
            <p className="text-muted-foreground">AI-powered technical evaluations</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAssessment ? "Edit Assessment" : "Create New Assessment"}
            </CardTitle>
            {!editingAssessment && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span>Or let AI generate one for you</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* AI Generation Option */}
            {!editingAssessment && (
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      AI-Powered Assessment Generation
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Let AI create a comprehensive assessment based on your interview data
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Manual Create
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ai-assessment-type">Assessment Type</Label>
                      <Select
                        value={aiFormData.assessmentType}
                        onValueChange={(value) => setAiFormData({ ...aiFormData, assessmentType: value as AssessmentType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AssessmentType.CODING}>Coding Challenge</SelectItem>
                          <SelectItem value={AssessmentType.TECHNICAL}>Technical Questions</SelectItem>
                          <SelectItem value={AssessmentType.BEHAVIORAL}>Behavioral Assessment</SelectItem>
                          <SelectItem value={AssessmentType.MIXED}>Mixed Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ai-difficulty">Difficulty Level</Label>
                      <Select
                        value={aiFormData.difficulty}
                        onValueChange={(value) => setAiFormData({ ...aiFormData, difficulty: value as DifficultyLevel })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DifficultyLevel.BEGINNER}>Beginner</SelectItem>
                          <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</SelectItem>
                          <SelectItem value={DifficultyLevel.ADVANCED}>Advanced</SelectItem>
                          <SelectItem value={DifficultyLevel.EXPERT}>Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ai-job-role">Job Role (Optional)</Label>
                    <Input
                      id="ai-job-role"
                      value={aiFormData.jobRole}
                      onChange={(e) => setAiFormData({ ...aiFormData, jobRole: e.target.value })}
                      placeholder="e.g., Senior Frontend Developer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ai-skills">Required Skills (comma-separated)</Label>
                    <Textarea
                      id="ai-skills"
                      value={aiFormData.skills.join(', ')}
                      onChange={(e) => setAiFormData({ ...aiFormData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="e.g., JavaScript, React, Node.js, AWS"
                      rows={2}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={generating}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Assessment...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate AI Assessment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Form (show when editing or when manual create is selected) */}
            {(editingAssessment || showCreateForm) && (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., JavaScript Fundamentals"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="assessment_type">Assessment Type</Label>
                  <Select
                    value={formData.assessment_type}
                    onValueChange={(value) => setFormData({ ...formData, assessment_type: value as AssessmentType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AssessmentType.CODING}>Coding Challenge</SelectItem>
                      <SelectItem value={AssessmentType.TECHNICAL}>Technical Interview</SelectItem>
                      <SelectItem value={AssessmentType.BEHAVIORAL}>Behavioral Assessment</SelectItem>
                      <SelectItem value={AssessmentType.MIXED}>Mixed Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what candidates will be tested on..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty_level">Difficulty</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) => setFormData({ ...formData, difficulty_level: value as DifficultyLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DifficultyLevel.BEGINNER}>Beginner</SelectItem>
                      <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</SelectItem>
                      <SelectItem value={DifficultyLevel.ADVANCED}>Advanced</SelectItem>
                      <SelectItem value={DifficultyLevel.EXPERT}>Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="5"
                    max="180"
                    value={formData.time_limit}
                    onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="passing_score">Passing Score (%)</Label>
                  <Input
                    id="passing_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingAssessment ? "Update Assessment" : "Create Assessment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingAssessment(null);
                    setFormData({
                      title: "",
                      description: "",
                      assessment_type: AssessmentType.CODING,
                      difficulty_level: DifficultyLevel.INTERMEDIATE,
                      time_limit: 45,
                      passing_score: 70
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      <div className="space-y-4">
        {/* Quick AI Generation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Code2 className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Generate Coding Questions</h3>
                  <p className="text-sm text-muted-foreground">AI creates coding challenges with solutions</p>
                </div>
              </div>
              <Button 
                onClick={() => generateCodingQuestions()}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Code2 className="h-4 w-4 mr-2" />
                    Generate Coding Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold">Generate MCQ Questions</h3>
                  <p className="text-sm text-muted-foreground">AI creates multiple-choice questions</p>
                </div>
              </div>
              <Button 
                onClick={() => generateMCQQuestions()}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate MCQ Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Assessments</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push(`/interviews/${interviewId}/assessments/analytics`)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </div>
        </div>

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI-powered skill assessment to start evaluating candidates
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(assessment.assessment_type)}
                        <h3 className="font-semibold text-lg">{assessment.title}</h3>
                      </div>
                      <Badge className={getDifficultyColor(assessment.difficulty_level)}>
                        {assessment.difficulty_level}
                      </Badge>
                      {assessment.is_active && (
                        <Badge variant="outline" className="text-green-600">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    {assessment.description && (
                      <p className="text-muted-foreground mb-3">{assessment.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>⏱️ {assessment.time_limit || 45} minutes</span>
                      <span>🎯 {assessment.passing_score || 70}% to pass</span>
                      <span>📝 {assessment.challenges_count || 0} challenges</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/interviews/${interviewId}/assessments/${assessment.id}/take`)}
                      className={takenAssessments.has(assessment.id) ? "bg-gray-400 hover:bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
                      disabled={takenAssessments.has(assessment.id)}
                    >
                      {takenAssessments.has(assessment.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Take
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(assessment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(assessment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
