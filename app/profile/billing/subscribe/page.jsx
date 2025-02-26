'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/stripe/prices');
      const data = await response.json();
      if (!data.prices) throw new Error('Failed to load pricing plans');

      // Add free plan
      const allPlans = [
        {
          id: null,
          name: 'Free',
          price: '0',
          currency: 'INR',
          description: 'Basic features for individuals',
          interval: 'month',
          features: [
            'Access to AI Legal Assistant (30 queries/day)',
            'Basic Document Templates',
            'Community Support',
          ],
          negativeFeatures: ['No Lawyers Chat', 'No Library Access'],
          popular: false,
        },
        ...data.prices,
      ];

      setPlans(allPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing plans',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribe = async (priceId) => {
    if (!priceId) return; // Free plan

    try {
      setLoading(true);
      setSelectedPlan(priceId);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: 'Error',
          description: 'Please login to subscribe',
          variant: 'destructive',
        });
        return;
      }

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      );
      if (!stripe) throw new Error('Failed to load Stripe');

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      if (!data.ok)
        throw new Error(data.error || 'Failed to create checkout session');

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.result.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  if (loadingPlans) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='container max-w-6xl p-6 mx-auto'>
      <div className='text-center'>
        <h1 className='mb-4 text-3xl font-bold'>Choose Your Plan</h1>
        <p className='mb-8 text-gray-600'>
          Select the plan that best fits your needs
        </p>
      </div>

      <div className='grid gap-8 md:grid-cols-3'>
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-6 ${
              plan.popular ? 'border-2 border-primary' : ''
            }`}
          >
            {plan.popular && (
              <div className='absolute top-0 px-3 py-1 text-sm font-medium text-white transform -translate-y-1/2 bg-black rounded-full left-6'>
                Most Popular
              </div>
            )}
            <div className='mb-4'>
              <h3 className='text-xl font-bold'>{plan.name}</h3>
              <p className='mt-2 text-sm text-gray-600'>{plan.description}</p>
            </div>
            <div className='mb-6'>
              <span className='text-3xl font-bold'>
                {plan.id === null ? (
                  'Free'
                ) : (
                  <>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: plan.currency,
                    }).format(parseFloat(plan.price))}
                    <span className='text-lg text-gray-600'>
                      /{plan.interval}
                    </span>
                  </>
                )}
              </span>
            </div>
            <ul className='mb-3 space-y-3 '>
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className='flex items-center text-sm text-gray-600'
                >
                  <Check className='w-4 h-4 mr-2 text-green-500' />
                  {feature}
                </li>
              ))}
            </ul>
            <ul className='mb-6 space-y-3'>
              {plan.negativeFeatures?.map((feature) => (
                <li
                  key={feature}
                  className='flex items-center text-sm text-gray-600'
                >
                  <X className='w-4 h-4 mr-2 text-red-500' />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className='w-full'
              variant={plan.popular ? 'default' : 'outline'}
              disabled={loading && selectedPlan === plan.id}
              onClick={() => handleSubscribe(plan.id)}
            >
              {loading && selectedPlan === plan.id ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : null}
              {plan.id ? 'Subscribe Now' : 'Get Started'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
