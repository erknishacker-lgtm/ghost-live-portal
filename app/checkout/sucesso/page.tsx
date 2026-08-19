import { headers } from 'next/headers';
import { CheckCircle } from '@phosphor-icons/react/ssr';
import { stripe } from '@/lib/billing/stripe';
import { PricingCta } from '@/app/assinar/pricing-cta';
import { MetaPixel, GHOST_LIVE_META_PIXEL_ID } from '@/lib/analytics/meta-pixel';

// See app/login/page.tsx for why nonce-based CSP requires this.
export const dynamic = 'force-dynamic';

async function purchaseParams(sessionId: string | undefined) {
  if (!sessionId) return undefined;
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (typeof session.amount_total !== 'number' || !session.currency) return undefined;
    return { value: session.amount_total / 100, currency: session.currency.toUpperCase() };
  } catch (error) {
    // Pixel firing shouldn't ever block the thank-you page from rendering.
    console.error('[checkout/sucesso] falha ao buscar sessão do Stripe pro Pixel', error);
    return undefined;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const nonce = headers().get('x-nonce') || '';
  const params = await purchaseParams(searchParams.session_id);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center'
      }}
    >
      <MetaPixel nonce={nonce} pixelId={GHOST_LIVE_META_PIXEL_ID} events={[{ name: 'Purchase', params }]} />

      <div style={{ maxWidth: 440, marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          <img src="/ghost-logo.png" alt="Ghost Live" style={{ width: 56, height: 56 }} />
          <span style={{ fontSize: 20, fontWeight: 800 }}>Ghost Live</span>
        </div>
        <CheckCircle size={40} weight="fill" color="#8be28b" style={{ marginBottom: 14 }} />
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Pagamento confirmado</h1>
        <p style={{ color: '#9a9a9a', fontSize: 14, lineHeight: 1.5, margin: '0 0 24px' }}>
          Enviamos um e-mail com sua chave de licença e um link pra você definir sua senha de acesso ao portal. Pode
          levar alguns minutos pra chegar.
        </p>
        <a href="/set-password" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Já recebeu? Definir senha
        </a>
      </div>

      <div>
        <p style={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>
          Quer ativar em mais uma conta TikTok?
        </p>
        <PricingCta />
      </div>
    </main>
  );
}
