"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { PricingPlan } from "@/config/pricing.config";

interface PricingCardProps {
  plan: PricingPlan;
  planKey: string;
  onSubscribe: (planKey: string) => void;
}

export default function PricingCard({ plan, planKey, onSubscribe }: PricingCardProps) {
  // Suppress Next.js props serialization warnings for callback functions
  // These are expected behavior for interactive components
  const isEnterprise = planKey === 'enterprise';
  const isFree = planKey === 'free';

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
        plan.popular 
          ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-500/20' 
          : 'glass-card hover:shadow-lg'
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold flex items-center gap-1">
          <Sparkles size={12} />
          MOST POPULAR
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
        <div className="flex items-baseline justify-center gap-1">
          {plan.price !== null ? (
            <>
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </>
          ) : (
            <span className="text-3xl font-bold">Custom</span>
          )}
        </div>
        {!isFree && !isEnterprise && (
          <p className="text-sm text-muted-foreground mt-2">
            {plan.interviews === -1 ? 'Unlimited' : plan.interviews} interviews/month
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={`feature-${index}`} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className={`w-full ${
            plan.popular
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              : isFree
              ? 'bg-muted hover:bg-muted/80 text-foreground'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          onClick={() => onSubscribe(planKey)}
          size="lg"
        >
          {plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
