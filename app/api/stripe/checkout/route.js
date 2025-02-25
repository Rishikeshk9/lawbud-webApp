import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  let stripeCustomer;
  try {
    // Get authenticated user from Supabase
    const authHeader = request.headers.get('authorization');
    const sessionData = authHeader.split(' ')[1].toString();
    const decodedToken = JSON.parse(
      Buffer.from(sessionData.split('.')[1], 'base64').toString()
    );

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }
    if (!decodedToken.session_id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decodedToken.sub)
      .single();
    console.log('user', user);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 1: Create Stripe Customer if missing
    if (!user.stripe_customer_id) {
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        phone: user.phone,
        metadata: { userId: user.id, role: user.role },
      });

      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomer.id })
        .eq('id', user.id);
    } else {
      stripeCustomer = await stripe.customers.retrieve(user.stripe_customer_id);
    }

    const data = await request.json();

    const priceId = data.priceId;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/billing?success=true&priceId=${priceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/billing?error=true`,
      metadata: {
        userId: user.id,
        priceId,
      },
    });

    return NextResponse.json({ result: checkoutSession, ok: true });
  } catch (error) {
    console.log(error);
    if (stripeCustomer?.id) {
      await stripe.customers.del(stripeCustomer.id);
    }
    return new NextResponse('Internal Server', { status: 500 });
  }
}
