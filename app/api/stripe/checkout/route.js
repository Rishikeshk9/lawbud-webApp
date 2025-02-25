import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
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

    const data = await request.json();
    console.log('data', data);
    const priceId = data.priceId;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/billing?error=true`,
      metadata: {
        userId: user.id,
        priceId,
      },
    });
    console.log('checkoutSession', checkoutSession);

    return NextResponse.json({ result: checkoutSession, ok: true });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Server', { status: 500 });
  }
}
