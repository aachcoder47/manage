"use client";

import React, { useState } from "react";
import { PRICING_PLANS, PLAN_ORDER } from "@/config/pricing.config";
import PricingCard from "@/components/pricing/pricingCard";
import { motion } from "framer-motion";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";

export default function PricingPage() {
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    if (!organization) {
      toast.error("Please create an organization first");
      return;
    }

    if (planKey === 'free') {
      toast.info("You're already on the free plan!");
      return;
    }

    if (planKey === 'enterprise') {
      // Open Calendly for enterprise
      window.open('https://calendly.com/ritwikr850/30min', '_blank');
      return;
    }

    setLoading(planKey);
    
    try {
      // Create Razorpay subscription
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey,
          organizationId: organization.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Load Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'Futuristic HR',
        description: `${PRICING_PLANS[planKey].name} Plan`,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              organizationId: organization.id,
              planKey,
            }),
          });

          if (verifyResponse.ok) {
            toast.success('Subscription activated successfully!');
            window.location.href = '/payment/success';
          } else {
            toast.error('Payment verification failed');
            window.location.href = '/payment/failed';
          }
        },
        prefill: {
          name: organization.name,
          email: organization.publicMetadata?.email as string || '',
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any){
        toast.error(response.error.description);
        window.location.href = '/payment/failed';
      });
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(null);
    }
  };

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

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Perfect Plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your hiring process with AI-powered interviews. Start free, upgrade as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {PLAN_ORDER.map((planKey) => {
            const plan = PRICING_PLANS[planKey];
            return (
              <motion.div key={planKey} variants={item}>
                <PricingCard
                  plan={plan}
                  planKey={planKey}
                  onSubscribe={handleSubscribe}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ or Additional Info */}
        <div className="glass-card p-8 rounded-2xl text-center space-y-4">
          <h3 className="text-2xl font-bold">Need Help Choosing?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All plans include our core AI-powered interview features. Upgrade for more interviews, 
            advanced analytics, and premium support.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://wa.me/917462085177"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-semibold"
            >
              Chat with Support
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://calendly.com/ritwikr850/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-semibold"
            >
              Schedule a Demo
            </a>
          </div>
        </div>
      </div>

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </main>
  );
}
