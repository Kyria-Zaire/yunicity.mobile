import Stripe from 'stripe';
import { env } from '../config/env.js';
import { PLANS, type PlanId } from '../config/plans.js';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return _stripe;
}

export async function createOrRetrieveCustomer(params: {
  email: string;
  userId: string;
  name?: string | undefined;
}): Promise<string> {
  const stripe = getStripe();
  if (!stripe) {
    console.log(`[DEV STRIPE] Customer simulé: ${params.email}`);
    return `cus_dev_${params.userId}`;
  }

  const existing = await stripe.customers.search({
    query: `metadata['userId']:'${params.userId}'`,
    limit: 1,
  });

  if (existing.data[0]) return existing.data[0].id;

  const customerParams: Stripe.CustomerCreateParams = {
    email: params.email,
    metadata: { userId: params.userId },
  };
  // exactOptionalPropertyTypes: ne pas renseigner `name` s'il est `undefined`
  if (params.name) customerParams.name = params.name;

  const customer = await stripe.customers.create(customerParams);

  return customer.id;
}

export async function createCheckoutSession(params: {
  customerId: string;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
  userId: string;
}): Promise<string> {
  const stripe = getStripe();
  const plan = PLANS[params.planId];

  if (!stripe) {
    console.log(`[DEV STRIPE] Checkout simulé plan ${params.planId}`);
    return `${params.successUrl}?session_id=cs_dev_simulation`;
  }

  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
    metadata: { userId: params.userId, planId: params.planId },
    ...(plan.trialDays > 0 ? { trial_period_days: plan.trialDays } : {}),
  };

  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          product_data: { name: plan.name },
          unit_amount: plan.price,
          recurring: { interval: plan.interval },
        },
        quantity: 1,
      },
    ],
    subscription_data: subscriptionData,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { userId: params.userId, planId: params.planId },
  });

  return session.url ?? params.cancelUrl;
}

export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  if (!stripe) return params.returnUrl;

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session.url;
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event | null {
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return null;

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return null;
  }
}

