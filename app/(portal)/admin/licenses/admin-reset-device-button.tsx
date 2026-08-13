'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminResetDeviceButton({ licenseId, deviceId }: { licenseId: string; deviceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm('Redefinir este dispositivo? O cliente vai precisar ativar a licença de novo.')) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/licenses/${licenseId}/devices/${deviceId}/reset`, { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: 'transparent',
        border: '1px solid #2a2a2a',
        borderRadius: 6,
        color: '#9a9a9a',
        fontSize: 10,
        padding: '1px 8px',
        cursor: 'pointer'
      }}
    >
      {loading ? '…' : 'Redefinir'}
    </button>
  );
}
