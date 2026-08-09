export default function CheckoutSuccessPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Ghost Live</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Pagamento confirmado 🎉</h1>
        <p style={{ color: '#9a9a9a', fontSize: 14, margin: '0 0 24px' }}>
          Enviamos um e-mail com sua chave de licença e um link pra você definir sua senha de acesso ao portal. Pode
          levar alguns minutos pra chegar.
        </p>
        <a href="/set-password" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Já recebeu? Definir senha
        </a>
      </div>
    </main>
  );
}
