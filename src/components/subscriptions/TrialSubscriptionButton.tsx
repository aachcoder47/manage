"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PRICING_PLANS } from "@/config/pricing.config";

interface TrialSubscriptionButtonProps {
  planType: 'basic' | 'pro' | 'advanced';
  userEmail: string;
  userName: string;
  onTrialStarted?: () => void;
}

export default function TrialSubscriptionButton({
  planType,
  userEmail,
  userName,
  onTrialStarted,
}: TrialSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          userEmail,
          userName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start trial');
      }

      toast.success(`🎉 Your ${planType} trial has started!`);
      onTrialStarted?.();
    } catch (error: any) {
      console.error('Trial start error:', error);
      toast.error(error.message || 'Failed to start trial');
    } finally {
      setLoading(false);
    }
  };

  const plan = PRICING_PLANS[planType];
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 14);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Calendar className="w-3 h-3 mr-1" />
          14-Day Trial
        </Badge>
      </div>
      
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">₹{plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Start free, pay after 14 days
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-blue-900 mb-1">Trial Benefits:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Full access to all {plan.name} features</li>
            <li>• {plan.interviews === -1 ? 'Unlimited' : plan.interviews} interview credits</li>
            <li>• No credit card required to start</li>
            <li>• Cancel anytime during trial</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Trial ends on {trialEnds.toLocaleDateString()}</p>
          <p>You'll be charged ₹{plan.price} after trial unless cancelled</p>
        </div>

        <Button 
          onClick={handleStartTrial}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting Trial...
            </>
          ) : (
            `Start 14-Day Free Trial`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          No commitment • Cancel anytime
        </p>
      </CardContent>
    </Card>
  );
}
