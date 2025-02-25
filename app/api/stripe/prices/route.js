import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getAllPrices() {
  let allPrices = [];
  let hasMore = true;
  let lastPriceId = null;

  while (hasMore) {
    const params = {
      active: true,
      expand: ['data.product'],
      limit: 100, // Maximum allowed by Stripe
    };

    // Add starting_after parameter if we have a last price ID
    if (lastPriceId) {
      params.starting_after = lastPriceId;
    }

    const prices = await stripe.prices.list(params);

    allPrices = [...allPrices, ...prices.data];
    hasMore = prices.has_more;

    // Get the ID of the last price in the current batch
    if (prices.data.length > 0) {
      lastPriceId = prices.data[prices.data.length - 1].id;
    }
  }

  return allPrices;
}

export async function GET() {
  try {
    // Fetch only active products first
    const products = await stripe.products.list({
      active: true,
    });
    console.log('stripe products', products);

    // Fetch all prices using pagination
    const allPrices = await getAllPrices();
    console.log('all stripe prices', allPrices);

    // Filter prices to only include those associated with active products
    const productIds = new Set(products.data.map((product) => product.id));
    const filteredPrices = allPrices.filter(
      (price) =>
        price.product &&
        productIds.has(
          typeof price.product === 'string' ? price.product : price.product.id
        )
    );

    const formattedPrices = filteredPrices
      .sort((a, b) => a.unit_amount - b.unit_amount)
      .map((price) => ({
        id: price.id,
        name: price.product.name,
        description: price.product.description,
        price: (price.unit_amount / 100).toString(),
        currency: price.currency.toUpperCase(),
        interval: price.recurring?.interval || 'one_time',
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
