'use client';

import { useState } from 'react';

export function CopyButton({ value, label = 'Copiar' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button className="btn-secondary" onClick={copy} type="button">
      {copied ? 'Copiado!' : label}
    </button>
  );
}
