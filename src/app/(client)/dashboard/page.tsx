"use client";

import React, { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import SubscriptionStats from "@/components/dashboard/SubscriptionStats";
import { Gem, Plus, Sparkles, Building2, ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization, isLoaded } = useOrganization();
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] =
    useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function InterviewsLoader() {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 w-full animate-pulse rounded-xl bg-muted/50 border border-muted" />
        ))}
      </>
    );
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          // Import subscription service
          const { SubscriptionService } = await import('@/services/subscription.service');
          
          // Get or create subscription
          let subscription = await SubscriptionService.getSubscriptionByOrgId(organization.id);
          
          if (!subscription) {
            // Create free subscription for new organizations
            subscription = await SubscriptionService.createSubscription({
              organization_id: organization.id,
              plan_type: 'free',
              status: 'active',
            });
          }
          
          setCurrentPlan(subscription.plan_type);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!mounted || !isLoaded) {
    return (
      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <InterviewsLoader />
        </div>
      </main>
    );
  }

  if (!organization) {
    return (
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
           <div className="p-6 bg-indigo-50 rounded-full text-indigo-600 ring-8 ring-indigo-50/50">
              <Building2 size={48} />
           </div>
           <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Create an Organization</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
                You need to create or select an organization to start managing interviews.
            </p>
           </div>
           <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
             <ArrowUpLeft size={16} />
             <span>Use the switcher in the sidebar to create one</span>
           </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{user?.firstName || "there"}</span> 👋
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage your interviews and track candidate responses.
          </p>
        </div>

        {/* Subscription Status Section */}
        {organization?.id && (
          <div className="w-full">
            <SubscriptionStats organizationId={organization.id} />
          </div>
        )}

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {currentPlan == "free_trial_over" ? (
            <motion.div variants={item}>
              <Card className="group relative flex items-center justify-center border-dashed border-2 border-red-200 bg-red-50/50 hover:bg-red-50 cursor-pointer transition-all duration-300 h-72 w-full rounded-xl overflow-hidden">
                <CardContent className="flex items-center flex-col mx-auto p-6 text-center">
                  <div className="flex flex-col justify-center items-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <Plus size={32} className="text-red-500" />
                  </div>
                  <CardTitle className="text-lg font-medium text-red-900">
                    Limit Reached
                  </CardTitle>
                  <p className="text-xs text-red-600 mt-2">
                    Upgrade to create more interviews
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={item}>
              <CreateInterviewCard />
            </motion.div>
          )}

          {interviewsLoading || loading ? (
            <InterviewsLoader />
          ) : (
            <>
              {interviews.map((interview) => (
                <motion.div key={interview.id} variants={item}>
                  <InterviewCard
                    id={interview.id}
                    interviewerId={interview.interviewer_id}
                    name={interview.name}
                    url={interview.url ?? ""}
                    readableSlug={interview.readable_slug}
                  />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* Upgrade Modal */}
        {isModalOpen && (
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="flex flex-col space-y-6 p-2">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mb-2">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-bold">
                  Upgrade to Pro
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  You&apos;ve reached the limit of your free trial. Unlock unlimited potential with our Pro plan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl bg-muted/30">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Free Plan
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">✓ 10 Responses</li>
                    <li className="flex items-center gap-2">✓ Basic Support</li>
                    <li className="flex items-center gap-2">✓ Limited Features</li>
                  </ul>
                </div>
                <div className="p-4 border-2 border-indigo-500/20 bg-indigo-50/50 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-medium">
                    RECOMMENDED
                  </div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-indigo-900">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Pro Plan
                  </h4>
                  <ul className="space-y-2 text-sm text-indigo-800">
                    <li className="flex items-center gap-2">✓ Flexible Pay-Per-Response</li>
                    <li className="flex items-center gap-2">✓ Priority Support</li>
                    <li className="flex items-center gap-2">✓ All AI Features</li>
                  </ul>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Contact <a href="mailto:ritwikr890@gmail.com" className="text-indigo-600 font-semibold hover:underline">ritwikr890@gmail.com</a> to upgrade.
              </div>
            </div>
          </Modal>
        )}
      </div>
    </main>
  );
}

export default Interviews;
