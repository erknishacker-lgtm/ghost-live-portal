'use client';

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmitPassword(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Não foi possível definir a senha.');
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

  async function onRequestLink(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setMessage(data.message || 'Se esse e-mail existir, enviamos um link.');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          <img src="/ghost-logo.png" alt="Ghost Live" style={{ width: 64, height: 64 }} />
          <span style={{ fontSize: 22, fontWeight: 800 }}>Ghost Live</span>
        </div>

        {token ? (
          <form onSubmit={onSubmitPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Defina sua senha</h2>
            <label style={{ fontSize: 13 }}>
              Nova senha
              <div style={{ marginTop: 6 }}>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </label>
            {error && <p className="error-text">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Salvando…' : 'Definir senha e entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={onRequestLink} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Registrar senha</h2>
            <p style={{ color: '#9a9a9a', fontSize: 13, margin: 0 }}>
              Informe o e-mail da sua compra — enviamos um link pra você definir sua senha.
            </p>
            <label style={{ fontSize: 13 }}>
              E-mail
              <div style={{ marginTop: 6 }}>
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" />
              </div>
            </label>
            {error && <p className="error-text">{error}</p>}
            {message && <p style={{ color: '#9a9a9a', fontSize: 13 }}>{message}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar link'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, color: '#9a9a9a', marginTop: 16 }}>
          <a href="/login" style={{ color: '#fff' }}>
            Voltar ao login
          </a>
        </p>
      </div>
    </main>
  );
}

export default function SetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <SetPasswordFormInner />
    </Suspense>
  );
}
