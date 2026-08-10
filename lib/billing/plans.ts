/**
 * Plan catalog. `maxDevices` is snapshotted onto `licenses.max_devices` at
 * purchase time — changing a value here never affects already-sold licenses.
 * Stripe price IDs come from env so test/live mode can use different IDs
 * without touching code.
 */
export type PlanId = 'starter_1' | 'starter_2' | 'starter_unlimited';

export const UNLIMITED_DEVICES = 999;

export const PLANS: Record<PlanId, { label: string; priceCents: number; maxDevices: number; stripePriceEnvVar: string; active: boolean }> = {
  starter_1: {
    label: '1 conta TikTok',
    priceCents: 9700,
    maxDevices: 1,
    stripePriceEnvVar: 'STRIPE_PRICE_ID_STARTER_1',
    active: true
  },
  starter_2: {
    label: '2 contas TikTok',
    priceCents: 14700,
    maxDevices: 2,
    stripePriceEnvVar: 'STRIPE_PRICE_ID_STARTER_2',
    // Paused for now — only the R$97/1-conta plan is on sale. Flip back to
    // true whenever this one's ready to sell again (existing licenses on
    // this plan, if any, are unaffected either way).
    active: false
  },
  starter_unlimited: {
    label: 'Contas ilimitadas',
    priceCents: 29700,
    maxDevices: UNLIMITED_DEVICES,
    stripePriceEnvVar: 'STRIPE_PRICE_ID_STARTER_UNLIMITED',
    active: false
  }
};

export function planByStripePriceId(stripePriceId: string): PlanId | null {
  for (const [planId, plan] of Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]) {
    if (process.env[plan.stripePriceEnvVar] === stripePriceId) return planId;
  }
  return null;
}
