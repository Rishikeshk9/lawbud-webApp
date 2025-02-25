import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function updateUserSubscriptionInDatabase(userId, newPlan) {
  await supabase
    .from('users')
    .update({ subscription_status: newPlan })
    .eq('id', userId);

  console.log(`Updating user ${userId} to plan: ${newPlan}`);
}

async function downgradeUserPlan(userId, productId) {
  if (!userId) {
    console.error('User ID missing in metadata');
    return;
  }

  await updateUserSubscriptionInDatabase(userId, productId);

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } catch (err) {
    console.error(`Failed to update Stripe subscription: ${err.message}`);
  }
}

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

    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscriptionCreated = event.data.object;
        console.log('subscriptionCreated', subscriptionCreated);
        break;
      }
      case 'customer.subscription.updated': {
        const subscriptionUpdated = event.data.object;
        const updatedUserId = subscriptionUpdated.metadata?.userId;
        const updatedSubscriptionId = subscriptionUpdated.id;
        const currentPlan = subscriptionUpdated.items.data[0].price.id;
        const subscriptionStatus = subscriptionUpdated.status;

        if (!updatedUserId) {
          console.error('User ID missing in metadata');
          break;
        }

        try {
          if (subscriptionStatus === 'active') {
            await updateUserSubscriptionInDatabase(
              updatedUserId,

              currentPlan
            );
            console.log(`User ${updatedUserId} upgraded to ${currentPlan}`);
          } else {
            console.log(
              `User ${updatedUserId} subscription updated but not active (${subscriptionStatus})`
            );
          }
        } catch (error) {
          console.error('Error updating user subscription:', error);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscriptionDeleted = event.data.object;
        const deletedUserId = subscriptionDeleted.metadata?.userId;

        try {
          await downgradeUserPlan(deletedUserId, 'free');
          console.log(
            `User ${deletedUserId} downgraded to free after subscription ended.`
          );
        } catch (error) {
          console.error('Error downgrading user:', error);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoicePaymentSucceeded = event.data.object;
        const updatedUserId = invoicePaymentSucceeded.metadata?.userId;
        const updatedSubscriptionId = invoicePaymentSucceeded.subscription;
        const currentPlan = invoicePaymentSucceeded.items.data[0].price.id;
        const subscriptionStatus = invoicePaymentSucceeded.status;

        if (!updatedUserId) {
          console.error('User ID missing in metadata');
          break;
        }

        try {
          if (subscriptionStatus === 'active') {
            await updateUserSubscriptionInDatabase(updatedUserId, currentPlan);
            console.log(`User ${updatedUserId} upgraded to ${currentPlan}`);
          } else {
            console.log(
              `User ${updatedUserId} subscription updated but not active (${subscriptionStatus})`
            );
          }
        } catch (error) {
          console.error('Error updating user subscription:', error);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoicePaymentFailed = event.data.object;
        const failedUserId = invoicePaymentFailed.metadata?.userId;
        const currentPlan = invoicePaymentFailed.items.data[0].price.id;

        try {
          await downgradeUserPlan(failedUserId, 'free');
          console.log(`Downgraded user ${failedUserId} due to failed payment`);
        } catch (error) {
          console.error('Error downgrading user:', error);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    const data = event.data.object;
    const metadata = data.metadata || {};
    const eventUserId = metadata.userId;
    const eventSubscriptionId = data.id;
    const eventStatus = data.status;
    const created = data.created;
    const currency = data.currency;
    const amount = data.amount_due || data.amount_total;

    const subscriptionDetails = {
      userId: eventUserId,
      subscriptionId: eventSubscriptionId,
      status: eventStatus,
      created,
      currency,
      amount,
    };

    try {
      console.log('subscriptionDetails', subscriptionDetails);
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Database update failed:', error);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
