import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Server, Key, CheckCircle2 } from "lucide-react";

export default function SecurityPage() {
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
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Enterprise-Grade Security</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your data security is our top priority. We employ industry-leading security measures to protect your sensitive information.
          </p>
        </div>
      </div>

      {/* Security Features */}
      <div className="pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <SecurityFeature
              icon={<Lock className="w-6 h-6 text-indigo-600" />}
              title="Data Encryption"
              description="All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption standards."
            />

            <SecurityFeature
              icon={<Eye className="w-6 h-6 text-purple-600" />}
              title="Privacy Controls"
              description="Granular privacy settings and role-based access control to ensure only authorized users can access sensitive data."
            />

            <SecurityFeature
              icon={<Server className="w-6 h-6 text-emerald-600" />}
              title="Secure Infrastructure"
              description="Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA and redundant backups."
            />

            <SecurityFeature
              icon={<Key className="w-6 h-6 text-yellow-600" />}
              title="Authentication"
              description="Multi-factor authentication and SSO support to protect your account from unauthorized access."
            />
          </div>

          {/* Compliance */}
          <div className="border border-border/50 rounded-xl p-8 bg-card">
            <h2 className="text-3xl font-bold mb-6 text-center">Compliance & Certifications</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <ComplianceBadge title="GDPR Compliant" description="Full compliance with EU data protection regulations" />
              <ComplianceBadge title="SOC 2 Type II" description="Certified for security, availability, and confidentiality" />
              <ComplianceBadge title="ISO 27001" description="International standard for information security management" />
            </div>
          </div>

          {/* Security Practices */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Our Security Practices</h2>
            <div className="space-y-4">
              <SecurityPractice text="Regular security audits and penetration testing by third-party experts" />
              <SecurityPractice text="24/7 security monitoring and incident response team" />
              <SecurityPractice text="Automated backup systems with point-in-time recovery" />
              <SecurityPractice text="Employee security training and background checks" />
              <SecurityPractice text="Vulnerability management and patch management programs" />
              <SecurityPractice text="Data residency options for regulatory compliance" />
            </div>
          </div>

          {/* Contact */}
          <div className="mt-12 text-center p-8 bg-secondary/30 rounded-xl">
            <h3 className="text-2xl font-bold mb-2">Have Security Questions?</h3>
            <p className="text-muted-foreground mb-4">
              Our security team is here to help. Contact us for more information.
            </p>
            <Link href="/contact" className="text-indigo-600 hover:underline font-semibold">
              Contact Security Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityFeature({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ComplianceBadge({ title, description }: { title: string, description: string }) {
  return (
    <div className="text-center p-4">
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 className="w-8 h-8 text-indigo-600" />
      </div>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SecurityPractice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
