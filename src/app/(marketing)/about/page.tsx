import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

export default function AboutPage() {
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

      {/* Content */}
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Futuristic HR</h1>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Futuristic HR is revolutionizing the recruitment industry with cutting-edge AI technology. 
              Our mission is to make hiring faster, fairer, and more efficient for companies of all sizes.
            </p>
            
            <p>
              Founded with the vision of transforming how organizations identify and evaluate talent, 
              we combine advanced artificial intelligence with human-centric design to create an interview 
              platform that works for everyone.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-8">Our Mission</h2>
            <p>
              To empower organizations with AI-driven insights that help them make better hiring decisions, 
              reduce bias, and build diverse, high-performing teams.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-8">Why Choose Us?</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>AI-powered interview analysis for objective candidate evaluation</li>
              <li>Automated screening process that saves time and resources</li>
              <li>Data-driven insights to make informed hiring decisions</li>
              <li>Scalable solution from startups to enterprise organizations</li>
              <li>Commitment to reducing unconscious bias in recruitment</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-8">Get in Touch</h2>
            <p>
              Want to learn more about how Futuristic HR can transform your hiring process? 
              We&apos;d love to hear from you.
            </p>
            
            <div className="pt-4">
              <Link href="/contact">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
