'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Award, 
  TrendingUp, 
  Target,
  Zap,
  Globe,
  Shield,
  Heart,
  Briefcase,
  Code,
  Database,
  Cloud,
  Smartphone,
  BookOpen,
  Coffee,
  Wifi,
  Car,
  Plane,
  Home,
  Gift
} from 'lucide-react';

interface ProJobDescriptionProps {
  title?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  salaryRange?: string;
  isRemote?: boolean;
  planType?: 'pro' | 'advanced' | 'enterprise';
}

export const ProJobDescription = ({
  title = "Senior Full-Stack Developer",
  company = "Futuristic HR",
  location = "Remote / Hybrid / On-site",
  employmentType = "Full-time",
  salaryRange = "₹15,99,999 - ₹25,00,000 per annum",
  isRemote = true,
  planType = 'pro'
}: ProJobDescriptionProps) => {
  const [activeSection, setActiveSection] = useState('overview');

  const planColors = {
    pro: {
      bg: 'bg-indigo-50 border-indigo-200',
      badge: 'bg-indigo-600 text-white',
      accent: 'text-indigo-600'
    },
    advanced: {
      bg: 'bg-purple-50 border-purple-200', 
      badge: 'bg-purple-600 text-white',
      accent: 'text-purple-600'
    },
    enterprise: {
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'bg-emerald-600 text-white',
      accent: 'text-emerald-600'
    }
  };

  const colors = planColors[planType];

  const sections = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'requirements', label: 'Requirements', icon: Code },
    { id: 'responsibilities', label: 'Responsibilities', icon: Briefcase },
    { id: 'qualifications', label: 'Qualifications', icon: Award },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'benefits', label: 'Benefits', icon: Heart },
    { id: 'growth', label: 'Career Growth', icon: TrendingUp },
    { id: 'apply', label: 'Apply Now', icon: Zap }
  ];

  const benefits = [
    { icon: Heart, title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
    { icon: Home, title: 'Paid Time Off', description: '25 days PTO plus 10 paid holidays' },
    { icon: Coffee, title: 'Free Meals', description: 'Daily meal allowance and snacks' },
    { icon: Wifi, title: 'Remote Work', description: 'Flexible remote/hybrid work options' },
    { icon: BookOpen, title: 'Learning Budget', description: '₹50,000 per year for courses and certifications' },
    { icon: Smartphone, title: 'Equipment Budget', description: 'Latest MacBook Pro and accessories' },
    { icon: Car, title: 'Transport', description: 'Company-provided phone and internet reimbursement' },
    { icon: Plane, title: 'Travel Benefits', description: 'Company-sponsored travel for team events' },
    { icon: Gift, title: 'Performance Bonus', description: 'Up to 20% annual bonus based on performance' }
  ];

  const technicalSkills = [
    'JavaScript/TypeScript',
    'React, Next.js, HTML5, CSS3',
    'Node.js, Express.js, PostgreSQL',
    'AWS, Docker, CI/CD, Git',
    'RESTful APIs, GraphQL',
    'SQL, NoSQL, Database Design',
    'Jest, Cypress, Unit Testing'
  ];

  const advancedSkills = [
    'AI/ML Integration',
    'Microservices Architecture',
    'Performance Optimization',
    'Security (OAuth, JWT, Encryption)',
    'Monitoring (Prometheus, Grafana)',
    'Containerization (Docker, Kubernetes)',
    'Infrastructure as Code (Terraform)',
    'GraphQL, Serverless, Mobile Development'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className={`${colors.bg} border-2`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={`${colors.badge} px-3 py-1 text-sm font-semibold`}>
                  {planType.toUpperCase()} PLAN
                </Badge>
                {isRemote && (
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    <Wifi className="w-3 h-3 mr-1" />
                    Remote
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-xl text-gray-600">{company}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                <span>{employmentType}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">{salaryRange}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Card className="border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2"
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card className="border">
        <CardContent className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Position Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  Join Futuristic HR as a Senior Full-Stack Developer and revolutionize the recruitment industry 
                  with cutting-edge AI-powered interview solutions. We are a fast-growing technology company 
                  that helps organizations streamline their hiring process through intelligent automation 
                  and data-driven insights.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Why Join Us</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Innovative Technology</h4>
                      <p className="text-gray-600">Work with cutting-edge AI and ML technologies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Rapid Growth</h4>
                      <p className="text-gray-600">Be part of a scaling tech company</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Impact-Driven</h4>
                      <p className="text-gray-600">Shape the future of recruitment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Remote-First</h4>
                      <p className="text-gray-600">Flexible work environment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'requirements' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Requirements</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Skills ({planType.toUpperCase()} Plan)</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {technicalSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Code className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Skills ({planType.toUpperCase()} Plan)</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {advancedSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <Database className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'responsibilities' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">System Architecture</h3>
                    <p className="text-gray-600">Design and implement scalable, maintainable system architecture</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">AI Integration</h3>
                    <p className="text-gray-600">Integrate AI models and APIs into our recruitment platform</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">API Development</h3>
                    <p className="text-gray-600">Build and maintain robust RESTful APIs and microservices</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Security Implementation</h3>
                    <p className="text-gray-600">Implement security best practices and protect against vulnerabilities</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Leadership & Mentorship</h3>
                    <p className="text-gray-600">Mentor junior developers and lead technical discussions</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'qualifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Qualifications</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Experience Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>5+ years of full-stack development experience</li>
                    <li>3+ years of experience with React/Next.js ecosystem</li>
                    <li>2+ years of experience with Node.js and backend development</li>
                    <li>1+ year of experience with AI/ML integration or APIs</li>
                    <li>Proven track record of building scalable web applications</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Educational Background</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Bachelor&apos;s degree in Computer Science, Engineering, or related field</li>
                    <li>Master&apos;s degree preferred but not required</li>
                    <li>Certifications in cloud technologies (AWS, GCP, Azure) are a plus</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Soft Skills</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Communication</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-blue-600" />
                      <span>Team Collaboration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Continuous Learning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>Attention to Detail</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'compensation' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compensation & Benefits ({planType.toUpperCase()} Plan)</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary & Equity</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Competitive Salary:</strong> ₹15,99,999 - ₹25,00,000 per annum</li>
                    <li><strong>Performance Bonus:</strong> Up to 20% annual bonus based on performance</li>
                    <li><strong>Stock Options:</strong> Equity in company (PRO Plan benefit)</li>
                    <li><strong>Signing Bonus:</strong> One-time signing bonus for exceptional candidates</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Benefits ({planType.toUpperCase()} Plan)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <benefit.icon className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">PRO Plan Exclusive Benefits</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Advanced Training:</strong> Access to premium AI/ML courses and certifications</li>
                    <li><strong>Conference Budget:</strong> ₹1,00,000 per year for tech conferences</li>
                    <li><strong>Wellness Program:</strong> Mental health support and wellness initiatives</li>
                    <li><strong>Career Coaching:</strong> Professional career development coaching</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'benefits' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why This Role is Perfect for You</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Career Growth</h3>
                    <p className="text-gray-600">Clear path to leadership positions</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Innovation</h3>
                    <p className="text-gray-600">Work with cutting-edge AI and recruitment technology</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Global Reach</h3>
                    <p className="text-gray-600">Work with international teams and clients</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Recognition</h3>
                    <p className="text-gray-600">Be part of a growing, innovative tech company</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Challenges</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>AI Integration:</strong> Work with state-of-the-art AI models and APIs</li>
                  <li><strong>Big Data:</strong> Handle large-scale data processing and analytics</li>
                  <li><strong>Scalability:</strong> Build systems that handle millions of users</li>
                  <li><strong>Security:</strong> Implement enterprise-grade security measures</li>
                  <li><strong>UX Excellence:</strong> Create world-class user experiences</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'growth' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Growth Path</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Current Role</h3>
                    <p className="text-gray-600">Senior Full-Stack Developer</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Current</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div>
                    <h3 className="font-semibold">Lead Developer</h3>
                    <p className="text-gray-600">Team leadership role</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-indigo-600">1-2 years</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <h3 className="font-semibold">Engineering Manager</h3>
                    <p className="text-gray-600">Team management</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-purple-600">2-3 years</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div>
                    <h3 className="font-semibold">CTO</h3>
                    <p className="text-gray-600">Technical leadership</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-emerald-600">3-5 years</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Skill Development</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>AI/ML Specialization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    <span>Architecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Leadership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Product</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'apply' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Process</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Steps:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Initial Screening - Resume and portfolio review</li>
                      <li>Technical Assessment - Coding challenge and system design</li>
                      <li>Technical Interview - Deep dive into technical skills</li>
                      <li>Cultural Fit - Meet with the team</li>
                      <li>Final Interview - Meet with leadership</li>
                      <li>Offer - Competitive compensation package</li>
                    </ol>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">What We&apos;re Looking For:</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Technical Excellence - Strong coding skills and architectural thinking</li>
                      <li>AI Interest - Passion for AI and emerging technologies</li>
                      <li>Leadership Potential - Ability to mentor and guide team members</li>
                      <li>Innovation Mindset - Creative problem-solving and out-of-the-box thinking</li>
                      <li>Global Perspective - Experience working with international teams</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Button size="lg" className={`${colors.bg} ${colors.accent} text-white px-8 py-3 text-lg font-semibold hover:opacity-90 transition-opacity`}>
                  <Zap className="w-5 h-5 mr-2" />
                  Apply Now - Join Our PRO Team
                </Button>
                <p className="mt-4 text-gray-600">
                  Be part of something extraordinary! Transform recruitment technology with us.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
