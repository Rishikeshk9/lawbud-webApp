'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Toaster } from '@/components/ui/toaster';

function BillingPageSkeleton() {
  return (
    <div className='container max-w-4xl p-6 mx-auto'>
      {/* Title Skeleton */}
      <div className='h-9 mb-8 bg-gray-200 rounded-md w-60 animate-pulse' />

      {/* Current Plan Card Skeleton */}
      <Card className='p-6 mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div className='space-y-2'>
            <div className='h-6 bg-gray-200 rounded-md w-32 animate-pulse' />
            <div className='h-4 bg-gray-200 rounded-md w-48 animate-pulse' />
          </div>
          <div className='h-10 bg-gray-200 rounded-md w-40 animate-pulse' />
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className='h-4 mb-2 bg-gray-200 rounded-md w-24 animate-pulse' />
              <div className='h-6 bg-gray-200 rounded-md w-32 animate-pulse' />
            </div>
          ))}
        </div>
      </Card>

      {/* Payment History Skeleton */}
      <div className='h-7 mb-4 bg-gray-200 rounded-md w-40 animate-pulse' />
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b'>
              {['Date', 'Amount', 'Status', 'Invoice'].map((header) => (
                <th key={header} className='px-6 py-3'>
                  <div className='h-4 bg-gray-200 rounded-md w-20 animate-pulse' />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y'>
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                {[1, 2, 3, 4].map((j) => (
                  <td key={j} className='px-6 py-4'>
                    <div className='h-4 bg-gray-200 rounded-md w-24 animate-pulse' />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BillingPageContent() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check URL parameters for payment status
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    console.log('success', success);
    console.log('error', error);
    if (success === 'true') {
      toast({
        title: 'Payment Successful',
        variant: 'success',
        description: 'Your subscription has been activated successfully!',
      });
    } else if (error === 'true') {
      toast({
        title: 'Payment Failed',
        description:
          'There was an issue processing your payment. Please try again.',
        variant: 'destructive',
      });
    }

    loadBillingInfo();
  }, [searchParams]);

  const loadBillingInfo = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/billing/subscription', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);
        setInvoices(data.invoices);
        setCustomer(data.customer);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error loading billing info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('session', session);
      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      window.location.href = data.url;
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BillingPageSkeleton />;
  }

  return (
    <div className='container max-w-4xl p-6 mx-auto'>
      <Toaster />
      <h1 className='mb-8 text-3xl font-bold'>Billing & Subscription</h1>

      {/* Current Plan */}
      <Card className='p-6 mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-xl font-semibold'>Current Plan</h2>
            {subscription ? (
              <p className='text-sm text-gray-600'>
                {subscription.plan.product.name} - {subscription.plan.nickname}
              </p>
            ) : (
              <p className='text-sm text-gray-600'>Free Plan</p>
            )}
          </div>
          {subscription ? (
            <Button onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          ) : (
            <Button asChild>
              <Link href='/profile/billing/subscribe'>Upgrade Plan</Link>
            </Button>
          )}
        </div>

        {subscription && (
          <div className='grid gap-4 md:grid-cols-3'>
            <div>
              <p className='text-sm text-gray-600'>Status</p>
              <p className='flex items-center mt-1'>
                <CheckCircle className='w-4 h-4 mr-2 text-green-500' />
                Active
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Next Payment</p>
              <p className='mt-1'>
                {new Date(
                  subscription.current_period_end * 1000
                ).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Payment Method</p>
              <p className='mt-1'>
                {subscription.default_payment_method?.card?.brand} ****
                {subscription.default_payment_method?.card?.last4}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Payment History */}
      <h2 className='mb-4 text-xl font-semibold'>Payment History</h2>
      {invoices.length > 0 ? (
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='text-left border-b'>
                <th className='px-6 py-3 text-sm font-medium text-gray-500'>
                  Date
                </th>
                <th className='px-6 py-3 text-sm font-medium text-gray-500'>
                  Amount
                </th>
                <th className='px-6 py-3 text-sm font-medium text-gray-500'>
                  Status
                </th>
                <th className='px-6 py-3 text-sm font-medium text-gray-500'>
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className='px-6 py-4 text-sm'>
                    {new Date(invoice.created * 1000).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: invoice.currency.toUpperCase(),
                    }).format(invoice.amount_paid / 100)}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    <a
                      href={invoice.hosted_invoice_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary hover:underline'
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className='text-gray-600'>No payment history available</p>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingPageSkeleton />}>
      <BillingPageContent />
    </Suspense>
  );
}
