import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/billing/stripe';
import { prisma } from '@/lib/db/prisma';
import { provisionLicenseFromCheckout, renewLicenseBySubscription, suspendLicenseBySubscription, revokeLicenseBySubscription } from '@/lib/billing/provision';
import type { PlanId } from '@/lib/billing/plans';

export const runtime = 'nodejs';

async function alreadyProcessed(eventId: string, type: string): Promise<boolean> {
  try {
    await prisma.stripeWebhookEvent.create({ data: { id: eventId, type } });
    return false;
  } catch {
    // Unique constraint hit → we've seen this event id before.
    return true;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 500 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    console.error('[stripe webhook] assinatura inválida', error);
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  if (await alreadyProcessed(event.id, event.type)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const planId = (session.metadata?.planId || null) as PlanId | null;
        if (!planId) {
          console.error('[stripe webhook] checkout.session.completed sem metadata.planId', session.id);
          break;
        }

        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        const subscription = await stripe().subscriptions.retrieve(subscriptionId);
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const email = session.customer_details?.email || session.customer_email;

        if (!customerId || !email) {
          console.error('[stripe webhook] checkout.session.completed sem customer/email', session.id);
          break;
        }

        await provisionLicenseFromCheckout({
          email,
          name: session.customer_details?.name ?? null,
          planId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (!subscriptionId) break;
        const subscription = await stripe().subscriptions.retrieve(subscriptionId);
        await renewLicenseBySubscription(subscriptionId, new Date(subscription.current_period_end * 1000));
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (!subscriptionId) break;
        await suspendLicenseBySubscription(subscriptionId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await revokeLicenseBySubscription(subscription.id);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`[stripe webhook] erro processando ${event.type}`, error);
    return NextResponse.json({ error: 'Falha ao processar evento.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
