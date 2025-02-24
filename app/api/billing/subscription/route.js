import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    // Get the authorization header
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authorization.replace('Bearer ', '');

    // Create a Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userData.stripe_customer_id) {
      return NextResponse.json({
        subscription: null,
        invoices: [],
        customer: null,
      });
    }

    // Fetch subscription with expanded price and product details
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method', 'data.plan.product'],
    });

    // Fetch customer
    const customer = await stripe.customers.retrieve(
      userData.stripe_customer_id
    );

    // Fetch invoices
    const invoices = await stripe.invoices.list({
      customer: userData.stripe_customer_id,
      limit: 12,
    });

    return NextResponse.json({
      subscription: subscriptions.data[0] || null,
      invoices: invoices.data,
      customer,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}
