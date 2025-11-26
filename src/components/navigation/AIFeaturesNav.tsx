"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Code2, 
  Filter, 
  Settings,
  BarChart3,
  ArrowRight
} from "lucide-react";

export function AIFeaturesNav() {
  const features = [
    {
      icon: Brain,
      title: "Skill Assessments",
      description: "AI-powered coding challenges",
      href: "/dashboard/ai-features?tab=assessments",
      color: "text-blue-600"
    },
    {
      icon: Filter,
      title: "Smart Filtering",
      description: "Advanced candidate matching",
      href: "/dashboard/ai-features?tab=filtering",
      color: "text-green-600"
    },
    {
      icon: Settings,
      title: "ATS Integration",
      description: "Connect your recruiting tools",
      href: "/dashboard/ai-features?tab=ats",
      color: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "AI Analytics",
      description: "Performance insights",
      href: "/dashboard/ai-features?tab=analytics",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">AI Recruiter Features</h3>
        </div>
        <Link href="/dashboard/ai-features">
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-100">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <Icon className={`h-5 w-5 ${feature.color} group-hover:scale-110 transition-transform`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 group-hover:text-blue-900 transition-colors">
                  {feature.title}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {feature.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
