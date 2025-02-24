import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { lookupKey } = await request.json();

    // Get authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    let stripeCustomerId = user.stripe_customer_id;

    // Create or get Stripe customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: lookupKey,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments?canceled=true`,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
