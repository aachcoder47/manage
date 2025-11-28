"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { SubscriptionService, Subscription } from "@/services/subscription.service";
import { PRICING_PLANS } from "@/config/pricing.config";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionStatsProps {
  organizationId: string;
}

export default function SubscriptionStats({ organizationId }: SubscriptionStatsProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subData, usageData] = await Promise.all([
          SubscriptionService.getSubscriptionByOrgId(organizationId),
          SubscriptionService.getMonthlyInterviewCount(organizationId)
        ]);
        setSubscription(subData);
        setUsage(usageData);
      } catch (error) {
        console.error("Failed to fetch subscription stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  if (loading) {
    return <SubscriptionStatsSkeleton />;
  }

  if (!subscription) return null;

  const planKey = subscription.plan_type;
  const planConfig = PRICING_PLANS[planKey] || PRICING_PLANS['free'];
  const limit = planConfig.interviews;
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((usage / limit) * 100, 100);
  const remaining = isUnlimited ? "Unlimited" : Math.max(0, limit - usage);

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-100" />
            Subscription Status
          </CardTitle>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            subscription.status === 'active' && subscription.plan_type !== 'free'
              ? 'bg-green-100 text-green-700'
              : subscription.status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}>
            {subscription.status === 'active' && subscription.plan_type !== 'free'
              ? 'Subscribed'
              : subscription.status === 'pending'
              ? 'Pending'
              : `${planConfig.name} Plan`
            }
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Monthly Interview Credits</span>
            <span className={remaining === 0 && !isUnlimited ? "text-red-600" : "text-foreground"}>
              {isUnlimited ? "Unlimited" : `${usage} / ${limit} Used`}
            </span>
          </div>
          {!isUnlimited && (
            <div className="relative pt-1">
              <Progress value={percentage} className="h-2.5" />
              {percentage >= 90 && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Running low on credits
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {isUnlimited 
              ? "You have unlimited access to all features." 
              : `You have ${remaining} interview credits remaining this month.`}
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground">Included Features:</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {planConfig.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade CTA */}
        {planKey !== 'enterprise' && subscription.status === 'active' && subscription.plan_type === 'free' && (
          <div className="pt-2">
            <Link href="/pricing" className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white group">
                Upgrade Plan
                <Zap className="w-4 h-4 ml-2 group-hover:fill-white/20 transition-all" />
              </Button>
            </Link>
          </div>
        )}

        {/* Pending Payment Message */}
        {subscription.status === 'pending' && (
          <div className="pt-2">
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Payment Pending</span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                Complete payment to activate {planConfig.name} features
              </p>
            </div>
          </div>
        )}

        {/* Subscribed Status Message */}
        {subscription.status === 'active' && subscription.plan_type !== 'free' && (
          <div className="pt-2">
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">You're subscribed!</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Full access to all {planConfig.name} features
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubscriptionStatsSkeleton() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
