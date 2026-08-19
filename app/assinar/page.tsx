import { PricingCta } from './pricing-cta';

// See app/login/page.tsx for why nonce-based CSP requires this.
export const dynamic = 'force-dynamic';

const FEATURES = [
  { title: 'Modo Infinito', desc: 'Reinicia a live sozinha — fica no ar por horas sem cair.' },
  { title: 'Proteção contra violação', desc: 'Encerra a live sozinha ao detectar aviso do TikTok, antes de tomar ban.' },
  { title: 'Vendas automáticas', desc: 'Produto sempre fixado, aviso de carrinho e de compra confirmada.' },
  { title: 'Assistente de Voz IA', desc: 'Responde o chat com a sua própria voz, sem parar a live.' }
];

export default function SalesPage() {
  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      {/* Seção 1 — apresentação */}
      <section
        style={{
          padding: '80px 24px 64px',
          textAlign: 'center',
          background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06), transparent 55%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
          <img src="/ghost-logo.png" alt="Ghost Live" style={{ width: 48, height: 48 }} />
          <span style={{ fontSize: 22, fontWeight: 800 }}>Ghost Live</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: 1.5, color: '#9a9a9a', textTransform: 'uppercase', marginBottom: 14 }}>
          Para quem vende ao vivo no TikTok
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, margin: '0 auto 16px', maxWidth: 640 }}>
          Sua LIVE não para. Nem quando você não está olhando.
        </h1>
        <p style={{ color: '#9a9a9a', fontSize: 16, maxWidth: 480, margin: '0 auto 48px' }}>
          Automação, proteção contra banimento e vendas rodando sozinhas — pra você focar em vender, não em ficar de olho na tela.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            maxWidth: 900,
            margin: '0 auto'
          }}
        >
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card" style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{feature.title}</div>
              <div style={{ color: '#9a9a9a', fontSize: 13, lineHeight: 1.5 }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 2 — compra */}
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
    </main>
  );
}
