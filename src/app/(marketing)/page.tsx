import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, BarChart3, Users, Zap, Shield } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default function LandingPage() {
  const { userId } = auth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Futuristic HR
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              How it Works
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {userId ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-sm font-medium mb-8 border border-indigo-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Now with AI-Powered Interviews
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Hiring Reimagined for the <br />
            <span className="text-indigo-600">Future of Work</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Streamline your recruitment process with our AI-driven platform. 
            Automate interviews, analyze candidate potential, and make data-backed hiring decisions 10x faster.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={userId ? "/dashboard" : "/sign-up"}>
              <Button size="lg" className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105">
                {userId ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg hover:bg-secondary/50">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur shadow-2xl overflow-hidden aspect-[16/9] relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
              {/* Placeholder for dashboard image */}
              <div className="w-full h-full bg-slate-900/5 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Interactive Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to hire top talent</h2>
            <p className="text-muted-foreground text-lg">
              Our platform provides a comprehensive suite of tools designed to make your hiring process efficient, fair, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-indigo-600" />}
              title="AI-Powered Interviews"
              description="Conduct automated initial screening interviews with our advanced AI that adapts to candidate responses."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
              title="Smart Analytics"
              description="Get deep insights into candidate performance with detailed reports and comparative analysis."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-emerald-600" />}
              title="Unbiased Evaluation"
              description="Remove unconscious bias from your hiring process with standardized scoring and objective criteria."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it Works</h2>
            <p className="text-muted-foreground text-lg">
              Get started with Futuristic HR in just three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 z-0" />

            <StepCard 
              number="01"
              title="Create Account"
              description="Sign up and create your organization workspace in seconds."
            />
            <StepCard 
              number="02"
              title="Setup Interviews"
              description="Define job roles and customize AI interview questions."
            />
            <StepCard 
              number="03"
              title="Hire the Best"
              description="Review AI insights and select top candidates effortlessly."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat number="10k+" label="Interviews Conducted" />
            <Stat number="500+" label="Companies Trust Us" />
            <Stat number="98%" label="Satisfaction Rate" />
            <Stat number="10x" label="Faster Hiring" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to transform your hiring?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of forward-thinking companies using Futuristic HR to build their dream teams.
          </p>
          <Link href={userId ? "/dashboard" : "/sign-up"}>
            <Button size="lg" className="h-14 px-10 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20">
              {userId ? "Go to Dashboard" : "Get Started for Free"}
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold">Futuristic HR</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering companies to build the workforce of tomorrow with AI-driven insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Futuristic HR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-background border-4 border-secondary flex items-center justify-center mb-6 shadow-lg">
        <span className="text-3xl font-bold text-indigo-600">{number}</span>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-xs">
        {description}
      </p>
    </div>
  );
}

function Stat({ number, label }: { number: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-indigo-600 mb-2">{number}</div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
