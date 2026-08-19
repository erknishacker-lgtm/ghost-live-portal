/**
 * Plan catalog. `maxDevices` is snapshotted onto `licenses.max_devices` at
 * purchase time — changing a value here never affects already-sold licenses.
 * Stripe price IDs come from env so test/live mode can use different IDs
 * without touching code.
 */
export type PlanId = 'starter_1' | 'starter_2' | 'starter_unlimited';

export const UNLIMITED_DEVICES = 999;

// Stripe subscriptions bill on whatever interval the Price object itself is
// configured with (mode: 'subscription' in create-session just follows it) -
// this field is display-only, so the portal shows the right suffix/period.
type BillingInterval = 'month' | 'year';

export const PLANS: Record<
  PlanId,
  { label: string; priceCents: number; maxDevices: number; interval: BillingInterval; stripePriceEnvVar: string; active: boolean }
> = {
  starter_1: {
    label: '1 conta TikTok',
    priceCents: 9700,
    maxDevices: 1,
    interval: 'month',
    stripePriceEnvVar: 'STRIPE_PRICE_ID_STARTER_1',
    active: true
  },
  starter_2: {
    label: '2 contas TikTok',
    priceCents: 14700,
    maxDevices: 2,
    interval: 'month',
    stripePriceEnvVar: 'STRIPE_PRICE_ID_STARTER_2',
    // Paused for now — only starter_1 and Ultra are on sale. Flip back to
    // true whenever this one's ready to sell again (existing licenses on
    // this plan, if any, are unaffected either way).
    active: false
  },
  // "Ultra" - same PlanId/env-var/Stripe Price plumbing as before, just
  // repriced: 5 devices, billed yearly instead of unlimited devices/mo.
  // The Stripe Price this env var points to must be swapped for a new
  // R$947/year recurring price (Stripe prices are immutable - can't just
  // edit the amount/interval on the existing one).
  starter_unlimited: {
    label: 'Ultra',
    priceCents: 94700,
    maxDevices: 5,
    interval: 'year',
    stripePriceEnvVar: 'STRIPE_PRICE_ID_STARTER_UNLIMITED',
    active: true
  }
};

export function planByStripePriceId(stripePriceId: string): PlanId | null {
  for (const [planId, plan] of Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]) {
    if (process.env[plan.stripePriceEnvVar] === stripePriceId) return planId;
  }
  return null;
}
