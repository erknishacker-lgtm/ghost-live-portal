export default function SupportPage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase' }}>Ajuda</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '4px 0 8px' }}>Suporte</h1>
      <p style={{ color: '#9a9a9a', margin: '0 0 32px' }}>Fale com nosso time.</p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Instalação e ativação</div>
          <p style={{ color: '#9a9a9a', fontSize: 13, margin: 0 }}>Siga o passo a passo na tela Início pra instalar e ativar sua licença.</p>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Problemas técnicos</div>
          <a href="mailto:louzadadigitalhub@gmail.com" style={{ color: '#c9b8ff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Enviar e-mail →
          </a>
        </div>
      </div>
    </main>
  );
}
