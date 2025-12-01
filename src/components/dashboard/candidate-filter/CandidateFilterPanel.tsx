"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Filter, 
  Search, 
  Download,
  RotateCcw,
  User,
  MapPin,
  Briefcase,
  Star,
  Clock
} from "lucide-react";
import { CandidateStatus, FilterCriteria } from "@/types/skill-assessment";

interface CandidateFilterPanelProps {
  onFilter: (criteria: FilterCriteria) => void;
  onExport: (format: 'csv' | 'json') => void;
  loading?: boolean;
}

export function CandidateFilterPanel({ 
  onFilter, 
  onExport, 
  loading = false 
}: CandidateFilterPanelProps) {
  const [criteria, setCriteria] = useState<FilterCriteria>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setCriteria({ ...criteria, skills: newSkills });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = skills.filter((skill: string) => skill !== skillToRemove);
    setSkills(newSkills);
    setCriteria({ ...criteria, skills: newSkills });
  };

  const handleStatusChange = (status: CandidateStatus, checked: boolean) => {
    const currentStatuses = criteria.status || [];
    let newStatuses: CandidateStatus[];
    
    if (checked) {
      newStatuses = [...currentStatuses, status];
    } else {
      newStatuses = currentStatuses.filter((s: CandidateStatus) => s !== status);
    }
    
    setCriteria({ ...criteria, status: newStatuses });
  };

  const handleApplyFilter = () => {
    onFilter(criteria);
  };

  const handleReset = () => {
    setCriteria({});
    setSkills([]);
    setSkillInput("");
  };

  const statusOptions = [
    { value: CandidateStatus.PENDING, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: CandidateStatus.IN_REVIEW, label: "In Review", color: "bg-blue-100 text-blue-800" },
    { value: CandidateStatus.SELECTED, label: "Selected", color: "bg-green-100 text-green-800" },
    { value: CandidateStatus.REJECTED, label: "Rejected", color: "bg-red-100 text-red-800" },
    { value: CandidateStatus.ON_HOLD, label: "On Hold", color: "bg-orange-100 text-orange-800" },
    { value: CandidateStatus.WITHDRAWN, label: "Withdrawn", color: "bg-gray-100 text-gray-800" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Candidate Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => onExport('csv')}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              className="flex items-center gap-1"
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Score Range
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minScore" className="text-sm text-muted-foreground">
                Minimum Score
              </Label>
              <Input
                id="minScore"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={criteria.minScore || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteria({ 
                  ...criteria, 
                  minScore: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxScore" className="text-sm text-muted-foreground">
                Maximum Score
              </Label>
              <Input
                id="maxScore"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={criteria.maxScore || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteria({ 
                  ...criteria, 
                  maxScore: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>
          </div>
        </div>

        {/* Skills Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Required Skills
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={skillInput}
              className="flex-1"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkillInput(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button onClick={handleAddSkill} size="sm">
              Add
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Experience Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Experience (Years)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minExp" className="text-sm text-muted-foreground">
                Minimum
              </Label>
              <Input
                id="minExp"
                type="number"
                min="0"
                placeholder="0"
                value={criteria.experienceYears?.min || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteria({ 
                  ...criteria, 
                  experienceYears: { 
                    ...criteria.experienceYears, 
                    min: e.target.value ? parseInt(e.target.value) : undefined 
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxExp" className="text-sm text-muted-foreground">
                Maximum
              </Label>
              <Input
                id="maxExp"
                type="number"
                min="0"
                placeholder="30"
                value={criteria.experienceYears?.max || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteria({ 
                  ...criteria, 
                  experienceYears: { 
                    ...criteria.experienceYears, 
                    max: e.target.value ? parseInt(e.target.value) : undefined 
                  }
                })}
              />
            </div>
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            placeholder="Enter location (city, country, remote...)"
            value={criteria.location?.join(", ") || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteria({ 
              ...criteria, 
              location: e.target.value ? e.target.value.split(",").map((l: string) => l.trim()) : undefined 
            })}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Candidate Status
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={status.value}
                  checked={criteria.status?.includes(status.value) || false}
                  onCheckedChange={(checked: boolean) => 
                    handleStatusChange(status.value, checked)
                  }
                />
                <Label htmlFor={status.value} className="text-sm cursor-pointer">
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Filter Button */}
        <Button 
          className="w-full" 
          disabled={loading}
          onClick={handleApplyFilter} 
        >
          {loading ? (
            "Filtering..."
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
