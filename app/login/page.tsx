'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Não foi possível entrar.');
        return;
      }
      router.push('/licencas');
      router.refresh();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
          background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 55%)'
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Ghost Live</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px' }}>
          Sua operação de LIVE começa aqui.
        </h1>
        <p style={{ color: '#9a9a9a', fontSize: 15, maxWidth: 420 }}>Acesse sua licença e o treinamento completo da ferramenta.</p>
      </section>
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
        <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase', marginBottom: 4 }}>Área de membros</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Bem-vindo de volta</h2>
            <p style={{ color: '#9a9a9a', fontSize: 13, margin: 0 }}>Entre com o e-mail usado na compra.</p>
          </div>
          <label style={{ fontSize: 13 }}>
            E-mail
            <div style={{ marginTop: 6 }}>
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" />
            </div>
          </label>
          <label style={{ fontSize: 13 }}>
            Senha
            <div style={{ marginTop: 6 }}>
              <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" />
            </div>
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#9a9a9a' }}>
            Primeiro acesso?{' '}
            <a href="/set-password" style={{ color: '#fff' }}>
              Registrar senha
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}
