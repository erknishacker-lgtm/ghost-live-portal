'use client';

import { useState, type FormEvent } from 'react';

type Result = {
  licenseKey: string;
  email: string;
  expiresAt: string;
  maxDevices: number;
  emailed: boolean;
};

export function TestLicenseForm() {
  const [email, setEmail] = useState('');
  const [days, setDays] = useState(3);
  const [maxDevices, setMaxDevices] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch('/api/admin/test-license', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, days, maxDevices })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Não foi possível gerar a chave.');
        return;
      }
      setResult(data);
    } catch {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  async function copyKey() {
    if (!result) return;
    await navigator.clipboard.writeText(result.licenseKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ fontSize: 13 }}>
          E-mail de quem vai testar
          <div style={{ marginTop: 6 }}>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="pessoa@email.com" />
          </div>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={{ fontSize: 13 }}>
            Dias de validade
            <div style={{ marginTop: 6 }}>
              <input type="number" min={1} max={365} required value={days} onChange={(event) => setDays(Number(event.target.value))} />
            </div>
          </label>
          <label style={{ fontSize: 13 }}>
            Dispositivos permitidos
            <div style={{ marginTop: 6 }}>
              <input type="number" min={1} max={999} required value={maxDevices} onChange={(event) => setMaxDevices(Number(event.target.value))} />
            </div>
          </label>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Gerando…' : 'Gerar chave de teste'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 20, padding: 16, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#9a9a9a', marginBottom: 6 }}>
            Chave gerada pra {result.email} · válida até {new Date(result.expiresAt).toLocaleString('pt-BR')} · {result.maxDevices} dispositivo(s)
          </div>
          <div style={{ fontSize: 11, marginBottom: 10, color: result.emailed ? '#4ade80' : '#f87171' }}>
            {result.emailed
              ? 'E-mail com a chave e o link pra definir senha foi enviado.'
              : 'Não foi possível enviar o e-mail — copie e envie a chave manualmente.'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{result.licenseKey}</div>
            <button className="btn-secondary" onClick={copyKey} type="button">
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
