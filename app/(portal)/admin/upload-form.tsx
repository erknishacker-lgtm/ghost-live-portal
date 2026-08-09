'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function UploadForm() {
  const router = useRouter();
  const [version, setVersion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file || !version.trim()) {
      setError('Preencha a versão e escolha o arquivo .zip.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('version', version.trim());
      const response = await fetch('/api/admin/extension/upload', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Falha no upload.');
        return;
      }
      setMessage(`Versão ${data.version} publicada com sucesso.`);
      setVersion('');
      setFile(null);
      router.refresh();
    } catch {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={{ fontSize: 13 }}>
        Versão (ex: 7.17.46)
        <div style={{ marginTop: 6 }}>
          <input type="text" value={version} onChange={(event) => setVersion(event.target.value)} placeholder="7.17.46" />
        </div>
      </label>
      <label style={{ fontSize: 13 }}>
        Arquivo .zip da extensão
        <div style={{ marginTop: 6 }}>
          <input type="file" accept=".zip" onChange={(event) => setFile(event.target.files?.[0] ?? null)} style={{ width: '100%' }} />
        </div>
      </label>
      {error && <p className="error-text">{error}</p>}
      {message && <p style={{ color: '#8be28b', fontSize: 13 }}>{message}</p>}
      <button className="btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}>
        {loading ? 'Enviando…' : 'Publicar nova versão'}
      </button>
    </form>
  );
}
