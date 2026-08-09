import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/billing/stripe';
import { PLANS, type PlanId } from '@/lib/billing/plans';

export const runtime = 'nodejs';

const bodySchema = z.object({
  plan_id: z.enum(['starter_1', 'starter_2', 'starter_unlimited'])
});

function baseUrl(): string {
  return (process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
  }

  const planId = parsed.data.plan_id as PlanId;
  const plan = PLANS[planId];
  const priceId = process.env[plan.stripePriceEnvVar];
  if (!priceId) {
    console.error(`[checkout] missing env var ${plan.stripePriceEnvVar}`);
    return NextResponse.json({ error: 'Plano indisponível no momento.' }, { status: 500 });
  }

  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { planId },
    subscription_data: { metadata: { planId } },
    success_url: `${baseUrl()}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/`,
    allow_promotion_codes: true
  });

  return NextResponse.json({ url: session.url });
}
