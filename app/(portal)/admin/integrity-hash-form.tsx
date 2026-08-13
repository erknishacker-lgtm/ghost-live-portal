'use client';

import { useState, type FormEvent } from 'react';

export function IntegrityHashForm() {
  const [version, setVersion] = useState('');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSaved(false);
    setLoading(true);
    try {
      const response = await fetch('/api/admin/integrity-hash', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ version, hash })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Não foi possível salvar.');
        return;
      }
      setSaved(true);
      setHash('');
    } catch {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ color: '#9a9a9a', fontSize: 13, margin: 0 }}>
        Rode <code>node compute-integrity-hash.js "caminho da pasta"</code> na build oficial dessa versão e cole o hash
        aqui. Dispositivos que reportarem um hash diferente pra essa versão aparecem marcados como &quot;código
        modificado&quot; em Contas &amp; chaves.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
        <label style={{ fontSize: 13 }}>
          Versão
          <div style={{ marginTop: 6 }}>
            <input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="1.5.1" required />
          </div>
        </label>
        <label style={{ fontSize: 13 }}>
          Hash (SHA-256 hex)
          <div style={{ marginTop: 6 }}>
            <input
              value={hash}
              onChange={(event) => setHash(event.target.value)}
              placeholder="64 caracteres hexadecimais"
              style={{ fontFamily: 'ui-monospace, monospace' }}
              required
            />
          </div>
        </label>
      </div>
      {error && <p className="error-text">{error}</p>}
      {saved && <p style={{ color: '#8be28b', fontSize: 13, margin: 0 }}>Hash salvo.</p>}
      <button className="btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}>
        {loading ? 'Salvando…' : 'Salvar hash esperado'}
      </button>
    </form>
  );
}
