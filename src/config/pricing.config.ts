export interface PricingPlan {
  name: string;
  interviews: number; // -1 means unlimited
  price: number | null; // null for enterprise (custom pricing)
  currency: string; // Currency code (e.g., 'INR', 'USD')
  features: string[];
  popular?: boolean;
  cta: string;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  free: {
    name: 'Free',
    interviews: 1,
    price: 0,
    currency: 'INR',
    features: [
      '1 Interview',
      'Basic AI Analysis',
      'Email Support',
      'Response Analytics'
    ],
    cta: 'Get Started'
  },
  basic: {
    name: 'Basic',
    interviews: 50,
    price: 3999,
    currency: 'INR',
    features: [
      '50 Interviews/month',
      'AI Analysis',
      'Email Support',
      'Response Analytics',
      'Custom Questions'
    ],
    cta: 'Subscribe'
  },
  pro: {
    name: 'Pro',
    interviews: 300,
    price: 15999,
    currency: 'INR',
    features: [
      '300 Interviews/month',
      'Advanced AI Analysis',
      'Priority Support',
      'Custom Branding',
      'Advanced Analytics',
      'Export Reports'
    ],
    popular: true,
    cta: 'Subscribe'
  },
  advanced: {
    name: 'Advanced',
    interviews: 1000,
    price: 39999,
    currency: 'INR',
    features: [
      '1000 Interviews/month',
      'Premium AI Features',
      'Dedicated Support',
      'White Label',
      'API Access',
      'Team Collaboration',
      'Custom Integrations'
    ],
    cta: 'Subscribe'
  },
  enterprise: {
    name: 'Enterprise',
    interviews: -1,
    price: null,
    currency: 'INR',
    features: [
      'Unlimited Interviews',
      'Custom AI Training',
      '24/7 Support',
      'SLA Guarantee',
      'Custom Integration',
      'Dedicated Account Manager',
      'On-premise Deployment'
    ],
    cta: 'Contact Sales'
  }
};

export const PLAN_ORDER = ['free', 'basic', 'pro', 'advanced', 'enterprise'];
