import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.async_payment_failed':
        const checkoutSessionAsyncPaymentFailed = event.data.object;
        // Then define and call a function to handle the event checkout.session.async_payment_failed
        break;
      case 'checkout.session.async_payment_succeeded':
        const checkoutSessionAsyncPaymentSucceeded = event.data.object;
        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        break;
      case 'checkout.session.completed':
        const checkoutSessionCompleted = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed
        break;
      case 'checkout.session.expired':
        const checkoutSessionExpired = event.data.object;
        // Then define and call a function to handle the event checkout.session.expired
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    const data = event.data.object;
    const metadata = data.metadata;
    const userId = metadata.userId;
    const priceId = metadata.priceId;
    const created = data.created;
    const currency = data.currency;
    const customerDetails = data.customer_details;
    const amount = data.amount_total;
    const transactionDetails = {
      userId,
      priceId,
      created,
      currency,
      customerDetails,
      amount,
    };
    try {
      // database update here
      console.log('transactionDetails', transactionDetails);
      return NextResponse.json({ received: true });
    } catch (error) {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
