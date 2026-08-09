'use client';

import { useState } from 'react';

function mask(key: string): string {
  const parts = key.split('-');
  if (parts.length !== 5) return key;
  return `${parts[0]}-****-****-****-${parts[4]}`;
}

export function RevealKey({ licenseKey }: { licenseKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(licenseKey).catch(() => {});
    setRevealed(true);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
        {revealed ? licenseKey : mask(licenseKey)}
      </div>
      <button className="btn-secondary" onClick={() => setRevealed((value) => !value)}>
        {revealed ? 'Ocultar' : 'Revelar'}
      </button>
      <button className="btn-secondary" onClick={copy}>
        {copied ? 'Copiado!' : 'Revelar para copiar'}
      </button>
    </div>
  );
}
