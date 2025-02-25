import { supabase } from './supabase';

// Cache subscriptions data to avoid frequent DB calls
let subscriptionsCache = null;
let cacheExpiry = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getSubscriptionsData() {
  // Return cached data if valid
  if (subscriptionsCache && cacheExpiry && Date.now() < cacheExpiry) {
    return subscriptionsCache;
  }

  // Fetch fresh data
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Update cache
  subscriptionsCache = data;
  cacheExpiry = Date.now() + CACHE_DURATION;

  return data;
}

export async function getUserSubscriptionPlan(userId) {
  // Get user's current subscription status
  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', userId)
    .single();

  if (error) throw error;
  console.log(user);
  // Get all subscription plans
  const subscriptions = await getSubscriptionsData();

  console.log(subscriptions);
  // Find user's current plan
  const currentPlan =
    subscriptions.find(
      (sub) => sub.stripe_price_id === user.subscription_status
    ) || subscriptions.find((sub) => sub.name === 'Free'); // Default to free plan

  console.log(currentPlan);
  return currentPlan;
}

export async function checkFeatureAccess(userId, featureKey) {
  const plan = await getUserSubscriptionPlan(userId);

  // If feature doesn't exist in plan, access is denied
  if (!plan.features[featureKey]) return { allowed: false, limit: 0 };

  const featureValue = plan.features[featureKey];

  // Parse feature value (e.g., "ai_30" -> { allowed: true, limit: 30 })
  const [feature, limit] = featureValue.split('_');
  const numericLimit = parseInt(limit);

  return {
    allowed: numericLimit > 0,
    limit: numericLimit,
    used: 0, // You'll need to implement usage tracking
  };
}

// Usage tracking functions
export async function incrementFeatureUsage(userId, featureKey) {
  const date = new Date().toISOString().split('T')[0]; // Current date as YYYY-MM-DD

  // Get current usage
  const { data: usage, error } = await supabase
    .from('feature_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', featureKey)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found"
    throw error;
  }

  const currentCount = usage?.count || 0;

  // Check if user has access and hasn't exceeded limit
  const access = await checkFeatureAccess(userId, featureKey);
  if (!access.allowed || currentCount >= access.limit) {
    return { allowed: false, remaining: 0 };
  }

  // Increment usage
  const { error: upsertError } = await supabase.from('feature_usage').upsert({
    user_id: userId,
    feature: featureKey,
    date,
    count: currentCount + 1,
  });

  if (upsertError) throw upsertError;

  return {
    allowed: true,
    remaining: access.limit - (currentCount + 1),
  };
}

// Helper to check remaining usage
export async function getFeatureUsage(userId, featureKey) {
  const date = new Date().toISOString().split('T')[0];

  const [access, usage] = await Promise.all([
    checkFeatureAccess(userId, featureKey),
    supabase
      .from('feature_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('feature', featureKey)
      .eq('date', date)
      .single(),
  ]);

  const used = usage?.data?.count || 0;

  return {
    ...access,
    used,
    remaining: access.limit - used,
  };
}

// Add this new function to check lawyer chat initiation limits
export async function checkLawyerChatInitiation(userId, lawyerId) {
  const plan = await getUserSubscriptionPlan(userId);

  // Get the lawyer chat limit from the plan features
  const lawyerChatFeature = plan.features['lawyer_chat_limit'];
  if (!lawyerChatFeature) return { allowed: false, limit: 0 };

  // Parse the limit (e.g., "lawyer_chat_5" -> 5 lawyers)
  const [_, limit] = lawyerChatFeature.split('_');
  const maxLawyers = parseInt(limit);

  if (maxLawyers === 0) return { allowed: false, limit: 0 };

  // Check if chat already exists with this lawyer
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('user_id', userId)
    .eq('lawyer_id', lawyerId)
    .single();

  if (existingChat) {
    // If chat exists, always allow it
    return { allowed: true, limit: maxLawyers, existing: true };
  }

  // Count unique lawyers the user is chatting with
  const { data: uniqueLawyers } = await supabase
    .from('chats')
    .select('lawyer_id')
    .eq('user_id', userId)
    .not('lawyer_id', 'is', null);

  const currentLawyerCount = uniqueLawyers?.length || 0;

  return {
    allowed: currentLawyerCount < maxLawyers,
    limit: maxLawyers,
    current: currentLawyerCount,
    remaining: maxLawyers - currentLawyerCount,
  };
}
