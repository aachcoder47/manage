"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CreditCard, ArrowRight, RefreshCw } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { SubscriptionService } from "@/services/subscription.service";
import { PRICING_PLANS } from "@/config/pricing.config";

export default function PaymentPendingPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (organization?.id) {
        try {
          const subData = await SubscriptionService.getSubscriptionByOrgId(organization.id);
          setSubscription(subData);
          
          // If subscription is already active, redirect to dashboard
          if (subData && subData.status === 'active' && subData.plan_type !== 'free') {
            router.push('/dashboard');
            return;
          }
        } catch (error) {
          console.error("Failed to fetch subscription:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubscription();
  }, [organization, router]);

  const handleRetryPayment = async () => {
    if (!subscription?.razorpay_subscription_id || !organization?.id) {
      toast.error("Subscription details not found");
      return;
    }

    setProcessing(true);
    try {
      // Load Razorpay
      const Razorpay = (await import('razorpay')).default;
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_...', // Fallback for testing
        subscription_id: subscription.razorpay_subscription_id,
        name: "FoloUp",
        description: "Complete your subscription payment",
        image: "/logo.png", // Add your logo path
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
              planKey: subscription.plan_type,
            }),
          });

          if (verifyResponse.ok) {
            toast.success("Payment completed successfully!");
            router.push('/payment/success');
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function() {
            toast.info("Payment cancelled. You can try again later.");
            setProcessing(false);
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment retry error:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const subData = await SubscriptionService.getSubscriptionByOrgId(organization!.id);
      setSubscription(subData);
      
      if (subData.status === 'active' && subData.plan_type !== 'free') {
        toast.success("Payment completed! Redirecting to dashboard...");
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        toast.info("Payment is still pending. Please complete the payment.");
      }
    } catch (error) {
      console.error("Failed to check status:", error);
      toast.error("Failed to check payment status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!subscription || subscription.status !== 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Pending Payment</h1>
        <p className="text-muted-foreground mb-6">You don't have any pending payments.</p>
        <Link href="/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const planConfig = PRICING_PLANS[subscription.plan_type] || PRICING_PLANS['basic'];

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Pending</h1>
        <p className="text-muted-foreground text-lg">
          Complete your payment to activate your {planConfig.name} subscription
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plan</span>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                {planConfig.name}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price</span>
              <span className="font-semibold">
                {planConfig.price ? `₹${planConfig.price}/month` : 'Custom'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subscription ID</span>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {subscription.razorpay_subscription_id}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <CardTitle>What You'll Get</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {planConfig.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-yellow-800">
                Your subscription is ready! Complete the payment to start using premium features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleRetryPayment}
                  disabled={processing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCheckStatus}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Check Status
                </Button>
              </div>
              
              <div className="text-sm text-yellow-700">
                <p>Need help? Contact support at support@foloup.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-muted-foreground">
              Back to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
