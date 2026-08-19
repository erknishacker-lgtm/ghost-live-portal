import { headers } from 'next/headers';
// The regular @phosphor-icons/react entry uses React.createContext, which
// isn't available in Server Components — the /ssr entry ships context-free
// icon components specifically for this.
import { Infinity as InfinityIcon, ShieldCheck, PushPin, MonitorPlay, ShoppingCartSimple, Microphone } from '@phosphor-icons/react/ssr';
import { PricingCta } from './pricing-cta';
import { MetaPixel, GHOST_LIVE_META_PIXEL_ID } from '@/lib/analytics/meta-pixel';

// See app/login/page.tsx for why nonce-based CSP requires this.
export const dynamic = 'force-dynamic';

const ACCENT = '#8be28b';

const FEATURES = [
  {
    title: 'Modo Infinito',
    desc: 'Reinicia sozinha, sem cair, por horas seguidas.',
    icon: InfinityIcon,
    span: 4,
    image: 'https://picsum.photos/seed/ghost-live-night-stream/900/540'
  },
  {
    title: 'Proteção contra violação',
    desc: 'Encerra a live antes de qualquer risco de banimento.',
    icon: ShieldCheck,
    span: 2,
    tint: true
  },
  { title: 'Produto sempre fixado', desc: 'Refixa sozinho se cair, sem tocar no cupom.', icon: PushPin, span: 2 },
  { title: 'Espelhamento de tela', desc: 'Transmite direto da tela ou de um vídeo em loop.', icon: MonitorPlay, span: 2 },
  { title: 'Carrinho e compra', desc: 'Avisa sozinha quando alguém adiciona ou compra.', icon: ShoppingCartSimple, span: 2 },
  {
    title: 'Assistente de Voz IA',
    desc: 'Responde o chat com a sua própria voz, ao vivo.',
    icon: Microphone,
    span: 6,
    image: 'https://picsum.photos/seed/ghost-live-voice-wave/1400/500'
  }
] as const;

export default function SalesPage() {
  const nonce = headers().get('x-nonce') || '';

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <MetaPixel nonce={nonce} pixelId={GHOST_LIVE_META_PIXEL_ID} events={[{ name: 'PageView' }]} />

      {/* Seção 1 — apresentação + assinatura (primeira dobra) */}
      <section
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          padding: '24px'
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 56,
            alignItems: 'center',
            width: '100%'
          }}
          className="hero-grid"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <img src="/ghost-logo.png" alt="Ghost Live" style={{ width: 36, height: 36 }} />
              <span style={{ fontSize: 17, fontWeight: 800 }}>Ghost Live</span>
            </div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: '#9a9a9a', textTransform: 'uppercase', marginBottom: 14 }}>
              Para quem vende ao vivo no TikTok
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.12, margin: '0 0 16px' }}>
              Sua LIVE roda sozinha.
            </h1>
            <p style={{ color: '#9a9a9a', fontSize: 16, lineHeight: 1.5, maxWidth: 440, margin: 0 }}>
              Automação, proteção contra banimento e vendas rodando sozinhas, pra você focar em vender, não em ficar
              de olho na tela.
            </p>
          </div>

          <PricingCta />
        </div>
      </section>

      {/* Seção 2 — recursos */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid #1c1c1c' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 40px', textAlign: 'center' }}>O que ela faz por você</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 16
            }}
            className="feature-grid"
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const hasImage = 'image' in feature;
              return (
                <div
                  key={feature.title}
                  style={{
                    gridColumn: `span ${feature.span}`,
                    position: 'relative',
                    borderRadius: 12,
                    border: '1px solid #2a2a2a',
                    overflow: 'hidden',
                    minHeight: hasImage ? 220 : 160,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: hasImage
                      ? '#141414'
                      : 'tint' in feature
                        ? `linear-gradient(160deg, rgba(139,226,139,.10), #141414 65%)`
                        : '#141414'
                  }}
                >
                  {hasImage && (
                    <img
                      src={feature.image}
                      alt=""
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(0.4) brightness(0.45)'
                      }}
                    />
                  )}
                  <div style={{ position: 'relative' }}>
                    <Icon size={22} weight="regular" color={ACCENT} style={{ marginBottom: 12 }} />
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{feature.title}</div>
                    <div style={{ color: '#c9c9c9', fontSize: 13, lineHeight: 1.5, maxWidth: 440 }}>{feature.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seção 3 — compra */}
      <section
        style={{
          padding: '64px 24px 96px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderTop: '1px solid #1c1c1c'
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Comece agora</h2>
        <p style={{ color: '#9a9a9a', fontSize: 14, margin: '0 0 32px' }}>Ativação imediata após o pagamento.</p>
        <PricingCta />
      </section>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .feature-grid > div { grid-column: span 1 !important; }
        }
      `}</style>
    </main>
  );
}
