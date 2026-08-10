'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LicenseRowActions({ licenseId, status }: { licenseId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function run(action: 'suspend' | 'reactivate' | 'revoke') {
    if (action === 'revoke' && !confirm('Revogar essa licença? Essa ação encerra o acesso e não é o mesmo que suspender.')) return;
    setLoading(action);
    try {
      await fetch(`/api/admin/licenses/${licenseId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action })
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function extend(days: number) {
    setLoading(`extend-${days}`);
    try {
      await fetch(`/api/admin/licenses/${licenseId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'extend', days })
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <button className="btn-secondary" disabled={loading !== null} onClick={() => extend(7)} style={{ padding: '6px 10px', fontSize: 11 }}>
        +7d
      </button>
      <button className="btn-secondary" disabled={loading !== null} onClick={() => extend(30)} style={{ padding: '6px 10px', fontSize: 11 }}>
        +30d
      </button>
      {status !== 'suspended' && (
        <button className="btn-secondary" disabled={loading !== null} onClick={() => run('suspend')} style={{ padding: '6px 10px', fontSize: 11 }}>
          Suspender
        </button>
      )}
      {status !== 'active' && (
        <button className="btn-secondary" disabled={loading !== null} onClick={() => run('reactivate')} style={{ padding: '6px 10px', fontSize: 11 }}>
          Reativar
        </button>
      )}
      {status !== 'revoked' && (
        <button className="btn-danger" disabled={loading !== null} onClick={() => run('revoke')} style={{ padding: '6px 10px', fontSize: 11 }}>
          Revogar
        </button>
      )}
    </div>
  );
}
