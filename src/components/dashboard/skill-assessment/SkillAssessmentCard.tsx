"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Brain, 
  MessageSquare, 
  Layers,
  Clock,
  Target,
  Play,
  Settings
} from "lucide-react";
import { AssessmentType, DifficultyLevel } from "@/types/skill-assessment";

interface SkillAssessmentCardProps {
  assessment: {
    id: string;
    title: string;
    description?: string;
    assessment_type: AssessmentType;
    difficulty_level: DifficultyLevel;
    time_limit?: number;
    passing_score: number;
    is_active: boolean;
    questions_count?: number;
  };
  onStartAssessment?: (assessmentId: string) => void;
  onEdit?: (assessmentId: string) => void;
}

const getAssessmentIcon = (type: AssessmentType) => {
  switch (type) {
    case AssessmentType.CODING:
      return <Code2 className="h-5 w-5" />;
    case AssessmentType.TECHNICAL:
      return <Brain className="h-5 w-5" />;
    case AssessmentType.BEHAVIORAL:
      return <MessageSquare className="h-5 w-5" />;
    case AssessmentType.MIXED:
      return <Layers className="h-5 w-5" />;
    default:
      return <Target className="h-5 w-5" />;
  }
};

const getDifficultyColor = (level: DifficultyLevel) => {
  switch (level) {
    case DifficultyLevel.BEGINNER:
      return "bg-green-100 text-green-800";
    case DifficultyLevel.INTERMEDIATE:
      return "bg-blue-100 text-blue-800";
    case DifficultyLevel.ADVANCED:
      return "bg-orange-100 text-orange-800";
    case DifficultyLevel.EXPERT:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeColor = (type: AssessmentType) => {
  switch (type) {
    case AssessmentType.CODING:
      return "bg-purple-100 text-purple-800";
    case AssessmentType.TECHNICAL:
      return "bg-indigo-100 text-indigo-800";
    case AssessmentType.BEHAVIORAL:
      return "bg-pink-100 text-pink-800";
    case AssessmentType.MIXED:
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function SkillAssessmentCard({ 
  assessment, 
  onStartAssessment, 
  onEdit 
}: SkillAssessmentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
        !assessment.is_active ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTypeColor(assessment.assessment_type)}`}>
              {getAssessmentIcon(assessment.assessment_type)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {assessment.title}
              </CardTitle>
              {assessment.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {assessment.description}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(assessment.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge className={getTypeColor(assessment.assessment_type)}>
            {assessment.assessment_type.replace('_', ' ')}
          </Badge>
          <Badge className={getDifficultyColor(assessment.difficulty_level)}>
            {assessment.difficulty_level}
          </Badge>
          {assessment.time_limit && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {assessment.time_limit}m
            </Badge>
          )}
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {assessment.passing_score}% to pass
          </Badge>
        </div>

        {assessment.questions_count && (
          <div className="text-sm text-muted-foreground">
            {assessment.questions_count} question{assessment.questions_count !== 1 ? 's' : ''}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              assessment.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-muted-foreground">
              {assessment.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {assessment.is_active && onStartAssessment && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStartAssessment(assessment.id);
              }}
              className="transition-transform hover:scale-105"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
