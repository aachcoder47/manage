"use client";

import React, { useState, useEffect } from "react";
import { Plus, Lock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function CreateInterviewCard() {
  const [open, setOpen] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const { organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (organization?.id) {
        try {
          const { SubscriptionService } = await import('@/services/subscription.service');
          const subData = await SubscriptionService.getSubscriptionByOrgId(organization.id);
          setSubscription(subData);
        } catch (error) {
          console.error("Failed to fetch subscription:", error);
        }
      }
    };

    fetchSubscription();
  }, [organization]);

  const handleClick = async () => {
    if (!organization) {
      toast.error("Please create an organization first");
      return;
    }

    // Check if user is subscribed (not free plan)
    if (subscription && subscription.status === 'active' && subscription.plan_type !== 'free') {
      toast.info("You're subscribed! Interview creation is managed through your subscription plan.", {
        duration: 4000,
      });
      return;
    }

    // Check if user has pending subscription
    if (subscription && subscription.status === 'pending') {
      toast.info("Redirecting to payment page...", {
        duration: 2000,
      });
      router.push('/payment/pending');
      return;
    }

    try {
      // Check if user can create more interviews
      const { SubscriptionService } = await import('@/services/subscription.service');
      const canCreate = await SubscriptionService.canCreateInterview(organization.id);
      
      if (!canCreate) {
        toast.error("You've reached your interview limit. Please upgrade to create more interviews.", {
          duration: 4000,
          action: {
            label: "View Plans",
            onClick: () => router.push('/pricing'),
          },
        });
        return;
      }

      // If can create, open the modal
      setOpen(true);
    } catch (error) {
      console.error("Error checking interview limit:", error);
      toast.error("Failed to check interview limit");
    }
  };

  return (
    <>
      <Card
        className={`group relative flex items-center justify-center border-dashed border-2 h-72 w-full rounded-xl overflow-hidden transition-all duration-300 ${
          subscription && subscription.status === 'active' && subscription.plan_type !== 'free'
            ? 'border-green-200 bg-green-50/30 cursor-not-allowed'
            : subscription && subscription.status === 'pending'
            ? 'border-yellow-200 bg-yellow-50/30 cursor-pointer hover:border-yellow-300 hover:shadow-lg'
            : 'border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 cursor-pointer hover:border-primary/50 hover:shadow-lg'
        }`}
        onClick={handleClick}
      >
        <CardContent className="flex items-center flex-col mx-auto p-6">
          <div className={`flex flex-col justify-center items-center w-16 h-16 rounded-full mb-4 transition-colors ${
            subscription && subscription.status === 'active' && subscription.plan_type !== 'free'
              ? 'bg-green-100'
              : subscription && subscription.status === 'pending'
              ? 'bg-yellow-100'
              : 'bg-primary/5 group-hover:bg-primary/10'
          }`}>
            {subscription && subscription.status === 'active' && subscription.plan_type !== 'free' ? (
              <Lock size={32} className="text-green-600" />
            ) : subscription && subscription.status === 'pending' ? (
              <AlertCircle size={32} className="text-yellow-600" />
            ) : (
              <Plus size={32} className="text-primary/70 group-hover:text-primary transition-colors" />
            )}
          </div>
          <CardTitle className={`text-lg font-medium text-center transition-colors ${
            subscription && subscription.status === 'active' && subscription.plan_type !== 'free'
              ? 'text-green-700'
              : subscription && subscription.status === 'pending'
              ? 'text-yellow-700 group-hover:text-yellow-800'
              : 'text-muted-foreground group-hover:text-foreground'
          }`}>
            {subscription && subscription.status === 'active' && subscription.plan_type !== 'free'
              ? 'Subscribed Plan'
              : subscription && subscription.status === 'pending'
              ? 'Complete Payment'
              : 'Create New Interview'
            }
          </CardTitle>
          <p className={`text-xs text-center mt-2 max-w-[150px] ${
            subscription && subscription.status === 'active' && subscription.plan_type !== 'free'
              ? 'text-green-600'
              : subscription && subscription.status === 'pending'
              ? 'text-yellow-600'
              : 'text-muted-foreground/70'
          }`}>
            {subscription && subscription.status === 'active' && subscription.plan_type !== 'free'
              ? 'Access managed by subscription'
              : subscription && subscription.status === 'pending'
              ? 'Click to complete payment'
              : 'Set up a new AI-conducted interview in seconds'
            }
          </p>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <CreateInterviewModal open={open} setOpen={setOpen} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
