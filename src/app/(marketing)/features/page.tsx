import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, BarChart3, Shield, Zap, Target, TrendingUp } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features for Modern Hiring</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to streamline your recruitment process and make better hiring decisions.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<Users className="w-8 h-8 text-indigo-600" />}
              title="AI-Powered Interviews"
              description="Conduct automated screening interviews with our advanced AI that adapts to candidate responses in real-time."
              features={[
                "Natural conversation flow",
                "Context-aware follow-up questions",
                "Multi-language support",
                "Voice and text analysis"
              ]}
            />

            <FeatureCard
              icon={<BarChart3 className="w-8 h-8 text-purple-600" />}
              title="Smart Analytics"
              description="Get deep insights into candidate performance with detailed reports and comparative analysis."
              features={[
                "Comprehensive scoring system",
                "Performance benchmarking",
                "Custom evaluation criteria",
                "Export detailed reports"
              ]}
            />

            <FeatureCard
              icon={<Shield className="w-8 h-8 text-emerald-600" />}
              title="Unbiased Evaluation"
              description="Remove unconscious bias from your hiring process with standardized scoring and objective criteria."
              features={[
                "Standardized questions",
                "Blind review options",
                "Diversity analytics",
                "Compliance tracking"
              ]}
            />

            <FeatureCard
              icon={<Zap className="w-8 h-8 text-yellow-600" />}
              title="Fast & Scalable"
              description="Handle high-volume hiring with automated workflows that save time and resources."
              features={[
                "Unlimited concurrent interviews",
                "Bulk candidate management",
                "Automated scheduling",
                "Real-time notifications"
              ]}
            />

            <FeatureCard
              icon={<Target className="w-8 h-8 text-red-600" />}
              title="Custom Branding"
              description="Create a branded candidate experience that reflects your company culture."
              features={[
                "Custom interview themes",
                "Branded landing pages",
                "Personalized email templates",
                "White-label options"
              ]}
            />

            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
              title="Integration & API"
              description="Connect seamlessly with your existing HR tech stack and ATS systems."
              features={[
                "REST API access",
                "Webhook support",
                "Popular ATS integrations",
                "Custom integrations available"
              ]}
            />
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8">Join hundreds of companies using Futuristic HR</p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, features }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  features: string[]
}) {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-all">
      <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-indigo-600 mt-1">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
