import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      type: 'recurring',
    });
    console.log('stripe prices', prices.data);
    const formattedPrices = prices.data
      .filter((price) => price.product.active)
      .sort((a, b) => a.unit_amount - b.unit_amount)
      .map((price) => ({
        id: price.id,
        name: price.product.name,
        description: price.product.description,
        price: (price.unit_amount / 100).toString(),
        currency: price.currency.toUpperCase(),
        interval: price.recurring.interval,
        features: price.product.marketing_features
          ? price.product.marketing_features.map((feature) => feature.name)
          : [],
        popular: price.product.metadata.popular === 'true',
      }));

    return NextResponse.json({ prices: formattedPrices });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
